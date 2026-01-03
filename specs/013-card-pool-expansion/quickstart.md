# Quick Start: Additional Spell Cards Implementation

**Feature**: 013-card-pool-expansion
**Date**: 2026-01-02

## Integration Scenarios

このfeatureで実装する6枚の魔法カードの統合シナリオを示します。各シナリオは、実際のゲームプレイでどのように動作するかを記述しています。

## Scenario 1: Graveyard Recovery Combo (P1)

**Objective**: 墓地から魔法カードを回収し、再利用する

**Setup**:
```typescript
const state = createMockGameState({
  phase: "Main1",
  zones: {
    deck: createCardInstances(Array(35).fill("12345678"), "deck"),
    hand: createCardInstances(["98494543", "1001", "1002"], "hand"), // 魔法石の採掘 + 2枚
    graveyard: createCardInstances(["55144522", "79571449"], "graveyard"), // 強欲な壺、天使の施し
  },
});
```

**Steps**:
1. プレイヤーが魔法石の採掘を発動
2. コストとして手札2枚を選択して墓地に送る
3. 墓地の魔法カードリストから1枚選択（例: 強欲な壺）
4. 選択したカードが手札に加わる
5. 魔法石の採掘が墓地に送られる

**Expected Outcome**:
- 手札: 1枚（強欲な壺）
- 墓地: 4枚（魔法石の採掘 + コスト2枚 + 天使の施し）

**Integration Test Location**: `tests/integration/card-effects/NormalSpells.test.ts`

## Scenario 2: Risky Draw with End Phase Penalty (P1)

**Objective**: 無の煉獄で1枚ドローし、エンドフェイズに手札を全て捨てる

**Setup**:
```typescript
const state = createMockGameState({
  phase: "Main1",
  zones: {
    deck: createCardInstances(["card1", "card2", "card3"], "deck"),
    hand: createCardInstances(["93946239", "hand1", "hand2", "hand3"], "hand"), // 無の煉獄 + 3枚
  },
});
```

**Steps**:
1. プレイヤーが無の煉獄を発動
2. デッキから1枚ドロー（手札は4枚になる）
3. 無の煉獄が墓地に送られる
4. エンドフェイズに進む
5. pendingEndPhaseEffectsが実行され、手札4枚が全て墓地に送られる

**Expected Outcome**:
- Main1フェーズ終了時: 手札4枚、墓地1枚（無の煉獄）
- Endフェーズ終了時: 手札0枚、墓地5枚（無の煉獄 + 手札4枚）

**Integration Test Location**: `tests/integration/card-effects/NormalSpells.test.ts`

## Scenario 3: Deck Excavation with Once-Per-Turn Limit (P2)

**Objective**: 強欲で謙虚な壺でデッキの上3枚から1枚選択し、同じターンに2枚目を発動できないことを確認

**Setup**:
```typescript
const state = createMockGameState({
  phase: "Main1",
  zones: {
    deck: createCardInstances(["card1", "card2", "card3", "card4", "card5"], "deck"),
    hand: createCardInstances(["98645731", "98645731"], "hand"), // 強欲で謙虚な壺 x2
  },
});
```

**Steps**:
1. プレイヤーが1枚目の強欲で謙虚な壺を発動
2. activatedOncePerTurnCardsに98645731が追加される
3. デッキの上3枚を確認（card1, card2, card3）
4. 1枚選択（例: card2）して手札に加える
5. 残り2枚をデッキに戻す
6. プレイヤーが2枚目の強欲で謙虚な壺を発動しようとする
7. canActivate()がfalseを返す（activatedOncePerTurnCardsに存在）

**Expected Outcome**:
- 1枚目: 発動成功、手札に1枚追加
- 2枚目: 発動失敗（同じターンに発動済み）
- Endフェーズ後: activatedOncePerTurnCardsがクリアされる

**Integration Test Location**: `tests/integration/card-effects/NormalSpells.test.ts`

## Scenario 4: Complex Card - Draw Until 3 + End Phase Discard (P2)

