<script lang="ts">
  import { navigateTo } from "$lib/utils/navigation";
  import Card from "$lib/components/atoms/Card.svelte";
  import type { PageData } from "./$types";
  import type { LoadedCardEntry } from "$lib/types/deck";

  let { data }: { data: PageData } = $props();
  const { monsters, spells, traps } = data.deckData.mainDeck;
  const { fusion, synchro, xyz } = data.deckData.extraDeck;

  function navigateToSimulator() {
    navigateTo(`/simulator/${data.deckId}`);
  }
</script>

<!-- 共通snippet -->
{#snippet cardSection(title: string, cardCount: number, cards: LoadedCardEntry[], borderColor = "border-gray-400")}
  <section>
    <div class="badge preset-tonal-surface mb-3 grid grid-cols-12 items-center space-x-4 p-2 rounded-lg shadow-md">
      <h3 class="col-span-2 h4 flex flex-col min-w-fit ml-2">
        {title}
        <span class="badge w-fit preset-tonal-surface text-sm">{cardCount}枚</span>
      </h3>
      {#if cards.length > 0}
        <div class="col-span-9 flex-1 flex gap-2 ml-4">
          {#each cards as cardEntry (cardEntry.cardData.id)}
            <div class="relative">
              <div class="border-2 {borderColor} rounded-lg shadow-md overflow-hidden">
                <Card card={cardEntry.cardData} size="medium" showDetails={true} />
              </div>
              {#if cardEntry.quantity > 1}
                <div
                  class="absolute -top-2 -right-2 bg-primary-200 text-primary-900 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md"
                >
                  {cardEntry.quantity}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>
{/snippet}

<div class="container mx-auto p-4">
  <!-- ヘッダー -->
  <header class="my-6">
    <div class="flex items-center space-x-8 mb-4">
      <h2 class="h3">{data.deckData.name}</h2>
      <button class="btn preset-tonal rounded-full shadow-lg text-lg px-4 py-2" onclick={navigateToSimulator}>
        決闘開始
      </button>
    </div>
  </header>

  <!-- カード一覧 -->
  <div class="space-y-6">
    <hr class="my-8 border-t border-gray-300" />
    <!-- メインデッキ -->
    <div class="mb-4 flex items-center space-x-4">
      <h2 class="h3">メインデッキ</h2>
      <span class="badge preset-tonal-surface text-sm shadow-md"
        >{data.deckData.stats.monsterCount + data.deckData.stats.spellCount + data.deckData.stats.trapCount}枚</span
      >
    </div>
    <!-- モンスターカード -->
    {@render cardSection("モンスター", data.deckData.stats.monsterCount, monsters)}

    <!-- 魔法カード -->
    {@render cardSection("魔法", data.deckData.stats.spellCount, spells)}

    <!-- 罠カード -->
    {@render cardSection("罠", data.deckData.stats.trapCount, traps)}

    <hr class="my-8 border-t border-gray-300" />

    <!-- エクストラデッキ -->
    <div class="mb-4 flex items-center space-x-4">
      <h2 class="h3">エクストラデッキ</h2>
      <span class="badge preset-tonal-surface text-sm shadow-md"
        >{fusion.reduce((sum, entry) => sum + entry.quantity, 0) +
          synchro.reduce((sum, entry) => sum + entry.quantity, 0) +
          xyz.reduce((sum, entry) => sum + entry.quantity, 0)}枚</span
      >
    </div>

    <!-- 融合モンスター -->
    {#if fusion.length > 0}
      {@render cardSection(
        "融合",
        fusion.reduce((sum, entry) => sum + entry.quantity, 0),
        fusion,
      )}
    {/if}

    <!-- シンクロモンスター -->
    {#if synchro.length > 0}
      {@render cardSection(
        "シンクロ",
        synchro.reduce((sum, entry) => sum + entry.quantity, 0),
        synchro,
      )}
    {/if}

    <!-- エクシーズモンスター -->
    {#if xyz.length > 0}
      {@render cardSection(
        "エクシーズ",
        xyz.reduce((sum, entry) => sum + entry.quantity, 0),
        xyz,
      )}
    {/if}
    <hr class="my-8 border-t border-gray-300" />
  </div>

  <!-- デッキ説明 -->
  {#if data.deckData.description}
    <div class="mb-6 p-4 bg-surface-100-800-token rounded-lg">
      <p class="text-sm opacity-75">{data.deckData.description}</p>
    </div>
  {/if}
</div>
