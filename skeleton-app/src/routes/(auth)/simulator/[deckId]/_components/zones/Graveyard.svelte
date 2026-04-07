<script lang="ts">
  import { onMount } from "svelte";
  import type { DisplayCardInstance } from "$lib/presentation/types";
  import { CARD_SIZE_CLASSES, BADGE_SIZE_CLASSES, type ComponentSize } from "$lib/presentation/constants/sizes";
  import { isMobile } from "$lib/presentation/utils/mobile";
  import { cardAnimationStore } from "$lib/presentation/stores/cardAnimationStore";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import CountBadge from "$lib/presentation/components/atoms/CountBadge.svelte";
  import cardBackImage from "$lib/presentation/assets/CardBack.jpg";
  import CardStackModal from "../modals/CardStackModal.svelte";

  interface GraveyardProps {
    cards: DisplayCardInstance[];
    banishedCards?: DisplayCardInstance[];
    size?: ComponentSize;
    animatingInstanceIds?: Set<string>; // アニメーション中のカードのインスタンスID
  }

  let {
    cards,
    banishedCards = [],
    size = "medium",
    animatingInstanceIds = new Set<string>(),
  }: GraveyardProps = $props();

  const _isMobile = isMobile();

  // ゾーン要素の参照
  let zoneElement: HTMLElement | undefined = $state();

  onMount(() => {
    // ゾーン位置を登録（マウント時に1回のみ。画面サイズ変更に追従しない）
    if (zoneElement) {
      const rect = zoneElement.getBoundingClientRect();
      cardAnimationStore.registerZonePosition("graveyard", rect);
    }
  });

  // 墓地モーダル状態管理
  let graveyardModalOpen = $state(false);

  // 除外モーダル状態管理
  let banishedModalOpen = $state(false);

  // アニメーション中のカードを除外した表示用カード
  const visibleCards = $derived(cards.filter((c) => !animatingInstanceIds.has(c.instanceId)));

  // 最後に墓地に置かれたカード（アニメーション中のカードを除外）
  const topCard = $derived(visibleCards.length > 0 ? visibleCards[visibleCards.length - 1].card : null);

  // 表示用のカード枚数（アニメーション中のカードを除外）
  const displayCount = $derived(visibleCards.length);

  // 除外ゾーンのカード枚数
  const banishedCount = $derived(banishedCards.length);

  // クリック処理（墓地）
  function handleClick() {
    graveyardModalOpen = true;
  }

  // クリック処理（除外）
  function handleBanishedClick(e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
    banishedModalOpen = true;
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
  bind:this={zoneElement}
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
    <div class="absolute inset-0 flex">
      <CardComponent card={topCard} {size} clickable={false} />
    </div>
    <CountBadge count={displayCount} />
  {:else}
    <!-- カードが無い場合、プレースホルダー色調：グレーを表示する -->
    <div
      class="h-full flex items-center justify-center p-1 relative"
      style="filter: grayscale(0.8) brightness(0.7) contrast(1.2);"
    >
      <img src={cardBackImage} alt="墓地" class="w-full h-full object-cover opacity-30 rounded-sm" />
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs text-surface-600-300-token text-center select-none drop-shadow-lg">
          {_isMobile ? "GY" : "墓地"}
        </span>
      </div>
    </div>
    <CountBadge count={displayCount} />
  {/if}

  <!-- 除外ゾーンボタン（カードがある場合のみ表示） -->
  {#if banishedCount > 0}
    <button
      class="
        absolute -bottom-2 -right-2
        bg-primary-600 text-white
        text-xs font-bold
        rounded-full {BADGE_SIZE_CLASSES[size]}
        shadow-md z-20
        hover:bg-primary-400
        leading-tight
      "
      onclick={handleBanishedClick}
      onkeydown={(e) => e.key === "Enter" && handleBanishedClick(e)}
      title="除外ゾーン ({banishedCount}枚)"
    >
      {banishedCount}
    </button>
  {/if}
</div>

<!-- 墓地モーダル -->
<CardStackModal {cards} open={graveyardModalOpen} onOpenChange={(v) => (graveyardModalOpen = v)} title="墓地" />

<!-- 除外モーダル -->
<CardStackModal
  cards={banishedCards}
  open={banishedModalOpen}
  onOpenChange={(v) => (banishedModalOpen = v)}
  title="除外ゾーン"
  emptyMessage="除外されたカードはありません"
/>
