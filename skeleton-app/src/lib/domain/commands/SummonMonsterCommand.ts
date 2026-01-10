import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import { moveCard } from "$lib/domain/models/Zone";
import { canNormalSummon } from "$lib/domain/rules/SummonRule";
import type { CardInstance } from "$lib/domain/models/Card";

/**
 * モンスターカードを表側攻撃表示でmainMonsterZoneに配置するコマンド
 * 召喚権を1消費する
 */
export class SummonMonsterCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Summon monster ${cardInstanceId}`;
  }

  canExecute(state: GameState): boolean {
    if (state.result.isGameOver) return false;

    const validation = canNormalSummon(state);
    if (!validation.canSummon) return false;

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance || cardInstance.location !== "hand") return false;
    if (cardInstance.type !== "monster") return false;

    return true;
  }

  execute(state: GameState): CommandResult {
    const validation = canNormalSummon(state);
    if (!validation.canSummon) {
      return createFailureResult(state, validation.reason || "Cannot summon");
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

    // Move card to mainMonsterZone with faceUp position
    const zonesAfterMove = moveCard(state.zones, this.cardInstanceId, "hand", "mainMonsterZone", "faceUp");

    // Update card properties: battlePosition and placedThisTurn
    // moveCard doesn't handle these new fields, so we need to update them manually
    const mainMonsterZone = zonesAfterMove.mainMonsterZone.map((card) =>
      card.instanceId === this.cardInstanceId
        ? ({ ...card, battlePosition: "attack", placedThisTurn: true } as CardInstance)
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

    return createSuccessResult(newState, `Monster summoned: ${cardInstance.name}`);
  }

  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
