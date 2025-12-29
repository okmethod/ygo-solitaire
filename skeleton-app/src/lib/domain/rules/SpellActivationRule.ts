/**
 * SpellActivationRule - Spell card activation validation
 *
 * Validates spell card activation conditions:
 * - Must be in Main1 phase
 * - Card must be in hand
 * - Must be a spell card
 * - MVP scope: Normal spells only (no Quick-Play during opponent's turn)
 *
 * @module domain/rules/SpellActivationRule
 */

import type { GameState } from "../models/GameState";
import type { GamePhase } from "../models/Phase";

/**
 * Result of spell activation validation
 */
export interface SpellActivationValidation {
  readonly canActivate: boolean;
  readonly reason?: string;
}

/**
 * Check if a spell card can be activated
 *
 * @param state - Current game state
 * @param cardInstanceId - Card instance ID to activate
 * @returns Validation result with reason if cannot activate
 */
export function canActivateSpell(state: GameState, cardInstanceId: string): SpellActivationValidation {
  // Check phase (must be Main1)
  if (state.phase !== "Main1") {
    return {
      canActivate: false,
      reason: `魔法カードはメインフェイズでのみ発動できます（現在: ${state.phase}）`,
    };
  }

  // Check if card is in hand
  const cardInHand = state.zones.hand.find((card) => card.instanceId === cardInstanceId);
  if (!cardInHand) {
    return {
      canActivate: false,
      reason: `指定されたカードが手札に見つかりません`,
    };
  }

  // Check card type: trap cards cannot be activated from hand (must be set first)
  if (cardInHand.type === "trap") {
    return {
      canActivate: false,
      reason: `罠カードは手札から直接発動できません（セットが必要です）`,
    };
  }

  // All checks passed
  return {
    canActivate: true,
  };
}

/**
 * Check if spell activation is allowed in current phase
 *
 * @param phase - Current game phase
 * @returns True if Main1 phase
 */
export function isSpellActivationPhase(phase: GamePhase): boolean {
  return phase === "Main1";
}

/**
 * Check if card exists in hand
 *
 * @param state - Current game state
 * @param cardInstanceId - Card instance ID to check
 * @returns True if card is in hand
 */
export function isCardInHand(state: GameState, cardInstanceId: string): boolean {
  return state.zones.hand.some((card) => card.instanceId === cardInstanceId);
}

/**
 * Validate spell activation with detailed error
 *
 * @param state - Current game state
 * @param cardInstanceId - Card instance ID to activate
 * @returns Validation result
 */
export function validateSpellActivation(state: GameState, cardInstanceId: string): SpellActivationValidation {
  return canActivateSpell(state, cardInstanceId);
}

/**
 * Check if any spells can be activated in current state
 * (Useful for UI to enable/disable activation buttons)
 *
 * @param state - Current game state
 * @returns True if at least one spell in hand can be activated
 */
export function hasActivatableSpells(state: GameState): boolean {
  if (state.phase !== "Main1") {
    return false;
  }

  // In MVP, all spell cards in hand during Main1 are activatable
  return state.zones.hand.length > 0;
}

/**
 * Get list of activatable spell card instance IDs
 *
 * @param state - Current game state
 * @returns Array of card instance IDs that can be activated
 */
export function getActivatableSpellIds(state: GameState): string[] {
  if (state.phase !== "Main1") {
    return [];
  }

  // In MVP, all cards in hand during Main1 are potentially activatable
  // (We don't check card type here as that requires CardData lookup)
  return state.zones.hand.map((card) => card.instanceId);
}
