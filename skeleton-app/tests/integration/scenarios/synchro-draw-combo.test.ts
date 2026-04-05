/**
 * シンクロ召喚連鎖ドロー シナリオテスト
 *
 * シナリオ:
 * 1. ＴＧ ハイパー・ライブラリアン (Lv5) をシンクロ召喚
 *    → ライブラリアンは自身の召喚では誘発しない (excludeSelf: true)
 * 2. フォーミュラ・シンクロン (Lv2) をシンクロ召喚
 *    → ライブラリアン誘発: 他のシンクロ召喚時 → 1枚ドロー
 *    → フォーミュラ誘発: このカードのシンクロ召喚時 → 1枚ドロー
 *    合計 2枚ドロー
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { CardDataRegistry } from "$lib/domain/cards";
import type { CardInstance, FrameSubType } from "$lib/domain/models/Card";
import { createInitialStateOnField } from "$lib/domain/models/Card/StateOnField";
import {
  createMockGameState,
  createTestTunerCard,
  createFilledMainDeck,
  flushEffectQueue,
  resolveCardSelection,
  hasCardSelection,
  hasOptionalTrigger,
  resolveOptionalTrigger,
  getState,
} from "../../__testUtils__";
import { SYNCHRO_TEST_CARD_IDS } from "../../__testUtils__/constants";

const TG_HYPER_LIBRARIAN_ID = 90953320; // Lv5 シンクロ
const FORMULA_SYNCHRON_ID = 50091196; // Lv2 シンクロ

/** 実在シンクロモンスターのカードインスタンスを生成する */
function createRealSynchroCard(
  id: number,
  instanceId: string,
  location: "extraDeck" | "mainMonsterZone",
): CardInstance {
  const registeredCard = CardDataRegistry.getOrUndefined(id);
  const baseInstance = {
    instanceId,
    id,
    jaName: registeredCard?.jaName ?? `Card-${id}`,
    type: "monster" as const,
    frameType: "synchro" as FrameSubType,
    monsterTypeList: registeredCard?.monsterTypeList ?? ["effect"],
    level: registeredCard?.level,
    edition: registeredCard?.edition ?? ("latest" as const),
    location,
  };
  if (location === "mainMonsterZone") {
    return {
      ...baseInstance,
      stateOnField: createInitialStateOnField({ position: "faceUp" }),
    };
  }
  return baseInstance;
}

/** 非チューナーモンスターのカードインスタンスを生成する */
function createNonTunerCard(instanceId: string, level: 1 | 4): CardInstance {
  const cardIdMap: Record<1 | 4, number> = {
    1: SYNCHRO_TEST_CARD_IDS.NON_TUNER_LV1,
    4: SYNCHRO_TEST_CARD_IDS.NON_TUNER_LV4,
  };
  const cardId = cardIdMap[level];
  const registeredCard = CardDataRegistry.getOrUndefined(cardId);
  return {
    instanceId,
    id: cardId,
    jaName: registeredCard?.jaName ?? `NonTuner Lv${level}`,
    type: "monster" as const,
    frameType: registeredCard?.frameType ?? ("normal" as FrameSubType),
    monsterTypeList: registeredCard?.monsterTypeList ?? ["normal"],
    level: registeredCard?.level ?? level,
    edition: registeredCard?.edition ?? ("latest" as const),
    location: "mainMonsterZone" as const,
    stateOnField: createInitialStateOnField({ position: "faceUp" }),
  };
}

