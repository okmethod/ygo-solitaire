<script lang="ts">
  import { Menu } from "@skeletonlabs/skeleton-svelte";
  import type { DisplayCardData } from "$lib/presentation/types";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";
  import { showCardDetailDisplay } from "$lib/presentation/stores/cardDetailDisplayStore";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import SpellCounterBadge from "$lib/presentation/components/atoms/SpellCounterBadge.svelte";

  /**
   * カードアクションボタン定義
   */
  type ButtonStyle = "filled" | "tonal" | "outlined";
  type ButtonColor = "primary" | "secondary" | "tertiary" | "success" | "warning" | "error" | "surface";
  export interface CardActionButton {
    label: string;
    style?: ButtonStyle;
    color?: ButtonColor;
    onClick: (instanceId: string) => void;
  }

  interface ActivatableCardProps {
    card: DisplayCardData;
    instanceId: string;
    actionButtons: CardActionButton[]; // アクション定義の配列
    size?: ComponentSize;
    showDetailOnClick?: boolean;
    faceUp?: boolean; // 表側表示フラグ
    rotation?: number; // 回転角度（守備表示用）
    spellCounterCount?: number; // 魔力カウンター数
    isEquipped?: boolean; // 装備カードが付いているかどうか
    isEquipmentHovered?: boolean; // 装備カードがホバーされているかどうか
    onHover?: (card: DisplayCardData | null) => void; // ホバー時のコールバック（装備対象ハイライト用）
  }

  let {
    card,
    instanceId,
    actionButtons,
    size = "medium",
    showDetailOnClick = true,
    faceUp = true,
    rotation = 0,
    spellCounterCount = 0,
    isEquipped = false,
    isEquipmentHovered = false,
    onHover,
  }: ActivatableCardProps = $props();

  let isMenuOpen = $state(false);

  // actionButtons があるか、詳細表示が有効な場合にMenuを表示
  const hasMenu = $derived(actionButtons.length > 0 || showDetailOnClick);

  function handleAction(action: CardActionButton) {
    action.onClick(instanceId);
  }

  function handleShowDetail() {
    showCardDetailDisplay(card);
  }

  function getButtonClass(style?: ButtonStyle, color?: ButtonColor): string {
    const s = style ?? "filled";
    const c = color ?? "primary";
    // 明示的にクラス名を定義してTailwindのスキャナーに伝える
    const map: Record<ButtonStyle, Record<ButtonColor, string>> = {
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
    return map[s][c];
  }
</script>

{#if hasMenu}
  <Menu
    closeOnSelect={true}
    positioning={{ placement: "bottom", flip: false }}
    onOpenChange={({ open }) => (isMenuOpen = open)}
  >
    <Menu.Trigger class="block p-0 m-0 bg-transparent border-none">
      <div class="transition-transform duration-300 hover:scale-105">
        <CardComponent
          {card}
          {size}
          {faceUp}
          {rotation}
          {isEquipped}
          {isEquipmentHovered}
          clickable={false}
          isSelected={isMenuOpen}
          animate={false}
          {onHover}
        />
        {#if spellCounterCount > 0}
          <SpellCounterBadge count={spellCounterCount} />
        {/if}
      </div>
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content class="card bg-surface-100-900 shadow-xl p-1 flex flex-col gap-1 z-50 min-w-[5rem]">
        {#each actionButtons as btn (btn.label)}
          <Menu.Item
            value={btn.label}
            class="btn btn-sm {getButtonClass(btn.style, btn.color)}"
            onclick={() => handleAction(btn)}
          >
            {btn.label}
          </Menu.Item>
        {/each}
        {#if showDetailOnClick}
          <Menu.Item value="詳細表示" class="btn btn-sm preset-tonal-surface" onclick={handleShowDetail}
            >詳細表示</Menu.Item
          >
        {/if}
      </Menu.Content>
    </Menu.Positioner>
  </Menu>
{:else}
  <div class="transition-transform duration-300 hover:scale-105">
    <CardComponent
      {card}
      {size}
      {faceUp}
      {rotation}
      {isEquipped}
      {isEquipmentHovered}
      clickable={false}
      isSelected={false}
      animate={false}
      {onHover}
    />
    {#if spellCounterCount > 0}
      <SpellCounterBadge count={spellCounterCount} />
    {/if}
  </div>
{/if}
