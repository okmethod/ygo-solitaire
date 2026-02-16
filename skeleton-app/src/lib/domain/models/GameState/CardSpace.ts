/**
 * CardSpace - カード配置空間モデル
 *
 * ゲーム中の各種カード配置領域を含む空間全体を表現するモデル。
 * プレーンなオブジェクトとして実装し、クラス化しない。
 * （理由: GameState に内包されるため）
 *
 * 領域間でのカード移動や状態管理のためのユーティリティ関数も提供する。
 *
 * @module domain/models/state/CardSpace
 * @see {@link docs/domain/overview.md}
 */

import type { LocationName } from "$lib/domain/models/Location";
import { Location } from "$lib/domain/models/Location";
import type { CardInstance, StateOnField } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card/index";
import { shuffleArray } from "$lib/shared/utils/arrayUtils";

/**
 * CardSpace - カード配置空間モデル
 *
 * LocationName 型の各値をキーとして持ち、
 * その値として CardInstance の読み取り専用配列を保持する。
 */
export type CardSpace = {
  readonly [L in LocationName]: readonly CardInstance[];
};

/** 各種ゾーンの最大容量 */
export const ZONE_CAPACITY = {
  mainMonsterZone: 5,
  spellTrapZone: 5,
  fieldZone: 1,
} as const;

/** 指定したロケーションのカード枚数を取得 */
const countCardsAt = (space: CardSpace, location: LocationName): number => {
  return space[location].length;
};

/** 手札のカード枚数（発動元が手札にある場合は自身を除外してカウント） */
export const countHandExcludingSelf = (space: CardSpace, sourceInstance: CardInstance): number => {
  const countCardsAtHand = countCardsAt(space, "hand");
  return sourceInstance.location === "hand" ? countCardsAtHand - 1 : countCardsAtHand;
};

/** メインデッキが空かどうか */
export const isMainDeckEmpty = (space: CardSpace): boolean => {
  return countCardsAt(space, "mainDeck") === 0;
};

/** ロケーションが上限に達しているかどうかの汎用チェック */
const isLocationFull = (space: CardSpace, location: LocationName, limit: number): boolean => {
  return countCardsAt(space, location) >= limit;
};

/** メインモンスターゾーンが最大枚数に達しているか */
export const isMainMonsterZoneFull = (space: CardSpace, limit: number = ZONE_CAPACITY.mainMonsterZone): boolean =>
  isLocationFull(space, "mainMonsterZone", limit);

/** 魔法・罠ゾーンが最大枚数に達しているか */
export const isSpellTrapZoneFull = (space: CardSpace, limit: number = ZONE_CAPACITY.spellTrapZone): boolean =>
  isLocationFull(space, "spellTrapZone", limit);

/** フィールドゾーンが最大枚数に達しているか */
export const isFieldZoneFull = (space: CardSpace, limit: number = ZONE_CAPACITY.fieldZone): boolean =>
  isLocationFull(space, "fieldZone", limit);

/** 全てのロケーションからカードインスタンスを検索する */
export function findCardInstance(space: CardSpace, instanceId: string): CardInstance | undefined {
  for (const location of Object.keys(space) as LocationName[]) {
    const card = space[location].find((c) => c.instanceId === instanceId);
    if (card) return card;
  }
  return undefined;
}

/**
 * カードの移動および表示形式の変更を行う（汎用）
 *
 * フィールドへの移動時: stateOnField が未設定なら初期化
 * フィールドから離脱時: stateOnField をクリア
 */
export function moveCardInstance(
  currentSpace: CardSpace,
  card: CardInstance,
  to: LocationName,
  updates?: Partial<StateOnField>,
): CardSpace {
  const from = card.location;
  const sourceList = currentSpace[from];

  // 移動対象カードインスタンスの存在確認
  const cardIndex = sourceList.findIndex((c) => c.instanceId === card.instanceId);
  if (cardIndex === -1) return currentSpace;

  // 移動元・移動先の判定
  const movingToField = Location.isField(to);
  const movingFromField = Location.isField(from);
  const placingOnField = movingToField && !movingFromField;
  const leavingFromField = !movingToField && movingFromField;

  // カードインスタンスを更新
  let updatedCard: CardInstance;
  if (placingOnField) {
    if (updates?.position === undefined) {
      throw new Error("Position must be specified when placing a card on the field.");
    }
    // フィールドに出される移動
    updatedCard = Card.Instance.placedOnField(card, to, updates?.position, updates?.battlePosition);
  } else if (leavingFromField) {
    // フィールドから離れる移動
    updatedCard = Card.Instance.leavedFromField(card, to);
  } else if (movingToField && movingFromField && updates !== undefined) {
    // フィールド内での状態更新（セットカードの発動、カウンター操作など）
    updatedCard = Card.Instance.updatedState(card, updates);
  } else {
    // フィールド内での移動や、フィールド外での移動（状態変更なし）
    updatedCard = Card.Instance.moved(card, to);
  }

  // 同じゾーン内での更新の場合は、配列の位置を維持する
  if (from === to) {
    const updatedList = sourceList.map((c) => (c.instanceId === card.instanceId ? updatedCard : c));
    return {
      ...currentSpace,
      [from]: updatedList,
    };
  }

  // 異なるゾーンへの移動
  const filteredSource = sourceList.filter((c) => c.instanceId !== card.instanceId);
  return {
    ...currentSpace,
    [from]: filteredSource,
    [to]: [...currentSpace[to], updatedCard],
  };
}

/** カードインスタンスをその場で更新する */
export function updateCardStateInPlace(
  currentSpace: CardSpace,
  card: CardInstance,
  updates: Partial<StateOnField>,
): CardSpace {
  return moveCardInstance(currentSpace, card, card.location, updates);
}

/** 指定枚数のカードをメインデッキから手札に移動する */
export function drawCards(currentSpace: CardSpace, count: number = 1): CardSpace {
  const deckSize = currentSpace.mainDeck.length;
  if (deckSize < count) {
    throw new Error(`Cannot draw ${count} cards. Only ${deckSize} cards remaining in main deck.`);
  }

  let updatedSpace = currentSpace;

  for (let i = 0; i < count; i++) {
    // デッキの末尾（トップ）から引く
    const topCard = updatedSpace.mainDeck[updatedSpace.mainDeck.length - 1];
    updatedSpace = moveCardInstance(updatedSpace, topCard, "hand");
  }

  return updatedSpace;
}

/** メインデッキをシャッフルする */
export function shuffleMainDeck(space: CardSpace): CardSpace {
  return {
    ...space,
    mainDeck: shuffleArray(space.mainDeck),
  };
}

/** 既存のフィールド魔法を墓地へ送る（存在する場合） */
export function sendExistingFieldSpellToGraveyard(space: CardSpace): CardSpace {
  if (!isFieldZoneFull(space)) return space;
  return moveCardInstance(space, space.fieldZone[0], "graveyard");
}
