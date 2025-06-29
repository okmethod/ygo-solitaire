<script lang="ts">
  import CountBadge from "$lib/components/atoms/CountBadge.svelte";
  import type { Card } from "$lib/types/card";
  import { CARD_SIZE_CLASSES, type ComponentSize } from "$lib/constants/sizes";
  import cardBackImage from "$lib/assets/CardBack.jpg";

  interface ExtraDeckProps {
    cards: Card[];
    size?: ComponentSize;
    onClick?: () => void;
  }

  let { cards, size = "medium", onClick }: ExtraDeckProps = $props();

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
    {CARD_SIZE_CLASSES[size]}
    relative
    border-2 border-dashed border-gray-400
    rounded-lg
    bg-gray-100 dark:bg-gray-800
    transition-all duration-300
    cursor-pointer
    {isHovered ? 'scale-105 shadow-lg' : ''}
  "
  role="button"
  tabindex="0"
  onclick={handleClick}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onkeydown={(e) => e.key === "Enter" && handleClick()}
>
  <!-- エクストラデッキは常に裏向き表示 -->
  <div class="h-full flex items-center justify-center p-1 relative">
    <img src={cardBackImage} alt="エクストラデッキ" class="w-full h-full object-cover rounded-sm" />
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-xs text-white font-bold text-center select-none drop-shadow-lg"> EX </span>
    </div>
  </div>
  <CountBadge count={cards.length} />
</div>
