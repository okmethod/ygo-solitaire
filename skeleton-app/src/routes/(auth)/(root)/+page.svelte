<script lang="ts">
  import { browser } from "$app/environment";
  import { getPresetDecks } from "$lib/application/decks/deckLoader";
  import { navigateTo } from "$lib/presentation/utils/navigation";
  import { gameFacade } from "$lib/application/GameFacade";

  const decks = getPresetDecks();
  let selectedRecipeId = decks[0].id;

  // browser環境では layout の DI が完了しているので hasSavedGame が使える
  const savedDeckId = browser ? gameFacade.getSavedDeckId() : null;

  function navigateToSimulator() {
    navigateTo(`/simulator/${selectedRecipeId}`);
  }

  function navigateToRecipe() {
    navigateTo(`/recipe/${selectedRecipeId}`);
  }

  function continueGame() {
    if (savedDeckId) {
      navigateTo(`/simulator/${savedDeckId}?restore=true`);
    }
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex flex-col items-center min-h-[70vh] space-y-8">
    <header class="text-center">
      <h1 class="h2 opacity-75 p-4">
        <span class="inline-block">ワンターンキル</span>
        <span class="inline-block">シミュレーター</span>
      </h1>
    </header>

    <div class="mx-auto w-64 md:w-96">
      <label for="deck-select">▼デッキを選択</label>
      <select
        id="deck-select"
        bind:value={selectedRecipeId}
        class="badge preset-tonal text-sm border border-gray-100 rounded px-4 py-2 w-full rounded-lg shadow-lg"
      >
        {#each decks as { id, name } (id)}
          <option value={id}>{name}</option>
        {/each}
      </select>
    </div>

    <div class="flex justify-center space-x-6">
      <button class="btn preset-tonal rounded-full shadow-lg md:text-lg px-4 md:px-8 py-4" on:click={navigateToRecipe}>
        デッキ確認
      </button>
      <button
        class="btn preset-tonal rounded-full shadow-lg md:text-lg px-4 md:px-8 py-4"
        on:click={navigateToSimulator}
      >
        決闘開始
      </button>
    </div>

    {#if savedDeckId}
      <div class="flex justify-center">
        <button class="btn preset-filled rounded-full shadow-lg md:text-lg px-4 md:px-8 py-4" on:click={continueGame}>
          直前の状態から再開
        </button>
      </div>
    {/if}
  </div>
</div>
