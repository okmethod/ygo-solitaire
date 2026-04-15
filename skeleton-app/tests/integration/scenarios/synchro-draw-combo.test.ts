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
  createSpaceState,
  createMonsterOnField,
  createFilledMainDeck,
  flushEffectQueue,
  resolveCardSelection,
  hasCardSelection,
  hasOptionalTrigger,
  resolveOptionalTrigger,
  getState,
} from "../../__testUtils__";
import { ACTUAL_CARD_IDS } from "../../__testUtils__/constants";

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
    const initialState = createSpaceState({
      ...createFilledMainDeck(5),
      extraDeck: [
        createRealSynchroCard(ACTUAL_CARD_IDS.TG_HYPER_LIBRARIAN, "librarian", "extraDeck"),
        createRealSynchroCard(ACTUAL_CARD_IDS.FORMULA_SYNCHRON, "formula", "extraDeck"),
      ],
      mainMonsterZone: [
        createMonsterOnField("tuner-for-librarian", { isTuner: true, level: 1 }),
        createMonsterOnField("nontuner-lv4", { level: 4 }),
        createMonsterOnField("tuner-for-formula", { isTuner: true, level: 1 }),
        createMonsterOnField("nontuner-lv1", { level: 1 }),
      ],
      hand: [],
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
    const initialState = createSpaceState({
      ...createFilledMainDeck(5),
      extraDeck: [createRealSynchroCard(ACTUAL_CARD_IDS.TG_HYPER_LIBRARIAN, "librarian", "extraDeck")],
      mainMonsterZone: [
        createMonsterOnField("tuner-0", { isTuner: true, level: 1 }),
        createMonsterOnField("nontuner-0", { level: 4 }),
      ],
      hand: [],
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
