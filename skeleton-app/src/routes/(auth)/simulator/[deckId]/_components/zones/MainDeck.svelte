<script lang="ts">
  import { onMount } from "svelte";
  import { CARD_SIZE_CLASSES, type ComponentSize } from "$lib/presentation/constants/sizes";
  import { cardAnimationStore } from "$lib/presentation/stores/cardAnimationStore";
  import CountBadge from "$lib/presentation/components/atoms/CountBadge.svelte";
  import cardBackImage from "$lib/presentation/assets/CardBack.jpg";

  interface MainDeckProps {
    cardCount: number; // メインデッキはカード数のみを表示
    size?: ComponentSize;
  }

  let { cardCount, size = "medium" }: MainDeckProps = $props();

  // ゾーン要素の参照
  let zoneElement: HTMLElement | undefined = $state();

  onMount(() => {
    // ゾーン位置を登録（マウント時に1回のみ。画面サイズ変更に追従しない）
    if (zoneElement) {
      const rect = zoneElement.getBoundingClientRect();
      cardAnimationStore.registerZonePosition("mainDeck", rect);
    }
  });
</script>

<div
  bind:this={zoneElement}
  class="
    {CARD_SIZE_CLASSES[size]}
    relative
    border-2 border-dashed border-gray-400
    rounded-lg
    bg-gray-100 dark:bg-gray-800
  "
  role="img"
>
  <!-- メインデッキは常に裏向き表示 -->
  <div class="h-full flex items-center justify-center p-1 relative">
    <img src={cardBackImage} alt="メインデッキ" class="w-full h-full object-cover rounded-sm" />
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-xs text-white font-bold text-center select-none drop-shadow-lg"> Deck </span>
    </div>
  </div>
  <CountBadge count={cardCount} />
</div>
