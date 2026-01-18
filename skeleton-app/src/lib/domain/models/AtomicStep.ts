/**
 * AtomicStep - 効果処理の単一ステップのモデル
 *
 * @module domain/models/AtomicStep
 * @see {@link docs/domain/effect-processing-model.md}
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";
import type { CardInstance } from "$lib/domain/models/Card";
import type { ZoneName } from "$lib/domain/models/Zone";

/**
 * 効果処理ステップの通知レベル
 *
 * Domain層で定義され、Presentation層が表示方法を決定する：
 * - silent: 通知なし（内部状態変更のみ、即座に実行）
 * - info: 情報通知（トースト、非ブロッキング、自動進行）
 * - interactive: ユーザー入力要求（モーダル、ブロッキング）
 */
export type NotificationLevel = "silent" | "info" | "interactive";

/**
 * カード選択設定
 *
 * ユーザーにカード選択を要求するための設定。
 * ドメイン層向けで、Svelte の store に依存しない。
 */
export interface CardSelectionConfig {
  availableCards: readonly CardInstance[]; // 選択可能なカードインスタンス一覧
  minCards: number;
  maxCards: number;
  summary: string; // 選択UIに表示される要約
  description: string; // 選択UIに表示される詳細説明
  cancelable?: boolean; // キャンセル可能かどうか（デフォルト: false）
  _sourceZone?: ZoneName;
  _filter?: (card: CardInstance, index?: number) => boolean;
}

/**
 * 効果処理の単一ステップ
 *
 * 各ステップは一意のID、タイトル、メッセージ、およびアクションコールバックを持つ。
 *
 * アクションコールバックは依存性注入パターンを使用する：
 * - ドメイン層：コールバック関数 (state: GameState) => GameStateUpdateResult を返す
 * - アプリケーション層：現在の GameState を注入してコールバックを実行する
 *
 * もし cardSelectionConfig が提供されている場合、アプリケーション層は以下を行う：
 * 1. CardSelectionModal を開き、設定を渡す
 * 2. ユーザーがカードを選択するのを待つ
 * 3. 選択されたインスタンスIDをアクションコールバックに渡す
 */
export interface AtomicStep {
  id: string;
  summary: string; // UIに表示される要約
  description: string; // UIに表示される詳細説明
  notificationLevel?: NotificationLevel; // Default: "info"
  cardSelectionConfig?: CardSelectionConfig;

  /**
   * 効果処理ステップの処理内容定義（アクションコールバック）
   *
   * Callback Pattern + Dependency Injection:
   * - GameStateはアプリケーション層が実行時に注入
   * - 更新後の状態を含む GameStateUpdateResult を返す
   * - 型安全のため同期関数（非async）のみ
   */
  action: (state: GameState, selectedInstanceIds?: string[]) => GameStateUpdateResult;
}
