# GameState/Rules 段階的移行戦略

## 概要

このドキュメントは、既存の Domain Layer コード（GameState, Rules, DuelState）を、文字列ベースのカードID（`cardId: string`）から数値ベースの `DomainCardData`（`id: number`）に段階的に移行する戦略を定義します。

## 現状分析

### 影響範囲

**対象タスク**:
- **T023**: `src/lib/domain/models/GameState.ts` の移行
- **T024**: `src/lib/domain/rules/*.ts` の移行
- **T025**: `src/lib/classes/DuelState.ts` の移行

**影響ファイル数**:
- 204以上のテストファイル（ほぼ全ユニットテスト）
- 30以上のDomain Layerソースファイル

### 現在の型定義

#### 既存: CardInstance (文字列ID)

```typescript
// 現在のGameState.ts
export interface CardInstance {
  cardId: string;  // 文字列ベースのカードID（例: "33396948"）
  zoneType: ZoneType;
  index: number;
  position?: CardPosition;
}

export interface GameState {
  deck: CardInstance[];
  hand: CardInstance[];
  field: {
    monsterZones: (CardInstance | null)[];
    spellTrapZones: (CardInstance | null)[];
  };
  graveyard: CardInstance[];
  banished: CardInstance[];
}
```

#### 移行先: DomainCardData (数値ID)

```typescript
// 新しいDomain Layer型
export interface DomainCardData {
  id: number;              // YGOPRODeck API互換の数値ID
  type: SimpleCardType;    // "monster" | "spell" | "trap"
  frameType?: string;      // 効果判定用（例: "effect", "fusion"）
}
```

### 破壊的変更の詳細

```typescript
// Before (文字列ID)
const card: CardInstance = { cardId: "33396948", zoneType: "hand", index: 0 };

// After (数値ID + 型情報)
const card: DomainCardData = { id: 33396948, type: "monster", frameType: "effect" };
```

**変更が必要な箇所**:
1. **型定義の変更**: `cardId: string` → `id: number`
2. **型情報の追加**: `type: SimpleCardType` の追加
3. **テストデータの変更**: すべてのモックデータ（204ファイル）

---

## 移行戦略

### 戦略1: Big Bang移行（非推奨）

**概要**: すべてのファイルを一度に変更

**メリット**:
- 移行が一度で完了
- 中間状態が存在しない

**デメリット**:
- ❌ 204ファイルの変更を一度に行うため、エラーリスクが高い
- ❌ テスト失敗時のデバッグが困難
- ❌ レビュー負荷が大きい（数千行の変更）
- ❌ ロールバックが困難

**結論**: 採用しない

---

### 戦略2: ファイル単位の段階的移行（推奨）⭐

**概要**: 1ファイルずつ移行し、各ステップでテストを通す

**メリット**:
- ✅ 各ステップでテストが通る状態を維持
- ✅ レビューが容易（変更範囲が小さい）
- ✅ 問題発生時のロールバックが容易
- ✅ 段階的なリスク管理

**デメリット**:
- 一時的に型エイリアスなどの互換層が必要
- 移行完了まで時間がかかる

**結論**: **採用** ⭐

---

## 実装計画

### Phase 1: 型エイリアスと互換層の準備

**目的**: 既存コードを壊さずに新型を導入

#### Step 1.1: CardInstance の段階的廃止準備

```typescript
// src/lib/domain/models/Card.ts に追加

/**
 * @deprecated Use DomainCardData instead (T023-T025 migration)
 *
 * この型は既存コードとの互換性のために残されています。
 * 新しいコードでは DomainCardData を使用してください。
 */
export interface CardInstance {
  cardId: string;
  zoneType?: ZoneType;
  index?: number;
  position?: CardPosition;
}

/**
 * 文字列IDから数値IDに変換する一時的なヘルパー関数
 * @deprecated 移行完了後に削除予定
 */
export function convertCardInstanceToDomainCardData(
  instance: CardInstance
): DomainCardData {
  return {
    id: parseInt(instance.cardId, 10),
    type: inferCardTypeFromId(instance.cardId), // 後で実装
    frameType: undefined,  // 必要に応じて取得
  };
}

/**
 * 数値IDから文字列IDに変換する一時的なヘルパー関数
 * @deprecated 移行完了後に削除予定
 */
export function convertDomainCardDataToCardInstance(
  card: DomainCardData,
  zoneType: ZoneType,
  index: number
): CardInstance {
  return {
    cardId: card.id.toString(),
    zoneType,
    index,
  };
}
```

