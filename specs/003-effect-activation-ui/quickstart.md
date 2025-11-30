# Quickstart: Effect Activation UI Implementation

**Feature**: 003-effect-activation-ui | **Date**: 2025-11-30

## Overview

この機能は3つの優先度付きユーザーストーリー（P1-P3）から構成される。各ストーリーは独立して実装・テスト可能。

## Prerequisites

- Node.js 18+ インストール済み
- プロジェクトルート: `/Users/shohei/github/ygo-solitaire`
- ブランチ: `003-effect-activation-ui`

## Development Setup

```bash
# プロジェクトルートに移動
cd /Users/shohei/github/ygo-solitaire/skeleton-app

# 依存関係インストール（初回のみ）
npm install

# 開発サーバー起動
npm run dev

# 別ターミナルでテスト監視
npm run test
```

**動作確認URL**: http://localhost:5173/simulator/{deckId}

---

## Implementation Order (優先度順)

### Phase 1: P1 - View Card Illustrations (最優先)

**Goal**: カードIDではなくイラスト画像で表示

**Files to create/modify**:
1. **新規**: `src/lib/application/stores/cardDisplayStore.ts`
2. **修正**: `src/routes/(auth)/simulator/[deckId]/+page.svelte`

**Steps**:

#### Step 1.1: cardDisplayStoreを作成

```bash
# ファイル作成
touch skeleton-app/src/lib/application/stores/cardDisplayStore.ts
```

**実装内容**: [contracts/cardDisplayStore.contract.ts](./contracts/cardDisplayStore.contract.ts) 参照

**重要ポイント**:
- Svelte `derived()` を使用
- gameStateStoreを監視
- getCardsByIds()でバッチ取得
- エラー時は空配列を返す

**テスト**:
```bash
cd skeleton-app
npx vitest src/lib/application/stores/__tests__/cardDisplayStore.test.ts
```

#### Step 1.2: V2シミュレーターページを修正

**ファイル**: `src/routes/(auth)/simulator/[deckId]/+page.svelte`

**変更内容**:
1. cardDisplayStoreをインポート
2. 手札表示を `$handCards` から取得
3. Card.svelteに `card={cardData}` でCardDisplayDataを渡す

**実装サンプル**:
```svelte
<script lang="ts">
  import { handCards } from "$lib/application/stores/cardDisplayStore";
  import Card from "$lib/components/atoms/Card.svelte";

  $: handCardsData = $handCards;
</script>

<div class="grid grid-cols-5 gap-2">
  {#each handCardsData as card (card.id)}
    <Card {card} size="medium" />
  {:else}
    <p>No cards in hand</p>
  {/each}
</div>
```

**動作確認**:
1. シミュレーターページを開く
2. "Draw Card"ボタンをクリック
3. 手札にカードイラストが表示されることを確認

---

### Phase 2: P2 - Execute Card Effect Commands (次優先)

**Goal**: カードクリックで効果発動

**Files to modify**:
1. `src/routes/(auth)/simulator/[deckId]/+page.svelte`

**Steps**:

#### Step 2.1: カードクリックハンドラーを追加

**実装内容**: [contracts/duelfield-integration.contract.svelte](./contracts/duelfield-integration.contract.svelte) 参照

**重要ポイント**:
- Main1フェーズのみ発動可能（`$currentPhase === "Main1"`）
- `$canActivateSpells` でルール検証
- `gameFacade.activateSpell(instanceId)` 実行
- トーストメッセージで結果通知

**実装サンプル**:
```svelte
<script lang="ts">
  import { gameFacade } from "$lib/application/GameFacade";
  import { currentPhase, canActivateSpells } from "$lib/application/stores/derivedStores";
  import { showSuccessToast, showErrorToast } from "$lib/utils/toaster";

  function handleCardClick(card: CardDisplayData, instanceId: string) {
    if ($currentPhase !== "Main1") {
      showErrorToast("メインフェーズ1でのみ発動できます");
      return;
    }

    const result = gameFacade.activateSpell(instanceId);
    if (result.success) {
      showSuccessToast(`${card.name}を発動しました`);
    } else {
      showErrorToast(result.error || "発動に失敗しました");
    }
  }
</script>

<Card
  {card}
  clickable={$currentPhase === "Main1" && $canActivateSpells}
  onClick={() => handleCardClick(card, instanceId)}
/>
```

