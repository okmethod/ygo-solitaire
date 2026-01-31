<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import { navigateTo } from "$lib/presentation/utils/navigation";
  import { initializeCache } from "$lib/presentation/services/cardDisplayDataCache";
  import CardList from "$lib/presentation/components/organisms/CardList.svelte";

  let { data }: { data: PageData } = $props();
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
      <h2 class="h3">{data.deckData.name}</h2>
      <button class="btn preset-tonal rounded-full shadow-lg text-lg px-4 py-2" onclick={navigateToSimulator}>
        決闘開始
      </button>
    </div>
  </header>

  <!-- デッキ説明 -->
  {#if data.deckData.description}
    <div class="mb-6 p-4 bg-surface-100-800-token rounded-lg">
      <p class="text-sm opacity-75">{data.deckData.description}</p>
    </div>
  {/if}

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
    <CardList title="モンスター" cardCount={data.deckData.stats.monsterCount} cards={monsters} />

    <!-- 魔法カード -->
    <CardList title="魔法" cardCount={data.deckData.stats.spellCount} cards={spells} />

    <!-- 罠カード -->
    <CardList title="罠" cardCount={data.deckData.stats.trapCount} cards={traps} />

    <hr class="my-8 border-t border-gray-300" />

    <!-- エクストラデッキ -->
    <div class="mb-4 flex items-center space-x-4">
      <h2 class="h3">エクストラデッキ</h2>
      <span class="badge preset-tonal-surface text-sm shadow-md"
        >{fusion.reduce((sum, entry) => sum + entry.quantity, 0) +
          synchro.reduce((sum, entry) => sum + entry.quantity, 0) +
          xyz.reduce((sum, entry) => sum + entry.quantity, 0) +
          link.reduce((sum, entry) => sum + entry.quantity, 0)}枚</span
      >
    </div>

    <!-- 融合モンスター -->
    {#if fusion.length > 0}
      <CardList title="融合" cardCount={fusion.reduce((sum, entry) => sum + entry.quantity, 0)} cards={fusion} />
    {/if}

    <!-- シンクロモンスター -->
    {#if synchro.length > 0}
      <CardList title="シンクロ" cardCount={synchro.reduce((sum, entry) => sum + entry.quantity, 0)} cards={synchro} />
    {/if}

    <!-- エクシーズモンスター -->
    {#if xyz.length > 0}
      <CardList title="エクシーズ" cardCount={xyz.reduce((sum, entry) => sum + entry.quantity, 0)} cards={xyz} />
    {/if}

    <!-- リンクモンスター -->
    {#if link.length > 0}
      <CardList title="リンク" cardCount={link.reduce((sum, entry) => sum + entry.quantity, 0)} cards={link} />
    {/if}
    <hr class="my-8 border-t border-gray-300" />
  </div>
</div>
