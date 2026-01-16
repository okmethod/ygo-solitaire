/**
 * BaseSpellAction - Abstract base class for all spell card activations
 *
 * Provides common properties and methods for spell card ChainableAction implementations.
 * All spell cards share:
 * - isCardActivation = true (card placement from hand to field)
 * - Common canActivate() with game-over check
 * - Default createActivationSteps() (can be overridden)
 *
 * Subclasses:
 * - NormalSpellAction (spellSpeed = 1, Main Phase only)
 * - QuickPlaySpellAction (spellSpeed = 2, Main Phase only in current scope)
 * - FieldSpellAction (spellSpeed = 1, stays on field)
 *
 * @module domain/effects/base/spell/BaseSpellAction
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../../../models/ChainableAction";
import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { getCardData, getCardNameWithBrackets } from "../../../registries/CardDataRegistry";

/**
 * BaseSpellAction - Abstract base class for spell card actions
 *
 * Implements ChainableAction interface with common spell card logic.
 *
 * @abstract
 * @example
 * ```typescript
 * export class PotOfGreedActivation extends NormalSpellAction {
 *   constructor() {
 *     super(55144522);
 *   }
 *
 *   protected additionalActivationConditions(state: GameState): boolean {
 *     return state.zones.deck.length >= 2;
 *   }
 *
 *   createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
 *     return [createDrawStep(2), createSendToGraveyardStep(instanceId, this.cardId)];
 *   }
 * }
 * ```
 */
export abstract class BaseSpellAction implements ChainableAction {
  /** カードID（数値） */
  protected readonly cardId: number;

  /** カードの発動（手札→フィールド） */
  readonly isCardActivation = true;

  /** スペルスピード（サブクラスで定義） */
  abstract readonly spellSpeed: 1 | 2;

  /**
   * Constructor
   * @param cardId - Card ID (number)
   */
  constructor(cardId: number) {
    this.cardId = cardId;
  }

  /**
   * CONDITIONS: 発動条件チェック
   *
   * Common conditions for all spell cards:
   * - Game must not be over
   *
   * Subclasses add additional conditions via additionalActivationConditions()
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  canActivate(state: GameState): boolean {
    // Game must not be over
    if (state.result.isGameOver) {
      return false;
    }

    // Subclass-specific conditions
    return this.additionalActivationConditions(state);
  }

  /**
   * Card-specific activation conditions
   *
   * Subclasses implement this to add card-specific conditions (e.g., deck size check)
   *
   * @param state - 現在のゲーム状態
   * @returns 追加条件を満たすならtrue
   * @protected
   */
  protected abstract additionalActivationConditions(state: GameState): boolean;

  /**
   * ACTIVATION: 発動時の処理
   *
   * Default activation step for spell cards (notification only).
   * Subclasses can override this for cards with activation costs.
   *
   * @param state - 現在のゲーム状態
   * @returns 発動通知ステップ
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createActivationSteps(state: GameState): EffectResolutionStep[] {
    const cardData = getCardData(this.cardId);
    return [
      {
        id: `${this.cardId}-activation`,
        summary: "カード発動",
        description: `${getCardNameWithBrackets(this.cardId)}を発動します`,
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // No state change, just notification
          return {
            success: true,
            updatedState: currentState,
            message: `${cardData.jaName} activated`,
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * Subclasses must implement this to define card-specific resolution steps.
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   * @abstract
   */
  abstract createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
}
