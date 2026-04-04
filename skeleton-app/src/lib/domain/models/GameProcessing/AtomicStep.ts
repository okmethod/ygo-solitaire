/**
 * AtomicStep - ゲーム状態更新処理の単一ステップ
 *
 * ドメイン層で定義され、アプリケーション層が実行時に処理を注入する。
 */

import type { LocationName } from "$lib/domain/models/Location";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot, EffectActivationContext } from "$lib/domain/models/GameState";
import type { GameStateUpdateResult } from "./GameStateUpdate";
import type { EffectId } from "$lib/domain/models/Effect";

/**
 * 効果処理ステップの通知レベル
 *
 * ドメイン層で定義され、プレゼン層が表示方法を決定する：
 * - silent: 通知なし（内部状態変更のみ、即座に実行）
 * - static: 静的メッセージ通知（step定義時のsummary/descriptionをトースト表示、自動進行）
 * - dynamic: 動的メッセージ通知（actionが返すmessageをトースト表示、自動進行）
 * - interactive: ユーザー入力要求（モーダル、ブロッキング）
 */
export type NotificationLevel = "silent" | "static" | "dynamic" | "interactive";

/**
 * ユーザーインタラクション設定の基底クラス
 *
 * ユーザー操作自体はプレゼン層で実装されるが、
 * ユーザーの意思決定を要するということ自体はゲームのルールに関わるため、
 * ドメイン層で設定を定義している。
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
  _effectId?: EffectId; // 動的フィルターで EffectActivationContext を参照するための効果ID
  _filter?: (
    card: CardInstance,
    index?: number,
    context?: EffectActivationContext,
    sourceZone?: readonly CardInstance[],
  ) => boolean;
  minCards: number;
  maxCards: number;
  /** 選択中のカードで確定可能かを判定（未指定時は minCards/maxCards のみでチェック） */
  canConfirm?: (selectedCards: readonly CardInstance[]) => boolean;
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
 * cardSelectionConfig が提供されている場合、アプリケーション層は以下を行う：
 * 1. cardSelectionConfig(state) を呼び出してUIの設定を取得する
 * 2. null が返った場合はUIなしで action を直接実行する（自動選択）
 * 3. 設定が返った場合は CardSelectionModal を開き、ユーザーの選択を待つ
 * 4. 選択されたインスタンスIDをアクションコールバックに渡す
 *
 * Note: 「ユーザーがどのような意思決定をする必要があるか」はゲームルールであり、
 * ドメイン層の責務。そのためカード選択設定はドメイン層で定義する。
 */
export interface AtomicStep {
  id: string;
  sourceCardId?: number; // 効果の発動元カードID（インタラクションモーダル表示用）
  summary: string; // UIに表示される要約
  description: string; // UIに表示される詳細説明
  notificationLevel?: NotificationLevel; // Default: "static"
  /**
   * 実行時の状態に基づいてカード選択設定を返す関数。
   * - null を返す場合: UIなし（自動選択・または選択不要）
   * - CardSelectionConfig を返す場合: カード選択モーダルを表示
   */
  cardSelectionConfig?: (state: GameSnapshot) => CardSelectionConfig | null;

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

/**
 * AtomicStep のカード選択設定を解決し、利用可能なカード一覧を返す純粋関数
 *
 * effectQueueStore など、アプリ層がUIを表示する前に呼び出す。
 * availableCards の解決（_sourceZone + _filter の適用）はゲームルールの一部であるため
 * ドメイン層に置く。
 *
 * @returns null: UIなし（自動実行）
 * @returns オブジェクト: { config, availableCards } をモーダルに渡す
 */
export function resolveCardSelection(
  step: AtomicStep,
  state: GameSnapshot,
): { config: CardSelectionConfig; availableCards: readonly CardInstance[] } | null {
  if (!step.cardSelectionConfig) return null;

  const config = step.cardSelectionConfig(state);
  if (!config) return null;

  let availableCards: readonly CardInstance[];
  if (config.availableCards !== null) {
    availableCards = config.availableCards;
  } else {
    if (!config._sourceZone) {
      throw new Error(
        `[resolveCardSelection] _sourceZone must be specified when availableCards is null (step: ${step.id})`,
      );
    }
    const sourceZone = state.space[config._sourceZone];
    const activationContext = config._effectId ? state.activationContexts[config._effectId] : undefined;
    availableCards = config._filter
      ? sourceZone.filter((card, index) => config._filter!(card, index, activationContext, sourceZone))
      : sourceZone;
  }

  return { config, availableCards };
}
