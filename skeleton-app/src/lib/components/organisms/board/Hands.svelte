<script lang="ts">
  import CardComponent from "$lib/components/atoms/Card.svelte";
  import type { Card } from "$lib/types/card";

  interface HandsProps {
    cards: Card[];
  }

  let { cards }: HandsProps = $props();

  // カード枚数に応じたレイアウトクラスを計算
  const layoutClasses = $derived(() => {
    const cardCount = cards.length;
    if (cardCount === 0) return "justify-center";
    if (cardCount <= 3) return "justify-center gap-4";
    if (cardCount <= 5) return "justify-center gap-3";
    if (cardCount <= 7) return "justify-center gap-2";
    return "justify-center gap-1"; // 7枚を超える場合
  });

  // カードサイズを動的に調整
  const cardSize = $derived(() => {
    const cardCount = cards.length;
    if (cardCount <= 3) return "large";
    if (cardCount <= 5) return "medium";
    return "small"; // 6枚以上
  });

  // カードクリック処理
  function handleCardClick() {
    // TODO: カード選択・使用の処理を実装
  }

  // カードホバー処理
  function handleCardHover() {
    // ホバー時の処理（必要に応じて実装）
  }
</script>

<div class="w-full max-w-6xl mx-auto">
  <div class="transition-all duration-300">
    <!-- 手札情報 -->
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-semibold">手札</h3>
      <span class="badge preset-tonal-surface text-sm">
        {cards.length}枚
      </span>
    </div>

    <!-- カード表示エリア -->
    <div class="bg-surface-100-800-token rounded-lg p-4 min-h-[150px]">
      {#if cards.length > 0}
        <div class="flex {layoutClasses()} flex-wrap">
          {#each cards as card (card.instanceId || `fallback-${card.id}-${Math.random()}`)}
            <div class="transition-all duration-200 hover:scale-105 hover:-translate-y-2">
              <CardComponent
                {card}
                size={cardSize()}
                clickable={true}
                selectable={true}
                animate={true}
                onClick={handleCardClick}
                onHover={handleCardHover}
              />
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex items-center justify-center h-32 text-surface-600-300-token">
          <p class="text-lg">手札にカードがありません</p>
        </div>
      {/if}
    </div>
  </div>
</div>
