import type { PageLoad } from "./$types";
import { sampleDeckRecipes } from "$lib/data/sampleDeckRecipes";
import { error } from "@sveltejs/kit";

export const load: PageLoad = ({ params }) => {
  const { id } = params;
  const recipe = sampleDeckRecipes[id];

  if (!recipe) {
    throw error(404, "レシピが見つかりません");
  }

  return {
    recipe,
    id,
  };
};
