# Data Model: Card Effect Execution System

**Feature**: 004-card-effect-execution
**Created**: 2025-12-06
**Phase**: Design (Phase 1)

## Entity Definitions

このドキュメントは、spec.mdの「Key Entities」セクションから抽出したエンティティモデルと、それらの状態遷移を定義します。

---

### Entity 1: Card Effect

**概要**: カードIDと効果処理の対応関係を表す。各カードは固有の効果ロジック（ドロー枚数、選択枚数など）を持つ。

**フィールド**:
- `cardId: number` - YGOPRODeck API互換のカードID（例: 55144522, 79571449）
- `drawCount?: number` - ドローする枚数（例: 強欲な壺=2, 天使の施し=3）
- `discardCount?: number` - 破棄する枚数（例: 天使の施し=2）
- `requiresUserInput: boolean` - ユーザー入力が必要か（例: 天使の施し=true）
- `effectSteps: EffectResolutionStep[]` - 効果解決の各ステップ

**バリデーションルール** (from FR-007):
- 発動前にデッキ枚数をチェック: `deck.length >= drawCount`
- メインフェイズ1でのみ発動可能: `currentPhase === "main1"`
- ゲームオーバー後は発動不可: `gameStatus !== "gameOver"`

**関連性**:
- `ActivateSpellCommand` がこのエンティティを参照してカードID判定を行う
- `effectResolutionStore` がeffectStepsを受け取って解決フローを開始

**実装パス**:
- 現時点では**if文でハードコード**（Decision 1 in research.md）
- 将来的に5種類を超えたら`Record<number, CardEffect>`へリファクタリング

---

### Entity 2: Effect Resolution Step

**概要**: 効果解決の1ステップを表す。タイトル、メッセージ、実行するアクション、キャンセル可否を含む。

**フィールド** (from effectResolutionStore.ts):
```typescript
interface EffectResolutionStep {
  id: string;              // ステップID（例: "graceful-charity-draw", "graceful-charity-select"）
  title: string;           // ステップのタイトル（例: "カードをドローします"）
  message: string;         // ユーザーへのメッセージ（例: "デッキから3枚ドローします"）
  action: () => Promise<void> | void;  // 実行するアクション（Command実行やStore操作）
  showCancel?: boolean;    // キャンセルボタンを表示するか（デフォルト: false）
}
```

**バリデーションルール**:
- `action`は必ず副作用を持つ関数（Command実行またはStore操作）
- `showCancel=true`の場合、ユーザーが途中キャンセル可能（現時点未実装）

**状態遷移** (User Story 2の例):
```
Step 1: Draw 3 cards
  id: "graceful-charity-draw"
  action: () => DrawCardCommand(3).execute()
  → 完了後に自動的にStep 2へ遷移

Step 2: Select 2 cards
  id: "graceful-charity-select"
  action: () => cardSelectionStore.startSelection(2)
  → ユーザー入力待ち → 確定後にステップ完了
```

**関連性**:
- `effectResolutionStore.startResolution(steps)` が複数ステップを受け取る
- `effectResolutionStore.confirmCurrentStep()` が次のステップへ進む

---

### Entity 3: Card Selection State

**概要**: カード選択UIの状態を表す。選択中のカードID配列、最大選択枚数、選択モードの有効/無効を含む。

**フィールド** (from research.md):
```typescript
interface CardSelectionState {
  isActive: boolean;          // 選択モードが有効か
  selectedCards: string[];    // 選択中のカードインスタンスID配列
  maxSelection: number;       // 最大選択枚数（例: 天使の施し=2）
}
```

**バリデーションルール** (from FR-005):
- `selectedCards.length === maxSelection` になるまで確定ボタン無効化
- `selectedCards` に同じIDが重複してはならない
- 手札に存在しないカードIDは選択不可

**状態遷移**:
```
Inactive → Active (selecting) → Confirmed → Inactive

1. Inactive:
   - isActive: false
   - selectedCards: []

2. Active (selecting):
   - isActive: true
   - selectedCards: ["id1", "id2"]  // ユーザーがクリック中

3. Confirmed:
   - DiscardCardsCommand(selectedCards).execute() 実行
   - reset() → Inactive へ戻る
```

**関連性**:
- `CardSelectionModal.svelte` がこのStoreを購読
- `effectResolutionStore` のStep 2アクションがこのStoreを起動

---

### Entity 4: Game Command

**概要**: ゲーム状態を変更する操作を表す。DrawCardCommand（ドロー）、DiscardCardsCommand（破棄）、ActivateSpellCommand（発動）を含む。

**インターフェース** (from GameCommand.ts):
```typescript
interface GameCommand {
  readonly description: string;  // コマンドの説明（例: "Draw 2 cards"）
  canExecute(state: GameState): boolean;  // 実行可能性チェック
  execute(state: GameState): CommandResult;  // 実行して新しい状態を返す
}

interface CommandResult {
  readonly success: boolean;
  readonly newState: GameState;
  readonly message?: string;
  readonly error?: string;
}
```

