/**
 * テスト用カードインスタンス ファクトリ
 *
 * CardInstance を生成するユーティリティ関数群
 *
 * 【フィールド以外向け】stateOnField 無し
 * - createMonsterInstance: モンスター
 * - createSpellInstance: 魔法
 * - createTrapInstance: 罠
 *
 * 【フィールド向け】stateOnField 有り
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

/** isTuner オプションから frameType / monsterTypeList を解決する */
const resolveMonsterOptions = (options?: {
  frameType?: FrameSubType;
  isTuner?: boolean;
  monsterTypeList?: string[];
}) => ({
  resolvedFrameType: options?.frameType ?? (options?.isTuner ? "effect" : undefined),
  resolvedMonsterTypeList: (options?.monsterTypeList ?? (options?.isTuner ? ["effect", "tuner"] : undefined)) as
    | CardData["monsterTypeList"]
    | undefined,
});

/**
 * フィールド配置に必要な spellType / cardId / location を一括解決する
 *
 * フィールド魔法をフィールドゾーンに、それ以外を魔法罠ゾーンに置く。
 * spellType 未指定の場合は、cardIdとレジストリから補完する。
 */
const resolveSpellFieldOptions = (options?: { cardId?: number; spellType?: SpellSubType }) => {
  const spellType =
    options?.spellType ??
    (options?.cardId !== undefined ? CardDataRegistry.getOrUndefined(options.cardId)?.spellType : undefined);
  const cardId = options?.cardId ?? defaultSpellCardIds[spellType ?? "normal"];
  const location: LocationName = spellType === "field" ? "fieldZone" : "spellTrapZone";
  return { spellType, cardId, location };
};

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
// フィールド以外向け（stateOnField 無し）
// =============================================================================

/**
 * テスト用モンスターカードインスタンスを作成（stateOnField 無し）
 *
 * cardId 未指定時は defaultMonsterCardId を使用。
 * cardId 指定時、CardDataRegistry に登録済みであればレジストリ値を優先。
 * isTuner: true の場合、frameType="effect" / monsterTypeList=["effect","tuner"] を自動設定。
 * デフォルトロケーション: 手札
 *
 * @param instanceId - 一意のインスタンスID
 * @param options - オプション設定
 */
export function createMonsterInstance(
  instanceId: string,
  options?: {
    cardId?: number;
    frameType?: FrameSubType;
    location?: LocationName;
    level?: number;
    isTuner?: boolean;
    race?: string;
    attack?: number;
    defense?: number;
    monsterTypeList?: string[];
  },
): CardInstance {
  const { resolvedFrameType, resolvedMonsterTypeList } = resolveMonsterOptions(options);
  return createBase(
    instanceId,
    options?.cardId ?? defaultMonsterCardId,
    options?.location ?? "hand",
    { type: "monster", frameType: "normal" },
    defined({
      frameType: resolvedFrameType,
      level: options?.level,
      race: options?.race,
      attack: options?.attack,
      defense: options?.defense,
      monsterTypeList: resolvedMonsterTypeList,
    }),
  );
}

/**
 * テスト用魔法カードインスタンスを作成（stateOnField 無し）
 *
 * cardId 未指定時は spellType に対応する defaultSpellCardIds を使用。
 * cardId 指定時、CardDataRegistry に登録済みであればレジストリ値を優先。
 * デフォルトロケーション: 手札
 *
 * @param instanceId - 一意のインスタンスID
 * @param options - オプション設定
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
  return createBase(
    instanceId,
    options?.cardId ?? defaultSpellCardIds[spellType],
    options?.location ?? "hand",
    { type: "spell", frameType: "spell" },
    defined({ spellType: options?.spellType }),
  );
}

/**
 * テスト用罠カードインスタンスを作成（stateOnField 無し）
 *
 * cardId 未指定時は trapType に対応する defaultTrapCardIds を使用。
 * デフォルトロケーション: 手札
 *
 * @param instanceId - 一意のインスタンスID
 * @param options - オプション設定
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
  return createBase(
    instanceId,
    options?.cardId ?? defaultTrapCardIds[trapType],
    options?.location ?? "hand",
    { type: "trap", frameType: "trap" },
    defined({ trapType: options?.trapType }),
  );
}

// =============================================================================
// フィールド向け（stateOnField 有り）
// =============================================================================

/**
 * テスト用モンスターカードインスタンスを作成（stateOnField 有り）
 *
 * cardId 未指定時は defaultMonsterCardId を使用。
 * cardId 指定時、CardDataRegistry に登録済みであればレジストリ値を優先。
 * isTuner=true の場合、frameType="effect" / monsterTypeList=["effect","tuner"] を自動設定。
 * isTuner と monsterTypeList / monsterTypeList の同時指定は不可。
 * ロケーション: モンスターゾーン固定
 * デフォルト: slotIndex=0, 表側攻撃表示
 *
 * @param instanceId - 一意のインスタンスID
 * @param options - オプション設定
 */
export function createMonsterOnField(
  instanceId: string,
  options?: {
    cardId?: number;
    isTuner?: boolean;
    frameType?: FrameSubType;
    position?: Position;
    battlePosition?: BattlePosition;
    placedThisTurn?: boolean;
    slotIndex?: number;
    counters?: readonly CounterState[];
    race?: string;
    level?: number;
    attack?: number;
    defense?: number;
    monsterTypeList?: string[];
  },
): CardInstance {
  const { resolvedFrameType, resolvedMonsterTypeList } = resolveMonsterOptions(options);
  return createBase(
    instanceId,
    options?.cardId ?? defaultMonsterCardId,
    "mainMonsterZone",
    { type: "monster" },
    defined({
      frameType: resolvedFrameType,
      race: options?.race,
      level: options?.level,
      attack: options?.attack,
      defense: options?.defense,
      monsterTypeList: resolvedMonsterTypeList,
    }),
    {
      slotIndex: options?.slotIndex ?? 0,
      position: options?.position ?? "faceUp",
      battlePosition: options?.battlePosition ?? "attack",
      placedThisTurn: options?.placedThisTurn ?? false,
      counters: options?.counters ?? [],
    },
  );
}

/**
 * テスト用魔法カードインスタンスを作成（stateOnField 有り）
 *
 * cardId 未指定時は spellType に対応する defaultSpellCardIds を使用。
 * cardId 指定時、CardDataRegistry に登録済みであればレジストリ値を優先。
 * ロケーション: spellType に応じて自動設定（魔法・罠ゾーン or フィールドゾーン）
 * デフォルト: slotIndex=0, 表側表示
 *
 * @param instanceId - 一意のインスタンスID
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
  const { spellType, cardId, location } = resolveSpellFieldOptions(options);
  return createBase(instanceId, cardId, location, { type: "spell", frameType: "spell" }, defined({ spellType }), {
    slotIndex: options?.slotIndex ?? 0,
    position: options?.position ?? "faceUp",
    placedThisTurn: options?.placedThisTurn,
    equippedTo: options?.equippedTo,
    counters: options?.counters,
  });
}
