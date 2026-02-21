/**
 * presetDeckRecipes - プリセットデッキレシピ集
 */

import type { DeckRecipe } from "$lib/application/types/deck";

const deckRecipeExodia: DeckRecipe = {
  name: "封印されしエクゾディア",
  description: "魔法カード主体のエクゾディアデッキです",
  category: "エクゾディア",
  mainDeck: [
    // モンスターカード
    { id: 33396948, quantity: 1 }, // 封印されしエクゾディア
    { id: 7902349, quantity: 1 }, // 封印されし者の左腕
    { id: 70903634, quantity: 1 }, // 封印されし者の右腕
    { id: 44519536, quantity: 1 }, // 封印されし者の左足
    { id: 8124921, quantity: 1 }, // 封印されし者の右足

    // 魔法カード
    { id: 55144522, quantity: 3 }, // 強欲な壺
    { id: 79571449, quantity: 3 }, // 天使の施し
    { id: 70368879, quantity: 3 }, // 成金ゴブリン
    { id: 33782437, quantity: 3 }, // 一時休戦
    { id: 93946239, quantity: 3 }, // 無の煉獄
    { id: 74519184, quantity: 3 }, // 手札断札
    { id: 90928333, quantity: 3 }, // 闇の量産工場
    { id: 98494543, quantity: 3 }, // 魔法石の採掘
    { id: 85852291, quantity: 3 }, // 打ち出の小槌
    { id: 73628505, quantity: 3 }, // テラ・フォーミング
    { id: 67616300, quantity: 3 }, // チキンレース
    { id: 98645731, quantity: 1 }, // 強欲で謙虚な壺
    { id: 59750328, quantity: 1 }, // 命削りの宝札
  ],
  extraDeck: [],
};

const deckRecipeGreedyExodia: DeckRecipe = {
  name: "強欲なエクゾディア",
  description: "あまりにも強欲で、必ずワンキルできるデッキです",
  category: "エクゾディア",
  mainDeck: [
    // モンスターカード
    { id: 33396948, quantity: 1 }, // 封印されしエクゾディア
    { id: 7902349, quantity: 1 }, // 封印されし者の左腕
    { id: 70903634, quantity: 1 }, // 封印されし者の右腕
    { id: 44519536, quantity: 1 }, // 封印されし者の左足
    { id: 8124921, quantity: 1 }, // 封印されし者の右足

    // 魔法カード
    { id: 55144522, quantity: 15 }, // 強欲な壺
    { id: 79571449, quantity: 10 }, // 天使の施し
    { id: 70368879, quantity: 10 }, // 成金ゴブリン
  ],
  extraDeck: [],
};

const deckRecipeLibrary: DeckRecipe = {
  name: "図書館エクゾ",
  description: "王立魔法図書館に魔力カウンターに置いてドローするエクゾディアデッキです",
  category: "エクゾディア",
  mainDeck: [
    // モンスターカード
    { id: 33396948, quantity: 1 }, // 封印されしエクゾディア
    { id: 7902349, quantity: 1 }, // 封印されし者の左腕
    { id: 70903634, quantity: 1 }, // 封印されし者の右腕
    { id: 44519536, quantity: 1 }, // 封印されし者の左足
    { id: 8124921, quantity: 1 }, // 封印されし者の右足
    { id: 70791313, quantity: 3 }, // 王立魔法図書館

    // 魔法カード
    { id: 55144522, quantity: 3 }, // 強欲な壺
    { id: 79571449, quantity: 3 }, // 天使の施し
    { id: 70368879, quantity: 3 }, // 成金ゴブリン
    { id: 33782437, quantity: 3 }, // 一時休戦
    { id: 93946239, quantity: 3 }, // 無の煉獄
    { id: 74519184, quantity: 3 }, // 手札断札
    { id: 90928333, quantity: 2 }, // 闇の量産工場
    { id: 85852291, quantity: 1 }, // 打ち出の小槌
    { id: 89997728, quantity: 3 }, // トゥーンのもくじ
    { id: 15259703, quantity: 1 }, // トゥーン・ワールド
    { id: 73628505, quantity: 3 }, // テラ・フォーミング
    { id: 67616300, quantity: 3 }, // チキンレース
    { id: 98645731, quantity: 1 }, // 強欲で謙虚な壺
  ],
  extraDeck: [],
};

export const presetDeckRecipes: Record<string, DeckRecipe> = {
  "exodia-deck": deckRecipeExodia,
  "greedy-exodia-deck": deckRecipeGreedyExodia,
  "library-exodia-deck": deckRecipeLibrary,
};
