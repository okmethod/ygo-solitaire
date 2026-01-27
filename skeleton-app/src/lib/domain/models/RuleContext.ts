/**
 * RuleContext - ルール適用時のコンテキスト
 *
 * @module domain/models/RuleContext
 * @see {@link docs/domain/effect-model.md}
 */

/**
 * ルール適用時のコンテキスト
 *
 * ルール適用時に必要なパラメータを汎用的に受け渡す。
 * カテゴリに応じて必要なフィールドのみを使用する。
 */
export interface RuleContext {
  /** ダメージ量（ダメージ無効化系で使用） */
  damageAmount?: number;

  /** ダメージ対象（"player" | "opponent"） */
  damageTarget?: string;

  /** 対象カードインスタンスID（破壊耐性等で使用） */
  targetCardInstanceId?: string;

  /** その他の汎用パラメータ */
  [key: string]: unknown;
}
