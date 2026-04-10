/**
 * テスト用カードインスタンス ファクトリ
 *
 * CardInstance を生成するユーティリティ関数群
 *
 * 【手札向け】stateOnField なし
 * - createMonsterInstance: モンスター
 * - createSpellInstance: 魔法
 * - createTrapInstance: 罠
 *
 * 【フィールド向け】stateOnField 付き
 * - createMonsterOnField: フィールド上のモンスター
 * - createSpellOnField: フィールド上の魔法
 */

import type { LocationName } from "$lib/domain/models/Location";
import { Location } from "$lib/domain/models/Location";
import type {
  CardData,
  CardInstance,
  CounterState,
  FrameSubType,
  SpellSubType,
  TrapSubType,
  StateOnField,
  Position,
  BattlePosition,
} from "$lib/domain/models/Card";
import { createInitialStateOnField } from "$lib/domain/models/Card/StateOnField";
import { CardDataRegistry } from "$lib/domain/cards";
import { TEST_CARD_IDS } from "./constants";

const defaultMonsterCardId = TEST_CARD_IDS.DUMMY;

const defaultSpellCardIds: Record<SpellSubType, number> = {
  normal: TEST_CARD_IDS.SPELL_NORMAL,
  "quick-play": TEST_CARD_IDS.SPELL_QUICK,
  continuous: TEST_CARD_IDS.SPELL_CONTINUOUS,
  field: TEST_CARD_IDS.SPELL_FIELD,
  equip: TEST_CARD_IDS.SPELL_EQUIP,
  ritual: TEST_CARD_IDS.SPELL_NORMAL,
};

const defaultTrapCardIds: Record<TrapSubType, number> = {
  normal: TEST_CARD_IDS.TRAP_NORMAL,
  continuous: 0, // 未登録
  counter: 0, // 未登録
};

// =============================================================================
// 内部ユーティリティ
// =============================================================================

/** undefined 値を除いたオブジェクトを返す */
const defined = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;

type StateOptions = Partial<
  Pick<StateOnField, "slotIndex" | "position" | "battlePosition" | "placedThisTurn" | "equippedTo" | "counters">
>;

/**
 * CardInstance の基底ビルダー
 *
 * 優先度: callerFields > レジストリ値 > typeDefaults > グローバルデフォルト
 * フィールド系ロケーションの場合は stateOnField を自動付与する。
 */
const createBase = (
  instanceId: string,
  id: number,
  location: LocationName,
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
    const stateOnField = createInitialStateOnField(stateOptions);
    return {
      ...base,
      stateOnField:
        stateOptions.counters !== undefined ? { ...stateOnField, counters: stateOptions.counters } : stateOnField,
    };
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
export function createMonsterInstance(
  instanceId: string,
  options?: {
    cardId?: number;
    frameType?: FrameSubType;
    location?: LocationName;
    level?: number;
  },
): CardInstance {
  return createBase(
    instanceId,
    options?.cardId ?? defaultMonsterCardId,
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
 * @param options - オプション設定
 * @returns CardInstance
 */
export function createSpellInstance(
  instanceId: string,
  options?: {
    cardId?: number;
    spellType?: SpellSubType;
    location?: LocationName;
  },
): CardInstance {
  const spellType = options?.spellType ?? "normal";
  return createBase(instanceId, options?.cardId ?? defaultSpellCardIds[spellType], options?.location ?? "hand", {
    type: "spell",
    frameType: "spell",
    spellType,
  });
}

/**
 * テスト用罠カードインスタンスを作成
 *
 * @param instanceId - 一意のインスタンス識別子
 * @param options - オプション設定
 * @returns CardInstance
 */
export function createTrapInstance(
  instanceId: string,
  options?: {
    cardId?: number;
    trapType?: TrapSubType;
    location?: LocationName;
  },
): CardInstance {
  const trapType = options?.trapType ?? "normal";
  return createBase(instanceId, options?.cardId ?? defaultTrapCardIds[trapType], options?.location ?? "hand", {
    type: "trap",
    frameType: "trap",
    trapType,
  });
}

// =============================================================================
// フィールド向け（stateOnField 付き）
// =============================================================================

/**
 * モンスターゾーンのカードインスタンスを作成（stateOnField付き）
 *
 * @param instanceId - インスタンスID（例: "mainMonsterZone-0"）
 * @param options - オプション設定
 */
export function createMonsterOnField(
  instanceId: string,
  options?: {
    cardId?: number;
    frameType?: FrameSubType;
    position?: Position;
    battlePosition?: BattlePosition;
    placedThisTurn?: boolean;
    slotIndex?: number;
    counters?: readonly CounterState[];
  },
): CardInstance {
  return createBase(
    instanceId,
    options?.cardId ?? defaultMonsterCardId,
    "mainMonsterZone",
    { type: "monster" },
    defined({ frameType: options?.frameType }),
    {
      slotIndex: options?.slotIndex ?? 0,
      position: options?.position ?? "faceUp",
      battlePosition: options?.battlePosition,
      placedThisTurn: options?.placedThisTurn,
      counters: options?.counters,
    },
  );
}

/**
 * 魔法カードインスタンスを作成（stateOnField付き）
 *
 * @param instanceId - インスタンスID
 * @param options - オプション設定
 */
export function createSpellOnField(
  instanceId: string,
  options?: {
    cardId?: number;
    spellType?: SpellSubType;
    position?: Position;
    placedThisTurn?: boolean;
    equippedTo?: string;
    slotIndex?: number;
    counters?: readonly CounterState[];
  },
): CardInstance {
  const resolvedSpellType =
    options?.spellType ??
    (options?.cardId !== undefined ? CardDataRegistry.getOrUndefined(options.cardId)?.spellType : undefined);
  const cardId = options?.cardId ?? defaultSpellCardIds[resolvedSpellType ?? "normal"];
  const location = resolvedSpellType === "field" ? "fieldZone" : "spellTrapZone";
  return createBase(
    instanceId,
    cardId,
    location,
    { type: "spell", frameType: "spell" },
    defined({ spellType: options?.spellType }),
    {
      slotIndex: options?.slotIndex ?? 0,
      position: options?.position ?? "faceUp",
      placedThisTurn: options?.placedThisTurn,
      equippedTo: options?.equippedTo,
      counters: options?.counters,
    },
  );
}
