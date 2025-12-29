import { describe, it, expect } from "vitest";
import { ExodiaVictoryRule } from "$lib/domain/effects/additional/ExodiaVictoryRule";
import { createExodiaVictoryState, createMockGameState } from "../../../../__testUtils__/gameStateFactory";

describe("ExodiaVictoryRule", () => {
  const rule = new ExodiaVictoryRule();

  describe("metadata", () => {
    it("should have isEffect = false", () => {
      expect(rule.isEffect).toBe(false);
    });

    it("should have category = VictoryCondition", () => {
      expect(rule.category).toBe("VictoryCondition");
    });
  });

  describe("canApply()", () => {
    it("should return true when all 5 Exodia pieces are in hand", () => {
      const state = createExodiaVictoryState();
      expect(rule.canApply(state, {})).toBe(true);
    });

    it("should return false when Exodia is incomplete", () => {
      const state = createMockGameState({ zones: { hand: [] } });
      expect(rule.canApply(state, {})).toBe(false);
    });
  });

  describe("checkPermission()", () => {
    it("should return true when canApply() is true", () => {
      const state = createExodiaVictoryState();
      expect(rule.checkPermission(state, {})).toBe(true);
    });
  });
});
