/**
 * テスト用カードインスタンス ファクトリ
 *
 * CardInstance を生成するユーティリティ関数群
 *
 * - createTestMonsterCard: テスト用モンスター
 * - createHandMonster: 手札のモンスター
 * - createMonstersOnField: フィールド上のモンスター配列
 * - createSpellsOnField: 魔法・罠ゾーンの魔法配列
 * - createTestSpellCard: テスト用魔法
 * - createTestTrapCard: テスト用罠
 * - createFieldCardInstance: フィールド上のカード（stateOnField付き）
 * - createSetCard: セット状態のカード
 * - createCardInstances: カードID配列から複数インスタンス生成
 */

import type { CardInstance, FrameSubType, SpellSubType, TrapSubType } from "$lib/domain/models/Card";
import type { CounterState } from "$lib/domain/models/Card";
import type { CardSpace } from "$lib/domain/models/GameState";
import { createInitialStateOnField } from "$lib/domain/models/Card/StateOnField";
import { Location } from "$lib/domain/models/Location";
import { CardDataRegistry } from "$lib/domain/cards";
import { TEST_CARD_IDS } from "./constants";

/**
 * テスト用モンスターカードインスタンスを作成
 *
 * setup.ts で登録されたデフォルトテストモンスター (id: 12345678) を使用。
 * 登録済みカードの場合は CardDataRegistry から情報を取得。
 *
 * @param instanceId - 一意のインスタンス識別子
 * @param options - オプション設定
 * @returns CardInstance
 */
export function createTestMonsterCard(
  instanceId: string,
  options?: {
    cardId?: number;
    frameType?: FrameSubType;
    location?: keyof CardSpace;
    level?: number;
  },
): CardInstance {
  const cardId = options?.cardId ?? TEST_CARD_IDS.DUMMY;
  const registeredCard = CardDataRegistry.getOrUndefined(cardId);
  return {
    instanceId,
    id: cardId,
    jaName: registeredCard?.jaName ?? "Test Monster",
    type: "monster",
    frameType: options?.frameType ?? registeredCard?.frameType ?? "normal",
    level: options?.level ?? registeredCard?.level,
    edition: registeredCard?.edition ?? "latest",
    location: options?.location ?? "hand",
  };
}

/**
 * 手札のモンスターカードを作成（召喚テスト用）
 *
 * @param instanceId - インスタンスID
 * @param level - モンスターレベル（デフォルト: 4）
 */
export function createHandMonster(instanceId: string, level: number = 4): CardInstance {
  return createTestMonsterCard(instanceId, { location: "hand", level });
}

/**
 * フィールド上のモンスター配列を作成
 *
 * @param count - 作成するモンスター数
 * @param options - オプション設定
 */
export function createMonstersOnField(count: number, options?: { position?: "faceUp" | "faceDown" }): CardInstance[] {
  return Array.from({ length: count }, (_, i) =>
    createFieldCardInstance({
      instanceId: `monster-${i}`,
      id: TEST_CARD_IDS.DUMMY,
      jaName: `Monster ${i}`,
      type: "monster",
      frameType: "normal",
      location: "mainMonsterZone",
      position: options?.position ?? "faceUp",
    }),
  );
}

/**
 * 魔法・罠ゾーンの魔法カード配列を作成
 *
 * @param count - 作成する魔法カード数
 */
export function createSpellsOnField(count: number): CardInstance[] {
  return Array.from({ length: count }, (_, i) =>
    createFieldCardInstance({
      instanceId: `spell-${i}`,
      id: TEST_CARD_IDS.SPELL_NORMAL,
      jaName: `Spell ${i}`,
      type: "spell",
      frameType: "spell",
      location: "spellTrapZone",
      position: "faceUp",
      spellType: "normal",
    }),
  );
}

/**
 * テスト用魔法カードインスタンスを作成
 *
 * setup.ts で登録されたテスト用魔法カードIDを spellType に応じて使用:
 * - normal: 1001, quick-play: 1004, continuous: 1005, field: 1006
 *
 * @param instanceId - 一意のインスタンス識別子
 * @param spellType - 魔法カード種別（デフォルト: "normal"）
 * @param options - オプション設定
 * @returns CardInstance
 */
export function createTestSpellCard(
  instanceId: string,
  spellType: SpellSubType = "normal",
  options?: {
    cardId?: number;
    location?: keyof CardSpace;
  },
): CardInstance {
  const defaultCardIds: Record<SpellSubType, number> = {
    normal: TEST_CARD_IDS.SPELL_NORMAL,
    "quick-play": TEST_CARD_IDS.SPELL_QUICK,
    continuous: TEST_CARD_IDS.SPELL_CONTINUOUS,
    field: TEST_CARD_IDS.SPELL_FIELD,
    equip: TEST_CARD_IDS.SPELL_EQUIP,
    ritual: TEST_CARD_IDS.SPELL_NORMAL,
  };
  const cardId = options?.cardId ?? defaultCardIds[spellType];
  const registeredCard = CardDataRegistry.getOrUndefined(cardId);

  return {
    instanceId,
    id: cardId,
    jaName: registeredCard?.jaName ?? `Test ${spellType} Spell`,
    type: "spell",
    frameType: "spell",
    spellType: registeredCard?.spellType ?? spellType,
    edition: registeredCard?.edition ?? "latest",
    location: options?.location ?? "hand",
  };
}

