import type { GameState } from "$lib/domain/models/GameState";
import type { GamePhase } from "$lib/domain/models/Phase";
import type { ValidationResult } from "$lib/domain/models/GameStateUpdate";

/**
 * Check if a spell card can be activated
 *
 * Supports activation from:
 * - Hand (all spell types)
 * - spellTrapZone (face-down spells, with quick-play set-turn restriction)
 * - fieldZone (face-down field spells)
 *
 * @param state - Current game state
 * @param cardInstanceId - Card instance ID to activate
 * @returns Validation result with reason if cannot activate
 */

/**
 * 魔法カードが発動可能かをチェックする
 *
 * チェック項目:
 * 1. メインフェーズ1であること
 * 2. カードタイプが魔法カードであること
 *
 * Note: GameStateのみによる判定を責務とし、カードインスタンスが必要な判定はコマンドに委ねる
 */
export function canActivateSpell(state: GameState, cardInstanceId: string): ValidationResult {
  // Check phase (must be Main1)
  if (state.phase !== "Main1") {
    return {
      canExecute: false,
      reason: `魔法カードはメインフェイズでのみ発動できます（現在: ${state.phase}）`,
    };
  }

  // Find card in hand, spellTrapZone, or fieldZone (T030-2)
  const cardInHand = state.zones.hand.find((card) => card.instanceId === cardInstanceId);
  const cardInSpellTrapZone = state.zones.spellTrapZone.find((card) => card.instanceId === cardInstanceId);
  const cardInFieldZone = state.zones.fieldZone.find((card) => card.instanceId === cardInstanceId);

  const card = cardInHand || cardInSpellTrapZone || cardInFieldZone;

  if (!card) {
    return {
      canExecute: false,
      reason: `指定されたカードが発動可能な位置（手札、魔法・罠ゾーン、フィールドゾーン）に見つかりません`,
    };
  }

  // Check card type: must be a spell card (SpellActivationRule is for spells only)
  if (card.type !== "spell") {
    return {
      canExecute: false,
      reason: `魔法カード以外は発動できません`,
    };
  }

  // If activating from field zones, additional checks apply
  if (cardInSpellTrapZone || cardInFieldZone) {
    // Field spells (continuous spells) can only be activated from fieldZone
    if (card.spellType === "field" && cardInSpellTrapZone) {
      return {
        canExecute: false,
        reason: `フィールド魔法は魔法・罠ゾーンから発動できません`,
      };
    }

    // Quick-play spells cannot be activated the turn they were set (FR-012-2)
    if (card.spellType === "quick-play" && card.placedThisTurn) {
      return {
        canExecute: false,
        reason: `速攻魔法はセットしたターンに発動できません`,
      };
    }
  }

  // All checks passed
  return {
    canExecute: true,
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
export function validateSpellActivation(state: GameState, cardInstanceId: string): ValidationResult {
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
