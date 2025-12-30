# Implementation Plan: Effect Resolution Notification Control

**Branch**: `010-notification-level-control` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-notification-level-control/spec.md`

## Summary

効果解決時の通知レベル制御を導入し、情報提供のみの通知（カードをドロー、墓地に送る）はトーストで非ブロッキング表示、ユーザー入力が必要な通知（カード選択）はモーダルでブロッキング表示、内部状態変更のみの通知は非表示とする。Clean Architectureの原則を維持し、Domain層は通知レベル（silent/info/interactive）のみを定義し、Presentation層が具体的な表示方法（toast/modal/none）を決定する。既存のEffectResolutionStepにnotificationLevelプロパティを追加し、Dependency InjectionパターンでNotificationHandlerをApplication層に注入することで、UI実装の詳細をDomain層から完全に分離する。

**技術的アプローチ**:
- NotificationLevelを"silent" | "info" | "interactive"の3レベルで定義
- EffectResolutionStepにoptionalなnotificationLevelプロパティを追加（デフォルト: "info"）
- NotificationHandlerインターフェースをApplication層で定義し、Presentation層から実装を注入
- 既存のCardSelectionHandlerパターンを踏襲してDependency Injection実装
- 後方互換性: notificationLevel未指定のステップは"info"として扱う

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022)
**Primary Dependencies**: Svelte 5 (Runes mode), SvelteKit 2, Skeleton UI (toast), Immer.js (immutability)
**Storage**: N/A (フロントエンドのみ、状態はメモリ内)
**Testing**: Vitest (unit/integration), Playwright (E2E)
**Target Platform**: Web browser (SPA)
**Project Type**: Web (single-page application)
**Performance Goals**: Toast表示500ms以内、モーダルは即座に表示
**Constraints**:
- Clean Architecture準拠（Domain層はUI詳細に依存しない）
- Svelte 5 Runes mode必須（$state, $derived, $effect）
- すべての状態更新はImmer.jsのproduce()を使用（不変性保持）
- 既存のEffectResolutionStepインターフェースを拡張（破壊的変更なし）
- 既存のカード効果は後方互換性を維持（デフォルト"info"）

**Scale/Scope**:
- 既存カード効果: 2枚（Pot of Greed, Graceful Charity）を移行
- 新規インターフェース: 2つ（NotificationLevel型、NotificationHandler）
- 修正ファイル: 3ファイル（EffectResolutionStep.ts, effectResolutionStore.ts, 既存カード効果）
- テストファイル: 2ファイル（effectResolutionStore.test.ts更新、統合テスト追加）

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Planning Principles

✅ **I. 目的と手段の分離**
- **目的**: 効果解決時の通知をユーザー体験に応じて使い分け、モーダル疲労を軽減する
- **手段**: NotificationLevel（3レベル）をDomain層で定義し、NotificationHandlerをDependency Injectionで注入
- **判断**: 目的（UX改善）と手段（通知レベル制御）が明確に分離され、Clean Architectureの原則に準拠

✅ **II. 段階的な理解の深化**
- Phase 0: NotificationLevelの設計決定、Dependency Injectionパターンの調査
- Phase 1: EffectResolutionStep拡張、NotificationHandler定義
- Phase 2: 既存カード効果への適用、テスト実装
- 段階的に実装し、各段階で検証可能

### Architecture Principles

✅ **III. 最適解の選択と記録**
- **選択**: NotificationHandlerをDependency Injectionで注入（CardSelectionHandlerと同じパターン）
- **代替案**: Domain層で通知方法を直接指定（toast/modal）→ Clean Architecture違反のため却下
- **記録**: research.mdで設計判断の根拠を明確化

✅ **IV. 関心の分離**
- Domain Layer: NotificationLevel型定義、EffectResolutionStepにnotificationLevel追加
- Application Layer: NotificationHandlerインターフェース定義、effectResolutionStoreでハンドラ呼び出し
- Presentation Layer: NotificationHandler実装（toast/modal表示）、ハンドラ登録
- 依存の方向が正しい（Application→Domain、Presentation→Application）

✅ **V. 変更に対応できる設計**
- 新しい通知レベル追加: NotificationLevel型を拡張するだけ
- 通知方法の変更: Presentation層のNotificationHandler実装を修正するだけ
- 既存カード効果: notificationLevelプロパティ追加のみ（オプショナル）

### Coding Principles

✅ **VI. 理解しやすさ最優先**
- NotificationLevel型は明示的な3値（"silent" | "info" | "interactive"）
- NotificationHandlerインターフェースはCardSelectionHandlerと同じパターン
- デフォルト値（"info"）により後方互換性を保証

✅ **VII. シンプルに問題を解決する**
- YAGNIの適用: 3レベルのみ実装（カスタマイズ可能なユーザー設定はスコープ外）
- 既存パターン（Dependency Injection）の再利用
- オプショナルプロパティによる段階的移行

✅ **VIII. テスト可能性を意識する**
- NotificationHandlerはモック可能（Dependency Injection）
- NotificationLevel型は純粋な型定義（テスト不要）
- effectResolutionStoreはハンドラ注入により単体テスト可能

### Project-Specific Principles

✅ **IX. 技術スタック**
- TypeScript + Svelte 5 + Skeleton UIを維持
- 新規依存関係なし
- 既存のImmer.jsパターンを継続

**判定**: ✅ All gates passed. 憲法違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/010-notification-level-control/
├── spec.md             # Feature specification
├── plan.md             # This file (/speckit.plan command output)
├── research.md         # Phase 0 output (設計決定の記録)
├── data-model.md       # Phase 1 output (データモデル設計)
├── quickstart.md       # Phase 1 output (実装クイックスタート)
├── contracts/          # Phase 1 output (API contracts)
│   ├── NotificationLevel.ts      # NotificationLevel型定義
│   └── NotificationHandler.ts    # NotificationHandlerインターフェース
└── tasks.md            # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
skeleton-app/src/lib/
├── domain/
│   └── models/
│       └── EffectResolutionStep.ts        # MODIFIED: notificationLevel追加
│
├── application/
│   └── stores/
│       └── effectResolutionStore.ts       # MODIFIED: NotificationHandler DI追加
│
└── presentation/
    ├── utils/
    │   └── toaster.ts                     # EXISTING: Toast表示ユーティリティ
    │
    └── components/
        └── game/
            └── EffectResolutionModal.svelte # EXISTING: モーダル表示コンポーネント

skeleton-app/src/lib/domain/effects/chainable/
├── PotOfGreedAction.ts                    # MODIFIED: notificationLevel追加
├── GracefulCharityAction.ts               # MODIFIED: notificationLevel追加
└── [other card effects]                   # FUTURE: 順次移行

tests/unit/application/stores/
└── effectResolutionStore.test.ts          # MODIFIED: NotificationHandler DI テスト

tests/integration/
└── notification-level-control.test.ts     # NEW: 統合テスト
```

