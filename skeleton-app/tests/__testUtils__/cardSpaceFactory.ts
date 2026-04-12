/**
 * テスト用カードスペース ファクトリ
 *
 * CardSpace の各ゾーンを表す Pick<CardSpace, "xxx"> を生成するユーティリティ関数群
 * （GameSnapshot の space フィールドに spread して使用する）
 *
 * - createHand: 手札を指定カードIDで生成
 * - createGraveyard: 墓地を指定カードIDで生成
 * - createMainDeck: メインデッキを指定カードID配列で生成
 * - createSpellTrapZone: 魔法・罠ゾーンを指定カードIDで生成
 * - createFilledMainDeck: メインデッキを n 枚で埋めた状態
 * - createFilledExtraDeck: EXデッキを n 枚で埋めた状態
 * - createFilledMonsterZone: モンスターゾーンを n 体で埋めた状態
 * - createFilledSpellZone: 魔法・罠ゾーンを n 枚で埋めた状態
 * - createFilledFieldZone: フィールドゾーンを n 枚で埋めた状態
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { CardSpace } from "$lib/domain/models/GameState";
import {
  createMonsterInstance,
  createSpellInstance,
  createTrapInstance,
  createMonsterOnField,
  createSpellOnField,
} from "./cardInstanceFactory";
import { DUMMY_CARD_IDS } from "./constants";

// =============================================================================
// 内部ヘルパー
// =============================================================================

/**
 * カードID配列から CardInstance 配列を生成する内部ヘルパー
 *
 * このファイル内および gameStateFactory.ts / synchroTestHelpers.ts などの
 * ファクトリファイルからのみ使用する。外部テストからは使用しない。
 *
 * @param cardIds - カードIDの配列（string または number）
 * @param location - カードの配置場所
 * @param prefix - インスタンスIDのプレフィックス（デフォルト: location名）
 * @param type - カード種別（デフォルト: "spell"）
 */
function createCardInstances(
  cardIds: (string | number)[],
  location: keyof CardSpace,
  prefix?: string,
  type: "monster" | "spell" | "trap" = "spell",
): CardInstance[] {
  const instancePrefix = prefix || location;
  return cardIds.map((cardId, index) => {
    const id = typeof cardId === "string" ? parseInt(cardId, 10) : cardId;
    const instanceId = `${instancePrefix}-${index}`;
    if (type === "monster") {
      return createMonsterInstance(instanceId, { cardId: id, location });
    } else if (type === "trap") {
      return createTrapInstance(instanceId, { cardId: id, location });
    } else {
      return createSpellInstance(instanceId, { cardId: id, location });
    }
  });
}

// =============================================================================
// ゾーン単位ファクトリ
// =============================================================================

/**
 * 指定カードIDで手札を生成したゾーン状態を返す
 *
 * @param cardIds - 手札に配置するカードIDの配列
 * @returns `{ hand: CardInstance[] }`
 */
export function createHand(cardIds: (string | number)[]): Pick<CardSpace, "hand"> {
  return {
    hand: createCardInstances(cardIds, "hand"),
  };
}

/**
 * 指定カードIDで墓地を生成したゾーン状態を返す
 *
 * @param cardIds - 墓地に配置するカードIDの配列
 * @returns `{ graveyard: CardInstance[] }`
 */
export function createGraveyard(cardIds: (string | number)[]): Pick<CardSpace, "graveyard"> {
  return {
    graveyard: createCardInstances(cardIds, "graveyard"),
  };
}

/**
 * 指定カードIDで魔法・罠ゾーンを生成したゾーン状態を返す
 *
 * @param cardIds - 魔法・罠ゾーンに配置するカードIDの配列
 * @returns `{ spellTrapZone: CardInstance[] }`
 */
export function createSpellTrapZone(cardIds: (string | number)[]): Pick<CardSpace, "spellTrapZone"> {
  return {
    spellTrapZone: createCardInstances(cardIds, "spellTrapZone"),
  };
}

/**
 * 指定カードID配列でメインデッキを生成したゾーン状態を返す
 *
 * createFilledMainDeck と異なり、異なるカードIDが混在する配列を受け付ける。
 *
 * @param cardIds - デッキに配置するカードIDの配列
 * @returns `{ mainDeck: CardInstance[] }`
 */
export function createMainDeck(cardIds: (string | number)[]): Pick<CardSpace, "mainDeck"> {
  return {
    mainDeck: createCardInstances(cardIds, "mainDeck", "deck"),
  };
}

/**
 * メインデッキを n 枚のカードで埋めたゾーン状態を返す
 *
 * @param count - デッキ枚数
 * @param cardId - カードID（デフォルト: DUMMY）
 * @returns `{ mainDeck: CardInstance[] }`
 */
export function createFilledMainDeck(
  count: number,
  cardId = DUMMY_CARD_IDS.NORMAL_MONSTER,
): Pick<CardSpace, "mainDeck"> {
  return {
    mainDeck: createCardInstances(Array(count).fill(cardId), "mainDeck", "deck"),
  };
}

/**
 * EXデッキを n 枚のカードで埋めたゾーン状態を返す
 *
 * 主に容量バリデーションのテスト用。
 *
 * @param count - EXデッキ枚数
 * @param cardId - カードID（デフォルト: DUMMY）
 * @returns `{ extraDeck: CardInstance[] }`
 */
export function createFilledExtraDeck(
  count: number,
  cardId = DUMMY_CARD_IDS.NORMAL_MONSTER,
): Pick<CardSpace, "extraDeck"> {
  return {
    extraDeck: createCardInstances(Array(count).fill(cardId), "extraDeck", "extra"),
  };
}

/**
 * フィールドに n 体のモンスターを配置したゾーン状態を返す
 *
 * instanceId は "monster-0", "monster-1", ... の形式で生成される。
 *
 * @param count - モンスター数
 * @param options - オプション設定
 * @returns `{ mainMonsterZone: CardInstance[] }`
 */
export function createFilledMonsterZone(
  count: number,
  options?: { position?: "faceUp" | "faceDown" },
): Pick<CardSpace, "mainMonsterZone"> {
  return {
    mainMonsterZone: Array.from({ length: count }, (_, i) =>
      createMonsterOnField(`monster-${i}`, { position: options?.position, slotIndex: i }),
    ),
  };
}

/**
 * 魔法・罠ゾーンを n 枚の通常魔法で埋めたゾーン状態を返す
 *
 * instanceId は "spell-0", "spell-1", ... の形式で生成される。
 *
 * @param count - 魔法カード数
 * @returns `{ spellTrapZone: CardInstance[] }`
 */
export function createFilledSpellZone(count: number): Pick<CardSpace, "spellTrapZone"> {
  return {
    spellTrapZone: Array.from({ length: count }, (_, i) =>
      createSpellOnField(`spell-${i}`, { position: "faceUp", slotIndex: i }),
    ),
  };
}

/**
 * フィールドゾーンを n 枚のフィールド魔法で埋めたゾーン状態を返す
 *
 * 主に容量バリデーションのテスト用。
 * instanceId は "field-0", "field-1", ... の形式で生成される。
 *
 * @param count - フィールドゾーン枚数
 * @returns `{ fieldZone: CardInstance[] }`
 */
export function createFilledFieldZone(count: number): Pick<CardSpace, "fieldZone"> {
  return {
    fieldZone: Array.from({ length: count }, (_, i) => createSpellOnField(`field-${i}`, { spellType: "field" })),
  };
}
