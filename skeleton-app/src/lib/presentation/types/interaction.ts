/**
 * 効果処理のユーザーインタラクション関連の型定義
 *
 * Domain 層の AtomicStep が前提としている型を基に、
 * 効果処理モーダル群の実装に関連する設定インターフェースを追加定義する。
 *
 * @module presentation/types/interaction
 */

import type { CardInstance, InteractionConfig } from "$lib/presentation/types";

/**
 * 効果確認モーダル用の設定（カード選択なし）
 *
 * @see EffectResolutionModal
 */
export interface EffectResolutionModalConfig extends InteractionConfig {
  onConfirm: () => void;
}

/**
 * カード選択モーダル用の設定
 *
 * @see CardSelectionModal
 */
export interface CardSelectionModalConfig extends InteractionConfig {
  availableCards: readonly CardInstance[];
  minCards: number;
  maxCards: number;
  onConfirm: (selectedInstanceIds: string[]) => void;
  onCancel?: () => void;
}
