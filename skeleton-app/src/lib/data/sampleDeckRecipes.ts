import type { Card } from "$lib/types/card";
import type { DeckRecipeData } from "$lib/types/recipe";

// サンプルカードデータ
export const sampleCards: Card[] = [
  // モンスターカード
  {
    id: "card-001",
    name: "青眼の白龍",
    type: "monster",
    attack: 3000,
    defense: 2500,
    level: 8,
    attribute: "光",
    race: "ドラゴン族",
    rarity: "ultra_rare",
    description: "高い攻撃力を誇る伝説のドラゴン。その雄叫びと破壊光線は全てを無に帰す。",
    restriction: "unlimited",
  },
  {
    id: "card-002",
    name: "真紅眼の黒竜",
    type: "monster",
    attack: 2400,
    defense: 2000,
    level: 7,
    attribute: "闇",
    race: "ドラゴン族",
    rarity: "ultra_rare",
    description: "真紅の眼を持つ黒いドラゴン。燃え盛る黒い炎で敵を焼き尽くす。",
    restriction: "unlimited",
  },
  {
    id: "card-003",
    name: "ブラック・マジシャン",
    type: "monster",
    attack: 2500,
    defense: 2100,
    level: 7,
    attribute: "闇",
    race: "魔法使い族",
    rarity: "ultra_rare",
    description: "魔法使いとしては攻撃力・守備力ともに最高クラス。",
    restriction: "unlimited",
  },
  {
    id: "card-004",
    name: "エルフの剣士",
    type: "monster",
    attack: 1400,
    defense: 1200,
    level: 4,
    attribute: "光",
    race: "戦士族",
    rarity: "common",
    description: "剣の達人であるエルフの戦士。素早い剣技で敵を翻弄する。",
    restriction: "unlimited",
  },
  {
    id: "card-005",
    name: "グレムリン",
    type: "monster",
    attack: 300,
    defense: 200,
    level: 1,
    attribute: "闇",
    race: "悪魔族",
    rarity: "common",
    description: "いたずら好きな小悪魔。機械を壊すのが得意。",
    restriction: "unlimited",
  },

  // 魔法カード
  {
    id: "card-006",
    name: "死者蘇生",
    type: "spell",
    rarity: "super_rare",
    description: "自分または相手の墓地からモンスター1体を選択し、自分フィールド上に攻撃表示で特殊召喚する。",
    restriction: "limited",
  },
  {
    id: "card-007",
    name: "ブラック・ホール",
    type: "spell",
    rarity: "rare",
    description: "フィールド上に存在するモンスターを全て破壊する。",
    restriction: "limited",
  },
  {
    id: "card-008",
    name: "強欲な壺",
    type: "spell",
    rarity: "rare",
    description: "自分のデッキからカードを2枚ドローする。",
    restriction: "forbidden",
  },
  {
    id: "card-009",
    name: "サンダー・ボルト",
    type: "spell",
    rarity: "common",
    description: "相手フィールド上に存在するモンスターを全て破壊する。",
    restriction: "limited",
  },
  {
    id: "card-010",
    name: "光の護封剣",
    type: "spell",
    rarity: "common",
    description: "相手モンスターを3ターンの間攻撃表示にできず、表示形式を変更できない。",
    restriction: "unlimited",
  },

  // 罠カード
  {
    id: "card-011",
    name: "聖なるバリア -ミラーフォース-",
    type: "trap",
    rarity: "super_rare",
    description: "相手モンスターの攻撃宣言時に発動できる。攻撃表示モンスターを全て破壊する。",
    restriction: "unlimited",
  },
  {
    id: "card-012",
    name: "激流葬",
    type: "trap",
    rarity: "rare",
    description: "モンスターが召喚・反転召喚・特殊召喚された時に発動できる。フィールド上のモンスターを全て破壊する。",
    restriction: "limited",
  },
  {
    id: "card-013",
    name: "落とし穴",
    type: "trap",
    rarity: "common",
    description: "相手モンスターの召喚・反転召喚・特殊召喚時に発動できる。そのモンスター1体を破壊する。",
    restriction: "unlimited",
  },
  {
    id: "card-014",
    name: "魔法の筒",
    type: "trap",
    rarity: "rare",
    description:
      "相手モンスターの攻撃宣言時に発動できる。その攻撃を無効にし、攻撃モンスターの攻撃力分のダメージを相手に与える。",
    restriction: "unlimited",
  },
  {
    id: "card-015",
    name: "リビングデッドの呼び声",
    type: "trap",
    rarity: "common",
    description: "自分の墓地からモンスター1体を選択して攻撃表示で特殊召喚する。",
    restriction: "unlimited",
  },
];

