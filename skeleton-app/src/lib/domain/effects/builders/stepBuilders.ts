/**
 * stepBuilders - Helper functions for creating EffectResolutionStep objects
 *
 * Provides reusable builder functions for common card effect operations.
 * Eliminates code duplication across card implementations by providing
 * standardized step creation for:
 * - Drawing cards (createDrawStep)
 * - Sending cards to graveyard (createSendToGraveyardStep)
 * - Card selection (createCardSelectionStep)
 * - Life point changes (createGainLifeStep, createDamageStep)
 * - Deck manipulation (createShuffleStep, createReturnToDeckStep)
 *
 * All functions return EffectResolutionStep objects that can be used
 * in createResolutionSteps() methods of ChainableAction implementations.
 *
 * @module domain/effects/builders/stepBuilders
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { EffectResolutionStep, CardSelectionConfig } from "../../models/EffectResolutionStep";
import type { GameState } from "../../models/GameState";
import type { GameStateUpdateResult } from "../../models/GameStateUpdateResult";
import type { CardInstance } from "../../models/Card";
import { drawCards, sendToGraveyard, moveCard, shuffleDeck } from "../../models/Zone";
import { checkVictoryConditions } from "../../rules/VictoryRule";
import { getCardData } from "../../registries/CardDataRegistry";

/**
 * Creates an EffectResolutionStep for drawing cards from the deck
 *
 * Handles:
 * - Deck size validation
 * - Drawing N cards from deck to hand
 * - Victory condition check after drawing
 *
 * @param count - Number of cards to draw
 * @param options - Optional customization for id, summary, description
 * @returns EffectResolutionStep for drawing cards
 *
 * @example
 * ```typescript
 * // Pot of Greed: Draw 2 cards
 * createDrawStep(2)
 *
 * // With custom description
 * createDrawStep(1, { description: "デッキから1枚ドローし、相手は1000LP獲得" })
 * ```
 */