#### Step 1.2: 型推論ヘルパー関数の実装（T018）

```typescript
// src/lib/domain/models/Card.ts

/**
 * カードIDからカードタイプを推論（一時的な実装）
 *
 * @deprecated API統合後は外部APIから取得すべき
 * @param cardId - YGOPRODeck API互換の数値カードID
 * @returns SimpleCardType
 */
export function inferCardTypeFromId(cardId: string | number): SimpleCardType {
  const id = typeof cardId === "string" ? parseInt(cardId, 10) : cardId;

  // 既知のカードIDのハードコード（一時的）
  // TODO: 将来的にはYGOPRODeck APIから取得
  const KNOWN_MONSTER_IDS = [33396948, 7902349, 70903634, 8124921, 44519536];
  const KNOWN_SPELL_IDS = [55144522, 79571449];
  const KNOWN_TRAP_IDS = [];

  if (KNOWN_MONSTER_IDS.includes(id)) return "monster";
  if (KNOWN_SPELL_IDS.includes(id)) return "spell";
  if (KNOWN_TRAP_IDS.includes(id)) return "trap";

  // デフォルトはmonster（後で修正）
  console.warn(`Unknown card ID: ${id}, defaulting to "monster"`);
  return "monster";
}
```

**Note**: この関数は一時的な実装。将来的には YGOPRODeck API から型情報を取得すべき。

---

### Phase 2: GameState.ts の移行（T023）

**優先度**: 高（他のファイルが依存）

#### Step 2.1: GameState型の更新

```typescript
// src/lib/domain/models/GameState.ts

// Before:
export interface GameState {
  deck: CardInstance[];
  hand: CardInstance[];
  // ...
}

// After:
export interface GameState {
  deck: DomainCardData[];
  hand: DomainCardData[];
  field: {
    monsterZones: (DomainCardData | null)[];
    spellTrapZones: (DomainCardData | null)[];
  };
  graveyard: DomainCardData[];
  banished: DomainCardData[];
  // 既存のプロパティは維持
  phase: GamePhase;
  turnCount: number;
  hasNormalSummoned: boolean;
}
```

#### Step 2.2: ファクトリー関数の更新

```typescript
// src/lib/domain/models/GameState.ts

/**
 * 初期ゲーム状態を生成（数値ID対応）
 * @param deckCardIds - YGOPRODeck API互換の数値カードID配列
 */
export function createInitialGameState(deckCardIds: number[]): GameState {
  const deckCards: DomainCardData[] = deckCardIds.map((id) => ({
    id,
    type: inferCardTypeFromId(id),
    frameType: undefined,  // 必要に応じて取得
  }));

  return {
    deck: deckCards,
    hand: [],
    field: {
      monsterZones: [null, null, null, null, null],
      spellTrapZones: [null, null, null, null, null],
    },
    graveyard: [],
    banished: [],
    phase: "draw",
    turnCount: 1,
    hasNormalSummoned: false,
  };
}

/**
 * @deprecated Use createInitialGameState with number IDs
 */
export function createInitialGameStateFromStringIds(deckCardIds: string[]): GameState {
  const numericIds = deckCardIds.map((id) => parseInt(id, 10));
  return createInitialGameState(numericIds);
}
```

#### Step 2.3: テストの段階的更新

```typescript
// tests/unit/domain/models/GameState.test.ts

describe("createInitialGameState (T023)", () => {
  it("should accept numeric card IDs", () => {
    // 新しい実装（数値ID）
    const state = createInitialGameState([33396948, 55144522, 79571449]);

    expect(state.deck).toHaveLength(3);
    expect(state.deck[0]).toEqual({
      id: 33396948,
      type: "monster",
      frameType: undefined,
    });
  });

  it("should maintain backward compatibility with string IDs", () => {
    // 旧実装（文字列ID）への互換性
    const state = createInitialGameStateFromStringIds(["33396948", "55144522"]);

    expect(state.deck).toHaveLength(2);
    expect(state.deck[0].id).toBe(33396948);
  });
});
```

