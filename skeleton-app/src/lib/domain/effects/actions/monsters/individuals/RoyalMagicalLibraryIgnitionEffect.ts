/**
 * RoyalMagicalLibraryIgnitionEffect - 《王立魔法図書館》(Royal Magical Library) 起動効果
 *
 * Card ID: 70791313 | Type: Monster | Subtype: Effect
 *
 * Implementation using ChainableAction model (簡略版):
 * - CONDITIONS: ゲーム続行中、メインフェイズ、モンスターゾーンに表側表示で存在、1ターンに1度制限
 * - ACTIVATION: 発動記録（1ターンに1度制限用）
 * - RESOLUTION: デッキから1枚ドロー
 *
 * Note: 本来は魔力カウンター3つを取り除くコストが必要だが、
 * 本実装では簡略化のためコスト条件なしで実装する。
 * 魔力カウンターシステムは次のSpecで実装予定。
 *
 * @module domain/effects/actions/monsters/individuals/RoyalMagicalLibraryIgnitionEffect
 */

import type { ChainableAction } from "$lib/domain/models/ChainableAction";
import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { EffectCategory } from "$lib/domain/models/EffectCategory";
import { drawStep } from "$lib/domain/effects/steps/draws";
import {
  ValidationErrorCode,
  successValidationResult,
  failureValidationResult,
} from "$lib/domain/models/ValidationResult";

/** 王立魔法図書館 カードID */
const ROYAL_MAGICAL_LIBRARY_ID = 70791313;

/** RoyalMagicalLibraryIgnitionEffect */
export class RoyalMagicalLibraryIgnitionEffect implements ChainableAction {
  /** 効果の発動（カードの発動ではない） */
  readonly isCardActivation = false;

  /** スペルスピード1（起動効果） */
  readonly spellSpeed = 1 as const;

  /** 効果カテゴリ: 起動効果 */
  readonly effectCategory: EffectCategory = "ignition";

  /** 起動効果のID（1ターンに1度制限用）*/
  readonly effectId = "royal-magical-library-ignition";

  /**
   * CONDITIONS: 発動条件チェック
   *
   * - Game is not over
   * - Current phase is Main Phase
   * - 王立魔法図書館がモンスターゾーンに表側表示で存在する
   * - 1ターンに1度制限（activatedIgnitionEffectsThisTurnにこの効果がない）
   *
   * Note: 本来は魔力カウンター3つが必要だが、簡略版のため省略
   */
  canActivate(state: GameState, sourceInstance: CardInstance): ValidationResult {
    // Game must not be over
    if (state.result.isGameOver) {
      return failureValidationResult(ValidationErrorCode.GAME_OVER);
    }

    // Must be Main Phase
    if (state.phase !== "Main1") {
      return failureValidationResult(ValidationErrorCode.NOT_MAIN_PHASE);
    }

    // 1ターンに1度制限チェック
    const effectKey = `${sourceInstance.instanceId}:${this.effectId}`;
    if (state.activatedIgnitionEffectsThisTurn.has(effectKey)) {
      return failureValidationResult(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
    }

    // 王立魔法図書館がモンスターゾーンに表側表示で存在するか
    const libraryOnField = state.zones.mainMonsterZone.some(
      (card) =>
        card.instanceId === sourceInstance.instanceId &&
        card.id === ROYAL_MAGICAL_LIBRARY_ID &&
        card.position === "faceUp",
    );

    if (!libraryOnField) {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_ON_FIELD);
    }

    return successValidationResult();
  }

  /**
   * ACTIVATION: 発動時の処理
   *
   * 1. 発動記録（1ターンに1度制限用）
   *
   * Note: 本来は魔力カウンター3つを取り除くコストがあるが、簡略版のため省略
   */
  createActivationSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    const effectKey = `${sourceInstance.instanceId}:${this.effectId}`;

    return [
      // Record activation (1ターンに1度制限)
      {
        id: "royal-magical-library-record-activation",
        summary: "効果発動を記録",
        description: "1ターンに1度の制限を記録します",
        action: (currentState: GameState) => {
          // Add to activated effects set
          const newActivatedEffects = new Set(currentState.activatedIgnitionEffectsThisTurn);
          newActivatedEffects.add(effectKey);

          const updatedState: GameState = {
            ...currentState,
            activatedIgnitionEffectsThisTurn: newActivatedEffects,
          };

          return {
            success: true,
            updatedState,
            message: "Recorded ignition effect activation",
          };
        },
      },
    ];
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * デッキから1枚ドロー
   */
  createResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      // Draw 1 card
      drawStep(1),
    ];
  }
}
