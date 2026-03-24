/**
 * シンクロ召喚テスト用ヘルパー
 *
 * シンクロ召喚関連のテストで使用するカードインスタンスとゲーム状態を生成
 *
 * - createTestTunerCard: チューナーモンスター
 * - createTestSynchroMonster: シンクロモンスター
 * - createSynchroSummonReadyState: シンクロ召喚可能な状態
 * - createSynchroSummonNoTunerState: チューナーなし状態
 * - createSynchroSummonLevelMismatchState: レベル不一致状態
 */

import type { CardInstance, FrameSubType } from "$lib/domain/models/Card";
import type { CardSpace } from "$lib/domain/models/GameState";
import { createInitialStateOnField } from "$lib/domain/models/Card/StateOnField";
import { Location } from "$lib/domain/models/Location";
import { CardDataRegistry } from "$lib/domain/cards";
import { SYNCHRO_TEST_CARD_IDS, TEST_CARD_IDS } from "./constants";
import { createCardInstances } from "./cardInstanceFactory";
import { createMockGameState } from "./gameStateFactory";

/**
 * テスト用チューナーモンスターを作成
 *
 * @param instanceId - インスタンスID
 * @param level - チューナーのレベル（1-3、デフォルト: 2）
 * @param options - オプション設定
 */
export function createTestTunerCard(
  instanceId: string,
  level: 1 | 2 | 3 = 2,
  options?: { location?: keyof CardSpace },
): CardInstance {
  const cardIdMap: Record<1 | 2 | 3, number> = {
    1: SYNCHRO_TEST_CARD_IDS.TUNER_LV1,
    2: SYNCHRO_TEST_CARD_IDS.TUNER_LV2,
    3: SYNCHRO_TEST_CARD_IDS.TUNER_LV3,
  };
  const cardId = cardIdMap[level];
  const registeredCard = CardDataRegistry.getOrUndefined(cardId);
  const location = options?.location ?? "mainMonsterZone";

  const baseInstance = {
    instanceId,
    id: cardId,
    jaName: registeredCard?.jaName ?? `Test Tuner Lv${level}`,
    type: "monster" as const,
    frameType: registeredCard?.frameType ?? ("effect" as FrameSubType),
    monsterTypeList: registeredCard?.monsterTypeList ?? ["effect", "tuner"],
    level: registeredCard?.level ?? level,
    edition: registeredCard?.edition ?? ("latest" as const),
    location,
  };

  if (Location.isField(location)) {
    return {
      ...baseInstance,
      stateOnField: createInitialStateOnField({ position: "faceUp" }),
    };
  }
  return baseInstance;
}

/**
 * テスト用シンクロモンスターを作成
 *
 * @param instanceId - インスタンスID
 * @param level - シンクロモンスターのレベル（5-8、デフォルト: 6）
 * @param options - オプション設定
 */
export function createTestSynchroMonster(
  instanceId: string,
  level: 5 | 6 | 7 | 8 = 6,
  options?: { location?: keyof CardSpace },
): CardInstance {
  const cardIdMap: Record<5 | 6 | 7 | 8, number> = {
    5: SYNCHRO_TEST_CARD_IDS.SYNCHRO_LV5,
    6: SYNCHRO_TEST_CARD_IDS.SYNCHRO_LV6,
    7: SYNCHRO_TEST_CARD_IDS.SYNCHRO_LV7,
    8: SYNCHRO_TEST_CARD_IDS.SYNCHRO_LV8,
  };
  const cardId = cardIdMap[level];
  const registeredCard = CardDataRegistry.getOrUndefined(cardId);
  const location = options?.location ?? "extraDeck";

  const baseInstance = {
    instanceId,
    id: cardId,
    jaName: registeredCard?.jaName ?? `Test Synchro Lv${level}`,
    type: "monster" as const,
    frameType: "synchro" as FrameSubType,
    monsterTypeList: registeredCard?.monsterTypeList ?? ["effect"],
    level: registeredCard?.level ?? level,
    edition: registeredCard?.edition ?? ("latest" as const),
    location,
  };

  if (Location.isField(location)) {
    return {
      ...baseInstance,
      stateOnField: createInitialStateOnField({ position: "faceUp" }),
    };
  }
  return baseInstance;
}

/**
 * シンクロ召喚可能な状態を作成（フィールドにチューナー+非チューナー、EXにシンクロ）
 *
 * @param options - オプション設定
 *   - tunerLevel: チューナーのレベル（デフォルト: 2）
 *   - nonTunerLevels: 非チューナーのレベル配列（デフォルト: [4]）
 *   - synchroLevel: シンクロモンスターのレベル（デフォルト: 6）
 */