**既存Commandクラス**:
1. `DrawCardCommand(count: number)`
   - Domain関数: `drawCards(zones, count)`
   - バリデーション: `deck.length >= count`

2. `ActivateSpellCommand(cardInstanceId: string)`
   - 拡張ポイント: カードID判定ロジック追加（行73-75）
   - バリデーション: メインフェイズ1、手札に存在するか

**新規Commandクラス** (研究結果):
3. `DiscardCardsCommand(cardInstanceIds: string[])`
   - Domain関数: `sendToGraveyard(zones, cardId)` を複数回呼び出し
   - バリデーション: すべてのIDが手札に存在するか

**バリデーションルール** (from ADR-0003):
- すべての状態変更は**Commandクラス経由**（Effect System廃止）
- `canExecute()` でpre-validation（状態を変更せずチェック）
- `execute()` はImmer.jsの`produce()`で不変更新

**状態遷移の例** (天使の施し):
```
1. User clicks card → ActivateSpellCommand.execute()
2. Card ID = 79571449 → 天使の施しフロー開始
3. effectResolutionStore.startResolution([step1, step2])
4. Step 1 action → DrawCardCommand(3).execute()
5. Step 2 action → cardSelectionStore.startSelection(2)
6. User confirms → DiscardCardsCommand(selectedIds).execute()
7. effectResolutionStore.confirmCurrentStep() → 完了
```

---

## State Transition Diagrams

### Effect Resolution Flow (全体フロー)

```
[Idle]
  ↓ ActivateSpellCommand.execute() (カードID検出)
[Resolving - Step 1: Draw]
  ↓ DrawCardCommand.execute() → confirmCurrentStep()
[Resolving - Step 2: Select]
  ↓ cardSelectionStore.startSelection(2) → ユーザー入力待ち
[Waiting for User Input]
  ↓ User confirms selection
[Resolving - Step 2: Discard]
  ↓ DiscardCardsCommand.execute() → confirmCurrentStep()
[Complete]
  ↓ Card sent to graveyard
[Idle]
```

### Card Selection Flow (カード選択サブフロー)

```
[Inactive]
  isActive: false
  selectedCards: []
  ↓ cardSelectionStore.startSelection(maxCount)
[Active - Selecting]
  isActive: true
  selectedCards: [] → ["id1"] → ["id1", "id2"]
  ↓ User clicks "確定" button
[Confirmed]
  ↓ DiscardCardsCommand.execute(selectedCards)
  ↓ cardSelectionStore.reset()
[Inactive]
```

---

## Validation Matrix

このマトリックスは、各エンティティに対する検証ルールを機能要件（FR）にマッピングします。

| エンティティ | 検証ルール | 関連FR | チェック箇所 |
|------------|----------|--------|------------|
| Card Effect | デッキ枚数 >= drawCount | FR-007 | ActivateSpellCommand.canExecute() |
| Card Effect | currentPhase === "main1" | FR-007 | ActivateSpellCommand.canExecute() |
| Card Effect | gameStatus !== "gameOver" | FR-010 | ActivateSpellCommand.canExecute() |
| Card Selection State | selectedCards.length === maxSelection | FR-005 | CardSelectionModal (確定ボタン無効化) |
| Card Selection State | 手札に存在するID | FR-005 | cardSelectionStore.toggleSelection() |
| Game Command | すべてのIDが手札に存在 | FR-009 | DiscardCardsCommand.canExecute() |

---

## Implementation Notes

### 1. カードID → 効果処理のマッピング

**現時点の実装** (Decision 1):
```typescript
// ActivateSpellCommand.execute() 内
if (cardMaster.id === 55144522) {  // 強欲な壺
  const steps: EffectResolutionStep[] = [
    {
      id: "pot-of-greed-draw",
      title: "カードをドローします",
      message: "デッキから2枚ドローします",
      action: () => {
        const drawCmd = new DrawCardCommand(2);
        const result = drawCmd.execute(get(gameStateStore));
        if (result.success) gameStateStore.set(result.newState);
      },
    },
  ];
  effectResolutionStore.startResolution(steps);
} else if (cardMaster.id === 79571449) {  // 天使の施し
  // ... (3ステップ)
}
```

**将来の拡張** (5種類を超えたら):
```typescript
const CARD_EFFECTS: Record<number, EffectResolutionStep[]> = {
  55144522: potOfGreedSteps,
  79571449: gracefulCharitySteps,
  // ...
};
```

### 2. Domain関数の再利用

**既存関数**（変更不要）:
- `drawCards(zones, count)` - DrawCardCommandで使用
- `sendToGraveyard(zones, cardId)` - DiscardCardsCommandで使用
- `moveCard(zones, cardId, from, to)` - 将来的に使用

**新規関数は不要** - 既存関数の組み合わせで実現可能。

---

## References

- **spec.md**: Key Entities セクション
- **research.md**: Technical Decisions
- **GameCommand.ts**: Command Pattern interface
- **effectResolutionStore.ts**: EffectResolutionStep interface
- **ADR-0003**: Command Pattern統一の根拠
