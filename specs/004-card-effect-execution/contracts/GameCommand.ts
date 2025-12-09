/**
 * Game Command Contract
 *
 * ゲーム状態を変更する操作を表すインターフェース
 * Feature: 004-card-effect-execution
 *
 * 既存の GameCommand.ts で定義されているインターフェースと同一
 * このファイルは設計ドキュメントとしての役割
 */

import type { GameState } from "$lib/domain/models/GameState";

/**
 * コマンド実行結果
 */
export interface CommandResult {
  /**
   * 実行成功かどうか
   */
  readonly success: boolean;

  /**
   * 新しいゲーム状態
   * 失敗時は元の状態がそのまま返される
   */
  readonly newState: GameState;

  /**
   * 成功時のメッセージ（オプション）
   * 例: "Drew 2 cards"
   */
  readonly message?: string;

  /**
   * 失敗時のエラーメッセージ（オプション）
   * 例: "Not enough cards in deck"
   */
  readonly error?: string;
}

/**
 * ゲームコマンドの基本インターフェース
 *
 * Command Patternに従い、すべてのゲーム状態変更はこのインターフェースを実装する
 * ADR-0003: Effect System廃止、Command Pattern統一
 */
export interface GameCommand {
  /**
   * コマンドの説明
   * 例: "Draw 2 cards", "Advance to Main Phase"
   */
  readonly description: string;

  /**
   * 実行可能性のチェック（状態を変更しない）
   *
   * @param state - 現在のゲーム状態
   * @returns 実行可能ならtrue
   *
   * 例: DrawCardCommand.canExecute()
   * → deck.length >= drawCount をチェック
   */
  canExecute(state: GameState): boolean;

  /**
   * コマンドを実行して新しい状態を返す
   *
   * @param state - 現在のゲーム状態
   * @returns 実行結果（新しい状態を含む）
   *
   * 注意: Immer.jsのproduce()で不変更新を行う
   */
  execute(state: GameState): CommandResult;
}

/**
 * 既存のCommandクラス
 *
 * 1. DrawCardCommand(count: number)
 *    - ドロー処理
 *    - Domain関数: drawCards(zones, count)
 *    - バリデーション: deck.length >= count
 *
 * 2. ActivateSpellCommand(cardInstanceId: string)
 *    - 魔法カード発動
 *    - 拡張ポイント: カードID判定ロジック追加（行73-75）
 *    - バリデーション: メインフェイズ1、手札に存在するか
 *
 * 3. AdvancePhaseCommand()
 *    - フェーズ進行
 */

/**
 * 新規Commandクラス（004で実装）
 *
 * DiscardCardsCommand(cardInstanceIds: string[])
 * - 手札から複数枚のカードを墓地に送る
 * - Domain関数: sendToGraveyard(zones, cardId) を複数回呼び出し
 * - バリデーション: すべてのIDが手札に存在するか
 *
 * 実装例:
 * ```typescript
 * export class DiscardCardsCommand implements GameCommand {
 *   constructor(private readonly cardInstanceIds: string[]) {}
 *
 *   canExecute(state: GameState): boolean {
 *     const handIds = state.zones.hand.map(c => c.instanceId);
 *     return this.cardInstanceIds.every(id => handIds.includes(id));
 *   }
 *
 *   execute(state: GameState): CommandResult {
 *     let updatedZones = state.zones;
 *     for (const cardId of this.cardInstanceIds) {
 *       updatedZones = sendToGraveyard(updatedZones, cardId);
 *     }
 *     return createSuccessResult(
 *       produce(state, draft => { draft.zones = updatedZones })
 *     );
 *   }
 * }
 * ```
 */
