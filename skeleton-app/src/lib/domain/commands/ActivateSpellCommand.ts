/**
 * ActivateSpellCommand - 魔法カード発動コマンド
 *
 * 手札またはフィールドにセットされた魔法カードを発動する Command パターン実装。
 *
 * @module domain/commands/ActivateSpellCommand
 */

import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { GameCommand, GameCommandResult } from "$lib/domain/models/Command";
import { Command } from "$lib/domain/models/Command";
import { placeCardForActivation } from "$lib/domain/rules/ActivationRule";
import { ChainableActionRegistry } from "$lib/domain/effects/actions";

/** 魔法カード発動コマンドクラス */
export class ActivateSpellCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Activate spell card ${cardInstanceId}`;
  }

  /**
   * 指定カードインスタンスの魔法カードが発動可能か判定する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * 2. 指定カードが魔法カードであること
   * 3. 手札にある、またはフィールドにセットされていること
   * 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
   * 5. 効果レジストリに登録されている場合、カード固有の発動条件を満たしていること
   *
   * Note: フェイズ判定・速攻魔法のセットターン制限は ChainableAction 側でチェック
   */
  canExecute(state: GameSnapshot): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.GAME_OVER);
    }

    // 2. 指定カードが魔法カードであること
    const cardInstance = GameState.Space.findCard(state.space, this.cardInstanceId);
    if (!cardInstance) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_FOUND);
    }
    if (!Card.isSpell(cardInstance)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_SPELL_CARD);
    }

    // 3. 手札にある、またはフィールドにセットされていること
    if (
      !Card.Instance.inHand(cardInstance) &&
      !(Card.Instance.onField(cardInstance) && Card.Instance.isFaceDown(cardInstance))
    ) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_IN_VALID_LOCATION);
    }

    // 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
    if (!Card.isFieldSpell(cardInstance) && GameState.Space.isSpellTrapZoneFull(state.space)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL);
    }

    // 5. 効果レジストリに登録されていること
    const activation = ChainableActionRegistry.getActivation(cardInstance.id);
    if (!activation) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.EFFECT_NOT_REGISTERED);
    }

    // 6. カード固有の発動条件を満たしていること
    const activationResult = activation.canActivate(state, cardInstance);
    if (!activationResult.isValid) {
      return activationResult;
    }

    return GameProcessing.Validation.success();
  }

  /**
   * 魔法カードの効果処理ステップ配列を生成して返す
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築
   * 3. 戻り値の構築
   *
   * Note: 効果処理は、アプリ層に返された後に実行される
   */
  execute(state: GameSnapshot): GameCommandResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return Command.Result.failure(state, GameProcessing.Validation.errorMessage(validationResult));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = GameState.Space.findCard(state.space, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedState: GameSnapshot = {
      ...state,
      space: placeCardForActivation(state.space, cardInstance),
      activatedCardIds: GameState.updatedActivatedCardIds(state.activatedCardIds, cardInstance.id),
    };

    // 3. 戻り値の構築
    const activation = ChainableActionRegistry.getActivation(cardInstance.id);
    const activationSteps = activation?.createActivationSteps(updatedState, cardInstance) ?? [];
    const resolutionSteps = activation?.createResolutionSteps(updatedState, cardInstance) ?? [];
    const chainBlock = activation
      ? {
          effectId: activation.effectId,
          sourceInstanceId: cardInstance.instanceId,
          sourceCardId: cardInstance.id,
          spellSpeed: activation.spellSpeed,
          resolutionSteps,
          isNegated: false,
        }
      : undefined;

    return Command.Result.success(
      updatedState,
      `Spell card activated: ${this.cardInstanceId}`,
      [],
      activationSteps,
      chainBlock,
    );
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
