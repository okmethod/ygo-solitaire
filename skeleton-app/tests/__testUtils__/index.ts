/**
 * テストユーティリティ 再エクスポート
 *
 * 後方互換性のため、すべてのユーティリティをこのファイルから再エクスポート
 */

// 定数
export { EXODIA_PIECE_IDS, TEST_CARD_IDS, TOKEN_TEST_CARD_IDS, SYNCHRO_TEST_CARD_IDS } from "./constants";

// カードインスタンスファクトリ
export {
  createTestMonsterCard,
  createHandMonster,
  createMonstersOnField,
  createSpellsOnField,
  createTestSpellCard,
  createTestTrapCard,
  createFieldCardInstance,
  createSetCard,
  createCardInstances,
} from "./cardInstanceFactory";

// ゲーム状態ファクトリ
export {
  createMockGameState,
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
