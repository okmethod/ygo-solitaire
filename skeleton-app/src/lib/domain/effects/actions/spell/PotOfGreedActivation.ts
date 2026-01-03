/**
 * PotOfGreedActivation - 《強欲な壺》(Pot of Greed)
 *
 * Card ID: 55144522 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、デッキに2枚以上
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 2枚ドロー、墓地へ送る
 *
 * @module domain/effects/actions/spell/PotOfGreedActivation
 */

import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { NormalSpellAction } from "../../base/spell/NormalSpellAction";
import { createDrawStep, createSendToGraveyardStep } from "../../builders/stepBuilders";

/**
 * PotOfGreedActivation
 *
 * Extends NormalSpellAction for Pot of Greed implementation.
 */
export class PotOfGreedActivation extends NormalSpellAction {
  constructor() {
    super(55144522);
  }

  /**
   * Card-specific activation condition: Deck must have at least 2 cards
   */
  protected additionalActivationConditions(state: GameState): boolean {
    return state.zones.deck.length >= 2;
  }

  /**
   * RESOLUTION: Draw 2 cards, then send this card to graveyard
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [createDrawStep(2), createSendToGraveyardStep(activatedCardInstanceId, this.cardId)];
  }
}