**Structure Decision**:
- NotificationLevel型はDomain層（EffectResolutionStep.ts内）に定義
- NotificationHandlerインターフェースはApplication層（effectResolutionStore.ts内）に定義
- NotificationHandler実装はPresentation層（+page.svelte等）に配置
- 既存の4層Clean Architectureを維持

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| N/A | N/A | N/A |

**Note**: すべてのConstitution Checkをパス。Clean Architectureの原則に完全準拠。

---

## Phase 0: Research & Design Decisions

### Research Questions

以下の技術的不明点を調査し、`research.md`に記録する:

#### 1. NotificationLevel型の設計

**調査内容**:
- 3レベル（silent/info/interactive）で十分か？
- string literal型 vs enum vs union型の選択
- 拡張性の考慮（将来的な新レベル追加）

**決定事項**:
- NotificationLevel型の定義方法
- デフォルト値の設定（後方互換性）

#### 2. NotificationHandlerのDependency Injection設計

**調査内容**:
- CardSelectionHandlerパターンとの整合性
- effectResolutionStore.registerNotificationHandler()の実装方法
- NotificationHandlerインターフェースのシグネチャ設計

**決定事項**:
- NotificationHandlerの具体的なインターフェース定義
- 注入タイミング（Presentation層の初期化時）

#### 3. effectResolutionStoreの修正戦略

**調査内容**:
- confirmCurrentStep()内でnotificationLevelをどう処理するか
- CardSelectionConfigとnotificationLevelの関係（互いに独立 or 連携）
- silent/info/interactiveの分岐ロジック

**決定事項**:
- confirmCurrentStep()の修正内容
- NotificationHandlerの呼び出しタイミング

#### 4. Toast表示の統合方法

