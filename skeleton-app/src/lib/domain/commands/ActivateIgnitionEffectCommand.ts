/**
 * ActivateIgnitionEffectCommand - 起動効果発動コマンド
 *
 * フィールドに表側表示で存在するカードの起動効果を発動する Command パターン実装。
 * TODO: 現状「チキンレース」のハードコードとなっている。別の起動効果も扱えるように汎用化する。
 * TODO: チェーンシステムに対応する。
 *
 * @module domain/commands/ActivateIgnitionEffectCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand } from "$lib/domain/models/GameCommand";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { findCardInstance } from "$lib/domain/models/GameState";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { isMainPhase } from "$lib/domain/rules/PhaseRule";
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
   * 1. ゲーム終了状態でないこと
   * 2. メインフェイズであること
   * 3. 指定カードがフィールドに存在し、表側表示であること
   * 4. 効果レジストリに登録されている場合、カード固有の発動条件を満たしていること
   */
  canExecute(state: GameState): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return validationFailure(ValidationErrorCode.GAME_OVER);
    }

    // 2. メインフェイズであること
    if (!isMainPhase(state.phase)) {
      return validationFailure(ValidationErrorCode.NOT_MAIN_PHASE);
    }

    // 3. 指定カードがフィールドに存在し、表側表示であること
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

    // 4. 効果レジストリに登録されている場合、カード固有の発動条件を満たしていること
    // 現在はチキンレース固定
    const cardId = cardInstance.id;
    if (cardId !== 67616300) {
      return validationFailure(ValidationErrorCode.NO_IGNITION_EFFECT);
    }
    const ignitionEffect = new ChickenGameIgnitionEffect(this.cardInstanceId);
    if (!ignitionEffect.canActivate(state)) {
      return validationFailure(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
    }

    return validationSuccess();
  }

  /**
   * 起動効果の効果処理ステップ配列を生成して返す
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築
   * 3. 戻り値の構築
   *
   * Note: 効果処理は、Application 層に返された後に実行される
   */
  execute(state: GameState): GameStateUpdateResult {
    // 1. 実行可能性判定
    const validation = this.canExecute(state);
    if (!validation.canExecute) {
      return createFailureResult(state, getValidationErrorMessage(validation));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = findCardInstance(state, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedState: GameState = {
      ...state, // 起動効果発動に伴う状態変化は特に無し
    };

    // 3. 戻り値の構築
    return {
      success: true,
      updatedState,
      message: `Ignition effect activated: ${this.cardInstanceId}`,
      effectSteps: this.buildEffectSteps(updatedState, cardInstance),
    };
  }

  // 効果処理ステップ配列を生成する
  private buildEffectSteps(state: GameState, cardInstance: CardInstance): AtomicStep[] {
    const ignitionEffect = new ChickenGameIgnitionEffect(cardInstance.instanceId);
    const activationSteps = ignitionEffect.createActivationSteps(state);
    const resolutionSteps = ignitionEffect.createResolutionSteps(state, this.cardInstanceId);
    const allEffectSteps = [...activationSteps, ...resolutionSteps];
    return allEffectSteps;
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
