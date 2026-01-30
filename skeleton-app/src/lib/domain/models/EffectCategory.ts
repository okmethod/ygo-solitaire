/**
 * EffectCategory - 効果カテゴリ型
 *
 * ChainableActionの効果カテゴリを識別するための型。
 * activation（発動時効果）とignition（起動効果）を区別する。
 *
 * @module domain/models/EffectCategory
 */

/**
 * 効果カテゴリ
 * - activation: カードの発動時効果（手札/セット状態から発動する際の効果）
 * - ignition: 起動効果（フィールド上のカードの効果をプレイヤーが任意に発動）
 *
 * 将来拡張: | "trigger" | "quick"
 */
export type EffectCategory = "activation" | "ignition";
