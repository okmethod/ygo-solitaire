/**
 * ActivateIgnitionEffectCommand - 起動効果発動コマンド
 *
 * フィールドに表側表示で存在するカードの起動効果を発動する Command パターン実装。
 * ChainableActionRegistry から起動効果を取得し、汎用的に発動する。
 *
 * TODO: チェーンシステムに対応する。
 *
 * @module domain/commands/ActivateIgnitionEffectCommand
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { GameCommand } from "$lib/domain/models/GameCommand";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { CardInstance, StateOnField } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ChainableAction } from "$lib/domain/models/ChainableAction";
import { findCardInstance, updateCardInPlace } from "$lib/domain/models/Zone";
import { successUpdateResult, failureUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { isFaceUp } from "$lib/domain/models/Card";
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
import {
  ValidationErrorCode,
  successValidationResult,
  failureValidationResult,
  validationErrorMessage,
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
   * 2. 指定カードがフィールドに存在し、表側表示であること
   * 3. 起動効果がレジストリに登録されていること
   * 4. カード固有の発動条件を満たし発動可能な起動効果が存在すること
   *
   * Note: フェイズ判定は ChainableAction 側でチェック
   */
  canExecute(state: GameState): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return failureValidationResult(ValidationErrorCode.GAME_OVER);
    }

    // 2. 指定カードがフィールドに存在し、表側表示であること
    const cardInstance = findCardInstance(state.zones, this.cardInstanceId);
    if (!cardInstance) {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_FOUND);
    }
    const validLocations = ["fieldZone", "spellTrapZone", "mainMonsterZone"];
    if (!validLocations.includes(cardInstance.location)) {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_ON_FIELD);
    }
    if (!isFaceUp(cardInstance)) {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_FACE_UP);
    }

    // 4. 起動効果がレジストリに登録されていること
    const ignitionEffects = ChainableActionRegistry.getIgnitionEffects(cardInstance.id);
    if (ignitionEffects.length === 0) {
      return failureValidationResult(ValidationErrorCode.NO_IGNITION_EFFECT);
    }

    // 5. カード固有の発動条件を満たし発動可能な起動効果が存在すること
    const activatableEffect = this.findActivatableEffect(ignitionEffects, state, cardInstance);
    if (!activatableEffect) {
      return failureValidationResult(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
    }

    return successValidationResult();
  }

  /**
   * 発動可能な起動効果を探す
   * 複数の起動効果がある場合、最初に発動可能なものを返す
   *
   * TODO: 複数の起動効果を選択できるようにする
   */
  private findActivatableEffect(
    effects: ChainableAction[],
    state: GameState,
    cardInstance: CardInstance,
  ): ChainableAction | undefined {
    return effects.find((effect) => effect.canActivate(state, cardInstance).isValid);
  }

  /**
   * 起動効果の効果処理ステップ配列を生成して返す
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築（発動記録を含む）
   * 3. 戻り値の構築
   *
   * Note: 効果処理は、Application 層に返された後に実行される
   */
  execute(state: GameState): GameStateUpdateResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return failureUpdateResult(state, validationErrorMessage(validationResult));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = findCardInstance(state.zones, this.cardInstanceId)!;
    // activatableEffect は canExecute で存在が保証されている
    const ignitionEffects = ChainableActionRegistry.getIgnitionEffects(cardInstance.id);
    const activatableEffect = this.findActivatableEffect(ignitionEffects, state, cardInstance)!;

    // 2. 更新後状態の構築
    const currentStateOnField = cardInstance.stateOnField!;
    const updatedActivatedEffects = new Set(currentStateOnField.activatedEffects);
    updatedActivatedEffects.add(activatableEffect.effectId);
    const updatedStateOnField: StateOnField = {
      ...currentStateOnField,
      activatedEffects: updatedActivatedEffects, // 発動済み効果IDを記録
    };

    const updatedZones = updateCardInPlace(state.zones, cardInstance, {
      stateOnField: updatedStateOnField,
    });

    const updatedState: GameState = {
      ...state,
      zones: updatedZones,
    };

    // 3. 戻り値の構築
    return successUpdateResult(
      updatedState,
      `Ignition effect activated: ${this.cardInstanceId}`,
      this.buildEffectSteps(updatedState, cardInstance, activatableEffect),
    );
  }

  /**
   * 効果処理ステップ配列を生成する
   * Note: 発動条件は canExecute でチェック済みのため、ここでは再チェックしない
   */
  private buildEffectSteps(state: GameState, cardInstance: CardInstance, effect: ChainableAction): AtomicStep[] {
    const activationSteps = effect.createActivationSteps(state, cardInstance);
    const resolutionSteps = effect.createResolutionSteps(state, cardInstance);
    return [...activationSteps, ...resolutionSteps];
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
