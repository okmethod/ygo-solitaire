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

/**
 * Creates an EffectResolutionStep for searching and selecting cards from graveyard
 *
 * Opens a card selection modal showing only graveyard cards that match the filter.
 * Selected card(s) are added to hand.
 *
 * Used for:
 * - Magical Stone Excavation (select 1 spell card from graveyard)
 * - Dark Factory (select 2 normal monsters from graveyard)
 *
 * @param config - Selection configuration
 * @param config.id - Unique step ID
 * @param config.summary - Summary shown in selection UI
 * @param config.description - Detailed description/instructions
 * @param config.filter - Filter function to determine which graveyard cards are available
 * @param config.minCards - Minimum number of cards that must be selected
 * @param config.maxCards - Maximum number of cards that can be selected
 * @param config.cancelable - Whether user can cancel selection (default: false)
 * @returns EffectResolutionStep for graveyard search and selection
 *
 * @example
 * ```typescript
 * // Magical Stone Excavation: Select 1 spell card from graveyard
 * createSearchFromGraveyardStep({
 *   id: "magical-stone-excavation-search",
 *   summary: "墓地から魔法カードを選択",
 *   description: "墓地の魔法カード1枚を選んで手札に加えてください",
 *   filter: (card) => card.type === "spell",
 *   minCards: 1,
 *   maxCards: 1,
 * })
 * ```
 */