**動作確認**:
1. "Advance Phase"でMain1に移行
2. 手札の魔法カードをクリック
3. トーストメッセージが表示され、カードが墓地に移動

---

### Phase 3: P3 - Interactive Card Detail Display (低優先)

**Goal**: カード詳細情報のモーダル表示

**Files to use**:
- **既存**: `src/lib/components/organisms/CardDetailDisplay.svelte`
- **既存**: Card.svelteの `showDetailOnClick` props

**Steps**:

#### Step 3.1: Card.svelteのshowDetailOnClickを有効化

```svelte
<Card
  {card}
  clickable={true}
  showDetailOnClick={true}
/>
```

**動作確認**:
1. 任意のカードイラストをクリック
2. CardDetailDisplayモーダルが開く
3. カード詳細（効果テキスト、ステータスなど）が表示される

---

## Testing Strategy

### Unit Tests

```bash
# cardDisplayStoreのテスト
npx vitest src/lib/application/stores/__tests__/cardDisplayStore.test.ts

# 全ユニットテスト実行
npm run test:run
```

### Integration Tests

```bash
# V2シミュレーターページの統合テスト
npx vitest src/routes/(auth)/simulator/__tests__/integration.test.ts
```

### E2E Tests

```bash
# Playwright E2Eテスト
npm run test:e2e

# 特定のテストのみ実行
npx playwright test tests/e2e/effect-activation-ui.test.ts
```

---

## Debugging Tips

### カードイラストが表示されない場合

1. **ブラウザコンソール確認**:
   ```
   [cardDisplayStore] Failed to fetch hand cards: ...
   ```
   → YGOPRODeck API エラー、ネットワーク問題

2. **キャッシュクリア**:
   ```typescript
   import { clearCache } from '$lib/api/ygoprodeck';
   clearCache();
   ```

3. **ストア状態確認**:
   ```svelte
   <pre>{JSON.stringify($handCards, null, 2)}</pre>
   ```

### 効果発動が実行されない場合

1. **フェーズ確認**:
   ```svelte
   <p>Current Phase: {$currentPhase}</p>
   <p>Can Activate: {$canActivateSpells}</p>
   ```

2. **GameFacade結果確認**:
   ```typescript
   const result = gameFacade.activateSpell(instanceId);
   console.log('Activate result:', result);
   ```

---

## Performance Monitoring

### レンダリングパフォーマンス

```bash
# Chrome DevTools → Performance タブ
# - 目標: 30fps以上維持
# - 確認: 40枚同時表示時のフレームレート
```

### API呼び出し頻度

```bash
# Network タブ → Filter: ygoprodeck.com
# - 初回ロード: 1-2リクエスト
# - ドロー時: 0リクエスト（キャッシュヒット）
```

---

## Common Issues & Solutions

| 問題 | 原因 | 解決策 |
|------|------|--------|
| カードが表示されない | API取得失敗 | ネットワーク確認、キャッシュクリア |
| クリックしても反応なし | フェーズがMain1以外 | Advance Phaseで移行 |
| トーストが出ない | toasterのインポート忘れ | showSuccessToast/showErrorToastをインポート |
| 型エラー | CardDisplayDataとCardのミスマッチ | 型定義を確認（Card = CardDisplayData） |

---

## Next Steps

Phase 1-3完了後:
1. Linter実行: `npm run lint`
2. Formatter実行: `npm run format`
3. 全テスト実行: `npm run test:run`
4. ビルド確認: `npm run build`
5. コミット: 各フェーズごとにコミット
6. PR作成: mainブランチへのマージリクエスト

---

## References

- **Spec**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/](./contracts/)
- **YGOPRODeck API**: https://db.ygoprodeck.com/api-guide/
- **Svelte 5 Docs**: https://svelte.dev/docs/svelte/overview
