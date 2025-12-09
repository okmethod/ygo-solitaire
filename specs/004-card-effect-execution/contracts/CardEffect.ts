/**
 * Card Effect Contract
 *
 * カードIDと効果処理の対応関係を表すインターフェース
 * Feature: 004-card-effect-execution
 */

import type { EffectResolutionStep } from "./EffectResolutionStep";

/**
 * カード効果のメタデータ
 *
 * 各カードは固有の効果ロジック（ドロー枚数、選択枚数など）を持つ
 * 現時点ではif文でハードコードするため、このインターフェースは将来の拡張用
 */
export interface CardEffect {
  /**
   * YGOPRODeck API互換のカードID
   * 例: 55144522 (強欲な壺), 79571449 (天使の施し)
   */
  readonly cardId: number;

  /**
   * ドローする枚数（オプション）
   * 例: 強欲な壺=2, 天使の施し=3
   */
  readonly drawCount?: number;

  /**
   * 破棄する枚数（オプション）
   * 例: 天使の施し=2
   */
  readonly discardCount?: number;

  /**
   * ユーザー入力が必要か
   * 例: 強欲な壺=false, 天使の施し=true
   */
  readonly requiresUserInput: boolean;

  /**
   * 効果解決の各ステップ
   * effectResolutionStore.startResolution()に渡される
   */
  readonly effectSteps: EffectResolutionStep[];
}

/**
 * カード効果のレジストリ（将来の拡張用）
 *
 * 現時点ではActivateSpellCommand内でif文を使用
 * カードが5種類を超えたらこの型へリファクタリング
 */
export type CardEffectRegistry = Record<number, CardEffect>;
