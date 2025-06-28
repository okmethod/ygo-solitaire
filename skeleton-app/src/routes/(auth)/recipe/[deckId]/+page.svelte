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
      <span class="badge preset-tonal-surface text-sm"
        >{data.deckData.stats.monsterCount + data.deckData.stats.spellCount + data.deckData.stats.trapCount}枚</span
      >
    </div>
    <!-- モンスターカード -->
    <section>
      <div class="mb-3 flex items-center space-x-4">
        <h3 class="h4 flex items-center min-w-fit">
          <span class="w-4 h-4 bg-yellow-500 rounded mr-2"></span>
          モンスター
        </h3>
        <span class="badge preset-tonal-surface text-sm">{data.deckData.stats.monsterCount}枚</span>
        {#if monsters.length > 0}
          <div
            class="flex-1 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2 ml-4"
          >
            {#each monsters as cardEntry (cardEntry.cardData.id)}
              <div class="relative">
                <div class="border-2 border-gray-400 rounded-lg shadow-md overflow-hidden">
                  <Card card={cardEntry.cardData} size="medium" showDetails={true} />
                </div>
                {#if cardEntry.quantity > 1}
                  <div
                    class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
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

    <!-- 魔法カード -->
    <section>
      <div class="mb-3 flex items-center space-x-4">
        <h3 class="h4 flex items-center min-w-fit">
          <span class="w-4 h-4 bg-green-500 rounded mr-2"></span>
          魔法
        </h3>
        <span class="badge preset-tonal-surface text-sm">{data.deckData.stats.spellCount}枚</span>
        {#if spells.length > 0}
          <div
            class="flex-1 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2 ml-4"
          >
            {#each spells as cardEntry (cardEntry.cardData.id)}
              <div class="relative">
                <div class="border-2 border-gray-400 rounded-lg shadow-md overflow-hidden">
                  <Card card={cardEntry.cardData} size="medium" showDetails={true} />
                </div>
                {#if cardEntry.quantity > 1}
                  <div
                    class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
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

    <!-- 罠カード -->
    <section>
      <div class="mb-3 flex items-center space-x-4">
        <h3 class="h4 flex items-center min-w-fit">
          <span class="w-4 h-4 bg-purple-500 rounded mr-2"></span>
          罠
        </h3>
        <span class="badge preset-tonal-surface text-sm">{data.deckData.stats.trapCount}枚</span>
        {#if traps.length > 0}
          <div
            class="flex-1 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2 ml-4"
          >
            {#each traps as cardEntry (cardEntry.cardData.id)}
              <div class="relative">
                <div class="border-2 border-gray-400 rounded-lg shadow-md overflow-hidden">
                  <Card card={cardEntry.cardData} size="medium" showDetails={true} />
                </div>
                {#if cardEntry.quantity > 1}
                  <div
                    class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
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
        <div class="mb-3 flex items-center space-x-4">
          <h3 class="h4 flex items-center min-w-fit">
            <span class="w-4 h-4 bg-violet-600 rounded mr-2"></span>
            融合
          </h3>
          <span class="badge preset-tonal-surface text-sm"
            >{fusion.reduce((sum, entry) => sum + entry.quantity, 0)}枚</span
          >
          <div
            class="flex-1 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2 ml-4"
          >
            {#each fusion as cardEntry (cardEntry.cardData.id)}
              <div class="relative">
                <div class="border-2 border-violet-600 rounded-lg shadow-md overflow-hidden">
                  <Card card={cardEntry.cardData} size="medium" showDetails={true} />
                </div>
                {#if cardEntry.quantity > 1}
                  <div
                    class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                  >
                    {cardEntry.quantity}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    <!-- シンクロモンスター -->
    {#if synchro.length > 0}
      <section>
        <div class="mb-3 flex items-center space-x-4">
          <h3 class="h4 flex items-center min-w-fit">
            <span class="w-4 h-4 bg-slate-300 border border-gray-500 rounded mr-2"></span>
            シンクロ
          </h3>
          <span class="badge preset-tonal-surface text-sm"
            >{synchro.reduce((sum, entry) => sum + entry.quantity, 0)}枚</span
          >
          <div
            class="flex-1 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2 ml-4"
          >
            {#each synchro as cardEntry (cardEntry.cardData.id)}
              <div class="relative">
                <div class="border-2 border-slate-400 rounded-lg shadow-md overflow-hidden">
                  <Card card={cardEntry.cardData} size="medium" showDetails={true} />
                </div>
                {#if cardEntry.quantity > 1}
                  <div
                    class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                  >
                    {cardEntry.quantity}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    <!-- エクシーズモンスター -->
    {#if xyz.length > 0}
      <section>
        <div class="mb-3 flex items-center space-x-4">
          <h3 class="h4 flex items-center min-w-fit">
            <span class="w-4 h-4 bg-gray-800 rounded mr-2"></span>
            エクシーズ
          </h3>
          <span class="badge preset-tonal-surface text-sm">{xyz.reduce((sum, entry) => sum + entry.quantity, 0)}枚</span
          >
          <div
            class="flex-1 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2 ml-4"
          >
            {#each xyz as cardEntry (cardEntry.cardData.id)}
              <div class="relative">
                <div class="border-2 border-gray-800 rounded-lg shadow-md overflow-hidden">
                  <Card card={cardEntry.cardData} size="medium" showDetails={true} />
                </div>
                {#if cardEntry.quantity > 1}
                  <div
                    class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                  >
                    {cardEntry.quantity}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
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
