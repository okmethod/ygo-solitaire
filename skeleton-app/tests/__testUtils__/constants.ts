/**
 * テスト用カードID定数
 *
 * セットアップ時に CardDataRegistry へ登録されるテストカード群
 */

/** エクゾディアパーツのカードID */
export const EXODIA_PIECE_IDS = {
  MAIN: 33396948, // 封印されしエクゾディア（本体）
  LEFT_ARM: 7902349, // 封印されし者の左腕
  RIGHT_ARM: 70903634, // 封印されし者の右腕
  LEFT_LEG: 44519536, // 封印されし者の左足
  RIGHT_LEG: 8124921, // 封印されし者の右足
  /** 全パーツのID配列 */
  ALL: [33396948, 7902349, 70903634, 44519536, 8124921] as readonly number[],
} as const;

/** テスト用カードID定数（基本） */
export const TEST_CARD_IDS = {
  DUMMY: 12345678,
  EFFECT_MONSTER: 7001,
  SPELL_NORMAL: 1001,
  SPELL_EQUIP: 1002,
  SPELL_QUICK: 1004,
  SPELL_CONTINUOUS: 1005,
  SPELL_FIELD: 1006,
  TRAP_NORMAL: 1007,
} as const;

/** トークンテスト用カードID定数 */
export const TOKEN_TEST_CARD_IDS = {
  BASIC_TOKEN: 5001,
} as const;

/** 任意誘発効果テスト用カードID定数 */
export const OPTIONAL_TRIGGER_TEST_CARD_IDS = {
  OPTIONAL_TRIGGER_MONSTER: 6001,
} as const;

/** シンクロ召喚テスト用カードID定数 */
export const SYNCHRO_TEST_CARD_IDS = {
  // チューナーモンスター
  TUNER_LV1: 2001,
  TUNER_LV2: 2002,
  TUNER_LV3: 2003,
  // 非チューナーモンスター
  NON_TUNER_LV1: 3001,
  NON_TUNER_LV2: 3002,
  NON_TUNER_LV3: 3003,
  NON_TUNER_LV4: 3004,
  // シンクロモンスター
  SYNCHRO_LV5: 4005,
  SYNCHRO_LV6: 4006,
  SYNCHRO_LV7: 4007,
  SYNCHRO_LV8: 4008,
} as const;
