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
import type { GameCommand } from "$lib/domain/models/GameStateUpdate";
import "$lib/domain/effects"; // Initialize ChainableActionRegistry and AdditionalRuleRegistry

/**
 * GameFacadeのメソッドが返す結果型（Presentation Layerへの公開用）
 *
 * GameStateUpdateResult から、一部のフィールドのみを公開する。
 */
export type FacadeResult = {
  success: boolean;
  message?: string;
  error?: string;
  // newState: Application層で消費されるため、Presentation層には公開しない
  // effectSteps: Application層で消費されるため、Presentation層には公開しない
};

/**
 * 全ゲーム操作の唯一の入り口（Single Entry Point）
 */
export class GameFacade {
  /**
   * Commandの実行可否をチェックする（共通処理）
   */
  private canExecuteCommand<T extends GameCommand>(CommandClass: new (param: string) => T, param: string): boolean {
    const currentState = getCurrentGameState();
    const command = new CommandClass(param);
    return command.canExecute(currentState);
  }

  /**
   * Commandを実行してストアを更新する（共通処理）
   */
  private executeCommand<T extends GameCommand>(CommandClass: new (param: string) => T, param: string): FacadeResult {
    const currentState = getCurrentGameState();
    const command = new CommandClass(param);
    const result = command.execute(currentState);

    if (result.success) {
      gameStateStore.set(result.newState);

      // 効果解決ステップがある場合は委譲
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

  /** デッキを初期化する */
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
  advancePhase(): FacadeResult {
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
  shuffleDeck(): FacadeResult {
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
  drawCard(count: number = 1): FacadeResult {
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
  activateSpell(cardInstanceId: string): FacadeResult {
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

  /** 指定したカード(インスタンス) の起動効果を発動する */
  activateIgnitionEffect(cardInstanceId: string): FacadeResult {
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

  /** 手札からモンスターを表側攻撃表示で通常召喚する */
  summonMonster(cardInstanceId: string): FacadeResult {
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

  /** 手札からモンスターを裏側守備表示でセットする */
  setMonster(cardInstanceId: string): FacadeResult {
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

  /** 手札から魔法カードまたは罠カードをセットする */
  setSpellTrap(cardInstanceId: string): FacadeResult {
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
