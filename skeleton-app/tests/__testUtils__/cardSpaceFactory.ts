/**
 * テスト用カードスペース ファクトリ
 *
 * CardSpace の各ゾーンを表す Pick<CardSpace, "xxx"> を生成するユーティリティ関数群
 * （GameSnapshot の space フィールドに spread して使用する）
 *
 * - createHand: 手札を指定カードIDで生成
 * - createFilledHand: 手札を n 枚で埋めた状態
 * - createGraveyard: 墓地を指定カードIDで生成
 * - createFilledGraveyard: 墓地を n 枚で埋めた状態
 * - createBanished: 除外ゾーンを指定カードIDで生成
 * - createFilledBanished: 除外ゾーンを n 枚で埋めた状態
 * - createMainDeck: メインデッキを指定カードID配列で生成
 * - createFilledMainDeck: メインデッキを n 枚で埋めた状態
 * - createExtraDeck: EXデッキを指定カードID配列で生成
 * - createFilledExtraDeck: EXデッキを n 枚で埋めた状態
 * - createMonsterZone: モンスターゾーンを指定カードIDで生成
 * - createFilledMonsterZone: モンスターゾーンを n 体で埋めた状態
 * - createSpellTrapZone: 魔法・罠ゾーンを指定カードIDで生成
 * - createFilledSpellZone: 魔法・罠ゾーンを n 枚で埋めた状態
 * - createFieldZone: フィールドゾーンを指定カードIDで生成
 * - createFilledFieldZone: フィールドゾーンを n 枚で埋めた状態
 */

