/**
 * ActivateSpellCommand - 魔法カード発動コマンド
 *
 * 手札またはフィールドにセットされた魔法カードを発動する Command パターン実装。
 * TODO: canExecute を、 execute 内で再利用するように修正する。
 * TODO: チェーンシステムに対応する。
 *
 * @module domain/commands/ActivateSpellCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { createSuccessResult, createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { moveCard, sendToGraveyard } from "$lib/domain/models/Zone";
import { canActivateSpell } from "$lib/domain/rules/SpellActivationRule";
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";

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
   * 2. 魔法カード発動ルールを満たしていること
   * 3. TODO: 3以降は要整理
   */
  canExecute(state: GameState): boolean {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return false;
    }

    // 2. 魔法カード発動ルールを満たしていること
    const validationResult = canActivateSpell(state, this.cardInstanceId);
    if (!validationResult.canExecute) {
      return false;
    }

    // Check card-specific effect requirements (if registered)
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (cardInstance) {
      const cardId = cardInstance.id; // CardInstance extends CardData
      const chainableAction = ChainableActionRegistry.get(cardId);

      if (chainableAction && !chainableAction.canActivate(state)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 魔法カードの発動処理・解決処理ステップ配列を生成して返す
   *
   * 処理フロー:
   * 1. TODO: 要整理
   *
   * Note: 効果処理ステップは、Application 層に返された後に逐次実行される。
   */
  execute(state: GameState): GameStateUpdateResult {
    // Validate activation
    const validationResult = canActivateSpell(state, this.cardInstanceId);
    if (!validationResult.canExecute) {
      return createFailureResult(state, validationResult.reason || "Cannot activate spell card");
    }

    // Step 2: Effect execution based on card ID
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card instance ${this.cardInstanceId} not found`);
    }

    const cardId = cardInstance.id; // CardInstance extends CardData

    // Check card-specific activation conditions (before moving to field)
    const chainableAction = ChainableActionRegistry.get(cardId);
    if (chainableAction && !chainableAction.canActivate(state)) {
      return createFailureResult(state, "発動条件を満たしていません");
    }

    // Step 1: Determine source and target zones (T030-3)
    const sourceZone = cardInstance.location; // hand, spellTrapZone, or fieldZone

    // If card is already in a field zone (spellTrapZone/fieldZone), it's being activated from set position
    // Otherwise, it's being activated from hand
    let zonesAfterActivation = state.zones;

    if (sourceZone === "hand") {
      // Activating from hand: move to appropriate zone face-up
      const targetZone = cardInstance.spellType === "field" ? "fieldZone" : "spellTrapZone";
      zonesAfterActivation = moveCard(state.zones, this.cardInstanceId, "hand", targetZone, "faceUp");
    } else if (sourceZone === "spellTrapZone" || sourceZone === "fieldZone") {
      // Activating from set position: just flip to face-up (stay in same zone)
      zonesAfterActivation = {
        ...state.zones,
        [sourceZone]: state.zones[sourceZone].map((card) =>
          card.instanceId === this.cardInstanceId ? { ...card, position: "faceUp" as const } : card,
        ),
      };
    } else {
      return createFailureResult(state, `Cannot activate spell from ${sourceZone}`);
    }

    // Create intermediate state for effect resolution using spread syntax
    const stateAfterActivation: GameState = {
      ...state,
      zones: zonesAfterActivation,
    };

    // Check ChainableActionRegistry for card effect
    if (chainableAction && chainableAction.canActivate(stateAfterActivation)) {
      // Get activation and resolution steps
      const activationSteps = chainableAction.createActivationSteps(stateAfterActivation);
      const resolutionSteps = chainableAction.createResolutionSteps(stateAfterActivation, this.cardInstanceId);

      // Combine activation and resolution steps into a single sequence
      const allEffectSteps = [...activationSteps, ...resolutionSteps];

      // Return result with all effect steps (delegate to Application Layer)
      // Application Layer will execute all steps sequentially with proper notifications
      return {
        success: true,
        newState: stateAfterActivation,
        message: `Spell card activated: ${this.cardInstanceId}`,
        effectSteps: allEffectSteps,
      };
    }

    // No effect registered - send directly to graveyard
    const zonesAfterResolution = sendToGraveyard(zonesAfterActivation, this.cardInstanceId);

    // Create new state with updated zones using spread syntax
    const newState: GameState = {
      ...state,
      zones: zonesAfterResolution,
    };

    return createSuccessResult(newState, `Spell card activated (no effect): ${this.cardInstanceId}`);
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