---

### Phase 3: Rules層の移行（T024）

**優先度**: 中（GameState移行後に実施）

#### Step 3.1: Rules関数のシグネチャ更新

```typescript
// src/lib/domain/rules/draw.ts

// Before:
export function canDraw(state: GameState): boolean {
  return state.deck.length > 0 && state.phase === "draw";
}

export function draw(state: GameState): GameState {
  if (!canDraw(state)) return state;

  const [drawnCard, ...remainingDeck] = state.deck;
  return produce(state, (draft) => {
    draft.deck = remainingDeck;
    draft.hand.push(drawnCard);
  });
}

// After: 変更なし（GameStateの型定義が変わるだけ）
```

**重要**: Rules層はすでに `GameState` を使用しているため、GameState の型が変わるだけで自動的に移行される。

#### Step 3.2: Rules層のテスト更新

```typescript
// tests/unit/domain/rules/draw.test.ts

describe("draw (T024)", () => {
  it("should draw a card from deck to hand", () => {
    // テストデータを数値IDに変更
    const initialState = createInitialGameState([33396948, 55144522]);

    const newState = draw(initialState);

    expect(newState.deck).toHaveLength(1);
    expect(newState.hand).toHaveLength(1);
    expect(newState.hand[0].id).toBe(33396948);
  });
});
```

---

### Phase 4: DuelState.ts の移行（T025）

**優先度**: 低（Application Layer、UI層への影響大）

#### Step 4.1: DuelState の型更新

```typescript
// src/lib/classes/DuelState.ts

// Before:
private gameState: GameState;  // CardInstance[] を使用

// After: 変更なし（GameStateの型が変わるだけ）
```

#### Step 4.2: デッキ初期化の変更

```typescript
// src/lib/classes/DuelState.ts

/**
 * デッキレシピからゲーム状態を初期化（数値ID対応）
 */
public initializeFromDeckRecipe(deckRecipe: DeckRecipe): void {
  // デッキレシピから数値カードIDを抽出
  const deckCardIds: number[] = [
    ...deckRecipe.mainDeck.map((entry) => entry.id),
    ...deckRecipe.extraDeck.map((entry) => entry.id),
  ];

  this.gameState = createInitialGameState(deckCardIds);
}
```

---

## テスト戦略

### Phase別テスト計画

| Phase | テスト対象 | テスト数（概算） | 備考 |
|-------|----------|-----------------|------|
| Phase 1 | 型ガード、変換関数 | 10 tests | 新規テスト |
| Phase 2 | GameState.ts | 50 tests | 既存テスト更新 |
| Phase 3 | Rules層 | 100 tests | 既存テスト更新 |
| Phase 4 | DuelState.ts | 44 tests | 既存テスト更新 |

### テスト実行戦略

```bash
# Phase 2完了時（GameState.ts移行後）
npm run test:run -- tests/unit/domain/models/GameState.test.ts
# ✅ 50/50 tests passed

# Phase 3完了時（Rules層移行後）
npm run test:run -- tests/unit/domain/rules/
# ✅ 100/100 tests passed

# Phase 4完了時（DuelState.ts移行後）
npm run test:run -- tests/unit/classes/DuelState.test.ts
# ✅ 44/44 tests passed

# 全テスト実行（すべてのPhase完了後）
npm run test:run
# ✅ 239/239 tests passed
```

---

## リスク管理

### リスク1: 型推論の不正確性

**問題**: `inferCardTypeFromId()` がハードコードされており、新しいカードIDに対応できない

**対策**:
1. **短期**: 既知のカードIDをハードコード（テスト用）
2. **中期**: YGOPRODeck API から型情報を取得
3. **長期**: デッキレシピに型情報を含める

```typescript
// 長期的な解決策: デッキレシピに型情報を含める
export interface RecipeCardEntry {
  id: number;
  type: SimpleCardType;  // ← 追加
  frameType?: string;    // ← 追加
  quantity: number;
}
```

