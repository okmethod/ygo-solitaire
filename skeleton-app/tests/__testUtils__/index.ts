/**
 * テストユーティリティ 再エクスポート
 *
 * 後方互換性のため、すべてのユーティリティをこのファイルから再エクスポート
 */

// 定数
export { ACTUAL_CARD_IDS, DUMMY_CARD_IDS } from "./constants";

// カードインスタンスファクトリ
export {
  // 手札向け
  createMonsterInstance,
  createSpellInstance,
  createTrapInstance,
  // フィールド向け
  createMonsterOnField,
  createSpellOnField,
} from "./cardInstanceFactory";

// カードスペースファクトリ
export {
  createHand,
  createGraveyard,
  createFilledMainDeck,
  createFilledExtraDeck,
  createFilledMonsterZone,
  createFilledSpellZone,
  createFilledFieldZone,
} from "./cardSpaceFactory";

// ゲーム状態ファクトリ
export {
  createTestInitialDeck,
  createMockGameState,
  createStateWithMonsterZone,
  createStateWithFieldZone,
  createExodiaVictoryState,
  createSynchroSummonReadyState,
} from "./gameStateFactory";

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
  hasChainConfirmation,
  resolveChainConfirmation,
} from "./integrationHelpers";
