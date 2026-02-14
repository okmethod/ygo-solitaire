/**
 * game - ゲーム状態の DTO (Data Transfer Object)
 *
 * @architecture レイヤー間依存ルール - Application Layer (DTO)
 * - ROLE: Application Layer や Presentation Layer が消費するデータ形式の定義
 * - ALLOWED: Domain Layer のモデルへの依存
 * - FORBIDDEN: Infrastructure Layer への依存、Presentation Layer への依存
 *
 * @module application/types/game
 */

import type { InteractionConfig, CardSelectionConfig } from "$lib/domain/models/AtomicStep";
import type { CardInstance } from "$lib/domain/models/Card";

/** Domain 型の再エクスポート */
export type { GameState } from "$lib/domain/models/GameStateOld";
export type { InteractionConfig, CardSelectionConfig } from "$lib/domain/models/AtomicStep";

/**
 * ユーザー確認設定（コールバック付き）
 *
 * Domain層の InteractionConfig にコールバックを追加。
 * effectQueueStore が生成し、Presentation層のUIが消費する。
 */
export interface ConfirmationConfig extends InteractionConfig {
  onConfirm: () => void;
  onCancel?: () => void; // cancelable=true の場合のみ選択可能
}

/**
 * 効果解決時のカード選択設定（コールバック付き）
 *
 * Domain層の CardSelectionConfig を解決し、コールバックを追加。
 * - availableCards: 実行時に解決済みのカード配列
 * - _sourceZone, _filter: 不要（解決済みのため除外）
 */
export interface ResolvedCardSelectionConfig
  extends Omit<CardSelectionConfig, "availableCards" | "_sourceZone" | "_filter"> {
  availableCards: readonly CardInstance[];
  onConfirm: (selectedInstanceIds: string[]) => void;
  onCancel?: () => void; // cancelable=true の場合のみ選択可能
}
