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
import { isSpellCard, isQuickPlaySpellCard, isFieldSpellCard } from "$lib/domain/models/Card";
import { moveCard, updateCardInPlace } from "$lib/domain/models/Zone";
import { isMainPhase } from "$lib/domain/models/Phase";
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
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
   * TODO: ChainableAction 側の発動条件と一部重複しているため、整理する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * 2. メインフェイズであること
   * 3. 指定カードが手札、またはフィールドに存在し、魔法カードであること
   * 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
   * 5. 速攻魔法の場合、セットしたターンでは無いこと
   * 6. 効果レジストリに登録されている場合、カード固有の発動条件を満たしていること
   */
  canExecute(state: GameState): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return failureValidationResult(ValidationErrorCode.GAME_OVER);
    }

    // 2. メインフェイズであること
    if (!isMainPhase(state.phase)) {
      return failureValidationResult(ValidationErrorCode.NOT_MAIN_PHASE);
    }

    const cardInstance = findCardInstance(state.zones, this.cardInstanceId);

    // 3. 指定カードが手札、またはフィールドに存在し、魔法カードであること
    if (!cardInstance) {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_FOUND);
    }
    if (!(["hand", "spellTrapZone", "fieldZone"] as string[]).includes(cardInstance.location)) {
      return failureValidationResult(ValidationErrorCode.CARD_NOT_IN_VALID_LOCATION);
    }
    if (!isSpellCard(cardInstance)) {
      return failureValidationResult(ValidationErrorCode.NOT_SPELL_CARD);
    }

    // 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
    if (!isFieldSpellCard(cardInstance) && state.zones.spellTrapZone.length >= 5) {
      return failureValidationResult(ValidationErrorCode.SPELL_TRAP_ZONE_FULL);
    }

    // 5. 速攻魔法の場合、セットしたターンでは無いこと
    if (isQuickPlaySpellCard(cardInstance) && cardInstance.placedThisTurn) {
      return failureValidationResult(ValidationErrorCode.QUICK_PLAY_RESTRICTION);
    }

    // 6. 効果レジストリに登録されている場合、カード固有の発動条件を満たしていること
    const chainableAction = ChainableActionRegistry.get(cardInstance.id);
    if (chainableAction && !chainableAction.canActivate(state, cardInstance)) {
      return failureValidationResult(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
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
    const validation = this.canExecute(state);
    if (!validation.canExecute) {
      return failureUpdateResult(state, validationErrorMessage(validation));
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
    const chainableAction = ChainableActionRegistry.get(cardInstance.id);
    if (chainableAction) {
      return [
        ...chainableAction.createActivationSteps(state, cardInstance),
        ...chainableAction.createResolutionSteps(state, cardInstance),
      ];
    }
    return [];
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