/**
 * テスト用罠カードインスタンスを作成
 *
 * @param instanceId - 一意のインスタンス識別子
 * @param trapType - 罠カード種別（デフォルト: "normal"）
 * @param options - オプション設定
 * @returns CardInstance
 */
export function createTestTrapCard(
  instanceId: string,
  trapType: TrapSubType = "normal",
  options?: {
    cardId?: number;
    location?: keyof CardSpace;
  },
): CardInstance {
  const cardId = options?.cardId ?? TEST_CARD_IDS.TRAP_NORMAL;
  const registeredCard = CardDataRegistry.getOrUndefined(cardId);

  return {
    instanceId,
    id: cardId,
    jaName: registeredCard?.jaName ?? `Test ${trapType} Trap`,
    type: "trap",
    frameType: "trap",
    trapType: registeredCard?.trapType ?? trapType,
    edition: registeredCard?.edition ?? "latest",
    location: options?.location ?? "hand",
  };
}

/**
 * フィールド上のカードインスタンスを作成（stateOnField付き）
 *
 * @param options - カードインスタンスの設定
 */
export function createFieldCardInstance(options: {
  instanceId: string;
  id: number;
  jaName: string;
  type: "monster" | "spell" | "trap";
  frameType: FrameSubType;
  location: "mainMonsterZone" | "spellTrapZone" | "fieldZone";
  position?: "faceUp" | "faceDown";
  battlePosition?: "attack" | "defense";
  placedThisTurn?: boolean;
  counters?: readonly CounterState[];
  spellType?: SpellSubType;
}): CardInstance {
  return {
    instanceId: options.instanceId,
    id: options.id,
    jaName: options.jaName,
    type: options.type,
    frameType: options.frameType,
    edition: "latest",
    location: options.location,
    spellType: options.spellType,
    stateOnField: {
      position: options.position ?? "faceUp",
      battlePosition: options.battlePosition,
      placedThisTurn: options.placedThisTurn ?? false,
      counters: options.counters ?? [],
      activatedEffects: new Set(),
    },
  };
}

/**
 * セット状態のカードを生成（裏側表示、stateOnField付き）
 *
 * @param instanceId - カードインスタンスID
 * @param cardId - カードID
 * @param location - 配置位置（spellTrapZone または fieldZone）
 * @param options - オプション（placedThisTurn など）
 */
export function createSetCard(
  instanceId: string,
  cardId: number,
  location: "spellTrapZone" | "fieldZone",
  options?: { placedThisTurn?: boolean },
): CardInstance {
  const registeredCard = CardDataRegistry.getOrUndefined(cardId);
  return {
    instanceId,
    id: cardId,
    jaName: registeredCard?.jaName ?? `Test Card ${cardId}`,
    type: registeredCard?.type ?? "spell",
    frameType: registeredCard?.frameType ?? "spell",
    spellType: registeredCard?.spellType,
    edition: registeredCard?.edition ?? "latest",
    location,
    stateOnField: {
      position: "faceDown",
      placedThisTurn: options?.placedThisTurn ?? false,
      counters: [],
      activatedEffects: new Set(),
    },
  };
}

/**
 * カードID配列から CardInstance 配列を生成
 *
 * @param cardIds - カードIDの配列（string または number）
 * @param location - カードの配置場所
 * @param prefix - インスタンスIDのプレフィックス（デフォルト: location名）
 * @param type - カード種別（デフォルト: "spell"）
 */
export function createCardInstances(
  cardIds: (string | number)[],
  location: keyof CardSpace,
  prefix?: string,
  type: "monster" | "spell" | "trap" = "spell",
): CardInstance[] {
  const instancePrefix = prefix || location;
  return cardIds.map((cardId, index) => {
    const numericId = typeof cardId === "string" ? parseInt(cardId, 10) : cardId;
    const registeredCard = CardDataRegistry.getOrUndefined(numericId);
    const frameType: FrameSubType = registeredCard?.frameType ?? (type === "monster" ? "normal" : type);
    const spellType = registeredCard?.spellType;
    const baseInstance = {
      instanceId: `${instancePrefix}-${index}`,
      id: numericId,
      type: registeredCard?.type ?? type,
      frameType,
      spellType,
      jaName: registeredCard?.jaName ?? `Test Card ${numericId}`,
      edition: registeredCard?.edition ?? ("latest" as const),
      location,
    };
    // フィールドロケーションの場合は stateOnField を設定
    if (Location.isField(location)) {
      return {
        ...baseInstance,
        stateOnField: createInitialStateOnField(),
      };
    }
    return baseInstance;
  });
}
