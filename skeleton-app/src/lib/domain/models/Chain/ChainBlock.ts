/**
 * ChainBlock - チェーン上の1つの処理単位
 *
 * チェーンブロックは「カードの発動」または「効果の発動」によって生成される。
 * チェーン構築時に積まれ、チェーン解決時に LIFO 順で処理される。
 */

import type { AtomicStep } from "$lib/domain/models/GameProcessing";
import type { EffectId } from "$lib/domain/models/Effect";

/**
 * チェーンブロック
 *
 * チェーン上に積まれる1つの処理単位を表す。
 */
export interface ChainBlock {
  /** チェーン番号（1から開始） */
  readonly chainNumber: number;

  /** ChainableAction の効果ID */
  readonly effectId: EffectId;

  /** 発動元カードインスタンスID */
  readonly sourceInstanceId: string;

  /** 発動元カードID */
  readonly sourceCardId: number;

  /** スペルスピード */
  readonly spellSpeed: 1 | 2 | 3;

  /**
   * 解決時に実行するステップ（resolutionSteps）
   *
   * チェーン構築時に生成され、チェーン解決時に実行される。
   */
  readonly resolutionSteps: AtomicStep[];

  /**
   * 無効化されたかどうか
   *
   * true の場合、チェーン解決時に resolutionSteps は実行されない。
   */
  readonly isNegated: boolean;
}

/**
 * ChainBlock 生成用のパラメータ（chainNumber を除く）
 */
export type ChainBlockParams = Omit<ChainBlock, "chainNumber">;
