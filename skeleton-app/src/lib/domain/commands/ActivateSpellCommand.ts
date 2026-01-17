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
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import type { CardInstance } from "$lib/domain/models/Card";
import type { Zones } from "$lib/domain/models/Zone";
import { findCardInstance } from "$lib/domain/models/GameState";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { moveCard, sendToGraveyard, updateCardInPlace } from "$lib/domain/models/Zone";
import { isMainPhase } from "$lib/domain/rules/PhaseRule";
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
import {
  ValidationErrorCode,
  validationSuccess,
  validationFailure,
  getValidationErrorMessage,
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
   * 2. メインフェイズであること
   * 3. 指定カードが手札、またはフィールドに存在し、魔法カードであること
   * 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
   * 5. 速攻魔法の場合、セットしたターンでは無いこと
   * 6. 効果レジストリに登録されている場合、カード固有の発動条件を満たしていること
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

    const cardInstance = findCardInstance(state, this.cardInstanceId);

    // 3. 指定カードが手札、またはフィールドに存在し、魔法カードであること
    if (!cardInstance) {
      return validationFailure(ValidationErrorCode.CARD_NOT_FOUND);
    }
    if (!(["hand", "spellTrapZone", "fieldZone"] as string[]).includes(cardInstance.location)) {
      return validationFailure(ValidationErrorCode.CARD_NOT_IN_VALID_LOCATION);
    }
    if (cardInstance.type !== "spell") {
      return validationFailure(ValidationErrorCode.NOT_SPELL_CARD);
    }

    // 4. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
    if (cardInstance.spellType !== "field" && state.zones.spellTrapZone.length >= 5) {
      return validationFailure(ValidationErrorCode.SPELL_TRAP_ZONE_FULL);
    }

    // 5. 速攻魔法の場合、セットしたターンでは無いこと
    if (cardInstance.spellType === "quick-play" && cardInstance.placedThisTurn) {
      return validationFailure(ValidationErrorCode.QUICK_PLAY_RESTRICTION);
    }

    // 6. 効果レジストリに登録されている場合、カード固有の発動条件を満たしていること
    const chainableAction = ChainableActionRegistry.get(cardInstance.id);
    if (chainableAction && !chainableAction.canActivate(state)) {
      return validationFailure(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
    }

    return validationSuccess();
  }

  /**
   * 魔法カードの効果処理ステップ配列を生成して返す
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. カードの配置(手札→フィールド or セット→表向き)
   * 3. 効果処理ステップ配列の生成(レジストリ登録されている場合)
   * 4. 戻り値の構築
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

    // 2. カードの配置(手札→フィールド or セット→表向き)
    const updatedState: GameState = {
      ...state,
      zones: this.moveActivatedSpellCard(state.zones, cardInstance),
    };

    // 3. 効果処理ステップ配列の生成(レジストリ登録されている場合)
    const chainableAction = ChainableActionRegistry.get(cardInstance.id);
    const effectSteps = chainableAction?.canActivate(updatedState)
      ? [
          ...chainableAction.createActivationSteps(updatedState),
          ...chainableAction.createResolutionSteps(updatedState, this.cardInstanceId),
        ]
      : undefined;

    // 4. 戻り値の構築
    return {
      success: true,
      updatedState: effectSteps
        ? updatedState
        : // 効果処理がない場合: カードを墓地へ送る
          {
            ...updatedState,
            zones: sendToGraveyard(updatedState.zones, this.cardInstanceId),
          },
      message: `Spell card activated: ${this.cardInstanceId}`,
      effectSteps,
    };
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
      const targetZone = cardInstance!.spellType === "field" ? "fieldZone" : "spellTrapZone";
      return moveCard(zones, this.cardInstanceId, "hand", targetZone, activatedCardState);
    }

    // セットから発動: 同じゾーンに表向きで配置
    return updateCardInPlace(zones, this.cardInstanceId, activatedCardState);
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
