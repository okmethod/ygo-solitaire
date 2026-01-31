<script lang="ts">
  import type { CardDisplayData } from "$lib/presentation/types";
  import { CARD_SIZE_CLASSES, type ComponentSize } from "$lib/presentation/constants/sizes";
  import { getFrameBackgroundClass } from "$lib/presentation/constants/frameTypes";
  import { showCardDetailDisplay } from "$lib/presentation/stores/cardDetailDisplayStore";
  import cardBackImage from "$lib/presentation/assets/CardBack.jpg";

  /**
   * Card型はCardDisplayDataのエイリアスです
   */
  interface CardComponentProps {
    card?: CardDisplayData;
    size?: ComponentSize;
    clickable?: boolean;
    selectable?: boolean;
    isSelected?: boolean; // UI状態を外部から制御
    placeholder?: boolean;
    placeholderText?: string;
    rotation?: number;
    animate?: boolean;
    showDetailOnClick?: boolean;
    faceDown?: boolean; // 裏側表示フラグ (T033-T034)
    onClick?: (card: CardDisplayData) => void;
    onHover?: (card: CardDisplayData | null) => void;
  }

  let {
    card,
    size = "medium",
    clickable = false,
    selectable = false,
    isSelected = false, // 初期値はfalse
    placeholder = false,
    placeholderText = "カード",
    rotation = 0,
    animate = true,
    showDetailOnClick = false,
    faceDown = false, // デフォルトは表側
    onClick,
    onHover,
  }: CardComponentProps = $props();

  let isHovered = $state(false);
  // selectableモード: 内部でトグル管理、外部制御時: isSelected propを使用
  let internalSelectedState = $state(false);

  // 選択状態を決定（selectable時は内部状態、それ以外は外部のisSelected）
  let selectedState = $derived(selectable ? internalSelectedState : isSelected);

  // isSelected propの変更を内部状態に同期（selectableでない場合）
  $effect(() => {
    if (!selectable) {
      internalSelectedState = isSelected;
    }
  });

  // カードクリック処理
  function handleClick() {
    console.log(`[Card] クリックイベント発生: clickable=${clickable}, card=${card?.jaName}, hasOnClick=${!!onClick}`);

    if (clickable && card && onClick) {
      console.log(`[Card] onClickコールバックを実行します: ${card.jaName}`);
      onClick(card);
    }
    if (selectable) {
      internalSelectedState = !internalSelectedState; // 内部stateをトグル
    }
    if (showDetailOnClick && card) {
      // Card型はCardDisplayDataのエイリアス
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
  const selectedClasses = $derived(selectedState ? "ring-2 ring-primary-500 shadow-lg" : "");

  // 回転スタイル
  const rotationStyle = $derived(rotation !== 0 ? `transform: rotate(${rotation}deg);` : "");

  // フレームタイプ別の背景色
  const typeClasses = $derived(() => {
    return getFrameBackgroundClass(card?.frameType);
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
  <!-- 裏側表示の場合はカード裏面のみ表示 (T033-T034) -->
  {#if faceDown}
    <div class="w-full h-full flex items-center justify-center p-1">
      <img src={placeholderImageUrl} alt="裏向きカード" class="w-full h-full object-cover rounded-sm" />
    </div>
  {:else}
    <!-- カード画像エリア -->
    <div class="flex-1 flex items-center justify-center p-1">
      {#if card?.images?.imageCropped}
        <img
          src={card.images.imageCropped}
          alt={card.jaName || "カード"}
          class="w-full h-full object-cover rounded-sm"
        />
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
        <div class="text-xs font-medium truncate">{card.jaName}</div>
      </div>
    {/if}
  {/if}

  <!-- 選択状態インジケーター -->
  {#if selectedState}
    <div class="absolute top-1 right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
  {/if}

  <!-- フェードアニメーション用オーバーレイ -->
  {#if animate && (isHovered || selectedState)}
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
