# Research Document: Effect Resolution Notification Control

**Date**: 2025-12-30
**Status**: Complete
**Related**: [spec.md](./spec.md), [plan.md](./plan.md)

---

## Overview

このドキュメントは、Phase 0のリサーチ結果を記録する。すべての技術的不明点を解決し、実装判断の根拠を明確化する。

---

## Research Questions & Answers

### Q1: NotificationLevel型の設計

**Question**: 3レベル（silent/info/interactive）で十分か？string literal型 vs enum vs union型の選択は？

**Research Method**: 既存のEffectResolutionStep分析、CardSelectionConfigパターン調査

**Findings**:

現在の効果解決ステップは以下の3パターンに分類可能:

1. **情報提供のみ（info）**: カードドロー、墓地送り、LP変更
   - 例: Pot of Greedの"draw 2 cards"ステップ
   - ユーザー入力不要、自動進行
   - 現在はモーダル表示（ユーザーが"確定"ボタンを押す必要あり）

2. **ユーザー入力要求（interactive）**: カード選択、対象指定
   - 例: Graceful Charityの"discard 2 cards"ステップ
   - cardSelectionConfigが設定されている
   - モーダルでブロッキング表示が必須

3. **内部状態変更のみ（silent）**: 永続効果適用、カウンター更新
   - 例: Chicken Gameの永続効果適用（将来的な実装）
   - 通知不要、即座に実行

**Decision**: **String literal union型を採用** - `type NotificationLevel = "silent" | "info" | "interactive"`

**Rationale**:
1. **型安全性**: TypeScriptのstring literal型により、誤った値の代入を防止
2. **拡張性**: 将来的に新しいレベル（例: "warning", "error"）を追加可能
3. **パターン統一**: 既存のPhase型（"Draw" | "Main1" | ...）と同じパターン
4. **enum不要**: 3値のみでenumのオーバーヘッド不要、import不要

**Alternatives Considered**:
- ❌ **Enum**: TypeScriptのenumは実行時コードを生成するためバンドルサイズ増加、3値のみならunion型で十分
- ❌ **数値定数（0/1/2）**: 可読性が低い、型安全性が低い

**Implementation Notes**:
- デフォルト値は"info"（既存ステップの後方互換性）
- EffectResolutionStep内で`readonly notificationLevel?: NotificationLevel`として定義
- `notificationLevel ?? "info"`でデフォルト値を適用

---

### Q2: NotificationHandlerのDependency Injection設計

**Question**: CardSelectionHandlerパターンとの整合性をどう保つ？NotificationHandlerインターフェースのシグネチャは？

**Research Method**: effectResolutionStore.tsのCardSelectionHandler実装調査

**Findings**:

既存のCardSelectionHandler実装:
```typescript
export interface CardSelectionHandler {
  (config: {
    availableCards: readonly CardInstance[];
    minCards: number;
    maxCards: number;
    title: string;
    message: string;
    onConfirm: (selectedInstanceIds: string[]) => void;
    onCancel?: () => void;
  }): void;
}

// 登録方法
registerCardSelectionHandler: (handler: CardSelectionHandler) => void;

// 使用方法
state.cardSelectionHandler!({
  ...state.currentStep!.cardSelectionConfig!,
  onConfirm: (selectedInstanceIds) => { ... },
  onCancel: () => { ... }
});
```

**Decision**: **NotificationHandlerも同じDependency Injectionパターンを採用**

**Rationale**:
1. **パターン統一**: CardSelectionHandlerと同じパターンで一貫性
2. **テスト容易性**: ハンドラをモックして単体テスト可能
3. **疎結合**: Application層はUI実装詳細を知らない

**Implementation**:

```typescript
export interface NotificationHandler {
  showInfo(title: string, message: string): void;
  showInteractive(
    step: EffectResolutionStep,
    onConfirm: () => void,
    onCancel?: () => void
  ): void;
}

// effectResolutionStore.ts
interface EffectResolutionState {
  // ... 既存フィールド
  notificationHandler: NotificationHandler | null;
}

registerNotificationHandler: (handler: NotificationHandler) => void {
  update((state) => ({
    ...state,
    notificationHandler: handler,
  }));
}
```