export function createDrawStep(
  count: number,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  return {
    id: options?.id ?? `draw-${count}`,
    summary: options?.summary ?? "カードをドロー",
    description: options?.description ?? `デッキから${count}枚ドローします`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      // Validate deck has enough cards
      if (currentState.zones.deck.length < count) {
        return {
          success: false,
          newState: currentState,
          error: `Cannot draw ${count} cards. Not enough cards in deck.`,
        };
      }

      // Draw cards (returns new immutable zones object)
      const newZones = drawCards(currentState.zones, count);

      // Create new state with drawn cards
      const newState: GameState = {
        ...currentState,
        zones: newZones,
      };

      // Check victory conditions after drawing
      const victoryResult = checkVictoryConditions(newState);

      // Update game result if victory/defeat occurred
      const finalState: GameState = {
        ...newState,
        result: victoryResult,
      };

      return {
        success: true,
        newState: finalState,
        message: `Drew ${count} card${count > 1 ? "s" : ""}`,
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for sending a card to the graveyard
 *
 * Used for:
 * - Sending spell cards to graveyard after resolution
 * - Discarding cards from hand
 *
 * @param instanceId - Card instance ID to send to graveyard
 * @param cardId - Card ID (number) for looking up card data
 * @param options - Optional customization for id
 * @returns EffectResolutionStep for sending card to graveyard
 *
 * @example
 * ```typescript
 * // Send Pot of Greed to graveyard
 * createSendToGraveyardStep(instanceId, 55144522)
 * ```
 */
export function createSendToGraveyardStep(
  instanceId: string,
  cardId: number,
  options?: { id?: string },
): EffectResolutionStep {
  const cardData = getCardData(cardId);
  return {
    id: options?.id ?? `${instanceId}-graveyard`,
    summary: "墓地へ送る",
    description: `${cardData.jaName}を墓地に送ります`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      // Send card to graveyard
      const newZones = sendToGraveyard(currentState.zones, instanceId);

      const newState: GameState = {
        ...currentState,
        zones: newZones,
      };

      return {
        success: true,
        newState,
        message: `Sent ${cardData.jaName} to graveyard`,
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for card selection (interactive)
 *
 * Opens a card selection modal for user interaction.
 * Selected card instance IDs are passed to the onSelect callback.
 *
 * Used for:
 * - Discarding cards (Graceful Charity)
 * - Returning cards to deck (Magical Mallet)
 * - Selecting targets
 *
 * @param config - Selection configuration
 * @param config.id - Unique step ID
 * @param config.summary - Summary shown in selection UI
 * @param config.description - Detailed description/instructions
 * @param config.availableCards - Cards available for selection (empty array = use current hand)
 * @param config.minCards - Minimum number of cards that must be selected
 * @param config.maxCards - Maximum number of cards that can be selected
 * @param config.cancelable - Whether user can cancel selection (default: false)
 * @param config.onSelect - Callback function receiving (state, selectedIds)
 * @returns EffectResolutionStep for card selection
 *
 * @example
 * ```typescript
 * // Graceful Charity: Discard 2 cards
 * createCardSelectionStep({
 *   id: "graceful-charity-discard",
 *   summary: "手札を捨てる",
 *   description: "手札から2枚選んで捨ててください",
 *   availableCards: [],
 *   minCards: 2,
 *   maxCards: 2,
 *   cancelable: false,
 *   onSelect: (state, selectedIds) => {
 *     // Discard logic...
 *   }
 * })
 * ```
 */
export function createCardSelectionStep(config: {
  id: string;
  summary: string;
  description: string;
  availableCards: readonly CardInstance[] | [];
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
  onSelect: (state: GameState, selectedIds: string[]) => GameStateUpdateResult;
}): EffectResolutionStep {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: config.availableCards,
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
    } satisfies CardSelectionConfig,
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        // No cards selected (possible if minCards = 0)
        return config.onSelect(currentState, []);
      }
      return config.onSelect(currentState, selectedInstanceIds);
    },
  };
}

/**
 * Creates an EffectResolutionStep for gaining life points
 *
 * Used for:
 * - Opponent gaining LP (Upstart Goblin, One Day of Peace)
 * - Player gaining LP (healing effects)
 *
 * @param amount - Amount of LP to gain
 * @param options - Optional customization
 * @param options.id - Custom step ID
 * @param options.target - Who gains LP: "player" or "opponent" (default: "opponent")
 * @param options.summary - Custom summary
 * @param options.description - Custom description
 * @returns EffectResolutionStep for gaining life points
 *
 * @example
 * ```typescript
 * // Upstart Goblin: Opponent gains 1000 LP
 * createGainLifeStep(1000, { target: "opponent" })
 *
 * // Player gains 500 LP
 * createGainLifeStep(500, { target: "player", description: "プレイヤーのLPが500回復" })
 * ```
 */
export function createGainLifeStep(
  amount: number,
  options?: {
    id?: string;
    target?: "player" | "opponent";
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  const target = options?.target ?? "opponent";
  const targetJa = target === "player" ? "プレイヤー" : "相手";

  return {
    id: options?.id ?? `gain-lp-${target}-${amount}`,
    summary: options?.summary ?? `${targetJa}のLPを増加`,
    description: options?.description ?? `${targetJa}のLPが${amount}増加します`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      const newState: GameState = {
        ...currentState,
        lp: {
          ...currentState.lp,
          [target]: currentState.lp[target] + amount,
        },
      };

      return {
        success: true,
        newState,
        message: `${target === "player" ? "Player" : "Opponent"} gained ${amount} LP`,
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for dealing damage (LP loss)
 *
 * Used for:
 * - Player taking damage
 * - Opponent taking damage
 *
 * Note: Victory conditions are NOT checked here (will be checked at end of phase).
 * Use VictoryRule.checkVictoryConditions() if immediate check is needed.
 *
 * @param amount - Amount of LP to lose
 * @param options - Optional customization
 * @param options.id - Custom step ID
 * @param options.target - Who takes damage: "player" or "opponent" (default: "player")
 * @param options.summary - Custom summary
 * @param options.description - Custom description
 * @returns EffectResolutionStep for dealing damage
 *
 * @example
 * ```typescript
 * // Player takes 1000 damage
 * createDamageStep(1000, { target: "player" })
 *
 * // Opponent takes 500 damage
 * createDamageStep(500, { target: "opponent", description: "相手に500ダメージ" })
 * ```
 */
export function createDamageStep(
  amount: number,
  options?: {
    id?: string;
    target?: "player" | "opponent";
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  const target = options?.target ?? "player";
  const targetJa = target === "player" ? "プレイヤー" : "相手";

  return {
    id: options?.id ?? `damage-${target}-${amount}`,
    summary: options?.summary ?? `${targetJa}にダメージ`,
    description: options?.description ?? `${targetJa}は${amount}ダメージを受けます`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      const newState: GameState = {
        ...currentState,
        lp: {
          ...currentState.lp,
          [target]: currentState.lp[target] - amount,
        },
      };

      return {
        success: true,
        newState,
        message: `${target === "player" ? "Player" : "Opponent"} took ${amount} damage`,
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for shuffling the deck
 *
 * Used for:
 * - After returning cards to deck (Magical Mallet)
 * - After deck search (Terraforming)
 *
 * @param options - Optional customization for id, summary, description
 * @returns EffectResolutionStep for shuffling deck
 *
 * @example
 * ```typescript
 * // Standard shuffle notification
 * createShuffleStep()
 *
 * // Custom description
 * createShuffleStep({ description: "カードを戻してデッキをシャッフルします" })
 * ```
 */
export function createShuffleStep(options?: {
  id?: string;
  summary?: string;
  description?: string;
}): EffectResolutionStep {
  return {
    id: options?.id ?? "shuffle-deck",
    summary: options?.summary ?? "デッキシャッフル",
    description: options?.description ?? "デッキをシャッフルします",
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      // Shuffle deck
      const newZones = shuffleDeck(currentState.zones);

      const newState: GameState = {
        ...currentState,
        zones: newZones,
      };

      return {
        success: true,
        newState,
        message: "Deck shuffled",
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for returning cards to the deck
 *
 * Returns specified cards from hand to deck (does NOT shuffle automatically).
 * Use createShuffleStep() after this if shuffling is required.
 *
 * Used for:
 * - Returning cards to deck (Magical Mallet)
 * - Bouncing cards to deck
 *
 * @param instanceIds - Array of card instance IDs to return to deck
 * @param options - Optional customization
 * @param options.id - Custom step ID
 * @param options.summary - Custom summary
 * @param options.description - Custom description
 * @returns EffectResolutionStep for returning cards to deck
 *
 * @example
 * ```typescript
 * // Return 3 cards to deck
 * createReturnToDeckStep(["hand-0", "hand-2", "hand-4"])
 *
 * // With custom description
 * createReturnToDeckStep(selectedIds, {
 *   description: "選択したカードをデッキに戻します"
 * })
 * ```
 */
export function createReturnToDeckStep(
  instanceIds: string[],
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  const count = instanceIds.length;

  return {
    id: options?.id ?? `return-to-deck-${count}`,
    summary: options?.summary ?? "デッキに戻す",
    description: options?.description ?? `${count}枚のカードをデッキに戻します`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      if (instanceIds.length === 0) {
        return {
          success: true,
          newState: currentState,
          message: "No cards to return",
        };
      }

      // Return cards to deck
      let updatedZones = currentState.zones;
      for (const instanceId of instanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "hand", "deck");
      }

      const newState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      return {
        success: true,
        newState,
        message: `Returned ${count} card${count > 1 ? "s" : ""} to deck`,
      };
    },
  };
}
