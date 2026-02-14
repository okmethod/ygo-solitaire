/**
 * AtomicStep - ゲーム状態更新処理の単一ステップ
 *
 * Domain層で定義され、アプリケーション層が実行時に処理を注入する。
 */

import type { LocationName } from "$lib/domain/models/Location";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { GameStateUpdateResult } from "./GameStateUpdate";

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
 * ユーザーインタラクション設定の基底クラス
 *
 * ユーザー操作自体は Presentation 層で実装されるが、
 * ユーザーの意思決定を要するということ自体はゲームのルールに関わるため、
 * Domain 層で設定を定義している。
 *
 */
export interface InteractionConfig {
  summary: string; // UIに表示される要約
  description: string; // UIに表示される詳細説明
  cancelable?: boolean; // キャンセル可能かどうか（デフォルト: false）
}

/**
 * カード選択設定
 *
 * ユーザーにカード選択を要求するための設定。
 * ドメイン層向けで、Svelte の store に依存しない。
 */
export interface CardSelectionConfig extends InteractionConfig {
  availableCards: readonly CardInstance[] | null; // 配列: 直接指定, null: 動的指定(_sourceZoneから取得)
  _sourceZone?: LocationName;
  _filter?: (card: CardInstance, index?: number) => boolean;
  minCards: number;
  maxCards: number;
}

/**
 * 効果処理の単一ステップ
 *
 * 各ステップは一意のID、タイトル、メッセージ、およびアクションコールバックを持つ。
 *
 * アクションコールバックは依存性注入パターンを使用する：
 * - ドメイン層：コールバック関数 (state) => GameStateUpdateResult を返す
 * - アプリケーション層：現在の state を注入してコールバックを実行する
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
  action: (state: GameSnapshot, selectedInstanceIds?: string[]) => GameStateUpdateResult;
}
