<script lang="ts">
  import CardComponent from "$lib/components/atoms/Card.svelte";
  import CountBadge from "$lib/components/atoms/CountBadge.svelte";
  import type { LoadedCardEntry } from "$lib/types/deck";

  interface CardListProps {
    title?: string;
    cardCount?: number;
    cards: LoadedCardEntry[];
    borderColor?: string;
  }

  let { title, cardCount, cards, borderColor = "border-gray-400" }: CardListProps = $props();

  // titleまたはcardCountが指定されているか確認
  const showHeader = $derived(title || cardCount !== undefined);
</script>

<section>
  <div
    class="badge preset-tonal-surface mb-3 grid items-center gap-4 p-2 rounded-lg shadow-md {showHeader
      ? 'grid-cols-1 md:grid-cols-12'
      : 'grid-cols-1'}"
  >
    {#if showHeader}
      <h3 class="md:col-span-2 h4 flex flex-col min-w-fit">
        {#if title}
          {title}
        {/if}
        {#if cardCount !== undefined}
          <span class="badge w-fit preset-tonal-surface text-sm">{cardCount}枚</span>
        {/if}
      </h3>
    {/if}
    {#if cards.length > 0}
      <div class="{showHeader ? 'md:col-span-10' : ''} flex-1 flex gap-2 flex-wrap">
        {#each cards as cardEntry (cardEntry.cardData.id)}
          <div class="relative">
            <div class="border-2 {borderColor} rounded-lg shadow-md overflow-hidden">
              <CardComponent card={cardEntry.cardData} size="medium" showDetailOnClick={true} />
            </div>
            {#if cardEntry.quantity > 1}
              <CountBadge count={cardEntry.quantity} colorClasses="bg-primary-200 text-primary-900" />
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>