export function createSearchFromGraveyardStep(config: {
  id: string;
  summary: string;
  description: string;
  filter: (card: CardInstance) => boolean;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
}): EffectResolutionStep {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: [], // Populated dynamically from graveyard in action
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
    } satisfies CardSelectionConfig,
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // Filter graveyard cards
      const availableCards = currentState.zones.graveyard.filter(config.filter);

      // If no cards available, return error
      if (availableCards.length === 0) {
        return {
          success: false,
          newState: currentState,
          error: "No cards available in graveyard matching the criteria",
        };
      }

      // If no selection made yet, return current state (UI will show selection modal)
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return {
          success: false,
          newState: currentState,
          error: "No cards selected",
        };
      }

      // Move selected cards from graveyard to hand
      let updatedZones = currentState.zones;
      for (const instanceId of selectedInstanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "graveyard", "hand");
      }

      const newState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      return {
        success: true,
        newState,
        message: `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from graveyard to hand`,
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for searching cards from the top N cards of the deck
 *
 * Opens a card selection modal showing the top N cards of the deck.
 * Selected card is added to hand, remaining cards are returned to deck.
 *
 * Used for:
 * - Pot of Duality (excavate top 3 cards, select 1, return 2 to deck)
 *
 * @param config - Selection configuration
 * @param config.id - Unique step ID
 * @param config.summary - Summary shown in selection UI
 * @param config.description - Detailed description/instructions
 * @param config.count - Number of cards to excavate from deck top
 * @param config.minCards - Minimum number of cards that must be selected (usually 1)
 * @param config.maxCards - Maximum number of cards that can be selected (usually 1)
 * @param config.cancelable - Whether user can cancel selection (default: false)
 * @returns EffectResolutionStep for deck top search and selection
 *
 * @example
 * ```typescript
 * // Pot of Duality: Excavate top 3 cards, select 1
 * createSearchFromDeckTopStep({
 *   id: "pot-of-duality-search",
 *   summary: "デッキの上から3枚を確認",
 *   description: "デッキの上から3枚を確認し、1枚を選んで手札に加えてください",
 *   count: 3,
 *   minCards: 1,
 *   maxCards: 1,
 * })
 * ```
 */
export function createSearchFromDeckTopStep(config: {
  id: string;
  summary: string;
  description: string;
  count: number;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
}): EffectResolutionStep {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: [], // Populated dynamically from deck top in action
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
    } satisfies CardSelectionConfig,
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // Get top N cards from deck
      const topCards = currentState.zones.deck.slice(0, config.count);

      // If not enough cards in deck, return error
      if (topCards.length < config.count) {
        return {
          success: false,
          newState: currentState,
          error: `Cannot excavate ${config.count} cards. Deck has only ${topCards.length} cards.`,
        };
      }

      // If no selection made yet, return current state (UI will show selection modal)
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return {
          success: false,
          newState: currentState,
          error: "No cards selected",
        };
      }

      // Move selected card(s) to hand
      let updatedZones = currentState.zones;
      for (const instanceId of selectedInstanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "deck", "hand");
      }

      // Remaining cards stay in deck (no shuffling - they return to their positions)
      const newState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      return {
        success: true,
        newState,
        message: `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from deck to hand`,
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for adding an effect to be executed at end phase
 *
 * Adds an EffectResolutionStep to pendingEndPhaseEffects array.
 * The effect will be executed when the game phase advances to End phase.
 *
 * Used for:
 * - Into the Void (discard all hand at end phase)
 * - Card of Demise (discard all hand at end phase)
 *
 * @param effectStep - The EffectResolutionStep to execute at end phase
 * @param options - Optional customization for id, summary, description
 * @returns EffectResolutionStep for adding end phase effect
 *
 * @example
 * ```typescript
 * // Into the Void: Add end phase discard effect
 * createAddEndPhaseEffectStep(
 *   {
 *     id: "into-the-void-end-phase-discard",
 *     summary: "手札を全て捨てる",
 *     description: "エンドフェイズに手札を全て捨てます",
 *     notificationLevel: "info",
 *     action: (state) => {
 *       // Discard all hand logic...
 *     }
 *   },
 *   { summary: "エンドフェイズ効果を登録" }
 * )
 * ```
 */
export function createAddEndPhaseEffectStep(
  effectStep: EffectResolutionStep,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  return {
    id: options?.id ?? `add-end-phase-effect-${effectStep.id}`,
    summary: options?.summary ?? "エンドフェイズ効果を登録",
    description: options?.description ?? "エンドフェイズに実行される効果を登録します",
    notificationLevel: "silent",
    action: (currentState: GameState): GameStateUpdateResult => {
      const newState: GameState = {
        ...currentState,
        pendingEndPhaseEffects: [...currentState.pendingEndPhaseEffects, effectStep],
      };

      return {
        success: true,
        newState,
        message: `Added end phase effect: ${effectStep.summary}`,
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for drawing cards until hand reaches a target count
 *
 * Draws cards from deck until hand size reaches the specified count.
 * If hand already has >= target count, no cards are drawn.
 *
 * Used for:
 * - Card of Demise (draw until hand = 3)
 *
 * @param targetCount - Target hand size (e.g., 3)
 * @param options - Optional customization
 * @param options.id - Custom step ID
 * @param options.summary - Custom summary
 * @param options.description - Custom description
 * @returns EffectResolutionStep for drawing until target count
 *
 * @example
 * ```typescript
 * // Card of Demise: Draw until hand = 3
 * createDrawUntilCountStep(3, {
 *   description: "手札が3枚になるようにデッキからドローします"
 * })
 * ```
 */
export function createDrawUntilCountStep(
  targetCount: number,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  return {
    id: options?.id ?? `draw-until-${targetCount}`,
    summary: options?.summary ?? `手札が${targetCount}枚になるようにドロー`,
    description: options?.description ?? `手札が${targetCount}枚になるようにデッキからドローします`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      const currentHandCount = currentState.zones.hand.length;
      const drawCount = Math.max(0, targetCount - currentHandCount);

      // If already at or above target, no draw needed
      if (drawCount === 0) {
        return {
          success: true,
          newState: currentState,
          message: `Hand already has ${currentHandCount} cards (target: ${targetCount})`,
        };
      }

      // Validate deck has enough cards
      if (currentState.zones.deck.length < drawCount) {
        return {
          success: false,
          newState: currentState,
          error: `Cannot draw ${drawCount} cards to reach target. Deck has only ${currentState.zones.deck.length} cards.`,
        };
      }

      // Draw cards
      const newZones = drawCards(currentState.zones, drawCount);

      const newState: GameState = {
        ...currentState,
        zones: newZones,
      };

      // Check victory conditions after drawing
      const victoryResult = checkVictoryConditions(newState);

      const finalState: GameState = {
        ...newState,
        result: victoryResult,
      };

      return {
        success: true,
        newState: finalState,
        message: `Drew ${drawCount} card${drawCount > 1 ? "s" : ""} (hand now: ${targetCount})`,
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for searching deck by card name filter
 *
 * Opens a card selection modal showing deck cards that match the name filter.
 * Selected card is added to hand, deck is shuffled.
 *
 * Used for:
 * - Toon Table of Contents (search for cards with "トゥーン" in name)
 * - Terraforming (search for field spells - frameType check)
 *
 * @param config - Selection configuration
 * @param config.id - Unique step ID
 * @param config.summary - Summary shown in selection UI
 * @param config.description - Detailed description/instructions
 * @param config.filter - Filter function to determine which deck cards are available
 * @param config.minCards - Minimum number of cards that must be selected
 * @param config.maxCards - Maximum number of cards that can be selected
 * @param config.cancelable - Whether user can cancel selection (default: false)
 * @returns EffectResolutionStep for deck search by name
 *
 * @example
 * ```typescript
 * // Toon Table of Contents: Search for "トゥーン" cards
 * createSearchFromDeckByNameStep({
 *   id: "toon-table-search",
 *   summary: "デッキからトゥーンカードを検索",
 *   description: "デッキから「トゥーン」カード1枚を選んで手札に加えてください",
 *   filter: (card) => card.jaName.includes("トゥーン") || card.name.includes("Toon"),
 *   minCards: 1,
 *   maxCards: 1,
 * })
 * ```
 */
export function createSearchFromDeckByNameStep(config: {
  id: string;
  summary: string;
  description: string;
  filter: (card: CardInstance) => boolean;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
}): EffectResolutionStep {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: [], // Populated dynamically from deck in action
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
    } satisfies CardSelectionConfig,
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // Filter deck cards
      const availableCards = currentState.zones.deck.filter(config.filter);

      // If no cards available, return error
      if (availableCards.length === 0) {
        return {
          success: false,
          newState: currentState,
          error: "No cards available in deck matching the criteria",
        };
      }

      // If no selection made yet, return current state (UI will show selection modal)
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return {
          success: false,
          newState: currentState,
          error: "No cards selected",
        };
      }

      // Move selected card(s) from deck to hand
      let updatedZones = currentState.zones;
      for (const instanceId of selectedInstanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "deck", "hand");
      }

      // Shuffle deck after search
      updatedZones = shuffleDeck(updatedZones);

      const newState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      return {
        success: true,
        newState,
        message: `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from deck to hand and shuffled`,
      };
    },
  };
}

/**
 * Creates an EffectResolutionStep for paying life points
 *
 * Reduces player's LP by the specified amount.
 * Used for card activation costs (Toon World - pay 1000 LP).
 *
 * @param amount - Amount of LP to pay
 * @param options - Optional customization
 * @param options.id - Custom step ID
 * @param options.target - Who pays LP: "player" or "opponent" (default: "player")
 * @param options.summary - Custom summary
 * @param options.description - Custom description
 * @returns EffectResolutionStep for LP payment
 *
 * @example
 * ```typescript
 * // Toon World: Pay 1000 LP
 * createLPPaymentStep(1000, {
 *   description: "1000LPを払って発動します"
 * })
 * ```
 */
export function createLPPaymentStep(
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
    id: options?.id ?? `pay-lp-${target}-${amount}`,
    summary: options?.summary ?? `${targetJa}がLPを支払う`,
    description: options?.description ?? `${targetJa}が${amount}LPを支払います`,
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
        message: `${target === "player" ? "Player" : "Opponent"} paid ${amount} LP`,
      };
    },
  };
}