import type { LocationName } from "$lib/domain/models/Location";
import type { CardInstance } from "$lib/domain/models/Card";
import type { CardSpace } from "$lib/domain/models/GameState";
import {
  createMonsterInstance,
  createSpellInstance,
  createTrapInstance,
  createMonsterOnField,
  createSpellOnField,
  createTrapOnField,
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
 * @param type - カード種別
 */
function createCardInstances(
  cardIds: number[],
  type: "monster" | "spell" | "trap",
  location: LocationName,
  prefix?: string,
): CardInstance[] {
  const instancePrefix = prefix || location;
  return cardIds.map((cardId, index) => {
    const id = typeof cardId === "string" ? parseInt(cardId, 10) : cardId;
    const instanceId = `${instancePrefix}-${index}`;
    if (location === "mainMonsterZone") {
      return createMonsterOnField(instanceId, { cardId: id, slotIndex: index });
    } else if (location === "spellTrapZone") {
      if (type === "spell") {
        return createSpellOnField(instanceId, { cardId: id, position: "faceUp", slotIndex: index });
      } else {
        return createTrapOnField(instanceId, { cardId: id, position: "faceUp", slotIndex: index });
      }
    } else if (location === "fieldZone") {
      return createSpellOnField(instanceId, { cardId: id, spellType: "field" });
    } else if (type === "monster") {
      return createMonsterInstance(instanceId, { cardId: id, location });
    } else if (type === "trap") {
      return createTrapInstance(instanceId, { cardId: id, location });
    } else {
      return createSpellInstance(instanceId, { cardId: id, location });
    }
  });
}

/**
 * 指定カードIDでゾーン状態を生成する内部ヘルパー
 *
 * @param zone - CardSpace のキー名
 * @param cardIds - カードIDの配列
 * @param prefix - instanceId のプレフィックス（省略時は zone 名）
 * @param type - カード種別（デフォルト: "spell"）
 */
function createZone<K extends keyof CardSpace>(
  zone: K,
  cardIds: number[],
  prefix?: string,
  type: "monster" | "spell" | "trap" = "spell",
): Pick<CardSpace, K> {
  return { [zone]: createCardInstances(cardIds, type, zone, prefix) } as unknown as Pick<CardSpace, K>;
}

/**
 * n 枚のカードでゾーン状態を生成する内部ヘルパー
 *
 * @param zone - CardSpace のキー名
 * @param count - 枚数
 * @param cardId - カードID
 * @param prefix - instanceId のプレフィックス（省略時は zone 名）
 * @param type - カード種別（デフォルト: "spell"）
 */
function createFilledZone<K extends keyof CardSpace>(
  zone: K,
  count: number,
  cardId: number,
  prefix?: string,
  type: "monster" | "spell" | "trap" = "spell",
): Pick<CardSpace, K> {
  return { [zone]: createCardInstances(Array(count).fill(cardId), type, zone, prefix) } as unknown as Pick<
    CardSpace,
    K
  >;
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
export function createHand(cardIds: number[]): Pick<CardSpace, "hand"> {
  return createZone("hand", cardIds);
}

/**
 * 手札を n 枚のカードで埋めたゾーン状態を返す
 *
 * @param count - 手札枚数
 * @param cardId - カードID（デフォルト: ダミー通常魔法）
 * @returns `{ hand: CardInstance[] }`
 */
export function createFilledHand(count: number, cardId = DUMMY_CARD_IDS.NORMAL_SPELL): Pick<CardSpace, "hand"> {
  return createFilledZone("hand", count, cardId);
}

/**
 * 指定カードIDで墓地を生成したゾーン状態を返す
 *
 * @param cardIds - 墓地に配置するカードIDの配列
 * @returns `{ graveyard: CardInstance[] }`
 */
export function createGraveyard(cardIds: number[]): Pick<CardSpace, "graveyard"> {
  return createZone("graveyard", cardIds);
}

/**
 * 墓地を n 枚のカードで埋めたゾーン状態を返す
 *
 * @param count - 墓地枚数
 * @param cardId - カードID（デフォルト: ダミー通常魔法）
 * @returns `{ graveyard: CardInstance[] }`
 */
export function createFilledGraveyard(
  count: number,
  cardId = DUMMY_CARD_IDS.NORMAL_SPELL,
): Pick<CardSpace, "graveyard"> {
  return createFilledZone("graveyard", count, cardId);
}

/**
 * 指定カードIDで除外ゾーンを生成したゾーン状態を返す
 *
 * @param cardIds - 除外ゾーンに配置するカードIDの配列
 * @returns `{ banished: CardInstance[] }`
 */
export function createBanished(cardIds: number[]): Pick<CardSpace, "banished"> {
  return createZone("banished", cardIds);
}

/**
 * 除外ゾーンを n 枚のカードで埋めたゾーン状態を返す
 *
 * @param count - 除外枚数
 * @param cardId - カードID（デフォルト: ダミー通常魔法）
 * @returns `{ banished: CardInstance[] }`
 */
export function createFilledBanished(count: number, cardId = DUMMY_CARD_IDS.NORMAL_SPELL): Pick<CardSpace, "banished"> {
  return createFilledZone("banished", count, cardId);
}

/**
 * 指定カードID配列でメインデッキを生成したゾーン状態を返す
 *
 * createFilledMainDeck と異なり、異なるカードIDが混在する配列を受け付ける。
 *
 * @param cardIds - デッキに配置するカードIDの配列
 * @returns `{ mainDeck: CardInstance[] }`
 */
export function createMainDeck(cardIds: number[]): Pick<CardSpace, "mainDeck"> {
  return createZone("mainDeck", cardIds, "deck");
}

/**
 * メインデッキを n 枚のカードで埋めたゾーン状態を返す
 *
 * @param count - デッキ枚数
 * @param cardId - カードID（デフォルト: ダミー通常魔法）
 * @returns `{ mainDeck: CardInstance[] }`
 */
export function createFilledMainDeck(count: number, cardId = DUMMY_CARD_IDS.NORMAL_SPELL): Pick<CardSpace, "mainDeck"> {
  return createFilledZone("mainDeck", count, cardId, "deck");
}

/**
 * 指定カードID配列でEXデッキを生成したゾーン状態を返す
 *
 * createFilledExtraDeck と異なり、異なるカードIDが混在する配列を受け付ける。
 *
 * @param cardIds - EXデッキに配置するカードIDの配列
 * @returns `{ extraDeck: CardInstance[] }`
 */
export function createExtraDeck(cardIds: number[]): Pick<CardSpace, "extraDeck"> {
  return createZone("extraDeck", cardIds, "extra");
}

/**
 * EXデッキを n 枚のカードで埋めたゾーン状態を返す
 *
 * @param count - EXデッキ枚数
 * @param cardId - カードID（デフォルト: ダミーシンクロモンスター）
 * @returns `{ extraDeck: CardInstance[] }`
 */
export function createFilledExtraDeck(
  count: number,
  cardId = DUMMY_CARD_IDS.SYNCHRO_MONSTER,
): Pick<CardSpace, "extraDeck"> {
  return createFilledZone("extraDeck", count, cardId, "extra");
}

/**
 * 指定カードIDでモンスターゾーンを生成したゾーン状態を返す
 *
 * instanceId は "monster-0", "monster-1", ... の形式で生成される。
 * createFilledMonsterZone と異なり、異なるカードIDが混在する配列を受け付ける。
 *
 * @param cardIds - モンスターゾーンに配置するカードIDの配列
 * @returns `{ mainMonsterZone: CardInstance[] }`
 */
export function createMonsterZone(cardIds: number[]): Pick<CardSpace, "mainMonsterZone"> {
  return createZone("mainMonsterZone", cardIds, "monster", "monster");
}

/**
 * フィールドに n 体のモンスターを配置したゾーン状態を返す
 *
 * instanceId は "monster-0", "monster-1", ... の形式で生成される。
 *
 * @param count - モンスター数
 * @param cardId - カードID（デフォルト: ダミー通常モンスター）
 * @returns `{ mainMonsterZone: CardInstance[] }`
 */
export function createFilledMonsterZone(
  count: number,
  cardId = DUMMY_CARD_IDS.NORMAL_MONSTER,
): Pick<CardSpace, "mainMonsterZone"> {
  return createFilledZone("mainMonsterZone", count, cardId, "monster");
}

/**
 * 指定カードIDで魔法・罠ゾーンを生成したゾーン状態を返す
 *
 * @param cardIds - 魔法・罠ゾーンに配置するカードIDの配列
 * @returns `{ spellTrapZone: CardInstance[] }`
 */
export function createSpellTrapZone(cardIds: number[]): Pick<CardSpace, "spellTrapZone"> {
  return createZone("spellTrapZone", cardIds);
}

/**
 * 魔法・罠ゾーンを n 枚の通常魔法で埋めたゾーン状態を返す
 *
 * instanceId は "spell-0", "spell-1", ... の形式で生成される。
 *
 * @param count - 魔法カード数
 * @param cardId - カードID（デフォルト: ダミー通常魔法）
 * @returns `{ spellTrapZone: CardInstance[] }`
 */
export function createFilledSpellZone(
  count: number,
  cardId = DUMMY_CARD_IDS.NORMAL_SPELL,
): Pick<CardSpace, "spellTrapZone"> {
  return createFilledZone("spellTrapZone", count, cardId);
}

/**
 * 指定カードIDでフィールドゾーンを生成したゾーン状態を返す
 *
 * @param cardIds - フィールドゾーンに配置するカードIDの配列
 * @returns `{ fieldZone: CardInstance[] }`
 */
export function createFieldZone(cardIds: number[]): Pick<CardSpace, "fieldZone"> {
  return createZone("fieldZone", cardIds, "field");
}

/**
 * フィールドゾーンを n 枚のフィールド魔法で埋めたゾーン状態を返す
 *
 * instanceId は "field-0", "field-1", ... の形式で生成される。
 *
 * @param count - フィールドゾーン枚数
 * @param cardId - カードID（デフォルト: ダミーフィールド魔法）
 * @returns `{ fieldZone: CardInstance[] }`
 */
export function createFilledFieldZone(
  count: number,
  cardId = DUMMY_CARD_IDS.FIELD_SPELL,
): Pick<CardSpace, "fieldZone"> {
  return createFilledZone("fieldZone", count, cardId);
}
