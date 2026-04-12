/**
 * 手札破棄系ステップのテスト
 */

import { describe, it, expect } from "vitest";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { sendToGraveyardStep, discardAllHandStep, selectAndDiscardStep } from "$lib/domain/dsl/steps/builders/discards";
import {
  createMockGameState,
  createMonsterInstance,
  createSpellInstance,
  createStepBuildContext,
} from "../../../../__testUtils__";

// =============================================================================
// SELECT_AND_DISCARD ステップのテスト
// =============================================================================

describe("StepRegistry - SELECT_AND_DISCARD", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1 }, createStepBuildContext());

      expect(step.id).toContain("select-and-discard");
      expect(step.summary).toContain("捨てる");
      expect(typeof step.action).toBe("function");
    });

    it("count: 2 でステップを生成できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 2 }, createStepBuildContext());

      expect(step.summary).toContain("2枚");
    });

    it("filterType: spell でステップを生成できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1, filterType: "spell" }, createStepBuildContext());

      expect(step.summary).toContain("魔法");
    });

    it("filterType: monster でステップを生成できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1, filterType: "monster" }, createStepBuildContext());

      expect(step.summary).toContain("モンスター");
    });

    it("count がない場合エラー", () => {
      expect(() => {
        buildStep("SELECT_AND_DISCARD", {}, createStepBuildContext());
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
      const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });
      const handCard2 = createMonsterInstance("hand-monster-1", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2],
          graveyard: [],
        },
      });

      const step = buildStep("SELECT_AND_DISCARD", { count: 1 }, createStepBuildContext());

      const result = step.action(state, ["hand-monster-0"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(1);
      expect(result.updatedState.space.graveyard.length).toBe(1);
      expect(result.message).toContain("Sent 1 card");
    });

    it("複数カードを墓地に送れる", () => {
      const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });
      const handCard2 = createMonsterInstance("hand-monster-1", { location: "hand" });
      const handCard3 = createMonsterInstance("hand-monster-2", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2, handCard3],
          graveyard: [],
        },
      });

      const step = buildStep("SELECT_AND_DISCARD", { count: 2 }, createStepBuildContext());

      const result = step.action(state, ["hand-monster-0", "hand-monster-1"]);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(1);
      expect(result.updatedState.space.graveyard.length).toBe(2);
    });

    it("指定枚数と異なる枚数を選択した場合エラー", () => {
      const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });
      const handCard2 = createMonsterInstance("hand-monster-1", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2],
          graveyard: [],
        },
      });

      const step = buildStep("SELECT_AND_DISCARD", { count: 2 }, createStepBuildContext());

      // 1枚しか選択しない
      const result = step.action(state, ["hand-monster-0"]);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Must select exactly 2");
    });

    it("sentToGraveyard イベントが発行される", () => {
      const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1],
          graveyard: [],
        },
      });

      const step = buildStep("SELECT_AND_DISCARD", { count: 1 }, createStepBuildContext());

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
      const step = buildStep("SELECT_AND_DISCARD", { count: 1 }, createStepBuildContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?._sourceZone).toBe("hand");
    });

    it("minCards と maxCards が count に設定される", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 2 }, createStepBuildContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?.minCards).toBe(2);
      expect(config?.maxCards).toBe(2);
    });

    it("cancelable: true を指定できる", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1, cancelable: true }, createStepBuildContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?.cancelable).toBe(true);
    });

    it("_filter が filterType でフィルタリングする", () => {
      const step = buildStep("SELECT_AND_DISCARD", { count: 1, filterType: "spell" }, createStepBuildContext());
      const config = step.cardSelectionConfig!(createMockGameState());
      const filter = config?._filter;
      expect(filter).toBeDefined();

      const spell = createSpellInstance("test-spell", { spellType: "normal", location: "hand" });
      const monster = createMonsterInstance("test-monster", { location: "hand" });

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
      const step = buildStep("DISCARD_ALL_HAND_END_PHASE", {}, createStepBuildContext());

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
      const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });
      const handCard2 = createSpellInstance("hand-spell-0", { spellType: "normal", location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2],
          graveyard: [],
        },
      });

      const step = buildStep("DISCARD_ALL_HAND_END_PHASE", {}, createStepBuildContext());

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
    const card = createMonsterInstance("card-instance-1", { location: "hand" });

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
    const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });
    const handCard2 = createSpellInstance("hand-spell-0", { spellType: "normal", location: "hand" });

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
    const config1 = step.cardSelectionConfig!(createMockGameState());
    expect(config1?.minCards).toBe(2);
    expect(config1?.maxCards).toBe(2);
  });

  it("cancelable オプションを指定できる", () => {
    const step = selectAndDiscardStep(1, true);
    const config = step.cardSelectionConfig!(createMockGameState());

    expect(config?.cancelable).toBe(true);
  });

  it("filterType オプションを指定できる", () => {
    const step = selectAndDiscardStep(1, false, "trap");

    expect(step.id).toContain("trap");
    expect(step.summary).toContain("罠");
  });
});
