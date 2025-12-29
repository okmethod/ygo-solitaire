/**
 * RuleContext - ルール適用時のコンテキスト
 *
 * AdditionalRuleのcanApply/apply/checkPermission/replaceメソッドに
 * 汎用的なパラメータを受け渡すためのインターフェース。
 *
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

/**
 * RuleContext インターフェース
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
