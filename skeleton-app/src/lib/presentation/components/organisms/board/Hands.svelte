<script lang="ts">
  import Card from "$lib/presentation/components/atoms/Card.svelte";
  import ActivatableCard, {
    type CardActionButton,
  } from "$lib/presentation/components/molecules/ActivatableCard.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";
  import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
  import { gameStateStore } from "$lib/application/stores/gameStateStore";

  interface HandZoneProps {
    cards: Array<{ card: CardDisplayData | null; instanceId: string }>;
    handCardCount: number;
    currentPhase: string;
    canActivateSpells: boolean;
    isGameOver: boolean;
    onCardClick: (card: CardDisplayData, instanceId: string) => void;
  }

  let { cards, handCardCount, currentPhase, canActivateSpells, isGameOver, onCardClick }: HandZoneProps = $props();

  // カードごとの発動可能性をチェック
  function isCardActivatable(instanceId: string): boolean {
    if (isGameOver) return false;
    if (currentPhase !== "Main1") return false;
    if (!canActivateSpells) return false;

    // ActivateSpellCommand.canExecute()でカード固有の発動条件をチェック
    const command = new ActivateSpellCommand(instanceId);
    return command.canExecute($gameStateStore);
  }

  // 選択中のカードのinstanceId
  let selectedInstanceId = $state<string | null>(null);

  // 手札枚数に応じたグリッドカラム数を計算
  function getHandGridColumns(handCount: number): string {
    if (handCount === 0) return "grid-cols-1";
    if (handCount <= 10) return `grid-cols-${handCount}`;
    return "grid-cols-10";
  }

  // カードクリック時：選択状態をトグル
  function handleSelect(card: CardDisplayData, instanceId: string) {
    // 同じカードをクリックしたら選択解除、違うカードなら選択
    selectedInstanceId = selectedInstanceId === instanceId ? null : instanceId;
  }

  // 発動ボタンクリック時：親コンポーネントのonCardClickを呼び出して選択解除
  function handleActivate(card: CardDisplayData, instanceId: string) {
    onCardClick(card, instanceId);
    selectedInstanceId = null;
  }

  // キャンセルボタンクリック時：選択解除
  function handleCancel() {
    selectedInstanceId = null;
  }

  // 手札カード用のアクション定義
  const handCardActions: CardActionButton[] = [
    {
      label: "発動",
      style: "filled",
      color: "primary",
      onClick: handleActivate,
    },
  ];
</script>

<div class="grid {getHandGridColumns(handCardCount)} gap-2 mb-16">
  {#each cards as { card, instanceId } (instanceId)}
    {#if card}
      <ActivatableCard
        {card}
        {instanceId}
        isSelected={selectedInstanceId === instanceId}
        isActivatable={isCardActivatable(instanceId)}
        onSelect={handleSelect}
        actions={handCardActions}
        onCancel={handleCancel}
        size="medium"
      />
    {:else}
      <!-- ローディング中のplaceholder -->
      <Card placeholder={true} placeholderText="..." size="medium" />
    {/if}
  {:else}
    <div class="text-center text-sm opacity-50">No cards in hand</div>
  {/each}
</div>