// サンプルデッキレシピ（静的データ）
export const sampleDeckRecipes: DeckRecipeData[] = [
  {
    name: "初心者向けデッキ",
    description: "遊戯王を始めたばかりの人におすすめの基本的なデッキです",
    category: "初心者",
    mainDeck: [
      // モンスター (20枚)
      ...Array(3).fill(sampleCards[3]), // エルフの剣士 x3
      ...Array(3).fill(sampleCards[4]), // グレムリン x3
      ...Array(2).fill(sampleCards[0]), // 青眼の白龍 x2
      ...Array(2).fill(sampleCards[1]), // 真紅眼の黒竜 x2
      ...Array(2).fill(sampleCards[2]), // ブラック・マジシャン x2
      ...Array(8).fill({
        id: "card-filler-1",
        name: "フィラーモンスター",
        type: "monster" as const,
        attack: 1200,
        defense: 800,
        level: 3,
        attribute: "地",
        race: "獣族",
        restriction: "unlimited" as const,
      }),

      // 魔法 (12枚)
      sampleCards[5], // 死者蘇生 x1
      sampleCards[6], // ブラック・ホール x1
      sampleCards[8], // サンダー・ボルト x1
      ...Array(3).fill(sampleCards[9]), // 光の護封剣 x3
      ...Array(6).fill({
        id: "card-filler-2",
        name: "フィラー魔法",
        type: "spell" as const,
        description: "サンプル魔法カード",
        restriction: "unlimited" as const,
      }),

      // 罠 (8枚)
      ...Array(2).fill(sampleCards[10]), // ミラーフォース x2
      sampleCards[11], // 激流葬 x1
      ...Array(2).fill(sampleCards[12]), // 落とし穴 x2
      sampleCards[13], // 魔法の筒 x1
      ...Array(2).fill(sampleCards[14]), // リビングデッドの呼び声 x2
    ],
    extraDeck: [],
  },

  {
    name: "ドラゴンデッキ",
    description: "ドラゴン族を中心とした攻撃的なデッキです",
    category: "ビートダウン",
    mainDeck: [
      // ドラゴン族モンスター中心
      ...Array(3).fill(sampleCards[0]), // 青眼の白龍 x3
      ...Array(3).fill(sampleCards[1]), // 真紅眼の黒竜 x3
      ...Array(14).fill({
        id: "card-dragon-1",
        name: "ドラゴンの子",
        type: "monster" as const,
        attack: 1000,
        defense: 600,
        level: 3,
        attribute: "風",
        race: "ドラゴン族",
        restriction: "unlimited" as const,
      }),

      // サポート魔法
      sampleCards[5], // 死者蘇生
      sampleCards[6], // ブラック・ホール
      ...Array(12).fill({
        id: "card-dragon-support",
        name: "ドラゴンサポート",
        type: "spell" as const,
        description: "ドラゴン族をサポートする魔法",
        restriction: "unlimited" as const,
      }),

      // 防御罠
      ...Array(6).fill(sampleCards[10]), // ミラーフォース等
    ],
    extraDeck: [],
  },

  {
    name: "コントロールデッキ",
    description: "魔法・罠で場をコントロールする上級者向けデッキです",
    category: "コントロール",
    mainDeck: [
      // 少数精鋭モンスター
      ...Array(2).fill(sampleCards[2]), // ブラック・マジシャン x2
      ...Array(8).fill({
        id: "card-control-monster",
        name: "コントロールモンスター",
        type: "monster" as const,
        attack: 1800,
        defense: 1600,
        level: 4,
        attribute: "光",
        race: "魔法使い族",
        restriction: "unlimited" as const,
      }),

      // 大量の魔法
      ...Array(15).fill({
        id: "card-control-spell",
        name: "コントロール魔法",
        type: "spell" as const,
        description: "場をコントロールする魔法",
        restriction: "unlimited" as const,
      }),

      // 大量の罠
      ...Array(15).fill({
        id: "card-control-trap",
        name: "コントロール罠",
        type: "trap" as const,
        description: "相手を妨害する罠",
        restriction: "unlimited" as const,
      }),
    ],
    extraDeck: [],
  },
];