### リスク2: テストデータの不整合

**問題**: 204ファイルのテストデータを一度に更新するとミスが発生しやすい

**対策**:
1. **段階的更新**: 1ファイルずつ更新
2. **自動化スクリプト**: 文字列ID → 数値ID変換スクリプトの作成
3. **検証**: 各ステップでテスト実行

```bash
# テストデータ変換スクリプト（例）
# skeleton-app/scripts/migrate-test-data.sh

#!/bin/bash
# すべての "cardId: \"123\"" を "id: 123" に変換
find tests/unit -name "*.test.ts" -exec sed -i '' 's/cardId: "\([0-9]*\)"/id: \1/g' {} \;
```

### リスク3: 移行中の型不整合

**問題**: 一部のファイルが移行済み、一部が未移行の場合の型エラー

**対策**:
1. **型エイリアス**: 互換層を維持
2. **段階的削除**: 全移行完了後に互換層を削除
3. **コンパイルチェック**: 各ステップで `npm run check` を実行

---

## 移行完了後のクリーンアップ

### 削除対象

移行完了後に削除すべき一時的な実装：

```typescript
// ❌ 削除対象
export function convertCardInstanceToDomainCardData() { /* ... */ }
export function convertDomainCardDataToCardInstance() { /* ... */ }
export function inferCardTypeFromId() { /* ... */ }
export function createInitialGameStateFromStringIds() { /* ... */ }

// ❌ 削除対象（型定義）
export interface CardInstance { /* ... */ }
```

### 削除手順

```bash
# Step 1: すべてのテストが通ることを確認
npm run test:run
# ✅ 239/239 tests passed

# Step 2: @deprecated 関数の使用箇所を検索
grep -r "convertCardInstanceToDomainCardData" skeleton-app/
# 結果: 0 matches (使用箇所なし)

# Step 3: @deprecated 関数を削除
# src/lib/domain/models/Card.ts から削除

# Step 4: 再度テスト実行
npm run test:run
# ✅ 239/239 tests passed

# Step 5: TypeScript型チェック
npm run check
# ✅ No errors
```

---

## スケジュール（概算）

| Phase | 内容 | 所要時間 | 備考 |
|-------|------|---------|------|
| Phase 1 | 互換層準備 | 1-2時間 | 型定義、変換関数 |
| Phase 2 | GameState.ts移行 | 2-3時間 | テスト更新含む |
| Phase 3 | Rules層移行 | 3-4時間 | 100テスト更新 |
| Phase 4 | DuelState.ts移行 | 2-3時間 | 44テスト更新 |
| Cleanup | 互換層削除 | 1時間 | @deprecated削除 |
| **合計** | | **9-13時間** | 段階的実施前提 |

**注意**: 一度に実施するのではなく、各Phaseを完了させてから次に進む。

---

## まとめ

### 採用戦略: ファイル単位の段階的移行

**理由**:
1. ✅ リスク管理: 各ステップでテストを通す
2. ✅ レビュー負荷: 変更範囲が小さい
3. ✅ ロールバック: 問題発生時の切り戻しが容易
4. ✅ 段階的学習: チームメンバーが段階的に理解

### 次のステップ

1. **Phase 1実装**: 互換層準備（T017, T018）
2. **Phase 2実装**: GameState.ts移行（T023）
3. **Phase 3実装**: Rules層移行（T024）
4. **Phase 4実装**: DuelState.ts移行（T025）
5. **Cleanup**: 互換層削除（Phase 7）

### 成功基準

- ✅ 全239テストがパス
- ✅ TypeScript型チェックエラーなし
- ✅ 互換層が完全に削除されている
- ✅ YGOPRODeck API互換の数値IDが使用されている

---

## 参考資料

- **タスク定義**: `specs/002-data-model-refactoring/tasks.md`
- **データモデル設計**: `docs/architecture/data-model-design.md`
- **型定義**: `skeleton-app/src/lib/domain/models/Card.ts`
- **GameState**: `skeleton-app/src/lib/domain/models/GameState.ts`