**Alternatives Considered**:
- ❌ **関数型ハンドラ（CardSelectionHandlerと同様）**: showInfoとshowInteractiveの2つのメソッドが必要なため、オブジェクト型インターフェースが適切
- ❌ **Global関数として実装**: DI不要だがテストが困難、Clean Architecture違反

**Implementation Notes**:
- Presentation層（+page.svelte）のonMount内で登録
- showInfo()はtoaster.success()を呼び出し
- showInteractive()は既存のEffectResolutionModal表示ロジックを統合

---

### Q3: effectResolutionStoreの修正戦略

**Question**: confirmCurrentStep()内でnotificationLevelをどう処理する？CardSelectionConfigとnotificationLevelの関係は？

**Research Method**: effectResolutionStore.ts のconfirmCurrentStep()実装分析

**Findings**:

現在のconfirmCurrentStep()実装:
```typescript
confirmCurrentStep: async () => {
  const state = get(effectResolutionStore);

  if (state.currentStep.cardSelectionConfig) {
    // CardSelectionModalを開く（ブロッキング）
    state.cardSelectionHandler!({ ... });
  } else {
    // actionを即座に実行
    const result = state.currentStep.action(currentGameState);
    // 次のステップに進む
  }
}
```

**Decision**: **notificationLevelを優先判定し、cardSelectionConfigはinteractive内で統合**

**Rationale**:
1. **notificationLevel優先**: 通知レベルが全体の制御フローを決定
2. **cardSelectionConfigとの関係**: cardSelectionConfig有 = 自動的にinteractive
3. **明確な分岐**: silent/info/interactiveの3つの明確な処理フロー

**Implementation**:

```typescript
confirmCurrentStep: async () => {
  const state = get(effectResolutionStore);
  if (!state.currentStep) return;

  const currentGameState = get(gameStateStore);
  const notificationLevel = state.currentStep.notificationLevel ?? "info";

  // 1. silent: 通知なし、即座に実行
  if (notificationLevel === "silent") {
    const result = state.currentStep.action(currentGameState);
    if (result.success) {
      gameStateStore.set(result.newState);
    }
    // 次のステップに進む
    moveToNextStep();
    return;
  }

  // 2. info: トースト表示、自動進行
  if (notificationLevel === "info") {
    state.notificationHandler?.showInfo(
      state.currentStep.title,
      state.currentStep.message
    );

    const result = state.currentStep.action(currentGameState);
    if (result.success) {
      gameStateStore.set(result.newState);
    }

    // 短いディレイ後に次のステップに進む（トースト表示時間確保）
    await new Promise(resolve => setTimeout(resolve, 300));
    moveToNextStep();
    return;
  }

  // 3. interactive: モーダル表示、ユーザー入力待ち
  if (notificationLevel === "interactive") {
    // cardSelectionConfigがある場合
    if (state.currentStep.cardSelectionConfig) {
      // 既存のCardSelectionModal処理
      state.cardSelectionHandler!({ ... });
    } else {
      // cardSelectionConfigがない場合は通常のモーダル表示
      state.notificationHandler?.showInteractive(
        state.currentStep,
        () => {
          // onConfirm: action実行 → 次のステップ
          const result = state.currentStep!.action(currentGameState);
          if (result.success) {
            gameStateStore.set(result.newState);
          }
          moveToNextStep();
        },
        () => {
          // onCancel: 効果解決中止
          cancelResolution();
        }
      );
    }
    return;
  }
};
```

**Alternatives Considered**:
- ❌ **cardSelectionConfigを優先判定**: notificationLevelとの関係が不明確
- ❌ **silent/info/interactiveを別々のメソッドに分割**: confirmCurrentStep()の責務が拡散

**Implementation Notes**:
- cardSelectionConfig有のステップは自動的にinteractiveとして扱う
- infoレベルでは300msのディレイ後に次のステップに進む（トースト表示時間確保）
- silentレベルでは即座に次のステップに進む

---

### Q4: Toast表示の統合方法

**Question**: 既存のtoaster.ts（Skeleton UI）をどう活用する？Toast表示のタイミングは？

