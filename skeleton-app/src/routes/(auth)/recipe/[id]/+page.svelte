<script lang="ts">
  import { navigateTo } from "$lib/utils/navigation";
  import Card from "$lib/components/atoms/Card.svelte";
  import type { Card as CardType } from "$lib/types/card";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const selectedRecipe = data.recipe;

  function navigateToHome() {
    navigateTo("/");
  }

  function navigateToSimulator() {
    navigateTo("/simulator");
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
    const uniqueMap = new Map<string, CardType>();
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
  <header class="mb-6">
    <div class="flex items-center justify-between">
      <h1 class="h2 opacity-75">デッキレシピ詳細</h1>
      <div class="flex space-x-2">
        <button class="btn btn-sm preset-tonal" onclick={navigateToHome}> 戻る </button>
        <button class="btn btn-sm preset-filled" onclick={navigateToSimulator}> 決闘開始 </button>
      </div>
    </div>
  </header>

  <!-- デッキ情報 -->
  <div class="mb-6 p-4 bg-surface-100-800-token rounded-lg">
    <h2 class="h3 mb-2">{selectedRecipe.name}</h2>
    {#if selectedRecipe.description}
      <p class="text-sm opacity-75 mb-2">{selectedRecipe.description}</p>
    {/if}
    {#if selectedRecipe.category}
      <span class="badge preset-tonal text-xs">{selectedRecipe.category}</span>
    {/if}
    <div class="mt-4 flex space-x-4 text-sm">
      <span>メインデッキ: {totalCards}枚</span>
      <span>エクストラデッキ: {selectedRecipe.extraDeck.length}枚</span>
    </div>
  </div>

  <!-- カード一覧 -->
  <div class="space-y-6">
    <!-- モンスターカード -->
    {#if monsterCards.length > 0}
      <section>
        <h3 class="h4 mb-4 flex items-center">
          <span class="w-4 h-4 bg-yellow-500 rounded mr-2"></span>
          モンスターカード ({getCardsByType(selectedRecipe.mainDeck, "monster").length}枚)
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each monsterCards as card (card.id)}
            <div class="relative">
              <Card {card} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {countCardQuantity(selectedRecipe.mainDeck, card)}
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- 魔法カード -->
    {#if spellCards.length > 0}
      <section>
        <h3 class="h4 mb-4 flex items-center">
          <span class="w-4 h-4 bg-green-500 rounded mr-2"></span>
          魔法カード ({getCardsByType(selectedRecipe.mainDeck, "spell").length}枚)
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each spellCards as card (card.id)}
            <div class="relative">
              <Card {card} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {countCardQuantity(selectedRecipe.mainDeck, card)}
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- 罠カード -->
    {#if trapCards.length > 0}
      <section>
        <h3 class="h4 mb-4 flex items-center">
          <span class="w-4 h-4 bg-purple-500 rounded mr-2"></span>
          罠カード ({getCardsByType(selectedRecipe.mainDeck, "trap").length}枚)
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each trapCards as card (card.id)}
            <div class="relative">
              <Card {card} size="medium" showDetails={true} />
              <div
                class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {countCardQuantity(selectedRecipe.mainDeck, card)}
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- エクストラデッキ -->
    {#if selectedRecipe.extraDeck.length > 0}
      <section>
        <h3 class="h4 mb-4 flex items-center">
          <span class="w-4 h-4 bg-blue-500 rounded mr-2"></span>
          エクストラデッキ ({selectedRecipe.extraDeck.length}枚)
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {#each selectedRecipe.extraDeck as card (card.id)}
            <Card {card} size="medium" showDetails={true} />
          {/each}
        </div>
      </section>
    {/if}
  </div>
</div>
