import { describe, it, expect } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { sendToGraveyardStep, discardAllHandStep, selectAndDiscardStep } from "$lib/domain/dsl/steps/builders/discards";
import { createMockGameState, createTestMonsterCard, createTestSpellCard, TEST_CARD_IDS } from "../../../__testUtils__";

/**
 * DiscardSteps Tests - 手札破棄系ステップのテスト
 *
 * TEST STRATEGY:
 * - SELECT_AND_DISCARD ステップが正しく動作すること
 * - DISCARD_ALL_HAND_END_PHASE ステップが正しく動作すること
 * - sentToGraveyard イベントが発行されること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

const createTestContext = (): StepBuildContext => ({
  cardId: TEST_CARD_IDS.DUMMY,
  sourceInstanceId: "source-card",
});

// =============================================================================
// SELECT_AND_DISCARD ステップのテスト
// =============================================================================

describe("StepRegistry - SELECT_AND_DISCARD", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1 }, createTestContext());

      expect(step.id).toContain("select-and-discard");
      expect(step.summary).toContain("捨てる");
      expect(typeof step.action).toBe("function");
    });

    it("count: 2 でステップを生成できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 2 }, createTestContext());

      expect(step.summary).toContain("2枚");
    });

    it("filterType: spell でステップを生成できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1, filterType: "spell" }, createTestContext());

      expect(step.summary).toContain("魔法");
    });

    it("filterType: monster でステップを生成できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1, filterType: "monster" }, createTestContext());

      expect(step.summary).toContain("モンスター");
    });

    it("count がない場合エラー", () => {
      expect(() => {
        buildStep("SELECT_AND_DISCARD", {}, createTestContext());
      }).toThrow("Argument 'count' must be a positive integer");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SELECT_AND_DISCARD")).toBe(true);
    });

    it("getRegisteredNames に含まれる", () => {
      const names = AtomicStepRegistry.getRegisteredNames();
      expect(names).toContain("SELECT_AND_DISCARD");
    });
  });

  describe("action実行", () => {
    it("選択したカードを墓地に送れる", () => {
      const handCard1 = createTestMonsterCard("hand-monster-0", { location: "hand" });
      const handCard2 = createTestMonsterCard("hand-monster-1", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2],
          graveyard: [],
        },
      });

      const step = buildStep("SELECT_AND_DISCARD", { count: 1 }, createTestContext());

      const result = step.action(state, ["hand-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(1);
      expect(result.updatedState.space.graveyard.length).toBe(1);
      expect(result.message).toContain("Sent 1 card");
    });

    it("複数カードを墓地に送れる", () => {
      const handCard1 = createTestMonsterCard("hand-monster-0", { location: "hand" });
      const handCard2 = createTestMonsterCard("hand-monster-1", { location: "hand" });
      const handCard3 = createTestMonsterCard("hand-monster-2", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2, handCard3],
          graveyard: [],
        },
      });

      const step = buildStep("SELECT_AND_DISCARD", { count: 2 }, createTestContext());

      const result = step.action(state, ["hand-monster-0", "hand-monster-1"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(1);
      expect(result.updatedState.space.graveyard.length).toBe(2);
    });

    it("指定枚数と異なる枚数を選択した場合エラー", () => {
      const handCard1 = createTestMonsterCard("hand-monster-0", { location: "hand" });
      const handCard2 = createTestMonsterCard("hand-monster-1", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2],
          graveyard: [],
        },
      });

      const step = buildStep("SELECT_AND_DISCARD", { count: 2 }, createTestContext());

      // 1枚しか選択しない
      const result = step.action(state, ["hand-monster-0"]);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Must select exactly 2");
    });

    it("sentToGraveyard イベントが発行される", () => {
      const handCard1 = createTestMonsterCard("hand-monster-0", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1],
          graveyard: [],
        },
      });

      const step = buildStep("SELECT_AND_DISCARD", { count: 1 }, createTestContext());

      const result = step.action(state, ["hand-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.emittedEvents).toBeDefined();
      // モンスターの場合: sentToGraveyard + monsterSentToGraveyard の2イベント
      expect(result.emittedEvents?.length).toBe(2);
      expect(result.emittedEvents?.[0].type).toBe("sentToGraveyard");
      expect(result.emittedEvents?.[1].type).toBe("monsterSentToGraveyard");
    });
  });

  describe("cardSelectionConfig プロパティ", () => {
    it("_sourceZone が hand に設定される", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1 }, createTestContext());

      expect(step.cardSelectionConfig?._sourceZone).toBe("hand");
    });

    it("minCards と maxCards が count に設定される", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 2 }, createTestContext());

      expect(step.cardSelectionConfig?.minCards).toBe(2);
      expect(step.cardSelectionConfig?.maxCards).toBe(2);
    });

    it("cancelable: true を指定できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1, cancelable: true }, createTestContext());

      expect(step.cardSelectionConfig?.cancelable).toBe(true);
    });

    it("_filter が filterType でフィルタリングする", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1, filterType: "spell" }, createTestContext());

      const filter = step.cardSelectionConfig?._filter;
      expect(filter).toBeDefined();

      const spell = createTestSpellCard("test-spell", "normal", { location: "hand" });
      const monster = createTestMonsterCard("test-monster", { location: "hand" });

      expect(filter!(spell)).toBe(true);
      expect(filter!(monster)).toBe(false);
    });
  });
});

// =============================================================================
// DISCARD_ALL_HAND_END_PHASE ステップのテスト
// =============================================================================

describe("StepRegistry - DISCARD_ALL_HAND_END_PHASE", () => {
  describe("ステップ生成", () => {
    it("ステップを生成できる", () => {
      const step = buildStep("DISCARD_ALL_HAND_END_PHASE", {}, createTestContext());

      expect(step.id).toContain("end-phase");
      expect(step.summary).toContain("全て捨てる");
      expect(typeof step.action).toBe("function");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("DISCARD_ALL_HAND_END_PHASE")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("エンドフェイズ効果をキューに登録できる", () => {
      const handCard1 = createTestMonsterCard("hand-monster-0", { location: "hand" });
      const handCard2 = createTestSpellCard("hand-spell-0", "normal", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2],
          graveyard: [],
        },
      });

      const step = buildStep("DISCARD_ALL_HAND_END_PHASE", {}, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      // エンドフェイズ効果IDがキューに登録される
      expect(result.updatedState.queuedEndPhaseEffectIds.length).toBe(1);
    });
  });
});

// =============================================================================
// 直接関数呼び出しのテスト
// =============================================================================

describe("sendToGraveyardStep", () => {
  it("墓地送りステップを生成できる", () => {
    const step = sendToGraveyardStep("card-instance-1", "テストカード");

    expect(step.id).toContain("send");
    expect(step.id).toContain("graveyard");
    expect(step.description).toContain("テストカード");
  });

  it("カードを墓地に送れる", () => {
    const card = createTestMonsterCard("card-instance-1", { location: "hand" });

    const state = createMockGameState({
      space: {
        hand: [card],
        graveyard: [],
      },
    });

    const step = sendToGraveyardStep("card-instance-1", "テストカード");
    const result = step.action(state);

    expect(result.success).toBe(true);
    expect(result.updatedState.space.hand.length).toBe(0);
    expect(result.updatedState.space.graveyard.length).toBe(1);
    expect(result.emittedEvents?.[0].type).toBe("sentToGraveyard");
  });
});

describe("discardAllHandStep", () => {
  it("手札全て捨てるステップを生成できる", () => {
    const step = discardAllHandStep();

    expect(step.id).toContain("discard-all-hand");
    expect(step.summary).toContain("全て");
  });

  it("手札全てを墓地に送れる", () => {
    const handCard1 = createTestMonsterCard("hand-monster-0", { location: "hand" });
    const handCard2 = createTestSpellCard("hand-spell-0", "normal", { location: "hand" });

    const state = createMockGameState({
      space: {
        hand: [handCard1, handCard2],
        graveyard: [],
      },
    });

    const step = discardAllHandStep();
    const result = step.action(state);

    expect(result.success).toBe(true);
    expect(result.updatedState.space.hand.length).toBe(0);
    expect(result.updatedState.space.graveyard.length).toBe(2);
  });

  it("手札が空の場合は何もしない", () => {
    const state = createMockGameState({
      space: {
        hand: [],
        graveyard: [],
      },
    });

    const step = discardAllHandStep();
    const result = step.action(state);

    expect(result.success).toBe(true);
    expect(result.message).toContain("No cards in hand");
  });
});

describe("selectAndDiscardStep", () => {
  it("指定枚数の破棄ステップを生成できる", () => {
    const step = selectAndDiscardStep(2);

    expect(step.id).toContain("select-and-discard");
    expect(step.id).toContain("2");
    expect(step.cardSelectionConfig?.minCards).toBe(2);
    expect(step.cardSelectionConfig?.maxCards).toBe(2);
  });

  it("cancelable オプションを指定できる", () => {
    const step = selectAndDiscardStep(1, true);

    expect(step.cardSelectionConfig?.cancelable).toBe(true);
  });

  it("filterType オプションを指定できる", () => {
    const step = selectAndDiscardStep(1, false, "trap");

    expect(step.id).toContain("trap");
    expect(step.summary).toContain("罠");
  });
});
