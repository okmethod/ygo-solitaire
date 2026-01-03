import type { DeckRecipe } from "$lib/application/types/deck";

// YGOProDeckAPI の ID を使用したサンプルデッキレシピ
// 例) https://db.ygoprodeck.com/api/v7/cardinfo.php?id=33396948
export const sampleDeckRecipes: Record<string, DeckRecipe> = {
  "greedy-exodia-deck": {
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
      { id: 55144522, quantity: 3 }, // 強欲な壺
      { id: 79571449, quantity: 3 }, // 天使の施し
      { id: 70368879, quantity: 3 }, // 成金ゴブリン
      { id: 33782437, quantity: 3 }, // 一時休戦
      { id: 85852291, quantity: 3 }, // 打ち出の小槌
      { id: 74519184, quantity: 3 }, // 手札断札
      { id: 90928333, quantity: 3 }, // 闇の量産工場
      { id: 73628505, quantity: 3 }, // テラ・フォーミング
      { id: 67616300, quantity: 3 }, // チキンレース
      { id: 93946239, quantity: 3 }, // 無の煉獄
      { id: 98494543, quantity: 3 }, // 魔法石の採掘
      { id: 98645731, quantity: 1 }, // 強欲で謙虚な壺
      { id: 59750328, quantity: 1 }, // 命削りの宝札
    ],
    extraDeck: [],
  },

  "blue-eyes-deck": {
    name: "青眼の白龍デッキ",
    description: "青眼の白龍を中心とした基本的なビートダウンデッキです",
    category: "ビートダウン",
    mainDeck: [
      // モンスターカード
      { id: 89631139, quantity: 3 }, // 青眼の白龍 (Blue-Eyes White Dragon)
      { id: 74677422, quantity: 3 }, // 真紅眼の黒竜 (Red-Eyes Black Dragon)
      { id: 46986414, quantity: 2 }, // ブラック・マジシャン (Dark Magician)
      { id: 55144522, quantity: 3 }, // エルフの剣士 (Elemental Hero Sparkman)
      { id: 88071625, quantity: 3 }, // Lord of D.
      { id: 26905245, quantity: 2 }, // アンコモナー (Alexandrite Dragon)
      { id: 75646173, quantity: 2 }, // フェラル・インプ (Feral Imp)
      { id: 76812113, quantity: 2 }, // スパークマン (Elemental HERO Sparkman)

      // 魔法カード
      { id: 83764718, quantity: 1 }, // モンスター・リボーン (Monster Reborn)
      { id: 53129443, quantity: 1 }, // ブラック・ホール (Dark Hole)
      { id: 19613556, quantity: 1 }, // 大嵐 (Heavy Storm)
      { id: 12580477, quantity: 1 }, // 雷破 (Raigeki)
      { id: 46448938, quantity: 2 }, // スペルブック (Spellbook of Secrets)
      { id: 72892473, quantity: 2 }, // ピケルの円陣 (Mystical Space Typhoon)

      // 罠カード
      { id: 44095762, quantity: 2 }, // ミラーフォース (Mirror Force)
      { id: 53582587, quantity: 1 }, // 激流葬 (Torrential Tribute)
      { id: 4206964, quantity: 2 }, // 落とし穴 (Trap Hole)
      { id: 62279055, quantity: 1 }, // 魔法の筒 (Magic Cylinder)
      { id: 97077563, quantity: 2 }, // Call of the Haunted
    ],
    extraDeck: [
      // 融合モンスター
      { id: 89943723, quantity: 2 }, // Blue-Eyes Ultimate Dragon
      { id: 23995346, quantity: 1 }, // Blue-Eyes Twin Burst Dragon

      // シンクロモンスター
      { id: 44508094, quantity: 2 }, // Stardust Dragon
      { id: 70902743, quantity: 1 }, // Red Dragon Archfiend

      // エクシーズモンスター
      { id: 10443957, quantity: 2 }, // Number 39: Utopia
      { id: 69610924, quantity: 1 }, // Number 11: Big Eye
    ],
  },
};
