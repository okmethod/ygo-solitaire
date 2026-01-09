/**
 * SetMonsterCommand - Set a monster card face-down in defense position
 *
 * Sets a monster card from hand to mainMonsterZone in face-down defense position.
 * This consumes one normal summon right (same as summoning).
 *
 * @module domain/commands/SetMonsterCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import { moveCard } from "$lib/domain/models/Zone";
import { canNormalSummon } from "$lib/domain/rules/SummonRule";
import type { CardInstance } from "$lib/domain/models/Card";

/**
 * Command to set a monster card face-down
 */
export class SetMonsterCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Set monster ${cardInstanceId}`;
  }

  /**
   * Check if monster can be set
   *
   * @param state - Current game state
   * @returns True if monster can be set
   */
  canExecute(state: GameState): boolean {
    if (state.result.isGameOver) {
      return false;
    }

    // Setting a monster uses the same summon rights as summoning
    const validation = canNormalSummon(state);
    if (!validation.canSummon) {
      return false;
    }

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance || cardInstance.location !== "hand") {
      return false;
    }

    if (cardInstance.type !== "monster") {
      return false;
    }

    return true;
  }

  /**
   * Execute set monster command
   *
   * @param state - Current game state
   * @returns Command result with new state
   */
  execute(state: GameState): CommandResult {
    // Validate summon rights
    const validation = canNormalSummon(state);
    if (!validation.canSummon) {
      return createFailureResult(state, validation.reason || "Cannot set monster");
    }

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card ${this.cardInstanceId} not found`);
    }

    if (cardInstance.location !== "hand") {
      return createFailureResult(state, "Card not in hand");
    }

    if (cardInstance.type !== "monster") {
      return createFailureResult(state, "Not a monster card");
    }

    // Move card to mainMonsterZone with faceDown position
    const zonesAfterMove = moveCard(state.zones, this.cardInstanceId, "hand", "mainMonsterZone", "faceDown");

    // Update card properties: battlePosition and placedThisTurn
    // moveCard doesn't handle these new fields, so we need to update them manually
    const mainMonsterZone = zonesAfterMove.mainMonsterZone.map((card) =>
      card.instanceId === this.cardInstanceId
        ? ({ ...card, battlePosition: "defense", placedThisTurn: true } as CardInstance)
        : card,
    );

    const newState: GameState = {
      ...state,
      zones: {
        ...zonesAfterMove,
        mainMonsterZone,
      },
      normalSummonUsed: state.normalSummonUsed + 1,
    };

    return createSuccessResult(newState, `Monster set: ${cardInstance.name}`);
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
