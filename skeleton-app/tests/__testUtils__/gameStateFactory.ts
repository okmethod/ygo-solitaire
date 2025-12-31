/**
 * Game State Factory - Test utility for creating game states
 *
 * Provides factory functions to create common test scenarios:
 * - Initial state with Exodia deck
 * - State with cards in hand
 * - State with Exodia pieces in hand (victory condition)
 * - Custom states for edge cases
 *
 * @module __testUtils__/gameStateFactory
 */

import type { GameState } from "$lib/domain/models/GameState";
import { INITIAL_LP } from "$lib/domain/models/GameState";
import type { CardInstance, FrameSubType } from "$lib/domain/models/Card";
import type { GamePhase } from "$lib/domain/models/Phase";
import { ExodiaNonEffect } from "$lib/domain/effects/rules/monster/ExodiaNonEffect";

/**
 * Create a minimal game state for testing
 *
 * @param overrides - Partial GameState to override defaults
 * @returns GameState
 */
export function createMockGameState(overrides?: Partial<GameState>): GameState {
  const defaultState: GameState = {
    zones: {
      deck: [],
      hand: [],
      field: [],
      graveyard: [],
      banished: [],
    },
    lp: {
      player: INITIAL_LP,
      opponent: INITIAL_LP,
    },
    phase: "Main1",
    turn: 1,
    chainStack: [],
    result: {
      isGameOver: false,
    },
    activatedIgnitionEffectsThisTurn: new Set<string>(),
  };

  return {
    ...defaultState,
    ...overrides,
    zones: {
      ...defaultState.zones,
      ...overrides?.zones,
    },
    lp: {
      ...defaultState.lp,
      ...overrides?.lp,
    },
    result: {
      ...defaultState.result,
      ...overrides?.result,
    },
  };
}

/**
 * Create card instances from card IDs
 *
 * @param cardIds - Array of card IDs (string or number)
 * @param location - Zone location for the cards
 * @param prefix - Prefix for instance IDs (default: location name)
 * @param type - Card type (default: "spell" for test compatibility)
 * @returns Array of CardInstance
 */
export function createCardInstances(
  cardIds: (string | number)[], // テストケースの可読性のため、テストのみ string も許容
  location: "deck" | "hand" | "field" | "graveyard" | "banished",
  prefix?: string,
  type: "monster" | "spell" | "trap" = "spell",
): CardInstance[] {
  const instancePrefix = prefix || location;
  return cardIds.map((cardId, index) => {
    const numericId = typeof cardId === "string" ? parseInt(cardId, 10) : cardId;
    const frameType: FrameSubType = type === "monster" ? "normal" : type;
    return {
      instanceId: `${instancePrefix}-${index}`,
      id: numericId, // CardInstance extends CardData
      type,
      frameType,
      location,
    };
  });
}

/**
 * Create a game state with Exodia deck (40 cards)
 *
 * @returns GameState with Exodia draw deck
 */
export function createExodiaDeckState(): GameState {
  const exodiaDeck = [
    ...ExodiaNonEffect.getExodiaPieceIds(), // 5 Exodia pieces
    "19613556", // Pot of Greed (x3)
    "19613556",
    "19613556",
    "79571449", // Graceful Charity (x3)
    "79571449",
    "79571449",
    "32807846", // Reinforcement of the Army (x3)
    "32807846",
    "32807846",
    "73915051", // Swords of Revealing Light (x3)
    "73915051",
    "73915051",
    "45986603", // Backup Soldier (x3)
    "45986603",
    "45986603",
    // Fill remaining slots with dummy cards to reach 40
    ...Array(40 - 5 - 15).fill("12345678"),
  ];

  return createMockGameState({
    zones: {
      deck: createCardInstances(exodiaDeck, "deck"),
      hand: [],
      field: [],
      graveyard: [],
      banished: [],
    },
    phase: "Draw",
    turn: 1,
  });
}

/**
 * Create a game state with specific cards in hand
 *
 * @param cardIds - Array of card IDs to place in hand
 * @param phase - Current game phase
 * @returns GameState
 */
export function createStateWithHand(cardIds: string[], phase: GamePhase = "Main1"): GameState {
  return createMockGameState({
    zones: {
      deck: createCardInstances(Array(30).fill("12345678"), "deck"),
      hand: createCardInstances(cardIds, "hand"),
      field: [],
      graveyard: [],
      banished: [],
    },
    phase,
  });
}

/**
 * Create a game state with all Exodia pieces in hand (victory state)
 *
 * @returns GameState with Exodia victory condition
 */
export function createExodiaVictoryState(): GameState {
  return createMockGameState({
    zones: {
      deck: createCardInstances(Array(35).fill("12345678"), "deck"),
      hand: createCardInstances([...ExodiaNonEffect.getExodiaPieceIds()], "hand"),
      field: [],
      graveyard: [],
      banished: [],
    },
    phase: "Main1",
    result: {
      isGameOver: true,
      winner: "player",
      reason: "exodia",
      message: "All 5 Exodia pieces are in your hand. You win!",
    },
  });
}

/**
 * Create a game state with empty deck (deck out scenario)
 *
 * @returns GameState with no cards in deck
 */
export function createDeckOutState(): GameState {
  return createMockGameState({
    zones: {
      deck: [],
      hand: createCardInstances(["12345678"], "hand"),
      field: [],
      graveyard: createCardInstances(Array(39).fill("12345678"), "graveyard"),
      banished: [],
    },
    phase: "Draw",
    result: {
      isGameOver: true,
      winner: "opponent",
      reason: "deckout",
      message: "You cannot draw from an empty deck. You lose!",
    },
  });
}

/**
 * Create a game state with 0 LP (loss scenario)
 *
 * @returns GameState with player at 0 LP
 */
export function createLPZeroState(): GameState {
  return createMockGameState({
    lp: {
      player: 0,
      opponent: INITIAL_LP,
    },
    phase: "Main1",
    result: {
      isGameOver: true,
      winner: "opponent",
      reason: "lp0",
      message: "Your Life Points reached 0. You lose!",
    },
  });
}

/**
 * Create a game state with a spell card on field
 *
 * @param spellCardId - Card ID of the spell to place
 * @returns GameState
 */
export function createStateWithSpellOnField(spellCardId: string): GameState {
  return createMockGameState({
    zones: {
      deck: createCardInstances(Array(35).fill("12345678"), "deck"),
      hand: [],
      field: createCardInstances([spellCardId], "field"),
      graveyard: [],
      banished: [],
    },
    phase: "Main1",
  });
}

/**
 * Create a game state with cards in graveyard
 *
 * @param cardIds - Array of card IDs to place in graveyard
 * @returns GameState
 */
export function createStateWithGraveyard(cardIds: string[]): GameState {
  return createMockGameState({
    zones: {
      deck: createCardInstances(Array(30).fill("12345678"), "deck"),
      hand: [],
      field: [],
      graveyard: createCardInstances(cardIds, "graveyard"),
      banished: [],
    },
  });
}
