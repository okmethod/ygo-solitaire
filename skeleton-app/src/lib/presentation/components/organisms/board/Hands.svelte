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

  // 手札枚数に応じたグリッドカラム数を計算
  function getHandGridColumns(handCount: number): string {
    if (handCount === 0) return "grid-cols-1";
    if (handCount <= 10) return `grid-cols-${handCount}`;
    return "grid-cols-10";
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
          clickable={currentPhase === "Main1" && canActivateSpells && !isGameOver}
          onClick={(clickedCard) => onCardClick(clickedCard, instanceId)}
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
</div>
