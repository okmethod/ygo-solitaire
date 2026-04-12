import { describe, it, expect } from "vitest";
import type { StepBuildContext } from "$lib/domain/dsl/types";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import {
  selectReturnShuffleDrawStep,
  returnAllHandShuffleDrawStep,
} from "$lib/domain/dsl/steps/builders/compositeOperations";
import {
  createMockGameState,
  createMonsterInstance,
  createSpellInstance,
  DUMMY_CARD_IDS,
} from "../../../../__testUtils__";

/**
 * CompositeOperationSteps Tests - 複合操作系ステップのテスト
 *
 * TEST STRATEGY:
 * - SELECT_RETURN_SHUFFLE_DRAW ステップが正しく生成されること
 * - RETURN_ALL_HAND_SHUFFLE_DRAW ステップが正しく生成されること
 * - 手札→デッキ→シャッフル→ドローの一連の処理が正しく動作すること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

const createTestContext = (): StepBuildContext => ({
  cardId: DUMMY_CARD_IDS.NORMAL_MONSTER,
  sourceInstanceId: "source-card",
});

// =============================================================================
// SELECT_RETURN_SHUFFLE_DRAW ステップのテスト
// =============================================================================

describe("StepRegistry - SELECT_RETURN_SHUFFLE_DRAW", () => {
  describe("ステップ生成", () => {
    it("基本パラメータでステップを生成できる", () => {
      const step = buildStep("SELECT_RETURN_SHUFFLE_DRAW", { min: 1 }, createTestContext());

      expect(step.id).toContain("select-and-return-to-deck");
      expect(step.summary).toContain("デッキに戻す");
      expect(typeof step.action).toBe("function");
    });

    it("min と max を指定できる", () => {
      const step = buildStep("SELECT_RETURN_SHUFFLE_DRAW", { min: 2, max: 5 }, createTestContext());

      expect(step.description).toContain("2");
      expect(step.description).toContain("5");
    });

    it("min が負の場合エラー", () => {
      expect(() => {
        buildStep("SELECT_RETURN_SHUFFLE_DRAW", { min: -1 }, createTestContext());
      }).toThrow("SELECT_RETURN_SHUFFLE_DRAW step requires a non-negative min argument");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("SELECT_RETURN_SHUFFLE_DRAW")).toBe(true);
    });

    it("getRegisteredNames に含まれる", () => {
      const names = AtomicStepRegistry.getRegisteredNames();
      expect(names).toContain("SELECT_RETURN_SHUFFLE_DRAW");
    });
  });

  describe("action実行", () => {
    it("選択したカードをデッキに戻して同数ドローできる", () => {
      const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });
      const handCard2 = createMonsterInstance("hand-monster-1", { location: "hand" });
      const deckCard1 = createMonsterInstance("deck-monster-0", { location: "mainDeck" });
      const deckCard2 = createMonsterInstance("deck-monster-1", { location: "mainDeck" });

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2],
          mainDeck: [deckCard1, deckCard2],
        },
      });

      const step = buildStep("SELECT_RETURN_SHUFFLE_DRAW", { min: 1 }, createTestContext());

      // 1枚選択して戻す
      const result = step.action(state, ["hand-monster-0"]);

      expect(result.success).toBe(true);
      // 手札: 1枚戻して1枚ドロー → 2枚のまま
      expect(result.updatedState.space.hand.length).toBe(2);
      // デッキ: 1枚増えて1枚減る → 2枚のまま
      expect(result.updatedState.space.mainDeck.length).toBe(2);
      expect(result.message).toContain("1枚をデッキに戻し");
      expect(result.message).toContain("1枚ドロー");
    });

    it("複数枚を選択して戻してドローできる", () => {
      const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });
      const handCard2 = createMonsterInstance("hand-monster-1", { location: "hand" });
      const handCard3 = createMonsterInstance("hand-monster-2", { location: "hand" });
      const deckCards = Array.from({ length: 5 }, (_, i) =>
        createMonsterInstance(`deck-monster-${i}`, { location: "mainDeck" }),
      );

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2, handCard3],
          mainDeck: deckCards,
        },
      });

      const step = buildStep("SELECT_RETURN_SHUFFLE_DRAW", { min: 1, max: 3 }, createTestContext());

      // 2枚選択して戻す
      const result = step.action(state, ["hand-monster-0", "hand-monster-1"]);

      expect(result.success).toBe(true);
      // 手札: 2枚戻して2枚ドロー → 3枚のまま
      expect(result.updatedState.space.hand.length).toBe(3);
      expect(result.message).toContain("2枚をデッキに戻し");
    });

    it("0枚選択の場合は何もしない", () => {
      const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });

      const state = createMockGameState({
        space: {
          hand: [handCard1],
          mainDeck: [],
        },
      });

      const step = buildStep("SELECT_RETURN_SHUFFLE_DRAW", { min: 0 }, createTestContext());

      const result = step.action(state, []);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(1);
      expect(result.message).toContain("No cards selected");
    });
  });

  describe("cardSelectionConfig プロパティ", () => {
    it("_sourceZone が hand に設定される", () => {
      const step = buildStep("SELECT_RETURN_SHUFFLE_DRAW", { min: 1 }, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?._sourceZone).toBe("hand");
    });

    it("minCards と maxCards が正しく設定される", () => {
      const step = buildStep("SELECT_RETURN_SHUFFLE_DRAW", { min: 2, max: 4 }, createTestContext());
      const config = step.cardSelectionConfig!(createMockGameState());

      expect(config?.minCards).toBe(2);
      expect(config?.maxCards).toBe(4);
    });
  });
});

// =============================================================================
// RETURN_ALL_HAND_SHUFFLE_DRAW ステップのテスト
// =============================================================================

describe("StepRegistry - RETURN_ALL_HAND_SHUFFLE_DRAW", () => {
  describe("ステップ生成", () => {
    it("ステップを生成できる", () => {
      const step = buildStep("RETURN_ALL_HAND_SHUFFLE_DRAW", {}, createTestContext());

      expect(step.id).toContain("return-all-hand-shuffle-draw");
      expect(step.summary).toContain("全て");
      expect(typeof step.action).toBe("function");
    });

    it("isRegistered で登録済みであることを確認できる", () => {
      expect(AtomicStepRegistry.isRegistered("RETURN_ALL_HAND_SHUFFLE_DRAW")).toBe(true);
    });
  });

  describe("action実行", () => {
    it("手札全てをデッキに戻して同数ドローできる", () => {
      const handCard1 = createMonsterInstance("hand-monster-0", { location: "hand" });
      const handCard2 = createSpellInstance("hand-spell-0", { spellType: "normal", location: "hand" });
      const deckCards = Array.from({ length: 10 }, (_, i) =>
        createMonsterInstance(`deck-monster-${i}`, { location: "mainDeck" }),
      );

      const state = createMockGameState({
        space: {
          hand: [handCard1, handCard2],
          mainDeck: deckCards,
        },
      });

      const step = buildStep("RETURN_ALL_HAND_SHUFFLE_DRAW", {}, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      // 手札: 2枚戻して2枚ドロー → 2枚のまま
      expect(result.updatedState.space.hand.length).toBe(2);
      expect(result.message).toContain("2枚をデッキに戻し");
      expect(result.message).toContain("2枚ドロー");
    });

    it("手札が空の場合は何もしない", () => {
      const deckCards = Array.from({ length: 5 }, (_, i) =>
        createMonsterInstance(`deck-monster-${i}`, { location: "mainDeck" }),
      );

      const state = createMockGameState({
        space: {
          hand: [],
          mainDeck: deckCards,
        },
      });

      const step = buildStep("RETURN_ALL_HAND_SHUFFLE_DRAW", {}, createTestContext());

      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(0);
      expect(result.message).toContain("手札がありません");
    });
  });
});

// =============================================================================
// 直接関数呼び出しのテスト
// =============================================================================

describe("selectReturnShuffleDrawStep", () => {
  it("オプション指定でステップを生成できる", () => {
    const step = selectReturnShuffleDrawStep({ min: 1, max: 3 });

    expect(step.id).toContain("select-and-return-to-deck");
    const config = step.cardSelectionConfig!(createMockGameState());
    expect(config?.minCards).toBe(1);
    expect(config?.maxCards).toBe(3);
  });
});

describe("returnAllHandShuffleDrawStep", () => {
  it("ステップを生成できる", () => {
    const step = returnAllHandShuffleDrawStep();

    expect(step.id).toContain("return-all-hand-shuffle-draw");
    expect(step.summary).toContain("全て");
  });
});
