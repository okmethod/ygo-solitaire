<script lang="ts">
  import CardComponent from "$lib/components/atoms/Card.svelte";
  import type { Card } from "$lib/types/card";
  import cardBackImage from "$lib/assets/CardBack.jpg";

  interface GraveyardProps {
    cards: Card[];
    size?: "small" | "medium" | "large";
    onClick?: () => void;
  }

  let { cards, size = "medium", onClick }: GraveyardProps = $props();

  // 最後に墓地に置かれたカード
  const topCard = $derived(cards.length > 0 ? cards[cards.length - 1] : null);

  // サイズクラスの定義
  const sizeClasses = {
    small: "w-16 h-24",
    medium: "w-22 h-32",
    large: "w-32 h-48",
  };

  // クリック処理
  function handleClick() {
    if (onClick) {
      onClick();
    }
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
    {sizeClasses[size]}
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
    <div
      class="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md z-10"
    >
      {cards.length}
    </div>
  {:else}
    <!-- カードが無い場合、プレースホルダー色調：グレーを表示する -->
    <div
      class="h-full flex items-center justify-center p-1 relative"
      style="filter: grayscale(0.8) brightness(0.7) contrast(1.2);"
    >
      <img src={cardBackImage} alt="墓地" class="w-full h-full object-cover opacity-30 rounded-sm" />
      <div
        class="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md z-10"
      >
        {cards.length}
      </div>
    </div>
  {/if}
</div>
