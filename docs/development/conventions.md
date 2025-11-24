# コーディング規約

## 基本原則

1. **TypeScript Strict Mode**: 常に有効
2. **Immutability First**: Immer.jsで状態を不変更新
3. **Test-Driven**: ロジック変更時は必ずテストを書く
4. **Layer Separation**: Clean Architectureの境界を守る

## TypeScript

### 命名規則

```typescript
// ✅ Good
interface GameState { }          // PascalCase (インターフェース)
class DrawCardCommand { }        // PascalCase (クラス)
function drawCard() { }          // camelCase (関数)
const EXODIA_CARD_IDS = [...];   // UPPER_SNAKE_CASE (定数)

// ❌ Bad
interface gameState { }          // snake_case不可
class draw_card_command { }      // snake_case不可
```

### 型定義

```typescript
// ✅ Good: 明示的な型定義
function getHandCardCount(state: GameState): number {
  return state.zones.hand.length;
}

// ❌ Bad: 型推論に頼りすぎない（パブリックAPIは必ず明示）
function getHandCardCount(state) {
  return state.zones.hand.length;
}
```

### readonly修飾子

```typescript
// ✅ Good: すべてのGameStateプロパティにreadonly
interface GameState {
  readonly zones: {
    readonly hand: readonly CardInstance[];
  };
}

// ❌ Bad: readonlyなし
interface GameState {
  zones: {
    hand: CardInstance[];
  };
}
```

## Svelte 5

### Runes使用

```svelte
<script lang="ts">
// ✅ Good: Svelte 5 Runes
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log('Count changed:', count);
});
</script>

<!-- ❌ Bad: 古いリアクティブ構文（Svelte 4） -->
<script lang="ts">
let count = 0;
$: doubled = count * 2;
$: console.log('Count changed:', count);
</script>
```

### Store購読

```svelte
<script lang="ts">
import { gameStateStore } from '$lib/application/stores';

// ✅ Good: $記法で自動購読
const gameState = $gameStateStore;
</script>

<!-- ❌ Bad: 手動subscribe（メモリリーク危険） -->
<script lang="ts">
import { gameStateStore } from '$lib/application/stores';

let gameState;
gameStateStore.subscribe(value => {
  gameState = value;
});
</script>
```

## レイヤー境界

### Domain Layer

```typescript
// ✅ Good: 純粋TypeScript、フレームワーク非依存
export class VictoryRule {
  check(state: GameState): GameResult | null {
    // ロジックのみ
  }
}

// ❌ Bad: Svelte依存コード
import { writable } from 'svelte/store';

export class VictoryRule {
  private store = writable(null);  // NG: Svelteへの依存
}
```

### Application Layer

```typescript
// ✅ Good: CommandパターンでDomain呼び出し
export class DrawCardCommand extends GameCommand {
  execute(state: GameState): GameState {
    return produce(state, draft => {
      // Immerで不変更新
    });
  }
}

// ❌ Bad: 直接状態変更
export class DrawCardCommand {
  execute(state: GameState): void {
    state.zones.hand.push(card);  // NG: ミュータブル更新
  }
}
```

### Presentation Layer

```svelte
<script lang="ts">
// ✅ Good: GameFacade経由で操作
import { gameFacade } from '$lib/application/GameFacade';

function handleDrawCard() {
  gameFacade.drawCard();
}
</script>

<!-- ❌ Bad: 直接Commandインスタンス化 -->
<script lang="ts">
import { DrawCardCommand } from '$lib/application/commands';

function handleDrawCard() {
  const command = new DrawCardCommand();
  command.execute(/* ... */);  // NG: レイヤー境界違反
}
</script>
```

## テスト

### テストファイル配置

```
src/lib/domain/rules/
├── VictoryRule.ts
└── __tests__/
    └── VictoryRule.test.ts
```

### テストケース命名

