/**
 * 効果クラスの自動登録設定
 * 新しい効果を追加する場合はここに追加するだけでOK
 */

// 効果クラスをインポート
import { PotOfGreedEffect } from "../cards/PotOfGreedEffect";

// TODO: 新しい効果クラスを追加する際はここにインポートを追加
// import { ModestPotEffect } from "../cards/ModestPotEffect";
// import { JarOfGreedEffect } from "../cards/JarOfGreedEffect";
// import { ExodiaWinEffect } from "../cards/ExodiaWinEffect";

/**
 * 効果クラスの自動登録マップ
 *
 * 利点:
 * 1. ファイル名とクラス名の自動対応
 * 2. 新しい効果はここに1行追加するだけ
 * 3. TypeScriptの型安全性を保持
 * 4. バンドルサイズの最適化が可能
 */
export const EFFECT_CLASS_REGISTRY = {
  // カード効果
  PotOfGreedEffect,

  // TODO: 新しい効果クラスを追加する際はここに追加
  // ModestPotEffect,
  // JarOfGreedEffect,
  // ExodiaWinEffect,
} as const;

/**
 * 登録済み効果クラス名の型
 */
export type RegisteredEffectClassName = keyof typeof EFFECT_CLASS_REGISTRY;

/**
 * 効果クラスが登録されているかチェック
 */
export function isRegisteredEffectClass(className: string): className is RegisteredEffectClassName {
  return className in EFFECT_CLASS_REGISTRY;
}
