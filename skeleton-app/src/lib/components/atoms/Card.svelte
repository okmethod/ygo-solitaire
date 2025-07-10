<script lang="ts">
  import type { Card } from "$lib/types/card";
  import { CARD_SIZE_CLASSES, type ComponentSize } from "$lib/constants/sizes";
  import { getCardTypeBackgroundClass } from "$lib/constants/cardTypes";
  import { showCardDetailDisplay } from "$lib/stores/cardDetailDisplayStore";
  import cardBackImage from "$lib/assets/CardBack.jpg";

  interface CardComponentProps {
    card?: Card;
    size?: ComponentSize;
    clickable?: boolean;
    selectable?: boolean;
    placeholder?: boolean;
    placeholderText?: string;
    rotation?: number;
    animate?: boolean;
    showDetailOnClick?: boolean;
    onClick?: (card: Card) => void;
    onHover?: (card: Card | null) => void;
  }

  let {
    card,
    size = "medium",
    clickable = false,
    selectable = false,
    placeholder = false,
    placeholderText = "カード",
    rotation = 0,
    animate = true,
    showDetailOnClick = false,
    onClick,
    onHover,
  }: CardComponentProps = $props();

  let isHovered = $state(false);
  let isSelected = $state(card?.isSelected || false);

  // カードクリック処理
  function handleClick() {
    console.log(`[Card] クリックイベント発生: clickable=${clickable}, card=${card?.name}, hasOnClick=${!!onClick}`);
    
    if (clickable && card && onClick) {
      console.log(`[Card] onClickコールバックを実行します: ${card.name}`);
      onClick(card);
    }
    if (selectable) {
      isSelected = !isSelected;
      if (card) card.isSelected = isSelected;
    }
    if (showDetailOnClick && card) {
      showCardDetailDisplay(card);
    }
  }

  // ホバー処理
  function handleMouseEnter() {
    isHovered = true;
    if (onHover && card) {
      onHover(card);
    }
  }

  function handleMouseLeave() {
    isHovered = false;
    if (onHover) {
      onHover(null);
    }
  }

  // プレースホルダー表示の判定
  const isPlaceholder = $derived(placeholder || !card);

  // プレースホルダー画像URL
  const placeholderImageUrl = cardBackImage;

  // アニメーションクラス
  const animationClasses = $derived(animate ? "transition-all duration-300 ease-in-out" : "");

  // ホバー効果クラス
  const hoverClasses = $derived(
    clickable || selectable || showDetailOnClick ? "cursor-pointer hover:scale-105 hover:shadow-lg" : "",
  );

  // 選択状態クラス
  const selectedClasses = $derived(isSelected ? "ring-2 ring-primary-500 shadow-lg" : "");

  // 回転スタイル
  const rotationStyle = $derived(rotation !== 0 ? `transform: rotate(${rotation}deg);` : "");

  // カードタイプ別の背景色
  const typeClasses = $derived(() => {
    return getCardTypeBackgroundClass(card?.type);
  });

  // 共通クラス
  const commonClasses = $derived(() => {
    return `
      ${CARD_SIZE_CLASSES[size]}
      ${animationClasses}
      ${hoverClasses}
      ${selectedClasses}
      ${typeClasses()}
      border border-surface-300 rounded aspect-[3/4] flex flex-col justify-between
      relative overflow-hidden
    `;
  });

  // インタラクティブ要素の属性
  const interactiveProps = $derived({
    style: rotationStyle,
    onclick: clickable || selectable || showDetailOnClick ? handleClick : undefined,
    onmouseenter: handleMouseEnter,
    onmouseleave: handleMouseLeave,
  });
</script>

<!-- 共通コンテンツテンプレート -->
{#snippet cardContent()}
  <!-- カード画像エリア -->
  <div class="flex-1 flex items-center justify-center p-1">
    {#if card?.images?.imageCropped}
      <img src={card.images.imageCropped} alt={card.name || "カード"} class="w-full h-full object-cover rounded-sm" />
    {:else if isPlaceholder}
      <div
        class="w-full h-full bg-surface-200-700-token rounded-sm flex flex-col items-center justify-center text-center overflow-hidden"
      >
        <img src={placeholderImageUrl} alt={placeholderText} class="w-full h-full object-cover opacity-30" />
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-xs select-none text-surface-600-300-token font-medium">{placeholderText}</span>
          {#if card?.type}
            <span class="text-xs opacity-75 select-none mt-1">{card.type}</span>
          {/if}
        </div>
      </div>
    {:else}
      <div class="w-full h-full bg-surface-200-700-token rounded-sm flex items-center justify-center">
        <img src={placeholderImageUrl} alt="" class="w-full h-full object-cover opacity-20" />
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-xs opacity-50 select-none">No Image</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- カード情報エリア -->
  {#if card && !isPlaceholder}
    <div class="px-1 py-1 bg-surface-50-900-token border-t border-surface-300">
      <div class="text-xs font-medium truncate">{card.name}</div>
    </div>
  {/if}

  <!-- 選択状態インジケーター -->
  {#if isSelected}
    <div class="absolute top-1 right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
  {/if}

  <!-- フェードアニメーション用オーバーレイ -->
  {#if animate && (isHovered || isSelected)}
    <div class="absolute inset-0 bg-primary-500 opacity-10 pointer-events-none"></div>
  {/if}
{/snippet}

{#if clickable || selectable || showDetailOnClick}
  <button class="{commonClasses()} bg-transparent p-0 border border-2 border-gray-100" {...interactiveProps}>
    {@render cardContent()}
  </button>
{:else}
  <div class={commonClasses()} role="img" {...interactiveProps}>
    {@render cardContent()}
  </div>
{/if}
