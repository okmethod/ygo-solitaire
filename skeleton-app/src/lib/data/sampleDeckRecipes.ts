import type { DeckRecipe } from "$lib/types/deck";

// 実際の遊戯王カードIDを使用したサンプルデッキレシピ
export const sampleDeckRecipes: Record<string, DeckRecipe> = {
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

  "spellcaster-deck": {
    name: "魔法使い族デッキ",
    description: "魔法使い族を中心とした魔法重視のデッキです",
    category: "魔法使い族",
    mainDeck: [
      // モンスターカード
      { id: 46986414, quantity: 3 }, // ブラック・マジシャン (Dark Magician)
      { id: 38033121, quantity: 3 }, // ブラック・マジシャン・ガール (Dark Magician Girl)
      { id: 71413901, quantity: 2 }, // Skilled Dark Magician
      { id: 90311614, quantity: 2 }, // Old Vindictive Magician
      { id: 36021814, quantity: 2 }, // 時の魔導士 (Breaker the Magical Warrior)
      { id: 97023549, quantity: 2 }, // Defender, the Magical Knight
      { id: 46718686, quantity: 2 }, // Magician of Faith

      // 魔法カード
      { id: 83764718, quantity: 1 }, // モンスター・リボーン (Monster Reborn)
      { id: 53129443, quantity: 1 }, // ブラック・ホール (Dark Hole)
      { id: 72892473, quantity: 3 }, // サイクロン (Mystical Space Typhoon)
      { id: 81439173, quantity: 2 }, // フューチャー・フュージョン (Future Fusion)
      { id: 1845204, quantity: 2 }, // Instant Fusion
      { id: 46448938, quantity: 2 }, // スペルブック (Spellbook of Secrets)

      // 罠カード
      { id: 44095762, quantity: 1 }, // ミラーフォース (Mirror Force)
      { id: 53582587, quantity: 1 }, // 激流葬 (Torrential Tribute)
      { id: 97077563, quantity: 2 }, // Call of the Haunted
      { id: 32807846, quantity: 2 }, // Enchanted Javelin
    ],
    extraDeck: [
      // 融合モンスター
      { id: 46986414, quantity: 2 }, // Dark Paladin
      { id: 74069014, quantity: 1 }, // The Dark Magicians

      // シンクロモンスター
      { id: 11502550, quantity: 2 }, // Tempest Magician
      { id: 44508094, quantity: 1 }, // Stardust Dragon

      // エクシーズモンスター
      { id: 10443957, quantity: 2 }, // Number 39: Utopia
      { id: 90809975, quantity: 1 }, // Gagaga Cowboy
    ],
  },

  "warrior-deck": {
    name: "戦士族デッキ",
    description: "戦士族モンスターによる攻撃的なデッキです",
    category: "戦士族",
    mainDeck: [
      // モンスターカード
      { id: 55144522, quantity: 3 }, // エレメンタルヒーロー スパークマン
      { id: 20721928, quantity: 3 }, // エレメンタルヒーロー クレイマン
      { id: 79979666, quantity: 2 }, // エレメンタルヒーロー バーストレディ
      { id: 21844576, quantity: 2 }, // Elemental HERO Avian
      { id: 84327329, quantity: 2 }, // Elemental HERO Burstinatrix
      { id: 40044918, quantity: 3 }, // エルフの剣士 (Elf Swordsman)
      { id: 90876561, quantity: 2 }, // Command Knight

      // 魔法カード
      { id: 83764718, quantity: 1 }, // モンスター・リボーン (Monster Reborn)
      { id: 53129443, quantity: 1 }, // ブラック・ホール (Dark Hole)
      { id: 1845204, quantity: 2 }, // Instant Fusion
      { id: 24094653, quantity: 2 }, // Polymerization
      { id: 72892473, quantity: 2 }, // サイクロン (Mystical Space Typhoon)

      // 罠カード
      { id: 44095762, quantity: 1 }, // ミラーフォース (Mirror Force)
      { id: 4206964, quantity: 2 }, // 落とし穴 (Trap Hole)
      { id: 53582587, quantity: 1 }, // 激流葬 (Torrential Tribute)
      { id: 62279055, quantity: 1 }, // 魔法の筒 (Magic Cylinder)
    ],
    extraDeck: [
      // 融合モンスター
      { id: 35809262, quantity: 2 }, // Elemental HERO Flame Wingman
      { id: 58932615, quantity: 1 }, // Elemental HERO Thunder Giant
      { id: 21143940, quantity: 1 }, // Elemental HERO Sparkman

      // シンクロモンスター
      { id: 44508094, quantity: 2 }, // Stardust Dragon
      { id: 70902743, quantity: 1 }, // Red Dragon Archfiend
      { id: 33396948, quantity: 1 }, // Exodius the Ultimate Forbidden Lord

      // エクシーズモンスター
      { id: 10443957, quantity: 2 }, // Number 39: Utopia
      { id: 56832966, quantity: 1 }, // Number 17: Leviathan Dragon
      { id: 69610924, quantity: 1 }, // Number 11: Big Eye
    ],
  },
};
