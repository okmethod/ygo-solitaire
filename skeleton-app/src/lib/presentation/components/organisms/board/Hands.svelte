<script lang="ts">
  import Card from "$lib/presentation/components/atoms/Card.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";

  interface HandZoneProps {
    cards: Array<{ card: CardDisplayData | null; instanceId: string }>;
    handCardCount: number;
    currentPhase: string;
    canActivateSpells: boolean;
    isGameOver: boolean;
    onCardClick: (card: CardDisplayData, instanceId: string) => void;
  }

  let { cards, handCardCount, currentPhase, canActivateSpells, isGameOver, onCardClick }: HandZoneProps = $props();

  // 選択中のカードのinstanceId
  let selectedInstanceId = $state<string | null>(null);

  // 手札枚数に応じたグリッドカラム数を計算
  function getHandGridColumns(handCount: number): string {
    if (handCount === 0) return "grid-cols-1";
    if (handCount <= 10) return `grid-cols-${handCount}`;
    return "grid-cols-10";
  }

  // カードクリック時：選択状態にする
  function handleCardClick(card: CardDisplayData, instanceId: string) {
    selectedInstanceId = instanceId;
  }

  // 発動ボタンクリック時：親コンポーネントのonCardClickを呼び出して選択解除
  function activateSelectedCard() {
    const selectedCard = cards.find((c) => c.instanceId === selectedInstanceId);
    if (selectedCard && selectedCard.card) {
      onCardClick(selectedCard.card, selectedCard.instanceId);
      selectedInstanceId = null;
    }
  }

  // キャンセルボタンクリック時：選択解除
  function cancelSelection() {
    selectedInstanceId = null;
  }
</script>

<div class="card px-4 space-y-4">
  <h2 class="text-xl font-bold">Hand ({handCardCount} cards)</h2>

  <div class="grid {getHandGridColumns(handCardCount)} gap-2">
    {#each cards as { card, instanceId } (instanceId)}
      {#if card}
        <Card
          {card}
          size="medium"
          selectable={currentPhase === "Main1" && canActivateSpells && !isGameOver}
          isSelected={selectedInstanceId === instanceId}
          onClick={(clickedCard) => handleCardClick(clickedCard, instanceId)}
          showDetailOnClick={true}
        />
      {:else}
        <!-- ローディング中のplaceholder -->
        <Card placeholder={true} placeholderText="..." size="medium" />
      {/if}
    {:else}
      <div class="text-center text-sm opacity-50">No cards in hand</div>
    {/each}
  </div>

  <!-- 発動ボタン（カードが選択されている時のみ表示） -->
  {#if selectedInstanceId}
    <div class="flex justify-center gap-2 pt-4">
      <button class="btn variant-filled-primary" onclick={activateSelectedCard}> 発動 </button>
      <button class="btn variant-ghost" onclick={cancelSelection}> キャンセル </button>
    </div>
  {/if}
</div>
