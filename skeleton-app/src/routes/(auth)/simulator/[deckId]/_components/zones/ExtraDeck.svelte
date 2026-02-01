<script lang="ts">
  import type { CardDisplayData } from "$lib/presentation/types";
  import { CARD_SIZE_CLASSES, type ComponentSize } from "$lib/presentation/constants/sizes";
  import CountBadge from "$lib/presentation/components/atoms/CountBadge.svelte";
  import cardBackImage from "$lib/presentation/assets/CardBack.jpg";
  import CardStackModal from "../modals/CardStackModal.svelte";

  interface ExtraDeckProps {
    cards: CardDisplayData[];
    size?: ComponentSize;
  }

  let { cards, size = "medium" }: ExtraDeckProps = $props();

  // モーダル状態管理
  let modalOpen = $state(false);

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
    <img src={cardBackImage} alt="EXデッキ" class="w-full h-full object-cover rounded-sm" />
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-xs text-white font-bold text-center select-none drop-shadow-lg"> EX </span>
    </div>
  </div>
  <CountBadge count={cards.length} />
</div>

<!-- エクストラデッキモーダル -->
<CardStackModal
  {cards}
  open={modalOpen}
  onOpenChange={handleModalChange}
  title="EXデッキ"
  borderColor="border-purple-400"
/>
