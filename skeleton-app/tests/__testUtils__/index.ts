/**
 * テストユーティリティ 再エクスポート
 *
 * 後方互換性のため、すべてのユーティリティをこのファイルから再エクスポート
 */

// 定数
export { EXODIA_PIECE_IDS, TEST_CARD_IDS, TOKEN_TEST_CARD_IDS, SYNCHRO_TEST_CARD_IDS } from "./constants";

// カードインスタンスファクトリ
export {
  // 手札向け
  createMonsterInstance,
  createSpellInstance,
  createTrapInstance,
  // フィールド向け
  createMonsterOnField,
  createMonstersOnField,
  createSpellOnField,
  createSpellsOnField,
  createSetCard,
  // 汎用
  createCardInstances,
} from "./cardInstanceFactory";

// ゲーム状態ファクトリ
export {
  createTestInitialDeck,
  createMockGameState,
  createStateWithMonsterZone,
  createStateWithFieldZone,
  createExodiaDeckState,
  createStateWithHand,
  createStateWithSpellOnField,
  createStateWithGraveyard,
  createExodiaVictoryState,
  createLPZeroState,
  createDeckOutState,
} from "./gameStateFactory";

// シンクロ召喚テストヘルパー
export {
  createTestTunerCard,
  createTestSynchroMonster,
  createSynchroSummonReadyState,
  createSynchroSummonNoTunerState,
  createSynchroSummonLevelMismatchState,
} from "./synchroTestHelpers";

// インテグレーションテスト共通ヘルパー
export {
  createScenarioDeck,
  createFacade,
  advanceToMain1,
  flushEffectQueue,
  resolveCardSelection,
  getState,
  hasCardSelection,
  hasOptionalTrigger,
  resolveOptionalTrigger,
} from "./integrationHelpers";
