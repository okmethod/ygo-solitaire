<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import { navigateTo } from "$lib/presentation/utils/navigation";
  import { initializeCache } from "$lib/presentation/services/cardDisplayDataCache";
  import CardList from "./_componets/CardList.svelte";

  let { data }: { data: PageData } = $props();
  const deckName = data.deckData.name;
  const deckDescription = data.deckData.description;
  const {
    mainDeckCount,
    monsterCount,
    spellCount,
    trapCount,
    extraDeckCount,
    fusionCount,
    synchroCount,
    xyzCount,
    linkCount,
  } = data.deckData.stats;
  const { monsters, spells, traps } = data.deckData.mainDeck;
  const { fusion, synchro, xyz, link } = data.deckData.extraDeck;

  onMount(async () => {
    // CardDisplayData キャッシュを初期化
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
      <h2 class="h3">{deckName}</h2>
      <button class="btn preset-tonal rounded-full shadow-lg text-lg px-4 py-2" onclick={navigateToSimulator}>
        決闘開始
      </button>
    </div>
  </header>

  <!-- デッキ説明 -->
  <div class="mb-6 p-4 bg-surface-100-800-token rounded-lg">
    <p class="text-sm opacity-75">{deckDescription}</p>
  </div>

  <hr class="my-8 border-t border-gray-300" />

  <!-- カード一覧 -->
  <div class="space-y-6">
    <!-- メインデッキ -->
    <div class="mb-4 flex items-center space-x-4">
      <h2 class="h3">メインデッキ</h2>
      <span class="badge preset-tonal-surface text-sm shadow-md">
        {mainDeckCount}枚
      </span>
    </div>
    <!-- モンスターカード -->
    <CardList title="モンスター" cardCount={monsterCount} cards={monsters} />

    <!-- 魔法カード -->
    <CardList title="魔法" cardCount={spellCount} cards={spells} />

    <!-- 罠カード -->
    <CardList title="罠" cardCount={trapCount} cards={traps} />

    <!-- エクストラデッキ -->
    <div class="mb-4 flex items-center space-x-4">
      <h2 class="h3">エクストラデッキ</h2>
      <span class="badge preset-tonal-surface text-sm shadow-md">
        {extraDeckCount}枚
      </span>
    </div>

    <!-- 融合モンスター -->
    {#if fusion.length > 0}
      <CardList title="融合" cardCount={fusionCount} cards={fusion} />
    {/if}

    <!-- シンクロモンスター -->
    {#if synchro.length > 0}
      <CardList title="シンクロ" cardCount={synchroCount} cards={synchro} />
    {/if}

    <!-- エクシーズモンスター -->
    {#if xyz.length > 0}
      <CardList title="エクシーズ" cardCount={xyzCount} cards={xyz} />
    {/if}

    <!-- リンクモンスター -->
    {#if link.length > 0}
      <CardList title="リンク" cardCount={linkCount} cards={link} />
    {/if}
  </div>
</div>
