# Research: Card Effect Execution System

**Feature**: 004-card-effect-execution
**Date**: 2025-12-06

## Research Overview

この機能は既存のClean Architecture（Feature 001で確立、Feature 003で実証）の自然な拡張である。大規模なリサーチは不要で、既存パターンの適用方法を確認する。

## Existing Architecture Review

### ✅ Domain Layer Pattern (既存)

**場所**: `skeleton-app/src/lib/domain/`

**既存の純粋関数**:
- `drawCards(zones, count)`: デッキから複数枚ドロー
- `sendToGraveyard(zones, cardId)`: カードを墓地に送る
- `moveCard(zones, cardId, from, to)`: ゾーン間移動

**決定**: これらをそのまま活用。新規Domain関数は不要。

### ✅ Command Pattern (既存)

**場所**: `skeleton-app/src/lib/application/commands/`

**既存Command**:
- `DrawCardCommand`: ドロー処理
- `ActivateSpellCommand`: 魔法カード発動
- `AdvancePhaseCommand`: フェーズ進行

**拡張ポイント**:
1. `ActivateSpellCommand.execute()` にカードID判定ロジック追加
2. 新規 `DiscardCardsCommand` 作成（複数枚破棄）

**根拠**: ADR-0003で「すべての状態変更はCommandクラス経由」と決定済み。

### ✅ Effect Resolution Store (既存)

**場所**: `skeleton-app/src/lib/stores/effectResolutionStore.ts`

**既存機能**:
```typescript
interface EffectResolutionStep {
  id: string;
  title: string;
  message: string;
  action: () => Promise<void> | void;
  showCancel?: boolean;
}

- startResolution(steps: EffectResolutionStep[])
- confirmCurrentStep()
- cancelResolution()
```

**活用方法**:
「天使の施し」の効果を2ステップに分割:
1. Step 1: 3枚ドロー（action内でDrawCardCommand実行）
2. Step 2: 2枚選択待ち（actionでcardSelectionStoreを起動）

**根拠**: Feature 003で効果解決フローパターンが確立済み。

## New Components

### 🆕 DiscardCardsCommand

**責務**: 手札から複数枚のカードを一度に墓地送り

**実装方針**:
```typescript
export class DiscardCardsCommand implements GameCommand {
  constructor(private readonly cardInstanceIds: string[]) {}

  execute(state: GameState): CommandResult {
    let updatedZones = state.zones;
    for (const cardId of this.cardInstanceIds) {
      updatedZones = sendToGraveyard(updatedZones, cardId);
    }
    return createSuccessResult(
      produce(state, draft => { draft.zones = updatedZones })
    );
  }
}
```

**根拠**: 既存のDrawCardCommandパターンを踏襲。Domain関数（sendToGraveyard）を呼び出すだけ。

### 🆕 cardSelectionStore

**責務**: カード選択UIの状態管理

**インターフェース**:
```typescript
interface CardSelectionState {
  isActive: boolean;
  selectedCards: string[];
  maxSelection: number;
}

- startSelection(maxCount: number)
- toggleSelection(cardId: string)
- getSelectedCards(): string[]
- reset()
```

**根拠**: 既存のgameStateStoreやeffectResolutionStoreと同様のSvelte Store パターン。

### 🆕 CardSelectionModal.svelte

**責務**: 手札からカードを選択するUI

**仕様**:
- 手札のカード一覧を表示
- クリックで選択/解除（ハイライト）
- 指定枚数選択まで確定ボタン無効化
- 確定後にdiscardCards()実行

**根拠**: Feature 003のCardDetailDisplay.svelteと同様のモーダルパターン。

## Technical Decisions

### Decision 1: カードID → 効果処理のマッピング方法

**選択肢**:
- A: ActivateSpellCommand内にif文でハードコード
- B: Record型で効果関数をマッピング
- C: 独立したEffectRegistryクラス

**選択**: **A (if文ハードコード)**

**理由**:
- 現時点で2つのカードのみ
- YAGNI原則: 3回同じパターンが現れてから抽象化
- ADR-0003: Effect System廃止済み、シンプルに保つ

**将来の拡張**:
カードが5種類を超えたら、Record型へリファクタリング検討。

### Decision 2: effectResolutionStoreとcardSelectionStoreの連携

**選択肢**:
- A: effectResolutionStore内でcardSelectionStoreを直接操作
- B: step.action()内でcardSelectionStore.startSelection()を呼ぶ
- C: 両Storeを統合

**選択**: **B (action内で呼び出し)**

**理由**:
- 関心の分離: effectResolutionStoreは効果フロー、cardSelectionStoreはUI状態
- テストしやすい: 各Storeを独立してテスト可能
- 既存パターン踏襲: Feature 003と同じ構造

### Decision 3: カード選択のユーザーフロー

**フロー**:
1. 「天使の施し」クリック
2. ActivateSpellCommand.execute()
3. effectResolutionStore.startResolution([step1, step2])
4. Step 1 action: DrawCardCommand(3).execute()
5. Step 2 action: cardSelectionStore.startSelection(2)
6. CardSelectionModal表示
7. ユーザーが2枚選択 → 確定クリック
8. DiscardCardsCommand(selectedIds).execute()
9. effectResolutionStore.confirmCurrentStep() → 完了

**根拠**: ユーザー入力を効果解決フローに組み込む明確な手順。

## Alternatives Considered

### ❌ Strategy Pattern with Effect Registry

**検討内容**:
```typescript
interface CardEffect {
  execute(state: GameState): GameState;
}

const CARD_EFFECTS: Record<number, CardEffect> = {
  55144522: new PotOfGreedEffect(),
  79571449: new GracefulCharityEffect(),
};
```

**却下理由**:
- 2つのカードのみで抽象化は過剰（YAGNI違反）
- ADR-0003でEffect System廃止を決定済み
- if文で十分シンプル

**再検討条件**: カードが5種類を超えた時点。

## Implementation Order

1. **Phase 1 (Domain/Application - P1)**: 強欲な壺の実装
   - ActivateSpellCommandにカードID判定追加
   - テスト: 強欲な壺で2枚ドロー

2. **Phase 2 (Application - P2前半)**: 天使の施しの基盤
   - DiscardCardsCommand作成
   - cardSelectionStore作成
   - テスト: 破棄処理単体

3. **Phase 3 (Presentation - P2後半)**: UI統合
   - CardSelectionModal作成
   - effectResolutionStoreとの連携
   - テスト: E2Eで全フロー

4. **Phase 4 (Polish - P3)**: 進行状況表示
   - EffectResolutionModal活用
   - メッセージ表示

**根拠**: User Storyの優先度（P1 → P2 → P3）に従う。

## References

- **ADR-0003**: Effect System廃止とCommand Pattern統一
- **docs/architecture/overview.md**: Clean Architecture 3層構造
- **Feature 003**: モーダルUIパターンの実装例
- **skeleton-app/src/lib/stores/effectResolutionStore.ts**: 既存の効果解決フロー

## Research Completion Checklist

- [x] 既存アーキテクチャの確認
- [x] 新規コンポーネントの設計
- [x] 技術的決定の記録
- [x] 代替案の検討
- [x] 実装順序の決定

**Result**: リサーチ完了 - すべての技術的決定が明確化された。Phase 1（設計）に進む準備完了。