**Research Method**: toaster.ts実装調査、Skeleton UI Toast仕様確認

**Findings**:

既存のtoaster.ts実装:
```typescript
import { createToaster } from "@skeletonlabs/skeleton-svelte";

export const toaster = createToaster({
  placement: "top-end",
});

export function showSuccessToast(title: string) {
  toaster.success({
    title: title,
  });
}

export function showErrorToast(title: string) {
  toaster.error({
    title: title,
  });
}
```

Skeleton UI Toastの特性:
- 自動消去時間: デフォルト3秒（変更可能）
- キューイング: 複数のToastを順次表示
- 非ブロッキング: UI操作を妨げない

**Decision**: **toaster.success()を直接使用、messageパラメータも活用**

**Rationale**:
1. **既存実装の活用**: showSuccessToast()を拡張してmessageも受け取る
2. **自動消去**: デフォルト3秒で十分（効果解決は300msディレイで次のステップに進む）
3. **非ブロッキング**: infoレベルの要件に合致

**Implementation**:

```typescript
// toaster.ts (拡張)
export function showInfoToast(title: string, message?: string) {
  toaster.success({
    title: title,
    message: message,
  });
}

// NotificationHandler実装（Presentation層）
effectResolutionStore.registerNotificationHandler({
  showInfo: (title, message) => {
    showInfoToast(title, message);
  },
  showInteractive: (step, onConfirm, onCancel) => {
    // 既存のEffectResolutionModal表示ロジック
  }
});
```

**Alternatives Considered**:
- ❌ **カスタムToastコンポーネント**: Skeleton UIで十分、YAGNI
- ❌ **Toast表示後にaction実行**: ユーザーがToastを見る前にステップが進む可能性

**Implementation Notes**:
- Toast表示後300msディレイでactionを実行（ユーザーがToastを認識する時間）
- messageパラメータはオプショナル（titleのみでも可）

---

### Q5: 既存EffectResolutionStepの移行戦略

**Question**: PotOfGreedActionとGracefulCharityActionの各ステップにどのnotificationLevelを割り当てる？

**Research Method**: PotOfGreedAction.ts、GracefulCharityAction.ts実装分析

**Findings**:

**PotOfGreedAction** (2ステップ):
1. `pot-of-greed-draw`: カードを2枚ドロー
   - 情報提供のみ、ユーザー入力不要
   - 現在: モーダル表示（"確定"ボタン押下必要）
   - 推奨: **notificationLevel: "info"**

2. `pot-of-greed-graveyard`: カードを墓地に送る
   - 情報提供のみ、ユーザー入力不要
   - 現在: モーダル表示（"確定"ボタン押下必要）
   - 推奨: **notificationLevel: "info"**

**GracefulCharityAction** (3ステップ):
1. `graceful-charity-draw`: カードを3枚ドロー
   - 情報提供のみ、ユーザー入力不要
   - 現在: モーダル表示
   - 推奨: **notificationLevel: "info"**

2. `graceful-charity-discard`: カードを2枚破棄（cardSelectionConfig有）
   - ユーザー入力必須（カード選択）
   - 現在: CardSelectionModal表示
   - 推奨: **notificationLevel: "interactive"**

3. `graceful-charity-graveyard`: カードを墓地に送る
   - 情報提供のみ、ユーザー入力不要
   - 現在: モーダル表示
   - 推奨: **notificationLevel: "info"**

**Decision**: **cardSelectionConfig有 = interactive、それ以外 = info**

**Rationale**:
1. **ユーザー入力の有無**: cardSelectionConfigがあるステップは必然的にinteractive
2. **UX改善**: 情報提供のみのステップ（5ステップ中4ステップ）がトースト表示になり、モーダル疲労を大幅軽減
3. **後方互換性**: notificationLevel未指定のステップは"info"として扱う

**Migration Plan**:
1. Phase 1: PotOfGreedActionの2ステップに`notificationLevel: "info"`を追加
2. Phase 2: GracefulCharityActionの3ステップに`notificationLevel: "info"` (draw, graveyard) と `notificationLevel: "interactive"` (discard) を追加
3. Phase 3: 他のカード効果も順次移行

