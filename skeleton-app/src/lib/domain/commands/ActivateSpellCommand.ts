/**
 * ActivateSpellCommand - 魔法カード発動コマンド
 *
 * 手札またはフィールドにセットされた魔法カードを発動する Command パターン実装。
 * TODO: 効果レジストリに登録されていない場合はエラーにした方が良いが、テストの都合上エラーにしていない
 * TODO: チェーンシステムに対応する。
 *
 * @module domain/commands/ActivateSpellCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameCommand } from "$lib/domain/models/GameCommand";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { CardInstance } from "$lib/domain/models/Card";
import type { Zones } from "$lib/domain/models/Zone";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { findCardInstance } from "$lib/domain/models/Zone";
import { successUpdateResult, failureUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { isSpellCard, isFieldSpellCard } from "$lib/domain/models/Card";
import { moveCard, updateCardInPlace } from "$lib/domain/models/Zone";
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
import {
  ValidationErrorCode,
  successValidationResult,
  failureValidationResult,
  validationErrorMessage,
} from "$lib/domain/models/ValidationResult";

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
   * 2. 指定カードが手札、またはフィールドに存在し、魔法カードであること
   * 3. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
   * 4. 効果レジストリに登録されている場合、カード固有の発動条件を満たしていること
   *
   * TODO: フィールドにある場合は、裏側状態チェックも必要
   *
   * Note: フェイズ判定・速攻魔法のセットターン制限は ChainableAction 側でチェック
   */
  canExecute(state: GameState): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return failureValidationResult(ValidationErrorCode.GAME_OVER);
    }

    const cardInstance = findCardInstance(state.zones, this.cardInstanceId);

    // 2. 指定カードが手札、またはフィールドに存在し、魔法カードであること
    if (!cardInstance) {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_FOUND);
    }
    if (!(["hand", "spellTrapZone", "fieldZone"] as string[]).includes(cardInstance.location)) {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_IN_VALID_LOCATION);
    }
    if (!isSpellCard(cardInstance)) {
      return failureValidationResult(ValidationErrorCode.NOT_SPELL_CARD);
    }

    // 3. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
    if (!isFieldSpellCard(cardInstance) && state.zones.spellTrapZone.length >= 5) {
      return failureValidationResult(ValidationErrorCode.SPELL_TRAP_ZONE_FULL);
    }

    // 4. 効果レジストリに登録されている場合、カード固有の発動条件を満たしていること
    const activation = ChainableActionRegistry.getActivation(cardInstance.id);
    if (activation) {
      const activationResult = activation.canActivate(state, cardInstance);
      if (!activationResult.isValid) {
        return activationResult;
      }
    }

    return successValidationResult();
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
  execute(state: GameState): GameStateUpdateResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return failureUpdateResult(state, validationErrorMessage(validationResult));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = findCardInstance(state.zones, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedActivatedCards = new Set(state.activatedOncePerTurnCards);
    updatedActivatedCards.add(cardInstance.id);
    const updatedState: GameState = {
      ...state,
      zones: this.moveActivatedSpellCard(state.zones, cardInstance),
      activatedOncePerTurnCards: updatedActivatedCards, // 発動済みカードIDを記録
    };

    // 3. 戻り値の構築
    return successUpdateResult(
      updatedState,
      `Spell card activated: ${this.cardInstanceId}`,
      this.buildEffectSteps(updatedState, cardInstance),
    );
  }

  /**
   * 発動した魔法カードを適切なゾーンに表向きで配置する
   *
   * - 手札から発動: 適切なゾーンに表向きで配置
   *   - 通常魔法/速攻魔法 → 魔法・罠ゾーン
   *   - フィールド魔法 → フィールドゾーン
   * - セットから発動: 同じゾーンに表向きで配置
   */
  private moveActivatedSpellCard(zones: Zones, cardInstance: CardInstance): Zones {
    const activatedCardState: Partial<CardInstance> = {
      position: "faceUp",
      placedThisTurn: true,
    };

    // 手札から発動: 魔法・罠ゾーン or フィールドゾーンに表向きで配置
    if (cardInstance!.location === "hand") {
      const targetZone = isFieldSpellCard(cardInstance) ? "fieldZone" : "spellTrapZone";
      return moveCard(zones, cardInstance, targetZone, activatedCardState);
    }

    // セットから発動: 同じゾーンに表向きで配置
    return updateCardInPlace(zones, cardInstance, activatedCardState);
  }

  // 効果処理ステップ配列を生成する
  // Note: 発動条件は canExecute でチェック済みのため、ここでは再チェックしない
  // Note: 通常魔法・速攻魔法の墓地送りは、ChainableAction 側で処理される
  private buildEffectSteps(state: GameState, cardInstance: CardInstance): AtomicStep[] {
    const steps: AtomicStep[] = [];

    // 魔法発動トリガーの追加ルールステップ（各ルールが自身のステップを生成）
    const triggerContext = {
      triggerEvent: "spellActivated" as const,
      triggerSourceCardId: cardInstance.id,
      triggerSourceInstanceId: cardInstance.instanceId,
    };
    const triggerSteps = AdditionalRuleRegistry.collectTriggerSteps(state, "spellActivated", triggerContext);
    steps.push(...triggerSteps);

    // カード固有の効果ステップ
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
