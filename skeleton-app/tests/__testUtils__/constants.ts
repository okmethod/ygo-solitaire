/**
 * テスト用カードID定数
 *
 * セットアップ時に CardDataRegistry へ登録されるテストカード群
 */

/** テストシナリオで使用する実カードのID定数 */
export const ACTUAL_CARD_IDS = {
  EXODIA_BODY: 33396948, // 封印されしエクゾディア
  EXODIA_LEFT_ARM: 7902349, // 封印されし者の左腕
  EXODIA_RIGHT_ARM: 70903634, // 封印されし者の右腕
  EXODIA_LEFT_LEG: 44519536, // 封印されし者の左足
  EXODIA_RIGHT_LEG: 8124921, // 封印されし者の右足
  ROYAL_MAGIC_LIBRARY: 70791313, // 王立魔法図書館
  TG_HYPER_LIBRARIAN: 90953320, // ＴＧ ハイパー・ライブラリアン
  FORMULA_SYNCHRON: 50091196, // フォーミュラ・シンクロン
  GOLDEN_GOBLIN: 70368879, // 成金ゴブリン
  POT_OF_GREED: 55144522, // 強欲な壺
  GRACEFUL_CHARITY: 79571449, // 天使の施し
  TERRAFORMING: 73628505, // テラ・フォーミング
  CHICKEN_GAME: 67616300, // チキンレース
  JAR_OF_GREED: 83968380, // 強欲な瓶（DSL未登録）
  METAL_FIEND_TOKEN: 24874631, // メタルデビル・トークン
} as const;

/** テスト用カードID定数
 * 1xxx: メインデッキに入るモンスターカード
 * 2xxx: エクストラデッキに入るモンスターカード
 * 3xxx: モンスタートークン
 * 4xxx: 魔法カード
 * 5xxx: 罠カード
 */
export const DUMMY_CARD_IDS = {
  NORMAL_MONSTER: 1001,
  EFFECT_MONSTER: 1002,
  OPTIONAL_TRIGGER_MONSTER: 1003,
  SYNCHRO_MONSTER: 2001,
  BASIC_TOKEN: 3001,
  NORMAL_SPELL: 4001,
  EQUIP_SPELL: 4002,
  QUICKPLAY_SPELL: 4003,
  CONTINUOUS_SPELL: 4004,
  FIELD_SPELL: 4005,
  NORMAL_TRAP: 5001,
  NOT_EXISTING_CARD: 99999999, // 存在しないカードID
} as const;
