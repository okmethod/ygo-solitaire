<script lang="ts">
  import Card from "$lib/presentation/components/atoms/Card.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";

  /**
   * カードアクションボタン定義
   */
  type ButtonStyle = "filled" | "outlined";
  type ButtonColor = "primary" | "secondary" | "tertiary" | "success" | "warning" | "error" | "surface";
  export interface CardActionButton {
    label: string; // ボタンラベル（例: "発動", "セット", "召喚"）
    style?: ButtonStyle; // ボタンスタイル（デフォルト: "filled"）
    color?: ButtonColor; // ボタンカラー（デフォルト: "primary"）
    onClick: (card: CardDisplayData, instanceId: string) => void; // アクション実行時のコールバック
  }

  interface ActivatableCardProps {
    card: CardDisplayData;
    instanceId: string;
    isSelected: boolean;
    isActivatable: boolean; // 発動可能条件（フェーズ、ゲーム状態など）
    onSelect: (card: CardDisplayData, instanceId: string) => void;
    actions: CardActionButton[]; // アクション定義の配列
    onCancel: () => void;
    size?: ComponentSize;
    showDetailOnClick?: boolean;
  }

  let {
    card,
    instanceId,
    isSelected,
    isActivatable,
    onSelect,
    actions,
    onCancel,
    size = "medium",
    showDetailOnClick = true,
  }: ActivatableCardProps = $props();

  function handleSelect() {
    onSelect(card, instanceId);
  }

  function handleAction(action: CardAction) {
    action.onClick(card, instanceId);
  }

  function getButtonClass(style?: ButtonStyle, color?: ButtonColor): string {
    const buttonStyle = style || "filled";
    const buttonColor = color || "primary";
    return `preset-${buttonStyle}-${buttonColor}-500`;
  }
</script>

<div class="relative">
  <!-- Card コンポーネントをラップ（選択状態も Card で管理） -->
  <Card {card} {size} clickable={isActivatable} {isSelected} onClick={handleSelect} {showDetailOnClick} />

  {#if isSelected}
    <!-- アクションボタン -->
    <div class="absolute -bottom-14 left-0 right-0 flex justify-center gap-2 z-10">
      {#each actions as action (action.label)}
        <button class="btn btn-sm {getButtonClass(action.style, action.color)}" onclick={() => handleAction(action)}>
          {action.label}
        </button>
      {/each}
      <button class="btn btn-sm preset-filled-warning-500" onclick={onCancel}> キャンセル </button>
    </div>
  {/if}
</div>
