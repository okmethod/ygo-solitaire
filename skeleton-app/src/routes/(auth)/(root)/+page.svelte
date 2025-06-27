<script lang="ts">
  import { sampleDeckRecipes } from "$lib/data/sampleDeckRecipes";
  import { navigateTo } from "$lib/utils/navigation";

  // レシピのキーと値の配列を作成
  const recipeEntries = Object.entries(sampleDeckRecipes);
  let selectedRecipeId = recipeEntries[0][0]; // 初期値として最初のIDを設定

  function navigateToSimulator() {
    navigateTo("/simulator");
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
      <label for="deck-select"></label>
      <select
        id="deck-select"
        bind:value={selectedRecipeId}
        class="badge preset-tonal text-sm border border-gray-100 rounded px-4 py-2 w-full"
      >
        {#each recipeEntries as [id, recipe] (id)}
          <option value={id}>{recipe.name}</option>
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
