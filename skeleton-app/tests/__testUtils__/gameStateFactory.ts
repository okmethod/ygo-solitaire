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

import type { GameSnapshot, GamePhase, CardSpace } from "$lib/domain/models/GameState";
import { INITIAL_LP } from "$lib/domain/models/GameState/GameSnapshot";
import type { CardInstance, CardData, FrameSubType } from "$lib/domain/models/Card";
import type { CounterState } from "$lib/domain/models/Card";
import { createInitialStateOnField } from "$lib/domain/models/Card/StateOnField";
import { Location } from "$lib/domain/models/Location";

// CardDataRegistry から実際のカード名を取得するためのインポート
import { getCardData } from "$lib/domain/registries/CardDataRegistry";

const EXODIA_PIECE_IDS = [
  33396948, // 本体
  7902349, // 左腕
  70903634, // 右腕
  44519536, // 左足
  8124921, // 右足
] as const;

/**
 * カードIDからCardDataを取得（存在しない場合はフォールバック）
 */
function getCardDataSafe(cardId: number): CardData | null {
  try {
    return getCardData(cardId);
  } catch {
    return null;
  }
}

/** @deprecated Use GameSnapshot instead */
export type GameState = GameSnapshot;

/**
 * Create a minimal game state for testing
 *
 * @param overrides - Partial GameSnapshot to override defaults
 * @returns GameSnapshot
 */
export function createMockGameState(overrides?: Partial<GameSnapshot>): GameSnapshot {
  const defaultState: GameSnapshot = {
    space: {
      mainDeck: [],
      extraDeck: [],
      hand: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    lp: {
      player: INITIAL_LP,
      opponent: INITIAL_LP,
    },
    phase: "main1",
    turn: 1,
    result: {
      isGameOver: false,
    },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    queuedEndPhaseEffectIds: [],
    activatedCardIds: new Set<number>(),
  };

  return {
    ...defaultState,
    ...overrides,
    space: {
      ...defaultState.space,
      ...overrides?.space,
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
 * @param location - Location for the cards
 * @param prefix - Prefix for instance IDs (default: location name)
 * @param type - Card type (default: "spell" for test compatibility)
 * @returns Array of CardInstance
 */
export function createCardInstances(
  cardIds: (string | number)[], // テストケースの可読性のため、テストのみ string も許容
  location: keyof CardSpace,
  prefix?: string,
  type: "monster" | "spell" | "trap" = "spell",
): CardInstance[] {
  const instancePrefix = prefix || location;
  return cardIds.map((cardId, index) => {
    const numericId = typeof cardId === "string" ? parseInt(cardId, 10) : cardId;
    const registeredCard = getCardDataSafe(numericId);
    const frameType: FrameSubType = registeredCard?.frameType ?? (type === "monster" ? "normal" : type);
    const spellType = registeredCard?.spellType;
    const baseInstance = {
      instanceId: `${instancePrefix}-${index}`,
      id: numericId,
      type: registeredCard?.type ?? type,
      frameType,
      spellType,
      jaName: registeredCard?.jaName ?? `Test Card ${numericId}`,
      location,
    };
    // フィールドロケーションの場合は stateOnField を設定
    if (Location.isField(location)) {
      return {
        ...baseInstance,
        stateOnField: createInitialStateOnField(),
      };
    }
    return baseInstance;
  });
}

/**
 * Create a field card instance for testing
 * フィールド上のカードインスタンスを作成するヘルパー関数
 *
 * @param options - カードインスタンスの設定
 * @returns CardInstance with stateOnField
 */
export function createFieldCardInstance(options: {
  instanceId: string;
  id: number;
  jaName: string;
  type: "monster" | "spell" | "trap";
  frameType: FrameSubType;
  location: "mainMonsterZone" | "spellTrapZone" | "fieldZone";
  position?: "faceUp" | "faceDown";
  battlePosition?: "attack" | "defense";
  placedThisTurn?: boolean;
  counters?: readonly CounterState[];
  spellType?: string;
}): CardInstance {
  return {
    instanceId: options.instanceId,
    id: options.id,
    jaName: options.jaName,
    type: options.type,
    frameType: options.frameType,
    location: options.location,
    spellType: options.spellType as CardInstance["spellType"],
    stateOnField: {
      position: options.position ?? "faceUp",
      battlePosition: options.battlePosition,
      placedThisTurn: options.placedThisTurn ?? false,
      counters: options.counters ?? [],
      activatedEffects: new Set(),
    },
  };
}

/**
 * Create a game state with Exodia deck (40 cards)
 *
 * @returns GameSnapshot with Exodia draw deck
 */
export function createExodiaDeckState(): GameSnapshot {
  const exodiaDeck = [
    ...EXODIA_PIECE_IDS, // 5 Exodia pieces
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
    space: {
      mainDeck: createCardInstances(exodiaDeck, "mainDeck"),
      extraDeck: [],
      hand: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    phase: "draw",
    turn: 1,
  });
}

/**
 * Create a game state with specific cards in hand
 *
 * @param cardIds - Array of card IDs to place in hand
 * @param phase - Current game phase
 * @returns GameSnapshot
 */
export function createStateWithHand(cardIds: string[], phase: GamePhase = "main1"): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill("12345678"), "mainDeck"),
      extraDeck: [],
      hand: createCardInstances(cardIds, "hand"),
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    phase,
  });
}

/**
 * Create a game state with all Exodia pieces in hand (victory state)
 *
 * @returns GameSnapshot with Exodia victory condition
 */
export function createExodiaVictoryState(): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(35).fill("12345678"), "mainDeck"),
      extraDeck: [],
      hand: createCardInstances([...EXODIA_PIECE_IDS], "hand"),
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    phase: "main1",
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
 * @returns GameSnapshot with no cards in deck
 */
export function createDeckOutState(): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: [],
      extraDeck: [],
      hand: createCardInstances(["12345678"], "hand"),
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: createCardInstances(Array(39).fill("12345678"), "graveyard"),
      banished: [],
    },
    phase: "draw",
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
 * @returns GameSnapshot with player at 0 LP
 */
export function createLPZeroState(): GameSnapshot {
  return createMockGameState({
    lp: {
      player: 0,
      opponent: INITIAL_LP,
    },
    phase: "main1",
    result: {
      isGameOver: true,
      winner: "opponent",
      reason: "lp0",
      message: "Your Life Points reached 0. You lose!",
    },
  });
}

/**
 * Create a game state with a spell card on field (spellTrapZone)
 *
 * @param spellCardId - Card ID of the spell to place
 * @returns GameSnapshot
 */
export function createStateWithSpellOnField(spellCardId: string): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(35).fill("12345678"), "mainDeck"),
      extraDeck: [],
      hand: [],
      mainMonsterZone: [],
      spellTrapZone: createCardInstances([spellCardId], "spellTrapZone"),
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    phase: "main1",
  });
}

/**
 * Create a game state with cards in graveyard
 *
 * @param cardIds - Array of card IDs to place in graveyard
 * @returns GameSnapshot
 */
export function createStateWithGraveyard(cardIds: string[]): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill("12345678"), "mainDeck"),
      extraDeck: [],
      hand: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: createCardInstances(cardIds, "graveyard"),
      banished: [],
    },
  });
}
