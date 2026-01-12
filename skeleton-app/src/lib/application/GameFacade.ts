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

// 許容される GameCommand のコンストラクタ引数パターンの定義
type GameCommandArgs = [] | [string] | [number];

/**
 * 全ゲーム操作の唯一の入り口（Single Entry Point）
 */
export class GameFacade {
  /** 各種 GameCommand の実行可否チェックのヘルパー */
  private canExecuteCommand<T extends GameCommand>(CommandClass: new () => T): boolean;
  private canExecuteCommand<T extends GameCommand>(CommandClass: new (param: string) => T, param: string): boolean;
  private canExecuteCommand<T extends GameCommand>(CommandClass: new (param: number) => T, param: number): boolean;
  private canExecuteCommand<T extends GameCommand>(
    CommandClass: new (...args: GameCommandArgs) => T,
    ...params: GameCommandArgs
  ): boolean {
    const currentState = getCurrentGameState();
    const command = new CommandClass(...params);
    return command.canExecute(currentState);
  }

  /** 各種 GameCommand の実行およびストア更新のヘルパー */
  private executeCommand<T extends GameCommand>(CommandClass: new () => T): FacadeResult;
  private executeCommand<T extends GameCommand>(CommandClass: new (param: string) => T, param: string): FacadeResult;
  private executeCommand<T extends GameCommand>(CommandClass: new (param: number) => T, param: number): FacadeResult;
  private executeCommand<T extends GameCommand>(
    CommandClass: new (...args: GameCommandArgs) => T,
    ...params: GameCommandArgs
  ): FacadeResult {
    const currentState = getCurrentGameState();
    const command = new CommandClass(...params);
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
    return this.executeCommand(AdvancePhaseCommand);
  }

  /** デッキをシャッフルする */
  shuffleDeck(): FacadeResult {
    return this.executeCommand(ShuffleDeckCommand);
  }

  /** デッキから指定枚数のカードをドローする */
  drawCard(count: number = 1): FacadeResult {
    return this.executeCommand(DrawCardCommand, count);
  }

  /** 指定した魔法カードインスタンスを発動可能かどうかチェックして返す */
  canActivateSpell(cardInstanceId: string): boolean {
    const currentState = getCurrentGameState();
    const validation = canActivateSpell(currentState, cardInstanceId);
    return validation.canActivate;
  }

  /** 指定した魔法カードインスタンスを発動する */
  activateSpell(cardInstanceId: string): FacadeResult {
    return this.executeCommand(ActivateSpellCommand, cardInstanceId);
  }

  /** 指定したカードインスタンスの起動効果を発動可能かどうかチェックして返す */
  canActivateIgnitionEffect(cardInstanceId: string): boolean {
    return this.canExecuteCommand(ActivateIgnitionEffectCommand, cardInstanceId);
  }

  /** 指定したカードインスタンスの起動効果を発動する */
  activateIgnitionEffect(cardInstanceId: string): FacadeResult {
    return this.executeCommand(ActivateIgnitionEffectCommand, cardInstanceId);
  }

  /** 指定したモンスターカードインスタンスを通常召喚可能かどうかチェックして返す */
  canSummonMonster(cardInstanceId: string): boolean {
    return this.canExecuteCommand(SummonMonsterCommand, cardInstanceId);
  }

  /** 指定したモンスターカードインスタンスを表側攻撃表示で通常召喚する */
  summonMonster(cardInstanceId: string): FacadeResult {
    return this.executeCommand(SummonMonsterCommand, cardInstanceId);
  }

  /** 指定したモンスターカードインスタンスをセット可能かどうかチェックして返す */
  canSetMonster(cardInstanceId: string): boolean {
    return this.canExecuteCommand(SetMonsterCommand, cardInstanceId);
  }

  /** 指定したモンスターカードインスタンスを裏側守備表示でセットする */
  setMonster(cardInstanceId: string): FacadeResult {
    return this.executeCommand(SetMonsterCommand, cardInstanceId);
  }

  /** 指定した魔法・罠カードインスタンスをセット可能かどうかチェックして返す */
  canSetSpellTrap(cardInstanceId: string): boolean {
    return this.canExecuteCommand(SetSpellTrapCommand, cardInstanceId);
  }

  /** 指定した魔法・罠カードインスタンスをセットする */
  setSpellTrap(cardInstanceId: string): FacadeResult {
    return this.executeCommand(SetSpellTrapCommand, cardInstanceId);
  }
}

/** GameFacade のシングルトンインスタンス */
export const gameFacade = new GameFacade();
