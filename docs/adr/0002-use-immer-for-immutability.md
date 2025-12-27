# ADR-0002: Immer.js による不変性保証

## Status

~~✅ Accepted (2024-11-23)~~

❌ **Superseded** (2024-12-27) by [ADR-0007: Domain Layer Refactoring](./0007-domain-layer-refactoring.md)

**理由**: GameStateのネスト構造が浅く、spread構文で十分対応可能。外部依存を削減し、Zone.tsの純粋関数パターンと統一。

## Context

Clean Architecture 採用に伴い、GameState の不変性を保証する必要がありました：

1. **Svelte Stores の制約**: 参照が変わらないと再描画されない
2. **デバッグの困難さ**: 可変オブジェクトは状態変化の追跡が困難
3. **並行処理の安全性**: 複数の Command が同時に実行される可能性
4. **TypeScript の限界**: `readonly`修飾子だけでは実行時の保証がない

### 従来の問題

```typescript
// ❌ Bad: 直接書き換え（参照が変わらない）
function drawCard(state: GameState): void {
  state.zones.hand.push(card); // Svelte Storeが変更を検知できない
}

// ❌ Bad: 手動コピー（冗長＋エラーの元）
function drawCard(state: GameState): GameState {
  return {
    ...state,
    zones: {
      ...state.zones,
      hand: [...state.zones.hand, card],
      deck: state.zones.deck.slice(1),
    },
  };
}
```

## Decision

**Immer.js を採用し、`produce()`関数で不変更新を実現する**

### 実装方法

```typescript
import { produce } from "immer";

function drawCard(state: GameState): GameState {
  return produce(state, (draft) => {
    const card = draft.zones.deck[0];
    draft.zones.deck.shift();
    draft.zones.hand.push(card);
  });
}
```

### TypeScript 型定義との連携

```typescript
// すべてのプロパティにreadonly修飾子
interface GameState {
  readonly zones: {
    readonly deck: readonly CardInstance[];
    readonly hand: readonly CardInstance[];
    readonly field: readonly CardInstance[];
    readonly graveyard: readonly CardInstance[];
  };
  readonly turnNumber: number;
  readonly currentPhase: Phase;
  readonly gameResult: GameResult | null;
}
```

## Consequences

### Positive

✅ **直感的な書き方**

- ミュータブルな書き方でイミュータブルな結果を得られる
- コードが簡潔で読みやすい

✅ **パフォーマンス最適化**

- 変更のない部分は元のオブジェクトを再利用（Structural Sharing）
- メモリ効率が良い

✅ **型安全性**

- TypeScript の`readonly`と併用で開発時も実行時も安全

✅ **デバッグ容易性**

- Redux DevTools との連携可能
- 状態変化の履歴追跡が容易

### Negative

❌ **依存ライブラリ追加**

- パッケージサイズ: 約 14KB（gzip 圧縮後）
- トレードオフ: 手動実装のバグリスクと比較して許容範囲

❌ **学習コスト**

- Immer.js の API を理解する必要
- `produce()`の使い方を学ぶ必要

### Neutral

⚖️ **パフォーマンスオーバーヘッド**

- Proxy ベースの実装のため若干のオーバーヘッド
- 実測: ゲームロジック処理で体感差なし

## Alternatives Considered

### Alternative 1: 手動 Spread 構文

```typescript
return {
  ...state,
  zones: {
    ...state.zones,
    hand: [...state.zones.hand, card],
  },
};
```

- **却下理由**: 深くネストした構造では冗長＋ミスしやすい

### Alternative 2: lodash/cloneDeep

```typescript
const newState = cloneDeep(state);
newState.zones.hand.push(card);
return newState;
```

- **却下理由**:
  - 全体をディープコピーするため非効率
  - Structural Sharing なし

### Alternative 3: ImmutableJS

- **却下理由**:
  - 専用の API を使う必要がある（`Map`, `List`）
  - TypeScript 型定義が複雑
  - パッケージサイズが大きい

## Implementation Notes

### インストール

```bash
npm install immer
```

### 使用箇所

- すべての`GameCommand.execute()`メソッド
- `GameStateFactory`での初期化

### パターン例

#### 配列操作

```typescript
// 追加
produce(state, (draft) => {
  draft.zones.hand.push(card);
});

// 削除
produce(state, (draft) => {
  const index = draft.zones.hand.findIndex((c) => c.id === cardId);
  draft.zones.hand.splice(index, 1);
});

// フィルタ
produce(state, (draft) => {
  draft.zones.hand = draft.zones.hand.filter((c) => c.cardId !== "pot-of-greed");
});
```

#### ネストしたオブジェクト

```typescript
produce(state, (draft) => {
  draft.gameResult = {
    winner: "player",
    reason: "exodia",
    timestamp: Date.now(),
  };
});
```

## Validation

### テストケース

```typescript
describe("Immutability", () => {
  it("should not mutate original state", () => {
    const originalState = createInitialState();
    const command = new DrawCardCommand();

    const newState = command.execute(originalState);

    expect(originalState.zones.hand.length).toBe(0); // 元の状態は不変
    expect(newState.zones.hand.length).toBe(1);
  });

  it("should share unchanged parts", () => {
    const originalState = createInitialState();
    const command = new DrawCardCommand();

    const newState = command.execute(originalState);

    // 変更のない部分は参照が同じ
    expect(newState.zones.graveyard).toBe(originalState.zones.graveyard);
    expect(newState.turnNumber).toBe(originalState.turnNumber);
  });
});
```

## Related Documents

- [ADR-0001: Clean Architecture の採用](./0001-adopt-clean-architecture.md)
- [アーキテクチャ概要](../architecture/overview.md)
- [Immer.js 公式ドキュメント](https://immerjs.github.io/immer/)

## References

- [specs/001-architecture-refactoring/tasks.md](../../specs/001-architecture-refactoring/tasks.md) (T003)
