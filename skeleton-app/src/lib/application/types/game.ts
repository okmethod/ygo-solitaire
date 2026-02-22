/**
 * game - ゲーム状態の DTO (Data Transfer Object)
 *
 * @architecture レイヤー間依存ルール - アプリ層 (DTO)
 * - ROLE: アプリ層やプレゼン層が消費するデータ形式の定義
 * - ALLOWED: ドメイン層のモデルへの依存
 * - FORBIDDEN: インフラ層への依存、プレゼン層への依存
 *
 * @module application/types/game
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { ChainableAction } from "$lib/domain/models/Effect";
import type { InteractionConfig, CardSelectionConfig } from "$lib/domain/models/GameProcessing";

/** Domain 型の再エクスポート */
export type { GameSnapshot } from "$lib/domain/models/GameState";
export type { InteractionConfig, CardSelectionConfig };

/**
 * ユーザー確認設定（コールバック付き）
 *
 * ドメイン層の InteractionConfig にコールバックを追加。
 * effectQueueStore が生成し、プレゼン層のUIが消費する。
 */
export interface ConfirmationConfig extends InteractionConfig {
  onConfirm: () => void;
  onCancel?: () => void; // cancelable=true の場合のみ選択可能
}

/**
 * 効果解決時のカード選択設定（コールバック付き）
 *
 * ドメイン層の CardSelectionConfig を解決し、コールバックを追加。
 * - availableCards: 実行時に解決済みのカード配列
 * - _sourceZone, _filter: 不要（解決済みのため除外）
 */
export interface ResolvedCardSelectionConfig
  extends Omit<CardSelectionConfig, "availableCards" | "_sourceZone" | "_filter"> {
  availableCards: readonly CardInstance[];
  onConfirm: (selectedInstanceIds: string[]) => void;
  onCancel?: () => void; // cancelable=true の場合のみ選択可能
}

/**
 * チェーン確認設定（コールバック付き）
 *
 * チェーン可能なカードをユーザーに提示し、発動するかパスするかを選択させる。
 * effectQueueStore が生成し、プレゼン層のUIが消費する。
 */
export interface ChainConfirmationConfig {
  /** チェーン可能なカードと効果のペア配列 */
  chainableCards: readonly { instance: CardInstance; action: ChainableAction }[];
  /** カードを選択して発動する */
  onActivate: (instanceId: string) => void;
  /** チェーンをパスする */
  onPass: () => void;
}
