/**
 * NotificationLevel Type Definition
 *
 * Domain層で定義される通知レベル型。
 * Clean Architectureの原則に従い、UI実装詳細（toast/modal）を含まない抽象的な定義。
 *
 * @module domain/models/EffectResolutionStep
 */

/**
 * NotificationLevel - 効果解決ステップの通知レベル
 *
 * 効果解決ステップがユーザーにどのように通知されるべきかを示す。
 * Presentation層がこのレベルに応じて具体的な表示方法（toast/modal/none）を決定する。
 */
export type NotificationLevel =
  /**
   * silent: 通知なし
   *
   * 内部状態変更のみで、ユーザーに通知する必要がないステップ。
   * 効果は即座に実行され、次のステップに進む。
   *
   * @example 永続効果適用、カウンター更新、フラグ設定
   */
  | "silent"

  /**
   * info: 情報通知（非ブロッキング）
   *
   * ユーザーに情報を提供するが、ユーザーの操作を妨げないステップ。
   * Presentation層では通常トーストで表示され、自動的に消える。
   * 効果は自動的に実行され、次のステップに進む。
   *
   * @example カードドロー、墓地送り、LP変更
   */
  | "info"

  /**
   * interactive: ユーザー入力要求（ブロッキング）
   *
   * ユーザーの入力を必要とするステップ。
   * Presentation層では通常モーダルで表示され、ユーザーの確認またはキャンセルを待つ。
   * 効果はユーザーの入力後に実行される。
   *
   * @example カード選択、対象指定、選択肢の選択
   */
  | "interactive";

/**
 * Default notification level
 *
 * notificationLevelが未指定のEffectResolutionStepのデフォルト値。
 * 後方互換性のため、既存のステップは"info"として扱われる。
 */
export const DEFAULT_NOTIFICATION_LEVEL: NotificationLevel = "info";

/**
 * Type Guard: Check if a value is a valid NotificationLevel
 *
 * @param value - Value to check
 * @returns true if value is a valid NotificationLevel
 *
 * @example
 * ```typescript
 * const level = "info";
 * if (isNotificationLevel(level)) {
 *   // level is NotificationLevel type
 * }
 * ```
 */
export function isNotificationLevel(value: unknown): value is NotificationLevel {
  return (
    typeof value === "string" &&
    (value === "silent" || value === "info" || value === "interactive")
  );
}
