/**
 * 効果処理のユーザーインタラクション関連の型定義
 *
 * Application層の型を再エクスポートし、Presentation層固有の型エイリアスを提供。
 *
 * @module presentation/types/interaction
 */

import type { ConfirmationConfig, ResolvedCardSelectionConfig } from "$lib/application/types/game";

/** 確認モーダル用の設定（UIコンポーネントとしてわかりやすい名前） */
export type ConfirmationModalConfig = ConfirmationConfig;

/** カード選択モーダル用の設定（UIコンポーネントとしてわかりやすい名前） */
export type CardSelectionModalConfig = ResolvedCardSelectionConfig;
