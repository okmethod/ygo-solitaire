<script lang="ts">
  import { sampleDeckRecipesList } from "$lib/data/sampleDeckRecipes";
  import { navigateTo } from "$lib/utils/navigation";
  import type { DeckRecipeData } from "$lib/types/recipe";

  let selectedRecipe = sampleDeckRecipesList[0];

  // レシピIDを取得する関数
  function getRecipeId(recipe: DeckRecipeData): string {
    if (recipe === sampleDeckRecipesList[0]) return "beginner-deck";
    if (recipe === sampleDeckRecipesList[1]) return "dragon-deck";
    if (recipe === sampleDeckRecipesList[2]) return "control-deck";
    return "beginner-deck";
  }

  function navigateToSimulator() {
    navigateTo("/simulator");
  }

  function navigateToRecipe() {
    const recipeId = getRecipeId(selectedRecipe);
    navigateTo(`/recipe/${recipeId}`);
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex flex-col items-center min-h-[70vh] space-y-8">
    <header class="text-center">
      <h1 class="h2 opacity-75 p-4">ワンキルシミュレーター</h1>
    </header>

    <div class="mx-auto w-96">
      <label for="deck-select"></label>
      <select id="deck-select" bind:value={selectedRecipe} class="w-full border border-gray-100 rounded px-4 py-2">
        {#each sampleDeckRecipesList as recipe (recipe.name)}
          <option value={recipe}>{recipe.name}</option>
        {/each}
      </select>
    </div>

    <div class="flex justify-center space-x-6">
      <button class="btn preset-tonal rounded-full text-lg px-8 py-4" on:click={navigateToRecipe}> デッキ確認 </button>
      <button class="btn preset-tonal rounded-full text-lg px-8 py-4" on:click={navigateToSimulator}> 決闘開始 </button>
    </div>
  </div>
</div>
