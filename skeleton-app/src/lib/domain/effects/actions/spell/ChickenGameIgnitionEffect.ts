/**
 * ChickenGameIgnitionEffect - Chicken Game (チキンレース) 起動効果
 *
 * Card Information:
 * - Card ID: 67616300
 * - Card Name: Chicken Game (チキンレース)
 * - Card Type: Field Spell
 * - 起動効果: 1ターンに1度、1000LP払って発動できる。以下の効果から1つを選択して適用する。
 *   1. デッキから1枚ドローする
 *   2. このカードを破壊する
 *   3. 相手は1000LP回復する
 *
 * 注意: 「この効果の発動に対して、お互いは魔法・罠・モンスターの効果を発動できない」はチェーンシステムのためスコープ外
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: Game not over, Main Phase, LP >= 1000, 1ターンに1度制限
 * - ACTIVATION: 1000LP支払い、発動記録
 * - RESOLUTION: デッキから1枚ドロー（簡略化のため選択肢1のみ実装）
 *
 * @module domain/effects/chainable/ChickenGameIgnitionEffect
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { ChainableAction } from "../../../models/ChainableAction";
import type { GameState } from "../../../models/GameState";
import type { EffectResolutionStep } from "../../../models/EffectResolutionStep";
import { createDrawStep } from "../../builders/stepBuilders";

/**
 * ChickenGameIgnitionEffect - Chicken Game 起動効果
 *
 * Implements ChainableAction interface for Chicken Game ignition effect.
 *
 * @example
 * ```typescript
 * // 起動効果の発動（フィールドのChicken Gameから）
 * const chickenGame = state.zones.field.find(card => card.id === 67616300);
 * const ignitionEffect = new ChickenGameIgnitionEffect(chickenGame.instanceId);
 * if (ignitionEffect.canActivate(state)) {
 *   const activationSteps = ignitionEffect.createActivationSteps(state);
 *   const resolutionSteps = ignitionEffect.createResolutionSteps(state, chickenGame.instanceId);
 * }
 * ```
 */
export class ChickenGameIgnitionEffect implements ChainableAction {
  /** 効果の発動（カードの発動ではない） */
  readonly isCardActivation = false;

  /** スペルスピード1（起動効果） */
  readonly spellSpeed = 1 as const;

  /**
   * 起動効果のID（1ターンに1度制限用）
   */
  private readonly effectId = "chicken-game-ignition";

  /**
   * Constructor
   *
   * @param cardInstanceId - フィールド上のChicken GameカードのインスタンスID
   */
  constructor(private readonly cardInstanceId: string) {}

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase 1
   * - Player LP >= 1000 (コスト支払い可能)
   * - 1ターンに1度制限（activatedIgnitionEffectsThisTurnにこの効果がない）
   * - Chicken GameがフィールドにfaceUpで存在する
   *
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  canActivate(state: GameState): boolean {
    // Game must not be over
    if (state.result.isGameOver) {
      return false;
    }

    // Must be Main Phase 1
    if (state.phase !== "Main1") {
      return false;
    }

    // Player must have at least 1000 LP to pay cost
    if (state.lp.player < 1000) {
      return false;
    }

    // 1ターンに1度制限チェック
    const effectKey = `${this.cardInstanceId}:${this.effectId}`;
    if (state.activatedIgnitionEffectsThisTurn.has(effectKey)) {
      return false;
    }

    // Chicken GameがフィールドにfaceUpで存在するか
    const chickenGameOnField = state.zones.field.some(
      (card) => card.instanceId === this.cardInstanceId && card.id === 67616300 && card.position === "faceUp",
    );

    if (!chickenGameOnField) {
      return false;
    }

    return true;
  }

  /**
   * ACTIVATION: 発動時の処理
   *
   * 1. 1000LP支払い
   * 2. 発動記録（1ターンに1度制限用）
   *
   * @param _state - 現在のゲーム状態（未使用）
   * @returns 発動ステップ配列
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createActivationSteps(_state: GameState): EffectResolutionStep[] {
    const effectKey = `${this.cardInstanceId}:${this.effectId}`;

    return [
      // Step 1: Pay 1000 LP cost
      {
        id: "chicken-game-pay-lp",
        summary: "コスト支払い",
        description: "1000LPを支払います",
        action: (currentState: GameState) => {
          // Validate LP is still sufficient
          if (currentState.lp.player < 1000) {
            return {
              success: false,
              newState: currentState,
              error: "Cannot pay 1000 LP. Not enough Life Points.",
            };
          }

          // Pay 1000 LP
          const newState: GameState = {
            ...currentState,
            lp: {
              ...currentState.lp,
              player: currentState.lp.player - 1000,
            },
          };

          return {
            success: true,
            newState,
            message: "Paid 1000 LP",
          };
        },
      },

      // Step 2: Record activation (1ターンに1度制限)
      {
        id: "chicken-game-record-activation",
        summary: "効果発動を記録",
        description: "1ターンに1度の制限を記録します",
        action: (currentState: GameState) => {
          // Add to activated effects set
          const newActivatedEffects = new Set(currentState.activatedIgnitionEffectsThisTurn);
          newActivatedEffects.add(effectKey);

          const newState: GameState = {
            ...currentState,
            activatedIgnitionEffectsThisTurn: newActivatedEffects,
          };

          return {
            success: true,
            newState,
            message: "Recorded ignition effect activation",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 実装簡略化のため、選択肢1（デッキから1枚ドロー）のみ実装。
   * 本来は3つの選択肢から1つを選択する。
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID（未使用）
   * @returns 効果解決ステップ配列
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      // Option 1: Draw 1 card (簡略化のためこの選択肢のみ実装)
      createDrawStep(1, {
        id: "chicken-game-draw",
        description: "デッキから1枚ドローします",
      }),
    ];
  }
}
