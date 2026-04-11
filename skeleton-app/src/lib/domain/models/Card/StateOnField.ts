/**
 * StateOnField - フィールド上のカードの一時状態
 */

import type { CounterState } from "./Counter";

/** カードの表側表示・裏側表示 */
export type Position = "faceUp" | "faceDown";

/** モンスターカードの攻撃表示・守備表示 */
export type BattlePosition = "attack" | "defense";

/**
 * フィールド上のカードの状態
 *
 * カードがフィールドから離れた場合にクリアされる一時的なプロパティ群。
 * - フィールド: mainMonsterZone, spellTrapZone, fieldZone
 */
export interface StateOnField {
  /** ゾーン内のスロット番号（0始まり） */
  readonly slotIndex: number;

  readonly position: Position;
  readonly battlePosition?: BattlePosition;

  readonly placedThisTurn: boolean;

  readonly counters: readonly CounterState[];

  /** このインスタンスで発動済みの起動効果ID (effectId) */
  readonly activatedEffects: readonly string[];

  /** 装備対象モンスターの instanceId（装備カード用） */
  readonly equippedTo?: string;
}

/** StateOnField の初期値を生成する */
export const createInitialStateOnField = (
  options?: Partial<Pick<StateOnField, "slotIndex" | "position" | "battlePosition" | "placedThisTurn" | "equippedTo">>,
): StateOnField => ({
  slotIndex: options?.slotIndex ?? 0,
  position: options?.position ?? "faceDown",
  battlePosition: options?.battlePosition,
  placedThisTurn: options?.placedThisTurn ?? false,
  counters: [],
  activatedEffects: [],
  equippedTo: options?.equippedTo,
});
