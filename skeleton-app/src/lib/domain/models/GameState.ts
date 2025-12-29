/**
 * GameState - Immutable game state representation
 *
 * This is the central state object for the Yu-Gi-Oh! solitaire game.
 * All game operations return a new GameState instance (immutability via Immer.js).
 *
 * @module domain/models/GameState
 */

import type { Zones } from "./Zone";
import type { GamePhase } from "./constants";
import { getCardData } from "../registries/CardDataRegistry";

/**
 * Life Points for both players
 */
export interface LifePoints {
  readonly player: number;
  readonly opponent: number;
}

/**
 * Chain block in the chain stack
 * Represents a spell/trap activation waiting to resolve
 */
export interface ChainBlock {
  readonly cardInstanceId: string;
  readonly effectDescription: string;
}

/**
 * Game result state
 */
export interface GameResult {
  readonly isGameOver: boolean;
  readonly winner?: "player" | "opponent" | "draw";
  readonly reason?: "exodia" | "lp0" | "deckout" | "surrender";
  readonly message?: string;
}

/**
 * Main game state interface
 * All fields are readonly to enforce immutability at type level
 */
export interface GameState {
  readonly zones: Zones;
  readonly lp: LifePoints;
  readonly phase: GamePhase;
  readonly turn: number;
  readonly chainStack: readonly ChainBlock[];
  readonly result: GameResult;
  /**
   * 今ターン発動済みの起動効果（1ターンに1度制限用）
   * Format: `${cardInstanceId}:${effectId}`
   */
  readonly activatedIgnitionEffectsThisTurn: ReadonlySet<string>;
}

/**
 * Create initial game state
 *
 * @param deckCardIds - Array of numeric card IDs for the main deck
 * @returns Initial GameState
 */
export function createInitialGameState(deckCardIds: number[]): GameState {
  return {
    zones: {
      deck: deckCardIds.map((cardId, index) => {
        const cardData = getCardData(cardId);
        return {
          ...cardData,
          instanceId: `deck-${index}`,
          location: "deck" as const,
        };
      }),
      hand: [],
      field: [],
      graveyard: [],
      banished: [],
    },
    lp: {
      player: 8000,
      opponent: 8000,
    },
    phase: "Draw",
    turn: 1,
    chainStack: [],
    result: {
      isGameOver: false,
    },
    activatedIgnitionEffectsThisTurn: new Set<string>(),
  };
}

/**
 * Helper to get card instance by ID
 *
 * @param state - Current game state
 * @param instanceId - Card instance ID to find
 * @returns Card instance or undefined if not found
 */
export function findCardInstance(state: GameState, instanceId: string) {
  const allZones = [
    ...state.zones.deck,
    ...state.zones.hand,
    ...state.zones.field,
    ...state.zones.graveyard,
    ...state.zones.banished,
  ];

  return allZones.find((card) => card.instanceId === instanceId);
}
