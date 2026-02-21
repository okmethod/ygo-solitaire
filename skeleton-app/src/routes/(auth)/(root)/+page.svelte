<script lang="ts">
  import { getPresetDecks } from "$lib/application/decks/deckLoader";
  import { navigateTo } from "$lib/presentation/utils/navigation";

  const decks = getPresetDecks();
  let selectedRecipeId = decks[0].id;

  function navigateToSimulator() {
    navigateTo(`/simulator/${selectedRecipeId}`);
  }

  function navigateToRecipe() {
    navigateTo(`/recipe/${selectedRecipeId}`);
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex flex-col items-center min-h-[70vh] space-y-8">
    <header class="text-center">
      <h1 class="h2 opacity-75 p-4">ワンキルシミュレーター</h1>
    </header>

    <div class="mx-auto w-96 rounded-lg shadow-lg">
      <label for="deck-select">▼デッキを選択</label>
      <select
        id="deck-select"
        bind:value={selectedRecipeId}
        class="badge preset-tonal text-sm border border-gray-100 rounded px-4 py-2 w-full"
      >
        {#each decks as { id, name } (id)}
          <option value={id}>{name}</option>
        {/each}
      </select>
    </div>

    <div class="flex justify-center space-x-6">
      <button class="btn preset-tonal rounded-full shadow-lg text-lg px-8 py-4" on:click={navigateToRecipe}>
        デッキ確認
      </button>
      <button class="btn preset-tonal rounded-full shadow-lg text-lg px-8 py-4" on:click={navigateToSimulator}>
        決闘開始
      </button>
    </div>
  </div>
</div>
