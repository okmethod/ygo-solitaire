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
    { id: 70903634, quantity: 1 }, // 封印されし者の右腕
    { id: 7902349, quantity: 1 }, // 封印されし者の左腕
    { id: 8124921, quantity: 1 }, // 封印されし者の右足
    { id: 44519536, quantity: 1 }, // 封印されし者の左足

    // 魔法カード
    { id: 55144522, quantity: 3 }, // 強欲な壺
    { id: 79571449, quantity: 3 }, // 天使の施し
    { id: 70368879, quantity: 3 }, // 成金ゴブリン
    { id: 33782437, quantity: 3 }, // 一時休戦
    { id: 93946239, quantity: 3 }, // 無の煉獄
    { id: 74519184, quantity: 3 }, // 手札断殺
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

const deckRecipeLegacyExodia: DeckRecipe = {
  name: "レガシー・エクゾディア",
  description: "往年のクリッター・黒き森のウィッチを使えるエクゾディアデッキです",
  category: "エクゾディア",
  mainDeck: [
    // モンスターカード
    { id: 33396948, quantity: 1 }, // 封印されしエクゾディア
    { id: 70903634, quantity: 1 }, // 封印されし者の右腕
    { id: 7902349, quantity: 1 }, // 封印されし者の左腕
    { id: 8124921, quantity: 1 }, // 封印されし者の右足
    { id: 44519536, quantity: 1 }, // 封印されし者の左足
    { id: 26202165, quantity: 3 }, // クリッター
    { id: 78010363, quantity: 3 }, // 黒き森のウィッチ

    // 魔法カード
    { id: 55144522, quantity: 3 }, // 強欲な壺
    { id: 79571449, quantity: 3 }, // 天使の施し
    { id: 70368879, quantity: 3 }, // 成金ゴブリン
    { id: 33782437, quantity: 3 }, // 一時休戦
    { id: 93946239, quantity: 3 }, // 無の煉獄
    { id: 67616300, quantity: 3 }, // チキンレース
    { id: 74519184, quantity: 3 }, // 手札断殺
    { id: 98494543, quantity: 3 }, // 魔法石の採掘
    { id: 90928333, quantity: 3 }, // 闇の量産工場
    { id: 98645731, quantity: 1 }, // 強欲で謙虚な壺
    { id: 73628505, quantity: 1 }, // テラ・フォーミング
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
    { id: 70903634, quantity: 1 }, // 封印されし者の右腕
    { id: 7902349, quantity: 1 }, // 封印されし者の左腕
    { id: 8124921, quantity: 1 }, // 封印されし者の右足
    { id: 44519536, quantity: 1 }, // 封印されし者の左足
    { id: 70791313, quantity: 3 }, // 王立魔法図書館
    { id: 423585, quantity: 3 }, // 召喚僧サモンプリースト

    // 魔法カード
    { id: 79571449, quantity: 3 }, // 天使の施し
    { id: 70368879, quantity: 3 }, // 成金ゴブリン
    { id: 33782437, quantity: 3 }, // 一時休戦
    { id: 93946239, quantity: 3 }, // 無の煉獄
    { id: 74519184, quantity: 3 }, // 手札断殺
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

const deckScienceCatapult: DeckRecipe = {
  name: "サイエンカタパ",
  description: "魔導サイエンティストで特殊召喚した融合モンスターを、カタパルトタートルで射出するデッキです",
  category: "フルバーン",
  mainDeck: [
    // モンスターカード
    { id: 34206604, quantity: 3 }, // 魔導サイエンティスト
    { id: 95727991, quantity: 3 }, // カタパルト・タートル

    // 魔法カード
    { id: 55144522, quantity: 3 }, // 強欲な壺
  ],
  extraDeck: [
    { id: 46696593, quantity: 3 }, // 紅陽鳥
    { id: 86164529, quantity: 3 }, // アクア・ドラゴン
    { id: 54622031, quantity: 3 }, // 金色の魔象
  ],
};

export const presetDeckRecipes: Record<string, DeckRecipe> = {
  "exodia-deck": deckRecipeExodia,
  "legacy-exodia-deck": deckRecipeLegacyExodia,
  "library-exodia-deck": deckRecipeLibrary,
  "scientist-catapult-deck": deckScienceCatapult,
};
