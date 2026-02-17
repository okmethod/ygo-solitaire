/**
 * ActivateSpellCommand - 魔法カード発動コマンド
 *
 * 手札またはフィールドにセットされた魔法カードを発動する Command パターン実装。
 * TODO: チェーンシステムに対応する。
 *
 * @module domain/commands/ActivateSpellCommand
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot, CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { GameCommand, GameCommandResult } from "$lib/domain/models/Command";
import { Command } from "$lib/domain/models/Command";
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

    // 2. 更新後状態の構築
    const updatedActivatedCards = new Set(state.activatedCardIds);
    updatedActivatedCards.add(cardInstance.id);
    const updatedState: GameSnapshot = {
      ...state,
      space: this.moveActivatedSpellCard(state.space, cardInstance),
      activatedCardIds: updatedActivatedCards, // 発動済みカードIDを記録
    };

    // 3. 戻り値の構築
    return Command.Result.success(
      updatedState,
      `Spell card activated: ${this.cardInstanceId}`,
      [],
      this.buildEffectSteps(updatedState, cardInstance),
    );
  }

  /**
   * 発動した魔法カードを適切なゾーンに表向きで配置する
   *
   * - 手札から発動: 適切なゾーンに表向きで配置
   *   - 通常魔法/速攻魔法 → 魔法・罠ゾーン
   *   - フィールド魔法 → フィールドゾーン（既存のフィールド魔法は墓地へ）
   * - セットから発動: 同じゾーンに表向きで配置
   */
  private moveActivatedSpellCard(space: CardSpace, cardInstance: CardInstance): CardSpace {
    // 手札から発動: 魔法・罠ゾーン or フィールドゾーンに表向きで配置
    if (cardInstance.location === "hand") {
      // フィールド魔法の場合
      if (Card.isFieldSpell(cardInstance)) {
        const sweepedFieldSpellSpace = GameState.Space.sendExistingFieldSpellToGraveyard(space);
        return GameState.Space.moveCard(sweepedFieldSpellSpace, cardInstance, "fieldZone", {
          position: "faceUp",
        });
      }

      // 通常魔法/速攻魔法の場合
      return GameState.Space.moveCard(space, cardInstance, "spellTrapZone", {
        position: "faceUp",
      });
    }

    // セットから発動: 同じゾーンに表向きで配置
    return GameState.Space.updateCardStateInPlace(space, cardInstance, {
      position: "faceUp",
    });
  }

  // 効果処理ステップ配列を生成する
  // Note: 発動条件は canExecute でチェック済みのため、ここでは再チェックしない
  // Note: 通常魔法・速攻魔法の墓地送りは、ChainableAction 側で処理される
  // Note: トリガールール（魔力カウンター等）は effectQueueStore がイベントを検出して自動挿入
  private buildEffectSteps(state: GameSnapshot, cardInstance: CardInstance): AtomicStep[] {
    const steps: AtomicStep[] = [];

    // カード固有の効果ステップ（イベント発行は BaseSpellActivation 内で行われる）
    const activation = ChainableActionRegistry.getActivation(cardInstance.id);
    if (activation) {
      steps.push(...activation.createActivationSteps(state, cardInstance));
      steps.push(...activation.createResolutionSteps(state, cardInstance));
    }

    return steps;
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