```typescript
// ✅ Good: 明確な説明
describe('VictoryRule', () => {
  it('should detect Exodia victory when all 5 pieces are in hand', () => {
    // ...
  });

  it('should return null when Exodia is incomplete', () => {
    // ...
  });
});

// ❌ Bad: 曖昧な説明
describe('VictoryRule', () => {
  it('works', () => {
    // 何をテストしているか不明
  });
});
```

### モック戦略

```typescript
// ✅ Good: 純粋関数のため実オブジェクトでテスト
const state = createStateWithExodia();
const result = victoryRule.check(state);

// ❌ Bad: 不要なモック
const mockState = vi.fn().mockReturnValue(/* ... */);
```

## Git Commit

### コミットメッセージ

```bash
# ✅ Good: Conventional Commits形式
feat: エクゾディア勝利判定を実装
fix: ドロー時のデッキ枚数チェックを修正
refactor: GameStateをImmutableに変更
test: VictoryRuleのテストを追加
docs: アーキテクチャ概要を更新

# ❌ Bad: 曖昧なメッセージ
git commit -m "update"
git commit -m "fix bug"
```

### ブランチ戦略

```bash
# ✅ Good: 目的別ブランチ
feature/exodia-victory
fix/draw-card-crash
refactor/clean-architecture

# ❌ Bad: mainに直接コミット
git commit -m "..." # mainブランチで作業 NG
```

## フォーマット・リント

### コミット前の必須チェック

```bash
# すべてパス必須
npm run lint
npm run check
npm run test:run
```

### 自動フォーマット

```bash
# 保存時に自動実行される設定推奨
npm run format
```

## パフォーマンス

### Derived Store活用

```typescript
// ✅ Good: 計算結果をキャッシュ
export const handCardCount = derived(
  gameStateStore,
  $state => $state.zones.hand.length
);

// ❌ Bad: コンポーネント内で毎回計算
<script>
const count = $gameStateStore.zones.hand.length; // 毎レンダリング時に実行
</script>
```

### 不要な再描画を避ける

```svelte
<script lang="ts">
// ✅ Good: derived storeで必要な部分のみ購読
const handCards = $derived($gameStateStore.zones.hand);
</script>

<!-- ❌ Bad: 全体を購読 -->
<script lang="ts">
const gameState = $gameStateStore; // hand以外の変更でも再描画
const handCards = gameState.zones.hand;
</script>
```

## ドキュメント

### JSDocの必須箇所

```typescript
// ✅ Good: 公開APIには必ずJSDoc
/**
 * ゲーム状態からエクゾディア勝利を判定します
 * @param state - 現在のゲーム状態
 * @returns 勝利条件を満たす場合はGameResult、それ以外はnull
 */
export function checkExodiaVictory(state: GameState): GameResult | null {
  // ...
}

// ❓ Optional: privateメソッドはJSDoc任意
function validateCard(card: Card): boolean {
  // ...
}
```

## 禁止事項

### ❌ 絶対に避けるべきコード

```typescript
// ❌ Bad: any型の使用
function processCard(card: any) { }

// ❌ Bad: 直接DOM操作
document.getElementById('hand').innerHTML = '...';

// ❌ Bad: グローバル変数
window.gameState = { };

// ❌ Bad: console.log放置（デバッグ後は削除）
console.log('debug:', state);

// ❌ Bad: 型アサーション乱用
const card = data as Card; // 型が本当に正しいか検証せずに使用
```

## レビュー観点

### Pull Request作成前のチェックリスト

- [ ] すべてのテストがパス
- [ ] Linterエラーなし
- [ ] 型エラーなし
- [ ] コミットメッセージがConventional Commits形式
- [ ] 機能追加時はテストも追加
- [ ] ドキュメント更新（必要な場合）
- [ ] ブラウザで動作確認済み

## 関連ドキュメント

- [セットアップガイド](./setup.md)
- [アーキテクチャ概要](../architecture/overview.md)
- [テスト戦略](../architecture/testing-strategy.md)
