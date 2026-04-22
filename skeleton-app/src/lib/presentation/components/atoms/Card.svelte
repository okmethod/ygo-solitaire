<script lang="ts">
  import type { DisplayCardData } from "$lib/presentation/types";
  import { CARD_SIZE_CLASSES, type ComponentSize } from "$lib/presentation/constants/sizes";
  import { getFrameBackgroundClass, getEditionBorderClass } from "$lib/presentation/constants/colors";
  import { showCardDetailDisplay } from "$lib/presentation/stores/cardDetailDisplayStore";
  import cardBackImage from "$lib/presentation/assets/CardBack.jpg";
  import Icon from "@iconify/svelte";

  interface CardComponentProps {
    card?: DisplayCardData;
    size?: ComponentSize;
    clickable?: boolean;
    selectable?: boolean;
    isSelected?: boolean; // UI状態を外部から制御
    placeholder?: boolean;
    placeholderText?: string;
    rotation?: number;
    animate?: boolean;
    showDetailOnClick?: boolean;
    faceUp?: boolean; // 表側表示フラグ
    isEquipped?: boolean; // 装備カードが付いているかどうか
    isEquipmentHovered?: boolean; // 装備カードがホバーされているかどうか
    onClick?: (card: DisplayCardData) => void;
    onHover?: (card: DisplayCardData | null) => void;
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
    faceUp = true, // デフォルトは表側
    isEquipped = false,
    isEquipmentHovered = false,
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
      // Card型はDisplayCardDataのエイリアス
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

  // カード種別に応じた色クラス
  const bgClass = $derived(getFrameBackgroundClass(card?.frameType));
  const borderClass = $derived(getEditionBorderClass(card?.edition));

  // 共通クラス
  const commonClasses = $derived(() => {
    return `
      ${CARD_SIZE_CLASSES[size]}
      ${animationClasses}
      ${hoverClasses}
      ${selectedClasses}
      ${bgClass}
      ${borderClass}
      border rounded aspect-[3/4] flex flex-col justify-between
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
  <!-- 裏側表示の場合はカード裏面のみ表示 -->
  {#if !faceUp}
    <div class="flex h-full w-full items-center justify-center p-1">
      <img src={placeholderImageUrl} alt="裏向きカード" class="h-full w-full rounded-sm object-cover" />
    </div>
  {:else}
    <!-- カード画像エリア -->
    <div class="flex flex-1 items-center justify-center p-1">
      {#if card?.images?.imageCropped}
        <img
          src={card.images.imageCropped}
          alt={card.jaName || "カード"}
          class="h-full w-full rounded-sm object-cover"
        />
      {:else if isPlaceholder}
        <div
          class="bg-surface-200-700-token flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-sm text-center"
        >
          <img src={placeholderImageUrl} alt={placeholderText} class="h-full w-full object-cover opacity-30" />
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-surface-600-300-token text-xs font-medium select-none">{placeholderText}</span>
            {#if card?.type}
              <span class="mt-1 text-xs opacity-75 select-none">{card.type}</span>
            {/if}
          </div>
        </div>
      {:else}
        <div class="bg-surface-200-700-token flex h-full w-full items-center justify-center rounded-sm">
          <img src={placeholderImageUrl} alt="" class="h-full w-full object-cover opacity-20" />
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xs opacity-50 select-none">No Image</span>
          </div>
        </div>
      {/if}
    </div>

    <!-- カード情報エリア -->
    {#if card && !isPlaceholder}
      <div class="bg-surface-50-900-token border-surface-300 border-t px-1 py-1">
        <div class="truncate text-xs font-medium">{card.jaName}</div>
      </div>
    {/if}
  {/if}

  <!-- 選択状態インジケーター -->
  {#if selectedState}
    <div class="bg-primary-500 absolute top-1 right-1 h-3 w-3 animate-pulse rounded-full"></div>
  {/if}

  <!-- 装備カードインジケーター（このカードに装備カードが付いている） -->
  {#if isEquipped}
    <div
      class="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full shadow-md transition-opacity duration-200 {isEquipmentHovered
        ? 'opacity-100'
        : 'opacity-75'}"
      title="装備カード付き"
    >
      <Icon icon="mdi:plus-circle-outline" class="size-8 text-white md:size-12" />
    </div>
  {/if}

  <!-- フェードアニメーション用オーバーレイ -->
  {#if animate && (isHovered || selectedState)}
    <div class="bg-primary-500 pointer-events-none absolute inset-0 opacity-10"></div>
  {/if}
{/snippet}

{#if clickable || selectable || showDetailOnClick}
  <button class="{commonClasses()} border border-2 border-gray-100 bg-transparent p-0" {...interactiveProps}>
    {@render cardContent()}
  </button>
{:else}
  <div class={commonClasses()} role="img" {...interactiveProps}>
    {@render cardContent()}
  </div>
{/if}
