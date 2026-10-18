/**
 * デッキ操作ステップのテスト
 *
 * - SHUFFLE_DECK: デッキシャッフル
 * - RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE: コンテキストのカードを墓地からデッキに戻す
 */

import { describe, it, expect } from "vitest";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { createMockGameState, createMonsterInstance, createStepBuildContext } from "../../../../__testUtils__";

const EFFECT_ID_1 = "12345-activation" as EffectId;

// =============================================================================
// SHUFFLE_DECK
// =============================================================================

describe("StepRegistry - SHUFFLE_DECK", () => {
  it("ステップを生成でき、登録済みである", () => {
    const step = buildStep("SHUFFLE_DECK", {}, createStepBuildContext());

    expect(step.id).toContain("shuffle-deck");
    expect(typeof step.action).toBe("function");
    expect(AtomicStepRegistry.isRegistered("SHUFFLE_DECK")).toBe(true);
  });

  it("action実行でデッキ枚数を変えずに成功する", () => {
    const state = createMockGameState({
      space: {
        mainDeck: [
          createMonsterInstance("deck-1", { location: "mainDeck" }),
          createMonsterInstance("deck-2", { location: "mainDeck" }),
          createMonsterInstance("deck-3", { location: "mainDeck" }),
        ],
      },
    });

    const step = buildStep("SHUFFLE_DECK", {}, createStepBuildContext());
    const result = step.action(state);

    expect(result.success).toBe(true);
    expect(result.updatedState.space.mainDeck.length).toBe(3);
  });
});

// =============================================================================
// RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE
// =============================================================================

describe("StepRegistry - RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE", () => {
  describe("ステップ生成", () => {
    it("effectIdをcontextから取得してステップを生成できる", () => {
      const step = buildStep(
        "RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE",
        {},
        createStepBuildContext({ effectId: EFFECT_ID_1 }),
      );

      expect(step.id).toContain("return-context-cards-to-deck-shuffle");
      expect(typeof step.action).toBe("function");
    });

    it("effectIdがない場合エラー", () => {
      expect(() => {
        buildStep("RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE", {}, createStepBuildContext());
      }).toThrow("RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE step requires effectId");
    });
  });

  describe("action実行", () => {
    it("墓地の対象カードをデッキに戻し、コンテキストをクリアする", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: ["gy-1", "gy-2"] },
      };
      const state = createMockGameState({
        activationContexts: contexts,
        space: {
          mainDeck: [createMonsterInstance("deck-1", { location: "mainDeck" })],
          graveyard: [
            createMonsterInstance("gy-1", { location: "graveyard" }),
            createMonsterInstance("gy-2", { location: "graveyard" }),
          ],
        },
      });

      const step = buildStep(
        "RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE",
        {},
        createStepBuildContext({ effectId: EFFECT_ID_1 }),
      );
      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.message).toContain("2枚");
      expect(result.updatedState.space.mainDeck.length).toBe(3); // 1 + 2
      expect(result.updatedState.space.graveyard.length).toBe(0);
      expect(result.updatedState.activationContexts[EFFECT_ID_1]).toBeUndefined();
    });

    it("対象が墓地にいない場合はスキップ（0枚）となる", () => {
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_ID_1]: { targets: ["not-in-gy"] },
      };
      const state = createMockGameState({
        activationContexts: contexts,
        space: {
          mainDeck: [createMonsterInstance("deck-1", { location: "mainDeck" })],
          graveyard: [],
        },
      });

      const step = buildStep(
        "RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE",
        {},
        createStepBuildContext({ effectId: EFFECT_ID_1 }),
      );
      const result = step.action(state);

      expect(result.success).toBe(true);
      expect(result.message).toContain("0枚");
      expect(result.updatedState.space.mainDeck.length).toBe(1);
    });

    it("コンテキストに対象がない場合は失敗する", () => {
      const state = createMockGameState({
        activationContexts: { [EFFECT_ID_1]: { targets: [] } },
      });

      const step = buildStep(
        "RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE",
        {},
        createStepBuildContext({ effectId: EFFECT_ID_1 }),
      );
      const result = step.action(state);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No targets found");
    });
  });
});
