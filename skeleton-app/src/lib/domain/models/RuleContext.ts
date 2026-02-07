/**
 * RuleContext - ルール適用時のコンテキスト
 *
 * @module domain/models/RuleContext
 * @see {@link docs/domain/effect-model.md}
 */

/**
 * トリガーイベントの種類
 *
 * 永続効果が反応するイベントを定義する。
 */
export type TriggerEvent =
  | "spellActivated" // 魔法カード発動時
  | "monsterSummoned" // モンスター召喚時
  | "cardDestroyed"; // カード破壊時

/**
 * ルール適用時のコンテキスト
 *
 * @deprecated 現在未使用。将来的にActionPermission等のカテゴリで
 * ダメージ量やダメージ対象などのコンテキスト情報が必要になった際に復活予定。
 * YAGNI原則に従い、必要になるまでAdditionalRuleインターフェースから削除している。
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

  /** トリガーイベントの種類 */
  triggerEvent?: TriggerEvent;

  /** トリガー元のカードID */
  triggerSourceCardId?: number;

  /** トリガー元のカードインスタンスID */
  triggerSourceInstanceId?: string;

  /** その他の汎用パラメータ */
  [key: string]: unknown;
}
