<script lang="ts">
  import Card from "$lib/presentation/components/atoms/Card.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";

  interface ActivatableCardProps {
    card: CardDisplayData;
    instanceId: string;
    isSelected: boolean;
    isActivatable: boolean; // 発動可能条件（フェーズ、ゲーム状態など）
    onSelect: (card: CardDisplayData, instanceId: string) => void;
    onActivate: (card: CardDisplayData, instanceId: string) => void;
    onCancel: () => void;
    actionLabel?: string; // "発動", "蘇生", "効果発動" など
    size?: ComponentSize;
    showDetailOnClick?: boolean;
  }

  let {
    card,
    instanceId,
    isSelected,
    isActivatable,
    onSelect,
    onActivate,
    onCancel,
    actionLabel = "発動",
    size = "medium",
    showDetailOnClick = true,
  }: ActivatableCardProps = $props();

  function handleSelect() {
    onSelect(card, instanceId);
  }

  function handleActivate() {
    onActivate(card, instanceId);
  }
</script>

<div class="relative">
  <!-- Card コンポーネントをラップ -->
  <Card {card} {size} clickable={isActivatable} onClick={handleSelect} {showDetailOnClick} />

  {#if isSelected}
    <!-- 選択インジケーター -->
    <div class="absolute inset-0 ring-4 ring-primary-500 rounded-lg pointer-events-none"></div>

    <!-- アクションボタン -->
    <div class="absolute -bottom-14 left-0 right-0 flex justify-center gap-2 z-10">
      <button class="btn btn-sm variant-filled-primary" onclick={handleActivate}>
        {actionLabel}
      </button>
      <button class="btn btn-sm variant-ghost" onclick={onCancel}> キャンセル </button>
    </div>
  {/if}
</div>
