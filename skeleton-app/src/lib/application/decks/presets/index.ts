/**
 *
 * Preset Deck Recipes - プリセットデッキレシピ集
 *
 * YAML定義をパース・バリデーションして Record<string, DeckRecipe> として提供する。
 * 順序がデッキ選択UIの表示順になる。
 *
 * @module application/decks/presets
 */

import type { DeckRecipe } from "$lib/application/types/deck";
import { parseDeckRecipeYaml, toDeckRecipe } from "../deckRecipeParsers";

import exodiaDeckYaml from "./exodia-deck.yaml?raw";
import legacyExodiaDeckYaml from "./legacy-exodia-deck.yaml?raw";
import libraryExodiaDeckYaml from "./library-exodia-deck.yaml?raw";
import pandaExodiaDeckYaml from "./panda-exodia-deck.yaml?raw";
import scientistCatapultDeckYaml from "./scientist-catapult-deck.yaml?raw";

const yamlContents: readonly string[] = [
  exodiaDeckYaml,
  legacyExodiaDeckYaml,
  libraryExodiaDeckYaml,
  pandaExodiaDeckYaml,
  scientistCatapultDeckYaml,
];

/** パース済みプリセットデッキレシピ（デッキID → DeckRecipe） */
export const presetDeckRecipes: Record<string, DeckRecipe> = Object.fromEntries(
  yamlContents.map((yaml) => {
    const definition = parseDeckRecipeYaml(yaml);
    return [definition.id, toDeckRecipe(definition)];
  }),
);
