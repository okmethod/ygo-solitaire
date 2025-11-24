/**
 * GameStateAdapter - Bridge between old DuelState and new GameState
 *
 * Converts legacy DuelState class instances to immutable GameState objects.
 * This adapter enables gradual migration from class-based to functional architecture.
 *
 * @module presentation/adapters/GameStateAdapter
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { DuelState } from "$lib/classes/DuelState";
import type { Card } from "$lib/types/card";

/**
 * Convert legacy Card to CardInstance
 */
function convertCardToInstance(
  card: Card,
  location: "deck" | "hand" | "field" | "graveyard" | "banished",
): CardInstance {
  return {
    instanceId: card.instanceId || `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    cardId: String(card.id), // Convert number to string
    location,
    position: undefined,
  };
}

/**
 * GameStateAdapter class
 *
 * Usage:
 * ```typescript
 * const adapter = new GameStateAdapter();
 * const gameState = adapter.fromDuelState(duelState);
 * gameStateStore.set(gameState);
 * ```
 */
export class GameStateAdapter {
  /**
   * Convert DuelState to GameState
   *
   * @param duelState - Legacy DuelState instance
   * @returns Immutable GameState object
   */
  fromDuelState(duelState: DuelState): GameState {
    // Convert cards to instances
    const deck = duelState.mainDeck.map((card) => convertCardToInstance(card, "deck"));
    const hand = duelState.hands.map((card) => convertCardToInstance(card, "hand"));

    // Field cards (monsters + spell/trap + field spell)
    const fieldCards: CardInstance[] = [];

    // Monster zones
    duelState.field.monsterZones.forEach((card) => {
      if (card) {
        fieldCards.push(convertCardToInstance(card, "field"));
      }
    });

    // Spell/Trap zones
    duelState.field.spellTrapZones.forEach((card) => {
      if (card) {
        fieldCards.push(convertCardToInstance(card, "field"));
      }
    });

    // Field spell
    if (duelState.field.fieldSpell) {
      fieldCards.push(convertCardToInstance(duelState.field.fieldSpell, "field"));
    }

    const graveyard = duelState.graveyard.map((card) => convertCardToInstance(card, "graveyard"));
    const banished = duelState.banished.map((card) => convertCardToInstance(card, "banished"));

    // Map phase name
    const phaseMap: Record<string, "Draw" | "Standby" | "Main1" | "End"> = {
      ドローフェイズ: "Draw",
      スタンバイフェイズ: "Standby",
      メインフェイズ1: "Main1",
      メインフェイズ: "Main1",
      エンドフェイズ: "End",
    };
    const phase = phaseMap[duelState.currentPhase] || "Draw";

    // Map game result
    let isGameOver = false;
    let winner: "player" | "opponent" | undefined = undefined;
    let reason: "exodia" | "lp0" | "deckout" | undefined = undefined;
    let message: string | undefined = undefined;

    if (duelState.gameResult !== "ongoing") {
      isGameOver = true;
      winner = duelState.gameResult === "win" ? "player" : duelState.gameResult === "lose" ? "opponent" : undefined;

      if (duelState.playerLifePoints <= 0) {
        reason = "lp0";
        message = "LPが0になりました。";
      } else if (duelState.mainDeck.length === 0 && duelState.gameResult === "lose") {
        reason = "deckout";
        message = "デッキ切れです。";
      }
    }

    return {
      zones: {
        deck,
        hand,
        field: fieldCards,
        graveyard,
        banished,
      },
      lp: {
        player: duelState.playerLifePoints,
        opponent: duelState.opponentLifePoints,
      },
      phase,
      turn: duelState.currentTurn,
      chainStack: [],
      result: {
        isGameOver,
        winner,
        reason,
        message,
      },
    };
  }

  /**
   * Convert GameState to DuelState (partial - for display only)
   *
   * Note: This creates a minimal DuelState for display purposes.
   * Full DuelState functionality (like activateEffect) is not supported.
   *
   * @param gameState - GameState object
   * @returns Partial DuelState-like object for display
   */
  toDuelStateDisplay(gameState: GameState): Partial<DuelState> {
    // This is a simplified conversion for display only
    // We don't reconstruct full DuelState with all methods
    return {
      name: "Game State",
      mainDeck: [], // Not needed for display
      extraDeck: [],
      sideDeck: [],
      hands: [], // Converted from gameState.zones.hand
      field: {
        monsterZones: [null, null, null, null, null],
        spellTrapZones: [null, null, null, null, null],
        fieldSpell: null,
      },
      graveyard: [],
      banished: [],
      playerLifePoints: gameState.lp.player,
      opponentLifePoints: gameState.lp.opponent,
      currentTurn: gameState.turn,
      currentPhase: this.mapPhaseToJapanese(gameState.phase),
      gameResult: gameState.result.isGameOver
        ? gameState.result.winner === "player"
          ? "win"
          : gameState.result.winner === "opponent"
            ? "lose"
            : "draw"
        : "ongoing",
      createdAt: new Date(),
    };
  }

  /**
   * Map phase to Japanese name
   */
  private mapPhaseToJapanese(phase: "Draw" | "Standby" | "Main1" | "End"): string {
    const phaseMap: Record<"Draw" | "Standby" | "Main1" | "End", string> = {
      Draw: "ドローフェイズ",
      Standby: "スタンバイフェイズ",
      Main1: "メインフェイズ1",
      End: "エンドフェイズ",
    };
    return phaseMap[phase];
  }
}

/**
 * Singleton instance
 */
export const gameStateAdapter = new GameStateAdapter();
