<script lang="ts">
  import { navigateTo } from "$lib/utils/navigation";
  import Card from "$lib/components/atoms/Card.svelte";
  import type { Card as CardType } from "$lib/types/card";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const selectedRecipe = data.recipe;

  function navigateToSimulator() {
    navigateTo(`/simulator/${data.deckId}`);
  }

  // カードタイプ別にフィルタする関数
  function getCardsByType(cards: CardType[], type: string) {
    return cards.filter((card) => card.type === type);
  }

  // カードの数量を計算する関数
  function countCardQuantity(cards: CardType[], targetCard: CardType): number {
    return cards.filter((card) => card.id === targetCard.id).length;
  }

  // 重複を除いたカードリストを作成する関数
  function getUniqueCards(cards: CardType[]): CardType[] {
    const uniqueMap = new Map<number, CardType>();
    cards.forEach((card) => {
      if (!uniqueMap.has(card.id)) {
        uniqueMap.set(card.id, card);
      }
    });
    return Array.from(uniqueMap.values());
  }

  // カードタイプ別の統計情報
  const monsterCards = getUniqueCards(getCardsByType(selectedRecipe.mainDeck, "monster"));
  const spellCards = getUniqueCards(getCardsByType(selectedRecipe.mainDeck, "spell"));
  const trapCards = getUniqueCards(getCardsByType(selectedRecipe.mainDeck, "trap"));
  const totalCards = selectedRecipe.mainDeck.length;
</script>

<div class="container mx-auto p-4">
  <!-- ヘッダー -->
  <header class="my-6">
    <div class="flex items-center space-x-8 mb-4">
      <h2 class="h3">{selectedRecipe.name}</h2>
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
        <span class="badge preset-tonal-surface text-sm"
          >{getCardsByType(selectedRecipe.mainDeck, "monster").length}枚</span
        >
      </div>
      {#if monsterCards.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each monsterCards as card (card.id)}
            <div class="relative">
              <Card {card} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {countCardQuantity(selectedRecipe.mainDeck, card)}
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
        <span class="badge preset-tonal-surface text-sm"
          >{getCardsByType(selectedRecipe.mainDeck, "spell").length}枚</span
        >
      </div>
      {#if spellCards.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each spellCards as card (card.id)}
            <div class="relative">
              <Card {card} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {countCardQuantity(selectedRecipe.mainDeck, card)}
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
        <span class="badge preset-tonal-surface text-sm"
          >{getCardsByType(selectedRecipe.mainDeck, "trap").length}枚</span
        >
      </div>
      {#if trapCards.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each trapCards as card (card.id)}
            <div class="relative">
              <Card {card} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {countCardQuantity(selectedRecipe.mainDeck, card)}
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
      <span class="badge preset-tonal-surface text-sm">{selectedRecipe.extraDeck.length}枚</span>
    </div>

    <!-- TODO: シンクロ・エクシーズなどを分類する -->
    <section>
      {#if selectedRecipe.extraDeck.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each selectedRecipe.extraDeck as card (card.id)}
            <Card {card} size="medium" showDetails={true} />
          {/each}
        </div>
      {/if}
    </section>
    <hr class="my-8 border-t border-gray-300" />
  </div>

  <!-- デッキ説明 -->
  {#if selectedRecipe.description}
    <div class="mb-6 p-4 bg-surface-100-800-token rounded-lg">
      <p class="text-sm opacity-75">{selectedRecipe.description}</p>
    </div>
  {/if}
</div>
