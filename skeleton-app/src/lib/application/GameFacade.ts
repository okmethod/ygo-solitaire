/**
 * GameFacade - 全てのゲーム操作コマンドの唯一の入り口（Single Entry Point）
 *
 * @architecture レイヤー間依存ルール - アプリ層（Facade）
 * - ROLE: ゲーム進行制御、プレゼン層へのゲーム操作手段の提供
 * - ALLOWED: ドメイン層への依存
 * - FORBIDDEN: インフラ層への依存、プレゼン層への依存
 *
 * @module application/GameFacade
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { GameCommand } from "$lib/domain/models/Command";
import { AdvancePhaseCommand } from "$lib/domain/commands/AdvancePhaseCommand";
import { SummonMonsterCommand } from "$lib/domain/commands/SummonMonsterCommand";
import { SetMonsterCommand } from "$lib/domain/commands/SetMonsterCommand";
import { SetSpellTrapCommand } from "$lib/domain/commands/SetSpellTrapCommand";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { ActivateIgnitionEffectCommand } from "$lib/domain/commands/ActivateIgnitionEffectCommand";
import { registerCardDataByIds, registerCardDataWithEffectsByIds } from "$lib/domain/cards";
import type { DeckData, DeckRecipe } from "$lib/application/types/deck";
import { getDeckRecipe, extractUniqueCardIds, buildDeckData } from "$lib/application/decks/deckLoader";
import { gameStateStore, resetGameState, getCurrentGameState } from "$lib/application/stores/gameStateStore";
import { effectQueueStore } from "$lib/application/stores/effectQueueStore";
import { chainStackStore } from "$lib/application/stores/chainStackStore";

/**
 * GameFacadeのメソッドが返す結果型（プレゼン層への公開用）
 *
 * GameStateUpdateResult から、一部のフィールドのみを公開する。
 */
export type FacadeResult = {
  success: boolean;
  message?: string;
  error?: string;
  // アプリ層で消化される効果処理ステップ等は公開しない
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
    const validationResult = command.canExecute(currentState);
    return validationResult.isValid;
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
      gameStateStore.set(result.updatedState);

      // チェーンブロックがある場合は chainStackStore に登録
      if (result.chainBlock) {
        // 新しいチェーンを開始（まだ構築中でない場合）
        const chainState = chainStackStore.getStackSize();
        if (chainState === 0) {
          chainStackStore.startChain();
        }
        chainStackStore.pushChainBlock(result.chainBlock);
      }

      // activationSteps（発動時処理）を即座に実行
      // チェーン解決は effectQueueStore 内で処理完了後に行われる
      if (result.activationSteps && result.activationSteps.length > 0) {
        effectQueueStore.startProcessing(result.activationSteps);
      } else if (result.chainBlock) {
        // 発動時処理がない場合は即座にチェーン解決を開始
        effectQueueStore.resolveChain();
      }
    }

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  }

  /**
   * デッキデータを読み込む（ゲーム状態は変更しない）
   *
   * カードデータレジストリのみ更新し、デッキデータを返す。
   * レシピ表示など、ゲームを開始しない用途向け。
   */
  loadDeck(deckId: string): { deckData: DeckData; uniqueCardIds: number[] } {
    const deckRecipe = getDeckRecipe(deckId);
    const uniqueCardIds = extractUniqueCardIds(deckRecipe);

    // カードデータのみレジストリに登録
    registerCardDataByIds(uniqueCardIds);

    // デッキデータを構築
    const deckData = buildDeckData(deckRecipe, uniqueCardIds);

    return { deckData, uniqueCardIds };
  }

  /**
   * ゲームを初期化する
   *
   * 全レジストリを更新し、ゲーム状態をリセットする。
   */
  initializeGame(deckId: string): { deckData: DeckData; uniqueCardIds: number[] } {
    const deckRecipe = getDeckRecipe(deckId);
    const uniqueCardIds = extractUniqueCardIds(deckRecipe);

    // 全レジストリに必要なカードを登録（CardData + 効果一括、DSL優先）
    registerCardDataWithEffectsByIds(uniqueCardIds);

    // デッキデータを構築
    const deckData = buildDeckData(deckRecipe, uniqueCardIds);

    // ゲーム開始
    this.startGame(deckRecipe);

    return { deckData, uniqueCardIds };
  }

  /**
   * ゲームを開始する
   *
   * レジストリを維持し、ゲーム状態のみリセットする。
   */
  startGame(deckRecipe: DeckRecipe): void {
    resetGameState(deckRecipe);
  }

  /** 現在のゲーム状態全体を取得する
   *
   * Note: 個別の各種情報は、derivedStores から取得する。
   */
  getGameState(): GameSnapshot {
    return getCurrentGameState();
  }

  /** 指定したカードインスタンスをフィールド上で検索して返す */
  findCardOnField(cardInstanceId: string): CardInstance | undefined {
    const currentState = getCurrentGameState();
    const allFieldCards = [
      ...currentState.space.mainMonsterZone,
      ...currentState.space.spellTrapZone,
      ...currentState.space.fieldZone,
    ];
    return allFieldCards.find((c) => c.instanceId === cardInstanceId);
  }

  /** 次のフェイズに進行する */
  advancePhase(): FacadeResult {
    return this.executeCommand(AdvancePhaseCommand);
  }

  /** ゲーム開始時、メインフェイズ1まで自動進行する */
  async autoAdvanceToMainPhase(
    onBeforeAdvance?: () => Promise<void>,
    onPhaseAdvanced?: (message: string) => void,
  ): Promise<boolean> {
    const state = getCurrentGameState();

    // 条件チェック: 1ターン目のドローフェイズでのみ実行
    if (state.turn !== 1 || state.phase !== "draw") {
      return false;
    }

    // Draw → Standby → Main1 へ進行（2回）
    for (let i = 0; i < 2; i++) {
      if (onBeforeAdvance) {
        await onBeforeAdvance();
      }

      const result = this.advancePhase();
      if (result.success) {
        if (result.message && onPhaseAdvanced) {
          onPhaseAdvanced(result.message);
        }
      } else {
        console.error(`[GameFacade] Auto advance failed: ${result.error}`);
        return false;
      }
    }

    return true;
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

  /** 指定した魔法カードインスタンスを発動可能かどうかチェックして返す */
  canActivateSpell(cardInstanceId: string): boolean {
    return this.canExecuteCommand(ActivateSpellCommand, cardInstanceId);
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
}

/** GameFacade のシングルトンインスタンス */
export const gameFacade = new GameFacade();
