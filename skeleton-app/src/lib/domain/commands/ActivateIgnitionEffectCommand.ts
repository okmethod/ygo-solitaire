/**
 * ActivateIgnitionEffectCommand - 起動効果発動コマンド
 *
 * フィールドに表側表示で存在するカードの起動効果を発動する Command パターン実装。
 * TODO: 現状「チキンレース」のハードコードとなっている。別の起動効果も扱えるように汎用化する。
 * TODO: canExecute を、 execute 内で再利用するように修正する。
 * TODO: チェーンシステムに対応する。
 *
 * @module domain/commands/ActivateIgnitionEffectCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import { findCardInstance } from "$lib/domain/models/GameState";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/spell/ChickenGameIgnitionEffect";
import {
  ValidationErrorCode,
  validationSuccess,
  validationFailure,
  getValidationErrorMessage,
} from "$lib/domain/models/ValidationResult";

/** 起動効果発動コマンドクラス */
export class ActivateIgnitionEffectCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Activate ignition effect of ${cardInstanceId}`;
  }

  /**
   * 指定カードインスタンスの起動効果が発動可能か判定する
   *
   * チェック項目:
   * - ゲーム終了状態でないこと
   * - 対象カードがフィールドに表側表示で存在すること
   * - 効果レジストリに効果処理が登録されていること
   * - カード固有の発動条件を満たしていること
   */
  canExecute(state: GameState): ValidationResult {
    // ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return validationFailure(ValidationErrorCode.GAME_OVER);
    }

    // 対象カードがフィールドに表側表示で存在すること
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return validationFailure(ValidationErrorCode.CARD_NOT_FOUND);
    }
    const validLocations = ["fieldZone", "spellTrapZone", "mainMonsterZone"];
    if (!validLocations.includes(cardInstance.location)) {
      return validationFailure(ValidationErrorCode.CARD_NOT_ON_FIELD);
    }
    if (cardInstance.position !== "faceUp") {
      return validationFailure(ValidationErrorCode.CARD_NOT_FACE_UP);
    }

    // 効果レジストリに効果処理が登録されていること
    const cardId = cardInstance.id;
    if (cardId !== 67616300) {
      return validationFailure(ValidationErrorCode.NO_IGNITION_EFFECT);
    }

    // カード固有の発動条件を満たしていること
    const ignitionEffect = new ChickenGameIgnitionEffect(this.cardInstanceId); // 現在はチキンレース固定
    if (!ignitionEffect.canActivate(state)) {
      return validationFailure(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
    }

    return validationSuccess();
  }

  /**
   * 起動効果の発動処理・解決処理ステップ配列を生成して返す
   *
   * 処理フロー:
   * 1. TODO: 要整理
   *
   * Note: 効果処理ステップは、Application 層に返された後に逐次実行される。
   */
  execute(state: GameState): GameStateUpdateResult {
    // Validate
    const validation = this.canExecute(state);
    if (!validation.canExecute) {
      return createFailureResult(state, getValidationErrorMessage(validation));
    }

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card instance ${this.cardInstanceId} not found`);
    }

    // Instantiate Chicken Game ignition effect
    const ignitionEffect = new ChickenGameIgnitionEffect(this.cardInstanceId);

    // Get activation and resolution steps
    const activationSteps = ignitionEffect.createActivationSteps(state);
    const resolutionSteps = ignitionEffect.createResolutionSteps(state, this.cardInstanceId);

    // Combine activation and resolution steps into a single sequence
    const allEffectSteps = [...activationSteps, ...resolutionSteps];

    // Return result with all effect steps (delegate to Application Layer)
    // Application Layer will execute all steps sequentially with proper notifications
    return {
      success: true,
      updatedState: state,
      message: `Ignition effect activated: ${this.cardInstanceId}`,
      effectSteps: allEffectSteps,
    };
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