export function createSynchroSummonReadyState(options?: {
  tunerLevel?: 1 | 2 | 3;
  nonTunerLevels?: (1 | 2 | 3 | 4)[];
  synchroLevel?: 5 | 6 | 7 | 8;
}): ReturnType<typeof createMockGameState> {
  const tunerLevel = options?.tunerLevel ?? 2;
  const nonTunerLevels = options?.nonTunerLevels ?? [4];
  const synchroLevel = options?.synchroLevel ?? 6;

  const nonTunerCardIdMap: Record<1 | 2 | 3 | 4, number> = {
    1: SYNCHRO_TEST_CARD_IDS.NON_TUNER_LV1,
    2: SYNCHRO_TEST_CARD_IDS.NON_TUNER_LV2,
    3: SYNCHRO_TEST_CARD_IDS.NON_TUNER_LV3,
    4: SYNCHRO_TEST_CARD_IDS.NON_TUNER_LV4,
  };

  // フィールド上のモンスター配列を作成
  const monstersOnField: CardInstance[] = [
    createTestTunerCard("tuner-0", tunerLevel, { location: "mainMonsterZone" }),
    ...nonTunerLevels.map((lvl, index) => {
      const cardId = nonTunerCardIdMap[lvl];
      const registeredCard = CardDataRegistry.getOrUndefined(cardId);
      return {
        instanceId: `nontuner-${index}`,
        id: cardId,
        jaName: registeredCard?.jaName ?? `Test NonTuner Lv${lvl}`,
        type: "monster" as const,
        frameType: registeredCard?.frameType ?? ("normal" as FrameSubType),
        monsterTypeList: registeredCard?.monsterTypeList ?? (["normal"] as const),
        level: registeredCard?.level ?? lvl,
        edition: registeredCard?.edition ?? ("latest" as const),
        location: "mainMonsterZone" as const,
        stateOnField: createInitialStateOnField({ position: "faceUp" }),
      };
    }),
  ];

  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      extraDeck: [createTestSynchroMonster("synchro-0", synchroLevel, { location: "extraDeck" })],
      mainMonsterZone: monstersOnField,
    },
    phase: "main1",
  });
}

/**
 * シンクロ召喚不可能な状態を作成（チューナーなし）
 */
export function createSynchroSummonNoTunerState(): ReturnType<typeof createMockGameState> {
  const nonTunerCardId = SYNCHRO_TEST_CARD_IDS.NON_TUNER_LV4;
  const registeredCard = CardDataRegistry.getOrUndefined(nonTunerCardId);

  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      extraDeck: [createTestSynchroMonster("synchro-0", 6, { location: "extraDeck" })],
      mainMonsterZone: [
        {
          instanceId: "nontuner-0",
          id: nonTunerCardId,
          jaName: registeredCard?.jaName ?? "Test NonTuner Lv4",
          type: "monster" as const,
          frameType: registeredCard?.frameType ?? ("normal" as FrameSubType),
          monsterTypeList: registeredCard?.monsterTypeList ?? (["normal"] as const),
          level: registeredCard?.level ?? 4,
          edition: registeredCard?.edition ?? ("latest" as const),
          location: "mainMonsterZone" as const,
          stateOnField: createInitialStateOnField({ position: "faceUp" }),
        },
      ],
    },
    phase: "main1",
  });
}

/**
 * シンクロ召喚不可能な状態を作成（レベル不一致）
 */
export function createSynchroSummonLevelMismatchState(): ReturnType<typeof createMockGameState> {
  return createMockGameState({
    space: {
      mainDeck: createCardInstances(Array(30).fill(TEST_CARD_IDS.DUMMY), "mainDeck"),
      extraDeck: [createTestSynchroMonster("synchro-0", 8, { location: "extraDeck" })], // Lv8 シンクロ
      mainMonsterZone: [
        createTestTunerCard("tuner-0", 1, { location: "mainMonsterZone" }), // Lv1 チューナー
        // Lv1 + Lv4 = Lv5 ≠ Lv8
        {
          instanceId: "nontuner-0",
          id: SYNCHRO_TEST_CARD_IDS.NON_TUNER_LV4,
          jaName: "Test NonTuner Lv4",
          type: "monster" as const,
          frameType: "normal" as FrameSubType,
          monsterTypeList: ["normal"] as const,
          level: 4,
          edition: "latest" as const,
          location: "mainMonsterZone" as const,
          stateOnField: createInitialStateOnField({ position: "faceUp" }),
        },
      ],
    },
    phase: "main1",
  });
}
