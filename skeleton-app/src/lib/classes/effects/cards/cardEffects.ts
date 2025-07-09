/**
 * カード固有効果クラスの登録設定
 * cards/ ディレクトリ内のカード固有効果のみを登録する
 * atoms/ の再利用可能効果は継承により使用される
 */

// カード固有効果クラスをインポート
import { PotOfGreedEffect } from "$lib/classes/effects/cards/magic/normal/PotOfGreedEffect";
import { GracefulCharityEffect } from "$lib/classes/effects/cards/magic/normal/GracefulCharityEffect";
// TODO: 新しいカード効果を追加する際はここにインポートを追加

/**
 * カード固有効果クラスの登録レジストリ
 *
 * 設計思想:
 * - cards/ のカード固有効果のみを登録
 * - atoms/ の再利用可能効果は継承により使用
 * - デッキレシピで指定されるのはカード固有効果のみ
 *
 * 利点:
 * 1. カード固有効果の一元管理
 * 2. 新しいカード効果は1行追加するだけ
 * 3. TypeScriptの型安全性を保持
 * 4. バンドルサイズの最適化が可能
 */
export const CARD_EFFECTS = {
  // カード固有効果（cards/ ディレクトリ）
  PotOfGreedEffect,
  GracefulCharityEffect,

  // TODO: 新しいカード効果を追加する際はここに追加
} as const;

/**
 * 登録済みカード効果クラス名の型
 */
export type RegisteredCardEffectClassName = keyof typeof CARD_EFFECTS;

/**
 * カード効果クラスが登録されているかチェック
 */
export function isRegisteredCardEffect(className: string): className is RegisteredCardEffectClassName {
  return className in CARD_EFFECTS;
}
