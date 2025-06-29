<script lang="ts">
  import CardComponent from "$lib/components/atoms/Card.svelte";
  import CountBadge from "$lib/components/atoms/CountBadge.svelte";
  import type { LoadedCardEntry } from "$lib/types/deck";

  interface CardsSectionProps {
    title: string;
    cardCount: number;
    cards: LoadedCardEntry[];
    borderColor?: string;
  }

  let { title, cardCount, cards, borderColor = "border-gray-400" }: CardsSectionProps = $props();
</script>

<section>
  <div
    class="badge preset-tonal-surface mb-3 grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-2 rounded-lg shadow-md"
  >
    <h3 class="md:col-span-2 h4 flex flex-col min-w-fit">
      {title}
      <span class="badge w-fit preset-tonal-surface text-sm">{cardCount}枚</span>
    </h3>
    {#if cards.length > 0}
      <div class="md:col-span-10 flex-1 flex gap-2 flex-wrap">
        {#each cards as cardEntry (cardEntry.cardData.id)}
          <div class="relative">
            <div class="border-2 {borderColor} rounded-lg shadow-md overflow-hidden">
              <CardComponent card={cardEntry.cardData} size="medium" showDetails={true} />
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
