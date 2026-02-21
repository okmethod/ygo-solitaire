<script lang="ts">
  import type { DisplayCardData } from "$lib/presentation/types";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import SpellCounterBadge from "$lib/presentation/components/atoms/SpellCounterBadge.svelte";

  /**
   * カードアクションボタン定義
   */
  type ButtonStyle = "filled" | "tonal" | "outlined";
  type ButtonColor = "primary" | "secondary" | "tertiary" | "success" | "warning" | "error" | "surface";
  export interface CardActionButton {
    label: string; // ボタンラベル（例: "発動", "セット", "召喚"）
    style?: ButtonStyle; // ボタンスタイル（デフォルト: "filled"）
    color?: ButtonColor; // ボタンカラー（デフォルト: "primary"）
    onClick: (card: DisplayCardData, instanceId: string) => void; // アクション実行時のコールバック
  }

  interface ActivatableCardProps {
    card: DisplayCardData;
    instanceId: string;
    isSelected: boolean;
    isActivatable: boolean; // 発動可能条件（フェーズ、ゲーム状態など）
    onSelect: (card: DisplayCardData, instanceId: string) => void;
    actionButtons: CardActionButton[]; // アクション定義の配列
    onCancel: () => void;
    size?: ComponentSize;
    showDetailOnClick?: boolean;
    faceDown?: boolean; // 裏側表示フラグ (T033-T034)
    rotation?: number; // 回転角度（守備表示用）
    spellCounterCount?: number; // 魔力カウンター数
  }

  let {
    card,
    instanceId,
    isSelected,
    isActivatable,
    onSelect,
    actionButtons,
    onCancel,
    size = "medium",
    showDetailOnClick = true,
    faceDown = false,
    rotation = 0,
    spellCounterCount = 0,
  }: ActivatableCardProps = $props();

  function handleSelect() {
    onSelect(card, instanceId);
  }

  function handleAction(action: CardActionButton) {
    action.onClick(card, instanceId);
  }

  function getButtonClass(style?: ButtonStyle, color?: ButtonColor): string {
    const buttonStyle = style || "filled";
    const buttonColor = color || "primary";
    // 明示的にクラス名を定義してTailwindのスキャナーに伝える
    const buttonClassMap: Record<ButtonStyle, Record<ButtonColor, string>> = {
      filled: {
        primary: "preset-filled-primary-500",
        secondary: "preset-filled-secondary-500",
        tertiary: "preset-filled-tertiary-500",
        success: "preset-filled-success-500",
        warning: "preset-filled-warning-500",
        error: "preset-filled-error-500",
        surface: "preset-filled-surface-500",
      },
      tonal: {
        primary: "preset-tonal-primary",
        secondary: "preset-tonal-secondary",
        tertiary: "preset-tonal-tertiary",
        success: "preset-tonal-success",
        warning: "preset-tonal-warning",
        error: "preset-tonal-error",
        surface: "preset-tonal-surface",
      },
      outlined: {
        primary: "preset-outlined-primary-500",
        secondary: "preset-outlined-secondary-500",
        tertiary: "preset-outlined-tertiary-500",
        success: "preset-outlined-success-500",
        warning: "preset-outlined-warning-500",
        error: "preset-outlined-error-500",
        surface: "preset-outlined-surface-500",
      },
    };

    return buttonClassMap[buttonStyle][buttonColor];
  }
</script>

<div class="relative">
  <!-- カードとバッジのみスケールアニメーション適用 -->
  <div class="transition-transform duration-300 hover:scale-105">
    <!-- Card コンポーネントをラップ（選択状態も Card で管理） -->
    <!-- カードは常にクリック可能にして、ユーザーが選択できるようにする -->
    <CardComponent
      {card}
      {size}
      {faceDown}
      {rotation}
      clickable={true}
      {isSelected}
      onClick={handleSelect}
      {showDetailOnClick}
      animate={false}
    />

    <!-- 魔力カウンター表示 -->
    {#if spellCounterCount > 0}
      <SpellCounterBadge count={spellCounterCount} />
    {/if}
  </div>

  {#if isSelected}
    <!-- アクションボタン -->
    <div
      class="absolute -bottom-10 md:-bottom-14 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-1 md:gap-2 z-10 max-w-[200px]"
    >
      {#each actionButtons as actionButton (actionButton.label)}
        <!-- disabledではなくopacity+cursor-not-allowedで視覚的に無効化し、クリックは可能にする -->
        <button
          class="btn btn-sm w-full border-2 border-gray-200 {getButtonClass(
            actionButton.style,
            actionButton.color,
          )} {!isActivatable ? 'opacity-50 cursor-not-allowed' : ''}"
          onclick={() => handleAction(actionButton)}
        >
          {actionButton.label}
        </button>
      {/each}
      <button class="btn btn-sm preset-tonal-warning" onclick={onCancel}> キャンセル </button>
    </div>
  {/if}
</div>