describe("シンクロ召喚連鎖ドロー - シナリオテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ライブラリアン召喚後にフォーミュラ・シンクロンを召喚→合計2枚ドロー", async () => {
    // 初期状態:
    // - エクストラデッキ: ライブラリアン(Lv5) + フォーミュラ(Lv2)
    // - フィールド:
    //     チューナーLv1 (ライブラリアン素材用: Lv1+Lv4=Lv5)
    //     非チューナーLv4 (ライブラリアン素材用)
    //     チューナーLv1 (フォーミュラ素材用: Lv1+Lv1=Lv2)
    //     非チューナーLv1 (フォーミュラ素材用)
    // - デッキ: ダミー5枚
    // - 手札: なし
    const initialState = createMockGameState({
      phase: "main1",
      space: {
        ...createFilledMainDeck(5),
        extraDeck: [
          createRealSynchroCard(TG_HYPER_LIBRARIAN_ID, "librarian", "extraDeck"),
          createRealSynchroCard(FORMULA_SYNCHRON_ID, "formula", "extraDeck"),
        ],
        mainMonsterZone: [
          createTestTunerCard("tuner-for-librarian", 1),
          createNonTunerCard("nontuner-lv4", 4),
          createTestTunerCard("tuner-for-formula", 1),
          createNonTunerCard("nontuner-lv1", 1),
        ],
        hand: [],
      },
    });
    gameStateStore.set(initialState);

    // ─────────────────────────────────────────────
    // Step 1: ＴＧ ハイパー・ライブラリアン (Lv5) シンクロ召喚
    // ─────────────────────────────────────────────
    expect(facade.canSynchroSummon("librarian")).toBe(true);

    facade.synchroSummon("librarian");
    await flushEffectQueue(); // 素材選択ステップで停止

    expect(hasCardSelection()).toBe(true);
    await resolveCardSelection(["tuner-for-librarian", "nontuner-lv4"]);

    const afterLibrarian = getState();
    // ライブラリアンがフィールドに出る
    expect(afterLibrarian.space.mainMonsterZone.some((c) => c.instanceId === "librarian")).toBe(true);
    // 自身のシンクロ召喚では誘発しないのでドローなし
    expect(afterLibrarian.space.hand.length).toBe(0);
    // 素材2体が墓地へ
    expect(afterLibrarian.space.graveyard.length).toBe(2);

    // ─────────────────────────────────────────────
    // Step 2: フォーミュラ・シンクロン (Lv2) シンクロ召喚
    // ─────────────────────────────────────────────
    expect(facade.canSynchroSummon("formula")).toBe(true);

    facade.synchroSummon("formula");
    await flushEffectQueue(); // 素材選択ステップで停止

    expect(hasCardSelection()).toBe(true);
    await resolveCardSelection(["tuner-for-formula", "nontuner-lv1"]);

    // フォーミュラの任意効果を発動
    expect(hasOptionalTrigger()).toBe(true);
    await resolveOptionalTrigger(true);

    const finalState = getState();
    // フォーミュラとライブラリアンが両方フィールドにいる
    expect(finalState.space.mainMonsterZone.some((c) => c.instanceId === "librarian")).toBe(true);
    expect(finalState.space.mainMonsterZone.some((c) => c.instanceId === "formula")).toBe(true);
    // 合計2枚ドロー
    expect(finalState.space.hand.length).toBe(2);
    expect(finalState.space.mainDeck.length).toBe(3); // 5 - 2 = 3
  });

  it("ライブラリアン召喚時はドローが発生しない", async () => {
    // ライブラリアン自身のシンクロ召喚では誘発しないことを検証
    const initialState = createMockGameState({
      phase: "main1",
      space: {
        ...createFilledMainDeck(5),
        extraDeck: [createRealSynchroCard(TG_HYPER_LIBRARIAN_ID, "librarian", "extraDeck")],
        mainMonsterZone: [createTestTunerCard("tuner-0", 1), createNonTunerCard("nontuner-0", 4)],
        hand: [],
      },
    });
    gameStateStore.set(initialState);

    facade.synchroSummon("librarian");
    await flushEffectQueue();
    await resolveCardSelection(["tuner-0", "nontuner-0"]);

    const after = getState();
    expect(after.space.mainMonsterZone.some((c) => c.instanceId === "librarian")).toBe(true);
    expect(after.space.hand.length).toBe(0); // ドローなし
  });
});