**Alternatives Considered**:
- ❌ **すべてinteractive**: UX改善効果なし
- ❌ **すべてinfo**: カード選択ステップが機能しない

**Implementation Notes**:
- cardSelectionConfig有のステップは明示的に`notificationLevel: "interactive"`を設定
- デフォルト値"info"に依存せず、明示的にレベルを指定する（可読性向上）

---

### Q6: ChainableActionとEffectResolutionStepの設計分離

**Question**: 通知関連の設定は、ChainableActionのインターフェースで定めるべきか？そもそもEffectResolutionStepとChainableActionが分かれているのは妥当なのか？

**Research Method**: ChainableActionとEffectResolutionStepの責務分析、Factory Patternとの関係確認

**Findings**:

現在の設計における役割の違い:

1. **ChainableAction**（Factory Pattern - 効果定義）
   - **責務**: カード効果の定義と、実行ステップの生成
   - **メソッド**:
     - `canActivate(state)`: 発動可能か判定
     - `createActivationSteps(state)`: 発動時ステップ生成
     - `createResolutionSteps(state)`: 解決時ステップ生成
   - **例**: `PotOfGreedAction`, `GracefulCharityAction`

2. **EffectResolutionStep**（Execution Unit - 実行単位）
   - **責務**: 個別ステップの実行内容とUI表示情報
   - **プロパティ**:
     - `action`: 実行する処理
     - `cardSelectionConfig`: カード選択設定（必要な場合）
     - `title`, `message`: UI表示用メタデータ
     - `notificationLevel`: 通知レベル（今回追加）

**Decision**: **ChainableActionとEffectResolutionStepは統合しない** - それぞれ異なる責務を持つ

**Rationale**:
1. **Single Responsibility Principle（単一責任原則）**:
   - ChainableAction = ステップの生成責務（Factory）
   - EffectResolutionStep = ステップの実行責務（Execution Unit）
2. **Factory Pattern**: ChainableActionがEffectResolutionStepを生成する関係
3. **依存の方向**: ChainableAction → EffectResolutionStep（適切な依存方向）
4. **拡張性**: 新しいカード効果を追加する際、ChainableActionを実装するだけで既存のeffectResolutionStoreが使える

**What vs How の明確な分離（Clean Architecture準拠）**:

EffectResolutionStepが `title`, `message`, `notificationLevel` を持つことは、**UI実装の詳細への依存ではなく、ドメイン知識の表現**です：

- **What（ドメイン層の責務）**:
  - `title`, `message`: 「何が起きたか」を伝える情報（ドメイン知識）
  - `notificationLevel`: 「どの程度重要か」（ドメインロジック）
  - 例: "カードをドロー", "2枚のカードをドローします", "info"

- **How（Presentation層の責務）**:
  - 「どう表示するか」（toast vs modal）
  - 「どこに表示するか」（top-right, center）
  - 「どんなスタイルか」（色、アニメーション、サイズ）

- **Clean Architecture準拠**:
  - Domain層は「何を通知すべきか」と「重要度」を決定
  - Presentation層は「どう表示するか」を決定
  - 依存性逆転原則（DIP）を守る: NotificationHandlerをDIで注入

**Alternatives Considered**:
- ❌ **ChainableActionに統合**: 責務が混在し、単一責任原則違反
- ❌ **EffectResolutionStepからUI情報を完全に分離**: 過剰な抽象化、YAGNI（You Aren't Gonna Need It）
- ❌ **ChainableActionに`getPresentationInfo()`を追加**: ステップごとの情報が分散し、管理が複雑化

**Implementation Notes**:
- `notificationLevel`プロパティはEffectResolutionStepに追加
- ChainableActionの`createResolutionSteps()`内で各ステップに`notificationLevel`を指定
- 例:
  ```typescript
  createResolutionSteps(state: DuelState): EffectResolutionStep[] {
    return [
      {
        id: "pot-of-greed-draw",
        title: "カードをドロー",
        message: "2枚のカードをドローします",
        notificationLevel: "info", // ← ここで指定
        action: (state) => { ... }
      },
      // ...
    ];
  }
  ```

---

## Design Decisions Summary

