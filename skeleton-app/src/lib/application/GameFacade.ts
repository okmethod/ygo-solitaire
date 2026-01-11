/**
 * GameFacade - 全てのゲーム操作の唯一の入り口（Single Entry Point）
 *
 * IMPORTANT REMINDER: Application Layer - レイヤー間依存ルール
 * - Application Layer は Domain Layer に依存できる
 * - Presentation Layer は Application Layer（GameFacade、Stores）のみに依存する
 * - Presentation Layer は Domain Layer に直接依存してはいけない
 *
 * @module application/GameFacade
 */

import type { GameState } from "$lib/domain/models/GameState";
import { gameStateStore, resetGameState, getCurrentGameState } from "./stores/gameStateStore";
import { DrawCardCommand } from "$lib/domain/commands/DrawCardCommand";
import { AdvancePhaseCommand } from "$lib/domain/commands/AdvancePhaseCommand";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { ActivateIgnitionEffectCommand } from "$lib/domain/commands/ActivateIgnitionEffectCommand";
import { ShuffleDeckCommand } from "$lib/domain/commands/ShuffleDeckCommand";
import { SummonMonsterCommand } from "$lib/domain/commands/SummonMonsterCommand";
import { SetMonsterCommand } from "$lib/domain/commands/SetMonsterCommand";
import { SetSpellTrapCommand } from "$lib/domain/commands/SetSpellTrapCommand";
import { canActivateSpell } from "$lib/domain/rules/SpellActivationRule";
import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";
import "$lib/domain/effects"; // Initialize ChainableActionRegistry and AdditionalRuleRegistry

/**
 * 全ゲーム操作の唯一の入り口（Single Entry Point）
 */
export class GameFacade {
  /** デッキを初期化する TODO: deckCardIds: number[] が引数として適切かどうか確認する */
  initializeGame(deckCardIds: number[]): void {
    resetGameState(deckCardIds);
  }

  /** 現在のゲーム状態全体を取得する
   *
   * Note: 個別の各種情報は、derivedStores から取得する。
   */
  getGameState(): GameState {
    return getCurrentGameState();
  }

  /** 次のフェイズに進行する */
  advancePhase(): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentGameState();
    const command = new AdvancePhaseCommand();

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /** デッキをシャッフルする */
  shuffleDeck(): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentGameState();
    const command = new ShuffleDeckCommand();

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /** デッキから指定枚数のカードをドローする */
  drawCard(count: number = 1): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentGameState();
    const command = new DrawCardCommand(count);

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /** 指定したカード(インスタンス) が発動可能かどうかを返す */
  canActivateCard(cardInstanceId: string): boolean {
    const currentState = getCurrentGameState();
    const validation = canActivateSpell(currentState, cardInstanceId);
    return validation.canActivate;
  }

  /** セットされた魔法カードが発動可能かどうかを返す TODO: canActivateCardと重複してそう。不要なら削除する。*/
  canActivateSetSpell(cardInstanceId: string): boolean {
    const currentState = getCurrentGameState();
    const validation = canActivateSpell(currentState, cardInstanceId);
    return validation.canActivate;
  }

  /** 指定した魔法カードを手札から発動する TODO: 魔法カードのみかどうか確認する。手札からのみかどうか確認する。*/
  activateSpell(cardInstanceId: string): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentGameState();
    const command = new ActivateSpellCommand(cardInstanceId);

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);

      // If effectSteps are returned, delegate to Application Layer
      if (result.effectSteps && result.effectSteps.length > 0) {
        effectResolutionStore.startResolution(result.effectSteps);
      }
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /** 指定したカード(インスタンス) の起動効果が発動可能かどうかを返す */
  canActivateIgnitionEffect(cardInstanceId: string): boolean {
    const currentState = getCurrentGameState();
    const command = new ActivateIgnitionEffectCommand(cardInstanceId);
    return command.canExecute(currentState);
  }

  /** 指定したカード(インスタンス) の起動効果を発動する TODO: GameStateUpdateResult の一部を切り出したInterfaceを定義するべきかも */
  activateIgnitionEffect(cardInstanceId: string): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentGameState();
    const command = new ActivateIgnitionEffectCommand(cardInstanceId);

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);

      if (result.effectSteps && result.effectSteps.length > 0) {
        effectResolutionStore.startResolution(result.effectSteps);
      }
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /** モンスターを通常召喚可能かどうかを返す */
  canSummonMonster(cardInstanceId: string): boolean {
    const currentState = getCurrentGameState();
    const command = new SummonMonsterCommand(cardInstanceId);
    return command.canExecute(currentState);
  }

  /** 手札からモンスターを表側攻撃表示で通常召喚する TODO: GameStateUpdateResult の一部を切り出したInterfaceを定義するべきかも */
  summonMonster(cardInstanceId: string): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentGameState();
    const command = new SummonMonsterCommand(cardInstanceId);

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /** モンスターをセット可能かどうかを返す */
  canSetMonster(cardInstanceId: string): boolean {
    const currentState = getCurrentGameState();
    const command = new SetMonsterCommand(cardInstanceId);
    return command.canExecute(currentState);
  }

  /** 手札からモンスターを裏側守備表示でセットする TODO: GameStateUpdateResult の一部を切り出したInterfaceを定義するべきかも */
  setMonster(cardInstanceId: string): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentGameState();
    const command = new SetMonsterCommand(cardInstanceId);

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /** 魔法カードまたは罠カードをセット可能かどうかを返す */
  canSetSpellTrap(cardInstanceId: string): boolean {
    const currentState = getCurrentGameState();
    const command = new SetSpellTrapCommand(cardInstanceId);
    return command.canExecute(currentState);
  }

  /** 手札から魔法カードまたは罠カードをセットする TODO: GameStateUpdateResult の一部を切り出したInterfaceを定義するべきかも */
  setSpellTrap(cardInstanceId: string): { success: boolean; message?: string; error?: string } {
    const currentState = getCurrentGameState();
    const command = new SetSpellTrapCommand(cardInstanceId);

    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }
}

/** GameFacade のシングルトンインスタンス */
export const gameFacade = new GameFacade();
