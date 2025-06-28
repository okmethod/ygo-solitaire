<script lang="ts">
  import { navigateTo } from "$lib/utils/navigation";
  import Card from "$lib/components/atoms/Card.svelte";
  import type { LoadedCardEntry } from "$lib/types/deck";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const selectedDeckData = data.deckData;

  function navigateToSimulator() {
    navigateTo(`/simulator/${data.deckId}`);
  }

  // カードタイプ別にフィルタする関数（LoadedCardEntry用）
  function getCardsByType(cards: LoadedCardEntry[], type: string) {
    return cards.filter((cardEntry) => cardEntry.card.type === type);
  }

  // カードタイプ別の統計情報（事前計算された統計を使用）
  const monsterCards = getCardsByType(selectedDeckData.mainDeck, "monster");
  const spellCards = getCardsByType(selectedDeckData.mainDeck, "spell");
  const trapCards = getCardsByType(selectedDeckData.mainDeck, "trap");

  // 統計情報は事前計算済み
  const { totalCards, monsterCount, spellCount, trapCount } = selectedDeckData.stats;
</script>

<div class="container mx-auto p-4">
  <!-- ヘッダー -->
  <header class="my-6">
    <div class="flex items-center space-x-8 mb-4">
      <h2 class="h3">{selectedDeckData.name}</h2>
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
      <span class="badge preset-tonal-surface text-sm">{totalCards}枚</span>
    </div>
    <!-- モンスターカード -->
    <section>
      <div class="mb-4 flex items-center space-x-4">
        <h3 class="h4 flex items-center">
          <span class="w-4 h-4 bg-yellow-500 rounded mr-2"></span>
          モンスター
        </h3>
        <span class="badge preset-tonal-surface text-sm">{monsterCount}枚</span>
      </div>
      {#if monsterCards.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each monsterCards as cardData (cardData.card.id)}
            <div class="relative">
              <Card card={cardData.card} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {cardData.quantity}
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
        <span class="badge preset-tonal-surface text-sm">{spellCount}枚</span>
      </div>
      {#if spellCards.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each spellCards as cardData (cardData.card.id)}
            <div class="relative">
              <Card card={cardData.card} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {cardData.quantity}
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
        <span class="badge preset-tonal-surface text-sm">{trapCount}枚</span>
      </div>
      {#if trapCards.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each trapCards as cardData (cardData.card.id)}
            <div class="relative">
              <Card card={cardData.card} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {cardData.quantity}
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
        >{selectedDeckData.extraDeck.reduce((sum, cardData) => sum + cardData.quantity, 0)}枚</span
      >
    </div>

    <!-- TODO: シンクロ・エクシーズなどを分類する -->
    <section>
      {#if selectedDeckData.extraDeck.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each selectedDeckData.extraDeck as cardData (cardData.card.id)}
            <Card card={cardData.card} size="medium" showDetails={true} />
          {/each}
        </div>
      {/if}
    </section>
    <hr class="my-8 border-t border-gray-300" />
  </div>

  <!-- デッキ説明 -->
  {#if selectedDeckData.description}
    <div class="mb-6 p-4 bg-surface-100-800-token rounded-lg">
      <p class="text-sm opacity-75">{selectedDeckData.description}</p>
    </div>
  {/if}
</div>