### Decision Matrix

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| NotificationLevel型 | String literal union型 | 型安全性、拡張性、パターン統一 |
| NotificationHandler DI | CardSelectionHandlerと同じパターン | パターン統一、テスト容易性 |
| confirmCurrentStep修正 | notificationLevel優先判定 | 明確な分岐、cardSelectionConfig統合 |
| Toast表示 | toaster.success()直接使用 | 既存実装活用、非ブロッキング |
| 既存ステップ移行 | cardSelectionConfig有 = interactive、他 = info | ユーザー入力の有無で分類 |
| ChainableAction vs EffectResolutionStep | 統合しない（Factory Patternを維持） | 単一責任原則、責務の明確な分離 |

### Key Takeaways

1. **Clean Architecture準拠**: NotificationLevelはDomain層、NotificationHandlerはApplication層、実装はPresentation層
2. **パターン統一**: CardSelectionHandlerと同じDependency Injectionパターン
3. **後方互換性**: notificationLevel未指定のステップは"info"として扱う
4. **UX改善効果**: Pot of Greedの2モーダル → 0モーダル（トースト2回）

---

## Technology Best Practices

### TypeScript Best Practices

**Type Safety**:
- NotificationLevel型は`"silent" | "info" | "interactive"`の厳密な型定義
- EffectResolutionStepのnotificationLevelはオプショナル（`?: NotificationLevel`）
- デフォルト値適用は`notificationLevel ?? "info"`で明示的

**Immutability**:
- effectResolutionStoreの状態更新はImmer.jsのproduce()を使用
- NotificationHandlerはreadonly指向（状態を持たない）

### Testing Best Practices

**Test Coverage**:
- effectResolutionStore.test.ts: NotificationHandler DI のテスト
- notification-level-control.test.ts: 統合テスト（各レベルの動作確認）

**Test Pattern**:
```typescript
describe("effectResolutionStore - NotificationHandler DI", () => {
  it("should register NotificationHandler", () => {
    const mockHandler = {
      showInfo: vi.fn(),
      showInteractive: vi.fn(),
    };

    effectResolutionStore.registerNotificationHandler(mockHandler);

    // 検証: ハンドラが登録されたことを確認
  });

  it("should call showInfo for info level steps", async () => {
    const mockHandler = {
      showInfo: vi.fn(),
      showInteractive: vi.fn(),
    };

    effectResolutionStore.registerNotificationHandler(mockHandler);

    const infoStep: EffectResolutionStep = {
      id: "test-info",
      title: "Info Step",
      message: "This is info",
      notificationLevel: "info",
      action: (state) => ({ success: true, newState: state }),
    };

    effectResolutionStore.startResolution([infoStep]);
    await effectResolutionStore.confirmCurrentStep();

    expect(mockHandler.showInfo).toHaveBeenCalledWith("Info Step", "This is info");
  });
});
```

---

## Final Design Summary

### Implementation Checklist

- [x] NotificationLevel型定義（string literal union）
- [x] EffectResolutionStep拡張（notificationLevelプロパティ追加）
- [x] NotificationHandlerインターフェース定義
- [x] effectResolutionStore修正（registerNotificationHandler、confirmCurrentStep）
- [x] Toast表示統合（toaster.ts拡張）
- [x] 既存カード効果移行戦略（Pot of Greed, Graceful Charity）
- [x] テスト戦略（単体テスト、統合テスト）

### Next Steps

Phase 0完了。Phase 1（Data Model & Contracts）に進む。

---

## References

- [effectResolutionStore.ts](../../skeleton-app/src/lib/application/stores/effectResolutionStore.ts)
- [EffectResolutionStep.ts](../../skeleton-app/src/lib/domain/models/EffectResolutionStep.ts)
- [toaster.ts](../../skeleton-app/src/lib/presentation/utils/toaster.ts)
- [PotOfGreedAction.ts](../../skeleton-app/src/lib/domain/effects/chainable/PotOfGreedAction.ts)
- [GracefulCharityAction.ts](../../skeleton-app/src/lib/domain/effects/chainable/GracefulCharityAction.ts)
- [Skeleton UI Toast Documentation](https://skeleton.dev/components/toaster)
