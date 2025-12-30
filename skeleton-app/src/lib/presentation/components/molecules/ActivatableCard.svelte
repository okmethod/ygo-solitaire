<script lang="ts">
  import Card from "$lib/presentation/components/atoms/Card.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";

  /**
   * カードアクション定義
   */
  export interface CardAction {
    label: string; // ボタンラベル（例: "発動", "セット", "召喚"）
    variant?: "filled-primary" | "filled-secondary" | "filled" | "ghost" | "soft"; // ボタンスタイル
    onClick: (card: CardDisplayData, instanceId: string) => void; // アクション実行時のコールバック
  }

  interface ActivatableCardProps {
    card: CardDisplayData;
    instanceId: string;
    isSelected: boolean;
    isActivatable: boolean; // 発動可能条件（フェーズ、ゲーム状態など）
    onSelect: (card: CardDisplayData, instanceId: string) => void;
    actions: CardAction[]; // アクション定義の配列
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

  function getButtonVariant(variant?: string): string {
    return variant ? `variant-${variant}` : "variant-filled-primary";
  }
</script>

<div class="relative">
  <!-- Card コンポーネントをラップ（選択状態も Card で管理） -->
  <Card {card} {size} clickable={isActivatable} {isSelected} onClick={handleSelect} {showDetailOnClick} />

  {#if isSelected}
    <!-- アクションボタン -->
    <div class="absolute -bottom-14 left-0 right-0 flex justify-center gap-2 z-10">
      {#each actions as action (action.label)}
        <button class="btn btn-sm {getButtonVariant(action.variant)}" onclick={() => handleAction(action)}>
          {action.label}
        </button>
      {/each}
      <button class="btn btn-sm variant-ghost" onclick={onCancel}> キャンセル </button>
    </div>
  {/if}
</div>
