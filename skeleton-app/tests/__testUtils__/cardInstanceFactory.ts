/**
 * テスト用カードインスタンス ファクトリ
 *
 * CardInstance を生成するユーティリティ関数群
 *
 * 【手札向け】stateOnField なし
 * - createTestMonsterCard: テスト用モンスター
 * - createTestSpellCard: テスト用魔法
 * - createTestTrapCard: テスト用罠
 *
 * 【フィールド向け】stateOnField 付き
 * - createFieldCardInstance: フィールド上のカード（汎用）
 * - createMonsterOnField: フィールド上のモンスター
 * - createMonstersOnField: フィールド上のモンスター配列
 * - createSpellOnField: 魔法・罠ゾーンの魔法カード
 * - createSpellsOnField: 魔法・罠ゾーンの魔法配列
 * - createSetCard: セット状態のカード
 *
 * 【汎用】
 * - createCardInstances: カードID配列から複数インスタンス生成
 */

import type {
  CardData,
  CardInstance,
  FrameSubType,
  SpellSubType,
  TrapSubType,
  StateOnField,
} from "$lib/domain/models/Card";
import type { CounterState } from "$lib/domain/models/Card";
import type { CardSpace } from "$lib/domain/models/GameState";
import { createInitialStateOnField } from "$lib/domain/models/Card/StateOnField";
import { Location } from "$lib/domain/models/Location";
import { CardDataRegistry } from "$lib/domain/cards";
import { TEST_CARD_IDS } from "./constants";

// =============================================================================
// 内部ユーティリティ
// =============================================================================

/** undefined 値を除いたオブジェクトを返す */
const defined = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;

type StateOptions = Partial<Pick<StateOnField, "position" | "battlePosition" | "placedThisTurn" | "equippedTo">>;

/**
 * CardInstance の基底ビルダー
 *
 * 優先度: callerFields > レジストリ値 > typeDefaults > グローバルデフォルト
 * フィールド系ロケーションの場合は stateOnField を自動付与する。
 */
const createBase = (
  instanceId: string,
  id: number,
  location: keyof CardSpace,
  typeDefaults: Partial<CardData>,
  callerFields: Partial<CardData> = {},
  stateOptions: StateOptions = {},
): CardInstance => {
  const reg = CardDataRegistry.getOrUndefined(id);
  const base = {
    jaName: `Test Card ${id}`,
    edition: "latest" as const,
    type: "monster" as const,
    frameType: "normal" as const,
    ...typeDefaults,
    ...defined(reg ?? {}),
    ...defined(callerFields),
    id,
    instanceId,
    location,
  } as CardInstance;

  if (Location.isField(location)) {
    return { ...base, stateOnField: createInitialStateOnField(stateOptions) };
  }
  return base;
};

// =============================================================================
// 手札向け（stateOnField なし）
// =============================================================================

/**
 * テスト用モンスターカードインスタンスを作成
 *
 * setup.ts で登録されたデフォルトテストモンスター (id: 12345678) を使用。
 * cardId 指定の場合、登録済みカードの場合は CardDataRegistry から情報を取得。
 * level 指定により上書きも可能。
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
  return createBase(
    instanceId,
    options?.cardId ?? TEST_CARD_IDS.DUMMY,
    options?.location ?? "hand",
    { type: "monster", frameType: "normal" },
    { frameType: options?.frameType, level: options?.level },
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
  return createBase(instanceId, options?.cardId ?? defaultCardIds[spellType], options?.location ?? "hand", {
    type: "spell",
    frameType: "spell",
    spellType,
  });
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
  const defaultCardIds: Record<TrapSubType, number> = {
    normal: TEST_CARD_IDS.TRAP_NORMAL,
    continuous: 0, // 未登録
    counter: 0, // 未登録
  };
  return createBase(instanceId, options?.cardId ?? defaultCardIds[trapType], options?.location ?? "hand", {
    type: "trap",
    frameType: "trap",
    trapType,
  });
}

// =============================================================================
// フィールド向け（stateOnField 付き）
// =============================================================================

/**
 * フィールド上のカードインスタンスを作成（stateOnField付き）
 *
 * 全フィールドを明示的に指定する汎用コンストラクタ。
 * レジストリ値より呼び出し元の値が常に優先される。
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
  equippedTo?: string;
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
      equippedTo: options.equippedTo,
    },
  };
}

/**
 * モンスターゾーンのカードインスタンスを作成（stateOnField付き）
 *
 * @param id - カードID
 * @param instanceId - インスタンスID（例: "mainMonsterZone-0"）
 * @param position - 表裏表示（デフォルト: "faceUp"）
 */
export function createMonsterOnField(
  id: number,
  instanceId: string,
  options?: {
    position?: "faceUp" | "faceDown";
    battlePosition?: "attack" | "defense";
    frameType?: FrameSubType;
  },
): CardInstance {
  return createBase(
    instanceId,
    id,
    "mainMonsterZone",
    { type: "monster" },
    defined({ frameType: options?.frameType }),
    { position: options?.position ?? "faceUp", battlePosition: options?.battlePosition },
  );
}

/**
 * 魔法カードインスタンスを作成（stateOnField付き）
 *
 * spellType が "field" の場合は fieldZone、それ以外は spellTrapZone に配置する。
 * spellType 未指定時はレジストリから取得した値で判定する。
 *
 * @param id - カードID
 * @param instanceId - インスタンスID
 * @param options - オプション設定
 */
export function createSpellOnField(
  id: number,
  instanceId: string,
  options?: {
    spellType?: SpellSubType;
    position?: "faceUp" | "faceDown";
    equippedTo?: string;
  },
): CardInstance {
  const resolvedSpellType = options?.spellType ?? CardDataRegistry.getOrUndefined(id)?.spellType;
  const location = resolvedSpellType === "field" ? "fieldZone" : "spellTrapZone";
  return createBase(
    instanceId,
    id,
    location,
    { type: "spell", frameType: "spell" },
    defined({ spellType: options?.spellType }),
    { position: options?.position ?? "faceUp", equippedTo: options?.equippedTo },
  );
}

/**
 * フィールド上のモンスター配列を作成
 *
 * @param count - 作成するモンスター数
 * @param options - オプション設定
 */
export function createMonstersOnField(count: number, options?: { position?: "faceUp" | "faceDown" }): CardInstance[] {
  return Array.from({ length: count }, (_, i) =>
    createMonsterOnField(TEST_CARD_IDS.DUMMY, `monster-${i}`, { position: options?.position }),
  );
}

/**
 * 魔法・罠ゾーンの魔法カード配列を作成
 *
 * @param count - 作成する魔法カード数
 */
export function createSpellsOnField(count: number): CardInstance[] {
  return Array.from({ length: count }, (_, i) =>
    createBase(
      `spell-${i}`,
      TEST_CARD_IDS.SPELL_NORMAL,
      "spellTrapZone",
      {
        type: "spell",
        frameType: "spell",
        spellType: "normal",
      },
      {},
      { position: "faceUp" },
    ),
  );
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
  return createBase(
    instanceId,
    cardId,
    location,
    { type: "spell", frameType: "spell" },
    {},
    { position: "faceDown", placedThisTurn: options?.placedThisTurn },
  );
}

// =============================================================================
// 汎用
// =============================================================================

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
  const frameType: FrameSubType = type === "monster" ? "normal" : type;
  return cardIds.map((cardId, index) => {
    const id = typeof cardId === "string" ? parseInt(cardId, 10) : cardId;
    return createBase(`${instancePrefix}-${index}`, id, location, { type, frameType });
  });
}
