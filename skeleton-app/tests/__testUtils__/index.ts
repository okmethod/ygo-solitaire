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
  createTrapOnField,
} from "./cardInstanceFactory";

// カードスペースファクトリ
export {
  createHand,
  createFilledHand,
  createGraveyard,
  createFilledGraveyard,
  createBanished,
  createFilledBanished,
  createMainDeck,
  createFilledMainDeck,
  createExtraDeck,
  createFilledExtraDeck,
  createMonsterZone,
  createFilledMonsterZone,
  createSpellTrapZone,
  createFilledSpellZone,
  createFieldZone,
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

// ゲームイベントファクトリ
export { createGameEvent } from "./gameEventFactory";

// コンテキストファクトリ
export { createStepBuildContext } from "./contextFactory";

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
