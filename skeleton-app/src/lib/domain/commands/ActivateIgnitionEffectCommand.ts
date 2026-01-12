/**
 * ActivateIgnitionEffectCommand - 起動効果発動コマンド
 *
 * フィールドに表側表示で存在するカードの起動効果を発動する Command パターン実装。
 * TODO: 現状「チキンレース」のハードコードとなっている。別の起動効果も扱えるように汎用化する。
 * TODO: canExecute を、 execute 内で再利用するように修正する。
 * TODO: チェーンシステムに対応する。
 *
 * @module domain/commands/ActivateIgnitionEffectCommand
 */

import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import { createFailureResult } from "$lib/domain/models/GameStateUpdate";
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/spell/ChickenGameIgnitionEffect";

/** 起動効果発動コマンドクラス */
export class ActivateIgnitionEffectCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Activate ignition effect of ${cardInstanceId}`;
  }

  /**
   * 指定カードインスタンスの起動効果が発動可能か判定する
   *
   * チェック項目:
   * - ゲーム終了状態でないこと
   * - 対象カードがフィールドに表側表示で存在すること
   * - 効果レジストリに効果処理が登録されていること
   * - カード固有の発動条件を満たしていること
   */
  canExecute(state: GameState): boolean {
    // ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return false;
    }

    // 対象カードがフィールドに表側表示で存在すること
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return false;
    }
    const validLocations = ["fieldZone", "spellTrapZone", "mainMonsterZone"];
    if (!validLocations.includes(cardInstance.location)) {
      return false;
    }
    if (cardInstance.position !== "faceUp") {
      return false;
    }

    // 効果レジストリに効果処理が登録されていること
    const cardId = cardInstance.id;
    if (cardId !== 67616300) {
      return false; // 現在はチキンレース固定
    }

    // カード固有の発動条件を満たしていること
    const ignitionEffect = new ChickenGameIgnitionEffect(this.cardInstanceId); // 現在はチキンレース固定
    if (!ignitionEffect.canActivate(state)) {
      return false;
    }

    return true;
  }

  /**
   * 起動効果の発動処理・解決処理ステップ配列を生成して返す
   *
   * 処理フロー:
   * 1. TODO: 要整理
   *
   * Note: 効果処理ステップは、Application 層に返された後に逐次実行される。
   */
  execute(state: GameState): GameStateUpdateResult {
    // Validate
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card instance ${this.cardInstanceId} not found`);
    }

    // Hardcoded check for Chicken Game (TODO: use registry)
    const cardId = cardInstance.id;
    if (cardId !== 67616300) {
      return createFailureResult(state, "This card has no ignition effect");
    }

    // Instantiate Chicken Game ignition effect
    const ignitionEffect = new ChickenGameIgnitionEffect(this.cardInstanceId);

    if (!ignitionEffect.canActivate(state)) {
      return createFailureResult(state, "発動条件を満たしていません");
    }

    // Get activation and resolution steps
    const activationSteps = ignitionEffect.createActivationSteps(state);
    const resolutionSteps = ignitionEffect.createResolutionSteps(state, this.cardInstanceId);

    // Combine activation and resolution steps into a single sequence
    const allEffectSteps = [...activationSteps, ...resolutionSteps];

    // Return result with all effect steps (delegate to Application Layer)
    // Application Layer will execute all steps sequentially with proper notifications
    return {
      success: true,
      newState: state,
      message: `Ignition effect activated: ${this.cardInstanceId}`,
      effectSteps: allEffectSteps,
    };
  }

  /** 発動対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