**調査内容**:
- 既存のtoaster.ts（Skeleton UI）の活用方法
- Toast表示のタイミング（step開始時 vs action実行後）
- Toastの自動消去時間設定

**決定事項**:
- showInfoToast()ヘルパー関数の実装
- Toast表示とeffect resolution進行の非同期処理

#### 5. 既存EffectResolutionStepの移行戦略

**調査内容**:
- PotOfGreedActionの2ステップ（draw, graveyard）にnotificationLevel追加
- GracefulCharityActionの3ステップ（draw, discard, graveyard）のレベル分類
- discardステップ（cardSelectionConfig有）はinteractiveに統一

**決定事項**:
- 各ステップのnotificationLevel分類基準
- デフォルト値（"info"）の適用範囲

### Output: research.md

すべての調査結果を `research.md` に以下のフォーマットで記録:

```markdown
## [調査項目名]

**Decision**: [選択した設計アプローチ]

**Rationale**: [選択理由]

**Alternatives Considered**:
- [代替案1]: [却下理由]
- [代替案2]: [却下理由]

**Implementation Notes**: [実装時の注意点]
```

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### 1. Data Model Design (data-model.md)

以下のエンティティとインターフェースを定義:

#### A. NotificationLevel型

```typescript
/**
 * NotificationLevel - 効果解決ステップの通知レベル
 *
 * Domain層で定義され、Presentation層が表示方法を決定する。
 */
export type NotificationLevel =
  | "silent"       // 通知なし（内部状態変更のみ）
  | "info"         // 情報通知（トースト、非ブロッキング）
  | "interactive"; // ユーザー入力要求（モーダル、ブロッキング）
```

**フィールド詳細**:
- `silent`: 通知UI非表示、効果は即座に実行（例: 永続効果適用）
- `info`: トースト表示、自動消去、効果は自動進行（例: カードドロー）
- `interactive`: モーダル表示、ユーザー入力待ち（例: カード選択）

#### B. EffectResolutionStep拡張

```typescript
/**
 * EffectResolutionStep - 効果解決ステップ（拡張）
 *
 * notificationLevelプロパティを追加（オプショナル）
 */
export interface EffectResolutionStep {
  readonly id: string;
  readonly title: string;
  readonly message: string;

  /**
   * 通知レベル（オプショナル）
   *
   * 未指定の場合は "info" として扱う（後方互換性）
   */
  readonly notificationLevel?: NotificationLevel;

  readonly cardSelectionConfig?: CardSelectionConfig;
  action: (state: GameState, selectedInstanceIds?: string[]) => GameStateUpdateResult;
  readonly showCancel?: boolean;
}
```

#### C. NotificationHandler Interface

```typescript
/**
 * NotificationHandler - 通知ハンドラ（Application層）
 *
 * Presentation層が実装を提供し、Dependency Injectionで注入する。
 * CardSelectionHandlerと同じパターン。
 */
export interface NotificationHandler {
  /**
   * 情報通知を表示（トースト）
   *
   * @param title - 通知タイトル
   * @param message - 通知メッセージ
   */
  showInfo(title: string, message: string): void;

  /**
   * インタラクティブ通知を表示（モーダル）
   *
   * @param step - 効果解決ステップ
   * @param onConfirm - 確認ボタン押下時のコールバック
   * @param onCancel - キャンセルボタン押下時のコールバック（オプショナル）
   */
  showInteractive(
    step: EffectResolutionStep,
    onConfirm: () => void,
    onCancel?: () => void
  ): void;
}
```

#### D. effectResolutionStore修正

**新規フィールド**:
```typescript
interface EffectResolutionState {
  // ... 既存フィールド
  notificationHandler: NotificationHandler | null; // NEW
}
```

**新規メソッド**:
```typescript
/**
 * NotificationHandlerを登録（Dependency Injection）
 * Presentation層の初期化時に呼ばれる
 */
registerNotificationHandler: (handler: NotificationHandler) => void;
```

**confirmCurrentStep修正**:
```typescript
confirmCurrentStep: async () => {
  const state = get(effectResolutionStore);
  if (!state.currentStep) return;

  const notificationLevel = state.currentStep.notificationLevel || "info";

  // silent: 通知なし、即座に実行
  if (notificationLevel === "silent") {
    // action実行 → 次ステップ
  }

  // info: トースト表示、自動進行
  if (notificationLevel === "info") {
    state.notificationHandler?.showInfo(state.currentStep.title, state.currentStep.message);
    // action実行 → 次ステップ
  }

  // interactive: モーダル表示、ユーザー入力待ち（既存のcardSelectionConfig処理）
  if (notificationLevel === "interactive") {
    // 既存のcardSelectionConfig処理を統合
  }
};
```

