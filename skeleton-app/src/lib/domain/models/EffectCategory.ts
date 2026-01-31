/**
 * EffectCategory - 効果カテゴリ
 *
 * ChainableAction と AdditionalRule の効果カテゴリを識別する。
 *
 * @module domain/models/EffectCategory
 * @see {@link docs/domain/effect-model.md}
 */

/**
 * ChainableAction の効果カテゴリ
 * - activation: カードの発動
 * - ignition: 起動効果
 * - trigger: 誘発効果 TODO: 将来追加
 * - quick: 誘発即時効果 TODO: 将来追加
 */
export type ActionEffectCategory = "activation" | "ignition";

/**
 * AdditionalRule の効果カテゴリ
 * - continuous: 永続効果
 * - unclassified: 分類されない効果（別名ルール効果） TODO: 将来追加
 * - nonEffect: 効果外テキスト TODO: 将来追加
 */
export type RuleEffectCategory = "continuous";
