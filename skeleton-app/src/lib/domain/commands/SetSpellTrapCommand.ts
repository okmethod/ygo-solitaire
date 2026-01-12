/**
 * SetSpellTrapCommand - Set a spell or trap card face-down
 *
 * Sets a spell or trap card from hand to either spellTrapZone or fieldZone (for field spells).
 * Setting does NOT consume normal summon rights.
 * Field spells automatically replace any existing field spell (old one goes to graveyard).
 *
 * @module domain/commands/SetSpellTrapCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "$lib/domain/models/GameStateUpdate";
import { createSuccessResult, createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { moveCard, sendToGraveyard } from "$lib/domain/models/Zone";
import type { CardInstance } from "$lib/domain/models/Card";

/**
 * Command to set a spell or trap card face-down
 */
export class SetSpellTrapCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Set spell/trap ${cardInstanceId}`;
  }

  /**
   * Check if spell/trap can be set
   *
   * @param state - Current game state
   * @returns True if spell/trap can be set
   */
  canExecute(state: GameState): boolean {
    if (state.result.isGameOver) {
      return false;
    }

    if (state.phase !== "Main1") {
      return false;
    }

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance || cardInstance.location !== "hand") {
      return false;
    }

    if (cardInstance.type !== "spell" && cardInstance.type !== "trap") {
      return false;
    }

    // Field spell: always allowed (will auto-replace existing)
    if (cardInstance.spellType === "field") {
      return true;
    }

    // Non-field spell/trap: check spellTrapZone capacity
    return state.zones.spellTrapZone.length < 5;
  }

  /**
   * Execute set spell/trap command
   *
   * @param state - Current game state
   * @returns Command result with new state
   */
  execute(state: GameState): CommandResult {
    if (state.phase !== "Main1") {
      return createFailureResult(state, "Main1フェーズではありません");
    }

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card ${this.cardInstanceId} not found`);
    }

    if (cardInstance.location !== "hand") {
      return createFailureResult(state, "Card not in hand");
    }

    if (cardInstance.type !== "spell" && cardInstance.type !== "trap") {
      return createFailureResult(state, "Not a spell or trap card");
    }

    const isFieldSpell = cardInstance.spellType === "field";
    let zones = state.zones;

    // Check zone capacity for non-field spells/traps
    if (!isFieldSpell && zones.spellTrapZone.length >= 5) {
      return createFailureResult(state, "魔法・罠ゾーンが満杯です");
    }

    // If field spell and fieldZone occupied, send existing to graveyard
    if (isFieldSpell && zones.fieldZone.length > 0) {
      const existingCard = zones.fieldZone[0];
      zones = sendToGraveyard(zones, existingCard.instanceId);
    }

    // Determine target zone
    const targetZone = isFieldSpell ? "fieldZone" : "spellTrapZone";

    // Move card to target zone with faceDown position
    zones = moveCard(zones, this.cardInstanceId, "hand", targetZone, "faceDown");

    // Update placedThisTurn flag
    const updatedZone = zones[targetZone].map((card) =>
      card.instanceId === this.cardInstanceId ? ({ ...card, placedThisTurn: true } as CardInstance) : card,
    );

    const newState: GameState = {
      ...state,
      zones: {
        ...zones,
        [targetZone]: updatedZone,
      },
      // NOTE: Setting spell/trap does NOT consume normalSummonUsed
    };

    return createSuccessResult(newState, `Card set: ${cardInstance.name}`);
  }

  /**
   * Get the card instance ID being set
   *
   * @returns Card instance ID
   */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