**Objective**: 命削りの宝札で手札3枚までドローし、エンドフェイズに全て捨てる

**Setup**:
```typescript
const state = createMockGameState({
  phase: "Main1",
  zones: {
    deck: createCardInstances(["card1", "card2", "card3", "card4", "card5"], "deck"),
    hand: createCardInstances(["59750328"], "hand"), // 命削りの宝札のみ
  },
});
```

**Steps**:
1. プレイヤーが命削りの宝札を発動
2. activatedOncePerTurnCardsに59750328が追加される
3. 手札が3枚になるまでドロー（3枚ドロー）
4. 相手のダメージを0にする効果が適用される（内部フラグ）
5. エンドフェイズ処理が登録される
6. 命削りの宝札が墓地に送られる
7. エンドフェイズに進む
8. 手札3枚が全て墓地に送られる

**Expected Outcome**:
- Main1フェーズ終了時: 手札3枚、墓地1枚（命削りの宝札）
- Endフェーズ終了時: 手札0枚、墓地4枚（命削りの宝札 + 手札3枚）

**Integration Test Location**: `tests/integration/card-effects/NormalSpells.test.ts`

## Scenario 5: Toon Card Search (P3)

**Objective**: トゥーンのもくじでデッキからトゥーンカードをサーチ

**Setup**:
```typescript
const state = createMockGameState({
  phase: "Main1",
  zones: {
    deck: createCardInstances([
      "15259703", // トゥーンワールド
      "12345678", // 通常カード
      "12345678",
    ], "deck"),
    hand: createCardInstances(["89997728"], "hand"), // トゥーンのもくじ
  },
});
```

**Steps**:
1. プレイヤーがトゥーンのもくじを発動
2. デッキから「トゥーン」を含むカードを検索
3. トゥーンワールド（15259703）が見つかる
4. トゥーンワールドを手札に加える
5. トゥーンのもくじが墓地に送られる

**Expected Outcome**:
- 手札: 1枚（トゥーンワールド）
- デッキ: 2枚（通常カード x2）
- 墓地: 1枚（トゥーンのもくじ）

**Integration Test Location**: `tests/integration/card-effects/NormalSpells.test.ts`

## Scenario 6: LP Payment for Field Spell (P3)

**Objective**: トゥーンワールドを1000LP支払って発動

**Setup**:
```typescript
const state = createMockGameState({
  phase: "Main1",
  lp: { player: 8000, opponent: 8000 },
  zones: {
    deck: createCardInstances(Array(35).fill("12345678"), "deck"),
    hand: createCardInstances(["15259703"], "hand"), // トゥーンワールド
    field: [],
  },
});
```

**Steps**:
1. プレイヤーがトゥーンワールドを発動
2. 1000LPを支払う（player LP: 8000 → 7000）
3. トゥーンワールドがフィールドに配置される

**Expected Outcome**:
- LP: 7000（8000 - 1000）
- 手札: 0枚
- フィールド: 1枚（トゥーンワールド）

**Integration Test Location**: `tests/integration/card-effects/FieldSpells.test.ts`

## Test Execution Order

統合テストは以下の順序で実行することを推奨します:

1. **Scenario 1** (魔法石の採掘) - 墓地選択UIの基本動作確認
2. **Scenario 2** (無の煉獄) - エンドフェイズ処理の基本動作確認
3. **Scenario 3** (強欲で謙虚な壺) - 1ターンに1枚制約の動作確認
4. **Scenario 4** (命削りの宝札) - 複合効果の動作確認
5. **Scenario 5** (トゥーンのもくじ) - カード名検索の動作確認
6. **Scenario 6** (トゥーンワールド) - LP支払い + フィールド配置の動作確認

## Notes

- すべてのシナリオは既存のテストパターン（NormalSpells.test.ts、FieldSpells.test.ts）に統合される
- エンドフェイズ処理の検証には、AdvancePhaseCommandを使用してフェーズを進める必要がある
- 1ターンに1枚制約の検証には、同じターン内で2回発動を試みるテストケースが必要
