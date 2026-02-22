/**
 * 効果処理のユーザーインタラクション関連の型定義
 *
 * アプリ層の型を再エクスポートし、プレゼン層固有の型エイリアスを提供。
 *
 * @module presentation/types/interaction
 */

import type {
  ConfirmationConfig,
  ResolvedCardSelectionConfig,
  ChainConfirmationConfig,
} from "$lib/application/types/game";

/** 確認モーダル用の設定（UIコンポーネントとしてわかりやすい名前） */
export type ConfirmationModalConfig = ConfirmationConfig;

/** カード選択モーダル用の設定（UIコンポーネントとしてわかりやすい名前） */
export type CardSelectionModalConfig = ResolvedCardSelectionConfig;

/** チェーン確認モーダル用の設定（UIコンポーネントとしてわかりやすい名前） */
export type ChainConfirmationModalConfig = ChainConfirmationConfig;