### 2. API Contracts (contracts/)

#### contracts/NotificationLevel.ts

```typescript
/**
 * NotificationLevel Type Definition
 *
 * Domain層で定義される通知レベル型。
 */
export type NotificationLevel = "silent" | "info" | "interactive";

/**
 * デフォルト通知レベル
 */
export const DEFAULT_NOTIFICATION_LEVEL: NotificationLevel = "info";
```

#### contracts/NotificationHandler.ts

```typescript
import type { EffectResolutionStep } from "$lib/domain/models/EffectResolutionStep";

/**
 * NotificationHandler Interface
 *
 * Application層で定義され、Presentation層が実装を提供する。
 */
export interface NotificationHandler {
  showInfo(title: string, message: string): void;
  showInteractive(
    step: EffectResolutionStep,
    onConfirm: () => void,
    onCancel?: () => void
  ): void;
}
```

### 3. Quickstart Guide (quickstart.md)

実装者向けのクイックスタートガイドを作成:

```markdown
# Notification Level Control Implementation Quickstart

## 既存カード効果への適用手順

### 1. notificationLevelプロパティ追加

`domain/effects/chainable/[CardName]Action.ts` の各ステップに `notificationLevel` を追加:

```typescript
{
  id: "pot-of-greed-draw",
  title: "カードをドローします",
  message: "デッキから2枚ドローします",
  notificationLevel: "info", // NEW
  action: (currentState: GameState) => { ... }
}
```

### 2. NotificationHandler登録（Presentation層）

`+page.svelte` の初期化時に登録:

```typescript
import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";
import { toaster } from "$lib/presentation/utils/toaster";

onMount(() => {
  effectResolutionStore.registerNotificationHandler({
    showInfo: (title, message) => {
      toaster.success({ title, message });
    },
    showInteractive: (step, onConfirm, onCancel) => {
      // 既存のモーダル表示ロジック
    }
  });
});
```

### 3. テスト実装

単体テスト: `tests/unit/application/stores/effectResolutionStore.test.ts`
統合テスト: `tests/integration/notification-level-control.test.ts`
```

### 4. Agent Context Update

CLAUDE.md更新不要（既存の技術スタックのみ使用）

---

## Next Steps

Phase 0とPhase 1が完了した時点で、このコマンドは終了します。

**次に実行するコマンド**: `/speckit.tasks`

Phase 2以降の詳細なタスク分解、実装順序、依存関係は `/speckit.tasks` コマンドで生成されます。

**報告事項**:
- **Branch**: 010-notification-level-control
- **Implementation Plan**: /Users/shohei/github/ygo-solitaire/specs/010-notification-level-control/plan.md
- **Generated Artifacts** (after Phase 0-1 completion):
  - research.md
  - data-model.md
  - contracts/NotificationLevel.ts
  - contracts/NotificationHandler.ts
  - quickstart.md

**Implementation Phases Overview** (詳細はtasks.mdで定義):
1. Phase 1: NotificationLevel型定義とEffectResolutionStep拡張
2. Phase 2: NotificationHandler DI実装とeffectResolutionStore修正
3. Phase 3: Presentation層実装（Toast統合、モーダル統合）
4. Phase 4: 既存カード効果への適用（Pot of Greed, Graceful Charity）
5. Phase 5: テスト実装とLint/Format実行

---

## References

- [spec.md](./spec.md)
- [docs/architecture/overview.md](../../docs/architecture/overview.md)
- [EffectResolutionStep.ts](../../skeleton-app/src/lib/domain/models/EffectResolutionStep.ts)
- [effectResolutionStore.ts](../../skeleton-app/src/lib/application/stores/effectResolutionStore.ts)
- [toaster.ts](../../skeleton-app/src/lib/presentation/utils/toaster.ts)
- [PotOfGreedAction.ts](../../skeleton-app/src/lib/domain/effects/chainable/PotOfGreedAction.ts)
- [GracefulCharityAction.ts](../../skeleton-app/src/lib/domain/effects/chainable/GracefulCharityAction.ts)
