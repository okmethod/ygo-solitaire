<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import { navigateTo } from "$lib/presentation/utils/navigation";
  import { initializeCache } from "$lib/presentation/services/displayDataCache";
  import CardList from "./_componets/CardList.svelte";

  let { data }: { data: PageData } = $props();
  const deck = $derived(data.deckData);
  const stats = $derived(deck.stats);
  const mainDeck = $derived(deck.mainDeck);
  const extraDeck = $derived(deck.extraDeck);

  onMount(async () => {
    // DisplayCardData キャッシュを初期化
    await initializeCache(data.uniqueCardIds);
  });

  function navigateToSimulator() {
    navigateTo(`/simulator/${data.deckId}`);
  }
</script>

<div class="container mx-auto p-4">
  <!-- ヘッダー -->
  <header class="my-6">
    <div class="flex items-center space-x-8 mb-4">
      <h2 class="h3">{deck.name}</h2>
      <button class="btn preset-tonal rounded-full shadow-lg md:text-lg px-4 py-2" onclick={navigateToSimulator}>
        決闘開始
      </button>
    </div>
  </header>

  <!-- デッキ説明 -->
  <div class="mb-6 p-4 bg-surface-100-800-token rounded-lg">
    <p class="text-sm opacity-75">{deck.description}</p>
  </div>

  <hr class="my-8 border-t border-gray-300" />

  <!-- カード一覧 -->
  <div class="space-y-6">
    <!-- メインデッキ -->
    <div class="mb-4 flex items-center space-x-4">
      <h2 class="h3">メインデッキ</h2>
      <span class="badge preset-tonal-surface text-sm shadow-md">
        {stats.mainDeckCount}枚
      </span>
    </div>
    <!-- モンスターカード -->
    <CardList title="モンスター" cardCount={stats.monsterCount} cards={mainDeck.monsters} />

    <!-- 魔法カード -->
    <CardList title="魔法" cardCount={stats.spellCount} cards={mainDeck.spells} />

    <!-- 罠カード -->
    <CardList title="罠" cardCount={stats.trapCount} cards={mainDeck.traps} />

    <!-- エクストラデッキ -->
    <div class="mb-4 flex items-center space-x-4">
      <h2 class="h3">エクストラデッキ</h2>
      <span class="badge preset-tonal-surface text-sm shadow-md">
        {stats.extraDeckCount}枚
      </span>
    </div>

    <!-- 融合モンスター -->
    {#if extraDeck.fusion.length > 0}
      <CardList title="融合" cardCount={stats.fusionCount} cards={extraDeck.fusion} />
    {/if}

    <!-- シンクロモンスター -->
    {#if extraDeck.synchro.length > 0}
      <CardList title="シンクロ" cardCount={stats.synchroCount} cards={extraDeck.synchro} />
    {/if}

    <!-- エクシーズモンスター -->
    {#if extraDeck.xyz.length > 0}
      <CardList title="エクシーズ" cardCount={stats.xyzCount} cards={extraDeck.xyz} />
    {/if}

    <!-- リンクモンスター -->
    {#if extraDeck.link.length > 0}
      <CardList title="リンク" cardCount={stats.linkCount} cards={extraDeck.link} />
    {/if}
  </div>
</div>
