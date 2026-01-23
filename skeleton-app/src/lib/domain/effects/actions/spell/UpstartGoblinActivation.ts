/**
 * UpstartGoblinActivation - 《成金ゴブリン》(Upstart Goblin)
 *
 * Card ID: 70368879 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、デッキに1枚以上
 * - ACTIVATION: 発動通知
 * - RESOLUTION: 1枚ドロー、相手が1000LP回復、墓地へ送る
 *
 * @module domain/effects/actions/spell/UpstartGoblinActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { drawStep } from "$lib/domain/effects/steps/draws";
import { gainLpStep } from "$lib/domain/effects/steps/lifePoints";

/**
 * UpstartGoblinActivation
 *
 * Extends NormalSpellAction for Upstart Goblin implementation.
 */
export class UpstartGoblinActivation extends NormalSpellAction {
  constructor() {
    super(70368879);
  }

  /**
   * Card-specific activation condition: Deck must have at least 1 card
   */
  protected additionalActivationConditions(state: GameState): boolean {
    return state.zones.deck.length >= 1;
  }

  /**
   * RESOLUTION: Draw 1 card, opponent gains 1000 LP
   */
  createResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [drawStep(1), gainLpStep(1000, "opponent")];
  }
}
