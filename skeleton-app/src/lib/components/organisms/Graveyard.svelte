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

  // 最上位カード（最後に追加されたカード）
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
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
  {#if topCard}
    <!-- 最上位カードがある場合 -->
    <div class="absolute inset-1">
      <CardComponent card={topCard} {size} clickable={false} />
    </div>

    <!-- 枚数表示（右上） -->
    <div
      class="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md z-10"
    >
      {cards.length}
    </div>
  {:else}
    <!-- 墓地が空の場合のプレースホルダー -->
    <div class="h-full flex flex-col items-center justify-center p-2">
      <img src={cardBackImage} alt="墓地" class="w-8 h-12 object-cover opacity-30 mb-1" />
      <span class="text-xs text-gray-600 dark:text-gray-400 font-medium text-center">
        墓地<br />
        {cards.length}枚
      </span>
    </div>
  {/if}
</div>