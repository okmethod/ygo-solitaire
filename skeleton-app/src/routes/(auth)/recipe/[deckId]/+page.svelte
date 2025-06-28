<script lang="ts">
  import { navigateTo } from "$lib/utils/navigation";
  import Card from "$lib/components/atoms/Card.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { monsters, spells, traps } = data.deckData.mainDeck;
  const { fusion, synchro, xyz } = data.deckData.extraDeck;

  function navigateToSimulator() {
    navigateTo(`/simulator/${data.deckId}`);
  }
</script>

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
      <span class="badge preset-tonal-surface text-sm">{data.deckData.stats.totalCards}枚</span>
    </div>
    <!-- モンスターカード -->
    <section>
      <div class="mb-4 flex items-center space-x-4">
        <h3 class="h4 flex items-center">
          <span class="w-4 h-4 bg-yellow-500 rounded mr-2"></span>
          モンスター
        </h3>
        <span class="badge preset-tonal-surface text-sm">{data.deckData.stats.monsterCount}枚</span>
      </div>
      {#if monsters.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each monsters as cardEntry (cardEntry.cardData.id)}
            <div class="relative">
              <Card card={cardEntry.cardData} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {cardEntry.quantity}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- 魔法カード -->
    <section>
      <div class="mb-4 flex items-center space-x-4">
        <h3 class="h4 flex items-center">
          <span class="w-4 h-4 bg-green-500 rounded mr-2"></span>
          魔法
        </h3>
        <span class="badge preset-tonal-surface text-sm">{data.deckData.stats.spellCount}枚</span>
      </div>
      {#if spells.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each spells as cardEntry (cardEntry.cardData.id)}
            <div class="relative">
              <Card card={cardEntry.cardData} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {cardEntry.quantity}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- 罠カード -->
    <section>
      <div class="mb-4 flex items-center space-x-4">
        <h3 class="h4 flex items-center">
          <span class="w-4 h-4 bg-purple-500 rounded mr-2"></span>
          罠
        </h3>
        <span class="badge preset-tonal-surface text-sm">{data.deckData.stats.trapCount}枚</span>
      </div>
      {#if traps.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each traps as cardEntry (cardEntry.cardData.id)}
            <div class="relative">
              <Card card={cardEntry.cardData} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {cardEntry.quantity}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <hr class="my-8 border-t border-gray-300" />

    <!-- エクストラデッキ -->
    <div class="mb-4 flex items-center space-x-4">
      <h2 class="h3">エクストラデッキ</h2>
      <span class="badge preset-tonal-surface text-sm"
        >{fusion.reduce((sum, entry) => sum + entry.quantity, 0) +
          synchro.reduce((sum, entry) => sum + entry.quantity, 0) +
          xyz.reduce((sum, entry) => sum + entry.quantity, 0)}枚</span
      >
    </div>

    <!-- 融合モンスター -->
    {#if fusion.length > 0}
      <section>
        <div class="mb-4 flex items-center space-x-4">
          <h3 class="h4 flex items-center">
            <span class="w-4 h-4 bg-purple-600 rounded mr-2"></span>
            融合
          </h3>
          <span class="badge preset-tonal-surface text-sm"
            >{fusion.reduce((sum, entry) => sum + entry.quantity, 0)}枚</span
          >
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each fusion as cardEntry (cardEntry.cardData.id)}
            <div class="relative">
              <Card card={cardEntry.cardData} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {cardEntry.quantity}
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- シンクロモンスター -->
    {#if synchro.length > 0}
      <section>
        <div class="mb-4 flex items-center space-x-4">
          <h3 class="h4 flex items-center">
            <span class="w-4 h-4 bg-white border border-gray-400 rounded mr-2"></span>
            シンクロ
          </h3>
          <span class="badge preset-tonal-surface text-sm"
            >{synchro.reduce((sum, entry) => sum + entry.quantity, 0)}枚</span
          >
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each synchro as cardEntry (cardEntry.cardData.id)}
            <div class="relative">
              <Card card={cardEntry.cardData} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {cardEntry.quantity}
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- エクシーズモンスター -->
    {#if xyz.length > 0}
      <section>
        <div class="mb-4 flex items-center space-x-4">
          <h3 class="h4 flex items-center">
            <span class="w-4 h-4 bg-black rounded mr-2"></span>
            エクシーズ
          </h3>
          <span class="badge preset-tonal-surface text-sm">{xyz.reduce((sum, entry) => sum + entry.quantity, 0)}枚</span
          >
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each xyz as cardEntry (cardEntry.cardData.id)}
            <div class="relative">
              <Card card={cardEntry.cardData} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {cardEntry.quantity}
              </div>
            </div>
          {/each}
        </div>
      </section>
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
