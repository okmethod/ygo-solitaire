/**
 * CardInstance - 「カード1枚」を表現するモデル
 */

import type { CardData } from "./CardData";
import type { StateOnField, Position, BattlePosition } from "./StateOnField";
import { createInitialStateOnField } from "./StateOnField";
import type { LocationName } from "$lib/domain/models/Location";
import { Location } from "$lib/domain/models/Location";

/**
 * 1枚のカードインスタンス
 *
 * カードデータを継承し、全プロパティに加えて1枚ごとのカードを区別するためのユニークIDを持つ。
 * 同じカードを複数枚デッキに入れた場合、 id は同一で、instanceId は異なる。
 */
export interface CardInstance extends CardData {
  readonly instanceId: string;
  readonly location: LocationName;
  /** フィールド一時状態（フィールド外では undefined） */
  readonly stateOnField?: StateOnField;
}

/** カードが手札にあるかどうか */
export const inHand = (card: CardInstance): boolean => {
  return Location.isHand(card.location);
};

/** カードがフィールドにあるかどうか */
export const onField = (card: CardInstance): boolean => {
  return Location.isField(card.location);
};

/** カードが墓地にあるかどうか */
export const inGraveyard = (card: CardInstance): boolean => {
  return Location.isGraveyard(card.location);
};

/** カードが除外されているかどうか */
export const isBanished = (card: CardInstance): boolean => {
  return Location.isBanished(card.location);
};

/** カードが表側表示かどうか */
export const isFaceUp = (card: CardInstance): boolean => {
  return card.stateOnField?.position === "faceUp";
};

/** カードが裏側表示かどうか */
export const isFaceDown = (card: CardInstance): boolean => {
  return card.stateOnField?.position === "faceDown";
};

/** カードが攻撃表示かどうか */
export const isAttackPosition = (card: CardInstance): boolean => {
  return card.stateOnField?.battlePosition === "attack";
};

/** カードが守備表示かどうか */
export const isDefensePosition = (card: CardInstance): boolean => {
  return card.stateOnField?.battlePosition === "defense";
};

/** カードインスタンスの状態を更新する */
const updatedCardInstance = (card: CardInstance, location: LocationName, stateOnField?: StateOnField): CardInstance => {
  return { ...card, location, stateOnField };
};

/** 指定カードを移動する */
export const movedInstance = (card: CardInstance, location: LocationName): CardInstance => {
  return updatedCardInstance(card, location);
};

/** 指定カードをフィールドに出す（フィールド状態を初期化する） */
export const placedOnFieldInstance = (
  card: CardInstance,
  location: LocationName,
  position: Position,
  battlePosition?: BattlePosition,
): CardInstance => {
  if (!Location.isField(location)) {
    throw new Error(`Invalid location for placing on field: ${location}`);
  }
  return updatedCardInstance(
    card,
    location,
    createInitialStateOnField({ position, battlePosition, placedThisTurn: true }),
  );
};

/** 指定カードをフィールドから取り除く（フィールド状態を削除する） */
export const leavedFromFieldInstance = (card: CardInstance, location: LocationName): CardInstance => {
  if (Location.isField(location)) {
    throw new Error(`Invalid location for removing from field: ${location}`);
  }
  return updatedCardInstance(card, location, undefined);
};

/** 指定カードのフィールド状態を更新する（カードの位置は変わらない）*/
export function updateCardStateInPlace(card: CardInstance, updates: Partial<StateOnField>): CardInstance {
  if (!Location.isField(card.location)) {
    throw new Error(`Card must be on the field to update state: currently in ${card.location}`);
  }
  if (!card.stateOnField) {
    throw new Error(`Card has no stateOnField to update.`);
  }
  const updatedState: StateOnField = {
    ...card.stateOnField,
    ...updates,
  };
  return updatedCardInstance(card, card.location, updatedState);
}
