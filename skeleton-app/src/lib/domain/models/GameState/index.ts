/**
 * GameState モデル
 *
 * これらはプレーンなオブジェクトとして実装し、クラス化しない。
 * （理由: 不変性担保 / Svelte 5 Runes での変更追跡性 / シリアライズ可能）
 *
 * 代わりに名前空間としてエクスポートし、純粋関数をクラスライクに利用できるようにする。
 *
 * @module domain/models/GameState
 * @see {@link docs/domain/overview.md}
 */

export type { GameSnapshot, InitialDeckCardIds } from "./GameSnapshot";
export type { Player } from "./Player";
export type { GamePhase } from "./Phase";
export type { GameResult } from "./GameResult";
export type { CardSpace } from "./CardSpace";

import * as GameSnapshotFuncs from "./GameSnapshot";
import * as GameStateConsistencyFuncs from "./GameStateConsistency";
import * as GameStateVictoryFuncs from "./VictoryCondition";
import * as PhaseFuncs from "./Phase";
import * as CardSpaceFuncs from "./CardSpace";

/* GameState 名前空間
 *
 * ゲーム状態に関する純粋関数（ロジック）を階層的に集約する。
 */
export const GameState = {
  initialize: GameSnapshotFuncs.createInitialGameSnapshot,
  assert: GameStateConsistencyFuncs.assertValidGameState,
  checkVictory: GameStateVictoryFuncs.checkedVictoryState,

  Phase: {
    displayName: PhaseFuncs.getPhaseDisplayName,
    next: PhaseFuncs.getNextPhase,
    isMain: PhaseFuncs.isMainPhase,
    isEnd: PhaseFuncs.isEndPhase,
    changeable: PhaseFuncs.validatePhaseTransition,
  },

  Space: {
    countHandExcludingSelf: CardSpaceFuncs.countHandExcludingSelf,
    isMainDeckEmpty: CardSpaceFuncs.isMainDeckEmpty,
    isMainMonsterZoneFull: CardSpaceFuncs.isMainMonsterZoneFull,
    isSpellTrapZoneFull: CardSpaceFuncs.isSpellTrapZoneFull,
    isFieldZoneFull: CardSpaceFuncs.isFieldZoneFull,
    findCard: CardSpaceFuncs.findCardInstance,
    moveCard: CardSpaceFuncs.moveCardInstance,
    updateCardStateInPlace: CardSpaceFuncs.updateCardStateInPlace,
    drawCards: CardSpaceFuncs.drawCards,
    shuffleMainDeck: CardSpaceFuncs.shuffleMainDeck,
  },
};
