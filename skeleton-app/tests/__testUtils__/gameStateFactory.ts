/**
 * テスト用ゲーム状態ファクトリ
 *
 * テストシナリオで使用する GameSnapshot と CardInstance を生成するユーティリティ
 *
 * ## カードインスタンスファクトリ
 * - createTestMonsterCard: テスト用モンスター
 * - createTestSpellCard: テスト用魔法（spellType指定可）
 * - createTestTrapCard: テスト用罠
 * - createFieldCardInstance: フィールド上のカード（stateOnField付き）
 * - createSpellCard: 魔法カード単体
 * - createSetCard: セット状態のカード
 * - createCardInstances: カードID配列から複数インスタンス生成
 *
 * ## ゲーム状態ファクトリ
 * - createMockGameState: 基本のゲーム状態（部分的な上書き可能）
 * - createExodiaDeckState: エクゾディアデッキの初期状態
 * - createStateWithHand: 手札を指定したゲーム状態
 * - createStateWithSpellOnField: フィールドに魔法カードを配置した状態
 * - createStateWithGraveyard: 墓地を指定したゲーム状態
 * - createExodiaVictoryState: エクゾディア勝利状態
 * - createLPZeroState: LP0敗北状態
 * - createDeckOutState: デッキ切れ敗北状態
 */

import type { GameSnapshot, GamePhase, CardSpace } from "$lib/domain/models/GameState";
import { INITIAL_LP } from "$lib/domain/models/GameState/GameSnapshot";
import type { CardInstance, FrameSubType, SpellSubType, TrapSubType } from "$lib/domain/models/Card";
import type { CounterState } from "$lib/domain/models/Card";
import { createInitialStateOnField } from "$lib/domain/models/Card/StateOnField";
import { Location } from "$lib/domain/models/Location";
import { CardDataRegistry } from "$lib/domain/cards";

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
    edition: registeredCard?.edition ?? "latest",
    location: options?.location ?? "hand",
  };
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
    equip: TEST_CARD_IDS.SPELL_NORMAL,
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
 * 魔法カードインスタンスを作成
 *
 * CardDataRegistry からカード情報を取得し、指定の location に配置。
 *
 * @param instanceId - カードインスタンスID
 * @param cardId - カードID（デフォルト: 1001）
 * @param location - 配置位置（デフォルト: "hand"）
 */
export function createSpellCard(
  instanceId: string,
  cardId: number = TEST_CARD_IDS.SPELL_NORMAL,
  location: keyof CardSpace = "hand",
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

const EXODIA_PIECE_IDS = [
  33396948, // 本体
  7902349, // 左腕
  70903634, // 右腕
  44519536, // 左足
  8124921, // 右足
] as const;

/** テスト用カードID定数 */
const TEST_CARD_IDS = {
  DUMMY: 12345678,
  SPELL_NORMAL: 1001,
  SPELL_QUICK: 1004,
  SPELL_CONTINUOUS: 1005,
  SPELL_FIELD: 1006,
  TRAP_NORMAL: 1007,
} as const;

/** createMockGameState の引数型（space を部分的に上書き可能） */
type GameStateOverrides = Omit<Partial<GameSnapshot>, "space"> & {
  space?: Partial<CardSpace>;
};

/**
 * テスト用の最小限のゲーム状態を作成
 *
 * @param overrides - デフォルト値を上書きする部分的な GameSnapshot
 */
export function createMockGameState(overrides?: GameStateOverrides): GameSnapshot {
  const defaultState: GameSnapshot = {
    space: {
      mainDeck: [],
      extraDeck: [],
      hand: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    lp: {
      player: INITIAL_LP,
      opponent: INITIAL_LP,
    },
    phase: "main1",
    turn: 1,
    result: {
      isGameOver: false,
    },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    queuedEndPhaseEffectIds: [],
    activatedCardIds: new Set<number>(),
  };

  return {
    ...defaultState,
    ...overrides,
    space: {
      ...defaultState.space,
      ...overrides?.space,
    },
    lp: {
      ...defaultState.lp,
      ...overrides?.lp,
    },
    result: {
      ...defaultState.result,
      ...overrides?.result,
    },
  };
}

/**
 * エクゾディアデッキ（40枚）の初期状態を作成
 */
export function createExodiaDeckState(): GameSnapshot {
  const exodiaDeck = [
    ...EXODIA_PIECE_IDS, // 5 Exodia pieces
    19613556, // Pot of Greed (x3)
    19613556,
    19613556,
    79571449, // Graceful Charity (x3)
    79571449,
    79571449,
    32807846, // Reinforcement of the Army (x3)
    32807846,
    32807846,
    73915051, // Swords of Revealing Light (x3)
    73915051,
    73915051,
    45986603, // Backup Soldier (x3)
    45986603,
    45986603,
    // Fill remaining slots with dummy cards to reach 40
    ...Array(40 - 5 - 15).fill(TEST_CARD_IDS.DUMMY),
  ];

  return createMockGameState({
    space: {
      mainDeck: createCardInstances(exodiaDeck, "mainDeck"),
    },
    phase: "draw",
    turn: 1,
  });
}

/**
 * 指定カードを手札に持つゲーム状態を作成
 *
 * @param cardIds - 手札に配置するカードIDの配列
 * @param phase - 現在のフェイズ（デフォルト: "main1"）
 */
export function createStateWithHand(cardIds: (string | number)[], phase: GamePhase = "main1"): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      hand: createCardInstances(cardIds, "hand"),
    },
    phase,
  });
}

/**
 * 魔法・罠ゾーンにカードを配置したゲーム状態を作成
 *
 * @param spellCardId - 配置する魔法カードのID
 */
export function createStateWithSpellOnField(spellCardId: string | number): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(35).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      spellTrapZone: createCardInstances([spellCardId], "spellTrapZone"),
    },
    phase: "main1",
  });
}

/**
 * 墓地にカードを配置したゲーム状態を作成
 *
 * @param cardIds - 墓地に配置するカードIDの配列
 */
export function createStateWithGraveyard(cardIds: (string | number)[]): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      graveyard: createCardInstances(cardIds, "graveyard"),
    },
  });
}

/**
 * エクゾディア全パーツが手札にある勝利状態を作成
 */
export function createExodiaVictoryState(): GameSnapshot {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(35).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      hand: createCardInstances([...EXODIA_PIECE_IDS], "hand"),
    },
    phase: "main1",
    result: {
      isGameOver: true,
      winner: "player",
      reason: "exodia",
      message: "All 5 Exodia pieces are in your hand. You win!",
    },
  });
}

/**
 * LP0（敗北）状態を作成
 */
export function createLPZeroState(): GameSnapshot {
  return createMockGameState({
    lp: {
      player: 0,
      opponent: INITIAL_LP,
    },
    phase: "main1",
    result: {
      isGameOver: true,
      winner: "opponent",
      reason: "lp0",
      message: "Your Life Points reached 0. You lose!",
    },
  });
}

/**
 * デッキ切れ（敗北）状態を作成
 */
export function createDeckOutState(): GameSnapshot {
  return createMockGameState({
    space: {
      hand: createCardInstances([TEST_CARD_IDS.DUMMY], "hand"),
      graveyard: createCardInstances(Array(39).fill(TEST_CARD_IDS.DUMMY), "graveyard"),
    },
    phase: "draw",
    result: {
      isGameOver: true,
      winner: "opponent",
      reason: "deckout",
      message: "You cannot draw from an empty deck. You lose!",
    },
  });
}
