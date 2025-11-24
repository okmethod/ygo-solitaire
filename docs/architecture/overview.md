# アーキテクチャ概要

## コンセプト

UIとゲームロジックを完全に分離し、変更に強くテストしやすい構成にする。

## Clean Architecture (3層構造)

```
┌─────────────────────────────────────────────┐
│        Presentation Layer (UI)              │
│    Svelte 5 Components + Skeleton UI        │
│    - Routes, Components, Stores             │
└──────────────────┬──────────────────────────┘
                   │ User Actions
                   ↓
┌─────────────────────────────────────────────┐
│      Application Layer (Use Cases)          │
│    Commands + GameFacade + Stores           │
│    - DrawCardCommand                        │
│    - ActivateSpellCommand                   │
│    - AdvancePhaseCommand                    │
└──────────────────┬──────────────────────────┘
                   │ Domain Operations
                   ↓
┌─────────────────────────────────────────────┐
│        Domain Layer (Core Logic)            │
│    GameState + Rules (Pure TypeScript)      │
│    - VictoryRule, PhaseRule                 │
│    - SpellActivationRule                    │
└─────────────────────────────────────────────┘
```

## レイヤー構成

### Domain Layer (核心)

**場所**: `skeleton-app/src/lib/domain/`

**責任**:
- 「遊戯王のルール」そのものを表現する
- 不変性を保証した純粋なゲームロジック

**依存**:
- 何にも依存しない（Pure TypeScript）
- SvelteやDOMのコードは一切含まない

**主要コンポーネント**:

```typescript
// GameState: 不変なゲーム状態
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

// Rules: ゲームルールの判定
class VictoryRule {
  check(state: GameState): GameResult | null
}

class PhaseRule {
  canAdvance(state: GameState): boolean
  getNextPhase(current: Phase): Phase
}
```

**重要**:
- ここには Svelte や DOM のコードを一切書かない
- ロジック単体でのテストが可能

### Application Layer (接着剤)

**場所**: `skeleton-app/src/lib/application/`

**責任**:
- ユーザーの操作（「カードをクリックした」）をドメインの言葉（「発動アクション」）に変換
- エンジンの処理結果をStoreに反映

**主要コンポーネント**:

```typescript
// Commands: すべての操作をコマンド化
abstract class GameCommand {
  abstract execute(state: GameState): GameState;
}

class DrawCardCommand extends GameCommand {
  execute(state: GameState): GameState {
    // Immer.jsで不変更新
    return produce(state, draft => {
      // ドロー処理
    });
  }
}

// GameFacade: UIからの単一窓口
class GameFacade {
  drawCard(): void
  activateSpell(cardId: string): void
  advancePhase(): void
}
```

**State Management**:
- ゲームの状態（GameState）はSvelteの`writable`で保持
- UIはstoreを購読（subscribe）して自動更新

### Presentation Layer (見た目)

**場所**: `skeleton-app/src/lib/components/`, `skeleton-app/src/routes/`

**責任**:
- Storeの状態を画面に描画
- ユーザー入力を受け取る

**技術スタック**:
- Svelte 5 (Runes: `$state`, `$derived`, `$effect`)
- Skeleton UI v3
- TailwindCSS v4

**ロジック**:
- 「カードが光るアニメーション」などの表示ロジックのみ
- 「攻撃力が計算される」などのゲームロジックは持たない

## データフロー (Unidirectional)

```
1. User Action
   ユーザーがカードをクリック

2. Dispatch
   UI が GameFacade.activateSpell(cardId) を呼ぶ

3. Validate & Execute
   ドメイン層がルール判定し、状態を更新
   新しい GameState を返す

4. State Update
   Store が新しい GameState で上書き

5. Re-render
   Svelte が変更を検知し、画面を再描画
```

## 設計原則

### 1. 不変性 (Immutability)

**実装**: Immer.js + TypeScript `readonly` 修飾子

```typescript
// ❌ Bad: 直接書き換え
state.zones.hand.push(card);

// ✅ Good: Immerで不変更新
return produce(state, draft => {
  draft.zones.hand.push(card);
});
```

**メリット**:
- 変更履歴の追跡が容易
- Svelte Storeとの相性が良い
- バグの原因となる意図しない状態変更を防ぐ

### 2. Command Pattern

すべての操作をCommandクラスで実装：

**メリット**:
- 行動履歴（ログ）の保存が容易
- 将来的に「Undo」機能を実装する際に対応しやすい
- テストが書きやすい

### 3. Strategy Pattern

カードごとの異なる効果処理を交換可能にする（将来拡張用）：

```typescript
interface CardBehavior {
  canActivate(state: GameState, card: Card): boolean;
  onActivate(state: GameState, card: Card): GameState;
}
```

**注**: 現在の実装ではEffect Systemは廃止され、Commandパターンに統一されています（ADR-0003参照）

### 4. Observer Pattern

状態の変化をUIに通知：

**実装**: Svelte Store (`writable`, `derived`)

```typescript
// Store定義
export const gameStateStore = writable<GameState>(initialState);

// UI購読
<script>
  const gameState = $gameStateStore; // Svelte 5 Runes
</script>
```

## ファイル構造

```
skeleton-app/src/lib/
├── domain/                    # Domain Layer
│   ├── models/
│   │   ├── GameState.ts       # ゲーム状態定義
│   │   └── Card.ts            # カード型定義
│   ├── rules/
│   │   ├── VictoryRule.ts     # 勝利条件判定
│   │   ├── PhaseRule.ts       # フェーズ遷移ルール
│   │   └── SpellActivationRule.ts
│   └── factories/
│       └── GameStateFactory.ts
│
├── application/               # Application Layer
│   ├── commands/
│   │   ├── GameCommand.ts     # 基底クラス
│   │   ├── DrawCardCommand.ts
│   │   ├── ActivateSpellCommand.ts
│   │   └── AdvancePhaseCommand.ts
│   ├── GameFacade.ts          # UIからの窓口
│   └── stores/
│       ├── gameStateStore.ts
│       └── derivedStores.ts
│
└── components/                # Presentation Layer
    ├── organisms/
    │   └── board/
    │       ├── DuelField.svelte
    │       ├── HandArea.svelte
    │       └── FieldArea.svelte
    └── molecules/
        └── CardView.svelte
```

## 技術スタック

### フロントエンド
- **フレームワーク**: SvelteKit + Svelte 5
- **UIライブラリ**: Skeleton UI v3
- **CSS**: TailwindCSS v4
- **状態管理**: Svelte Stores + Immer.js
- **型チェック**: TypeScript (Strict mode)
- **テスト**: Vitest + Playwright

### バックエンド（開発時のみ）
- **フレームワーク**: FastAPI + Python
- **用途**: カードデータAPI提供
- **本番**: 静的ビルド（GitHub Pages）でバックエンド不要

## パフォーマンス最適化

### 不変オブジェクトによる更新検知

- GameState の更新は、オブジェクトの一部を書き換えるのではなく、変更があった部分をコピーして新しいオブジェクトを作る
- Svelte は参照の変更を検知して再描画するため、無駄なレンダリングを防ぐ

### Derived Stores

計算コストの高い派生値はキャッシュ：

```typescript
export const handCardCount = derived(
  gameStateStore,
  $state => $state.zones.hand.length
);
```

## 関連ドキュメント

- [設計判断記録](../adr/) - アーキテクチャ上の重要な決定を記録
- [テスト戦略](./testing-strategy.md) - テストの方針と実装方法
- [遊戯王ルール](../domain/yugioh-rules.md) - ドメイン知識
