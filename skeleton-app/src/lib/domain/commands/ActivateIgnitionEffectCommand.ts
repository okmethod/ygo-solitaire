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

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { GameCommand, GameCommandResult } from "$lib/domain/models/Command";
import { Command } from "$lib/domain/models/Command";
import type { ChainableAction } from "$lib/domain/models/Effect";
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";

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
  canExecute(state: GameSnapshot): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.GAME_OVER);
    }

    // 2. 指定カードがフィールドに存在し、表側表示であること
    const cardInstance = GameState.Space.findCard(state.space, this.cardInstanceId);
    if (!cardInstance) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_FOUND);
    }
    const validLocations = ["fieldZone", "spellTrapZone", "mainMonsterZone"];
    if (!validLocations.includes(cardInstance.location)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_ON_FIELD);
    }
    if (!Card.Instance.isFaceUp(cardInstance)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_FACE_UP);
    }

    // 4. 起動効果がレジストリに登録されていること
    const ignitionEffects = ChainableActionRegistry.getIgnitionEffects(cardInstance.id);
    if (ignitionEffects.length === 0) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NO_IGNITION_EFFECT);
    }

    // 5. カード固有の発動条件を満たし発動可能な起動効果が存在すること
    const activatableEffect = this.findActivatableEffect(ignitionEffects, state, cardInstance);
    if (!activatableEffect) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
    }

    return GameProcessing.Validation.success();
  }

  /**
   * 発動可能な起動効果を探す
   * 複数の起動効果がある場合、最初に発動可能なものを返す
   *
   * TODO: 複数の起動効果を選択できるようにする
   */
  private findActivatableEffect(
    effects: ChainableAction[],
    state: GameSnapshot,
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
  execute(state: GameSnapshot): GameCommandResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return Command.Result.failure(state, GameProcessing.Validation.errorMessage(validationResult));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = GameState.Space.findCard(state.space, this.cardInstanceId)!;
    // activatableEffect は canExecute で存在が保証されている
    const ignitionEffects = ChainableActionRegistry.getIgnitionEffects(cardInstance.id);
    const activatableEffect = this.findActivatableEffect(ignitionEffects, state, cardInstance)!;

    // 2. 更新後状態の構築
    const currentStateOnField = cardInstance.stateOnField!;
    const updatedActivatedEffects = new Set(currentStateOnField.activatedEffects);
    updatedActivatedEffects.add(activatableEffect.effectId);

    const updatedState: GameSnapshot = {
      ...state,
      space: GameState.Space.updateCardStateInPlace(state.space, cardInstance, {
        activatedEffects: updatedActivatedEffects, // 発動記録の更新
      }),
    };

    // 3. 戻り値の構築
    return Command.Result.success(
      updatedState,
      `Ignition effect activated: ${this.cardInstanceId}`,
      [],
      this.buildEffectSteps(updatedState, cardInstance, activatableEffect),
    );
  }

  /**
   * 効果処理ステップ配列を生成する
   * Note: 発動条件は canExecute でチェック済みのため、ここでは再チェックしない
   */
  private buildEffectSteps(state: GameSnapshot, cardInstance: CardInstance, effect: ChainableAction): AtomicStep[] {
    const activationSteps = effect.createActivationSteps(state, cardInstance);
    const resolutionSteps = effect.createResolutionSteps(state, cardInstance);
    return [...activationSteps, ...resolutionSteps];
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
