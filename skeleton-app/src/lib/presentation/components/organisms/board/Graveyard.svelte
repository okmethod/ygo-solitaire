<script lang="ts">
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import CountBadge from "$lib/presentation/components/atoms/CountBadge.svelte";
  import CardListModal from "$lib/presentation/components/modals/CardListModal.svelte";
  import type { Card } from "$lib/presentation/types/card";
  import { CARD_SIZE_CLASSES, type ComponentSize } from "$lib/presentation/constants/sizes";
  import cardBackImage from "$lib/presentation/assets/CardBack.jpg";

  interface GraveyardProps {
    cards: Card[];
    size?: ComponentSize;
  }

  let { cards, size = "medium" }: GraveyardProps = $props();

  // モーダル状態管理
  let modalOpen = $state(false);

  // 最後に墓地に置かれたカード
  const topCard = $derived(cards.length > 0 ? cards[cards.length - 1] : null);

  // クリック処理
  function handleClick() {
    modalOpen = true;
  }

  // モーダル状態変更処理
  function handleModalChange(open: boolean) {
    modalOpen = open;
  }

  // ホバー状態
  let isHovered = $state(false);

  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
  }
</script>

<div
  class="
    {CARD_SIZE_CLASSES[size]}
    relative
    border-2 border-dashed border-gray-400
    rounded-lg
    bg-gray-100 dark:bg-gray-800
    transition-all duration-300
    cursor-pointer
    hover:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700
    {isHovered ? 'scale-105 shadow-lg' : ''}
  "
  role="button"
  tabindex="0"
  onclick={handleClick}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onkeydown={(e) => e.key === "Enter" && handleClick()}
>
  {#if topCard}
    <!-- カードがある場合、最後に置かれたカードを表示 -->
    <div class="absolute inset-1">
      <CardComponent card={topCard} {size} clickable={false} />
    </div>
    <CountBadge count={cards.length} />
  {:else}
    <!-- カードが無い場合、プレースホルダー色調：グレーを表示する -->
    <div
      class="h-full flex items-center justify-center p-1 relative"
      style="filter: grayscale(0.8) brightness(0.7) contrast(1.2);"
    >
      <img src={cardBackImage} alt="墓地" class="w-full h-full object-cover opacity-30 rounded-sm" />
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs text-surface-600-300-token text-center select-none drop-shadow-lg"> 墓地 </span>
      </div>
    </div>
    <CountBadge count={cards.length} />
  {/if}
</div>

<!-- 墓地モーダル -->
<CardListModal {cards} open={modalOpen} onOpenChange={handleModalChange} title="墓地" borderColor="border-gray-400" />
