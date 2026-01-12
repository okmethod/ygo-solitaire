/**
 * Unit tests for PhaseRule
 */

import { describe, it, expect } from "vitest";
import {
  canAdvanceToPhase,
  getNextValidPhase,
  requiresAutoDraw,
  canActivateSpellsInPhase,
  isFirstTurn,
  shouldSkipFirstTurnDraw,
  getPhaseDisplayName,
  getAllPhases,
  isEndPhase,
  validatePhaseTransition,
} from "$lib/domain/rules/PhaseRule";

describe("PhaseRule", () => {
  describe("canAdvanceToPhase", () => {
    it("should allow Draw → Standby", () => {
      expect(canAdvanceToPhase("Draw", "Standby")).toBe(true);
    });

    it("should allow Standby → Main1", () => {
      expect(canAdvanceToPhase("Standby", "Main1")).toBe(true);
    });

    it("should allow Main1 → End", () => {
      expect(canAdvanceToPhase("Main1", "End")).toBe(true);
    });

    it("should allow End → End (循環)", () => {
      expect(canAdvanceToPhase("End", "End")).toBe(true);
    });

    it("should reject Draw → Main1 (skip Standby)", () => {
      expect(canAdvanceToPhase("Draw", "Main1")).toBe(false);
    });

    it("should reject Standby → End (skip Main1)", () => {
      expect(canAdvanceToPhase("Standby", "End")).toBe(false);
    });
  });

  describe("getNextValidPhase", () => {
    it("should return Standby after Draw", () => {
      expect(getNextValidPhase("Draw")).toBe("Standby");
    });

    it("should return Main1 after Standby", () => {
      expect(getNextValidPhase("Standby")).toBe("Main1");
    });

    it("should return End after Main1", () => {
      expect(getNextValidPhase("Main1")).toBe("End");
    });

    it("should return End after End", () => {
      expect(getNextValidPhase("End")).toBe("End");
    });
  });

  describe("requiresAutoDraw", () => {
    it("should return true for Draw phase", () => {
      expect(requiresAutoDraw("Draw")).toBe(true);
    });

    it("should return false for Standby phase", () => {
      expect(requiresAutoDraw("Standby")).toBe(false);
    });

    it("should return false for Main1 phase", () => {
      expect(requiresAutoDraw("Main1")).toBe(false);
    });

    it("should return false for End phase", () => {
      expect(requiresAutoDraw("End")).toBe(false);
    });
  });

  describe("canActivateSpellsInPhase", () => {
    it("should return true for Main1 phase", () => {
      expect(canActivateSpellsInPhase("Main1")).toBe(true);
    });

    it("should return false for Draw phase", () => {
      expect(canActivateSpellsInPhase("Draw")).toBe(false);
    });

    it("should return false for Standby phase", () => {
      expect(canActivateSpellsInPhase("Standby")).toBe(false);
    });

    it("should return false for End phase", () => {
      expect(canActivateSpellsInPhase("End")).toBe(false);
    });
  });

  describe("isFirstTurn", () => {
    it("should return true for turn 1", () => {
      expect(isFirstTurn(1)).toBe(true);
    });

    it("should return false for turn 2", () => {
      expect(isFirstTurn(2)).toBe(false);
    });

    it("should return false for turn 10", () => {
      expect(isFirstTurn(10)).toBe(false);
    });
  });

  describe("shouldSkipFirstTurnDraw", () => {
    it("should return true for turn 1 Draw phase", () => {
      expect(shouldSkipFirstTurnDraw(1, "Draw")).toBe(true);
    });

    it("should return false for turn 1 Main1 phase", () => {
      expect(shouldSkipFirstTurnDraw(1, "Main1")).toBe(false);
    });

    it("should return false for turn 2 Draw phase", () => {
      expect(shouldSkipFirstTurnDraw(2, "Draw")).toBe(false);
    });

    it("should return false for turn 2 Main1 phase", () => {
      expect(shouldSkipFirstTurnDraw(2, "Main1")).toBe(false);
    });
  });

  describe("getPhaseDisplayName", () => {
    it("should return Japanese name for Draw phase", () => {
      expect(getPhaseDisplayName("Draw")).toBe("ドローフェイズ");
    });

    it("should return Japanese name for Standby phase", () => {
      expect(getPhaseDisplayName("Standby")).toBe("スタンバイフェイズ");
    });

    it("should return Japanese name for Main1 phase", () => {
      expect(getPhaseDisplayName("Main1")).toBe("メインフェイズ");
    });

    it("should return Japanese name for End phase", () => {
      expect(getPhaseDisplayName("End")).toBe("エンドフェイズ");
    });
  });

  describe("getAllPhases", () => {
    it("should return all 4 phases in order", () => {
      const phases = getAllPhases();
      expect(phases).toHaveLength(4);
      expect(phases[0]).toBe("Draw");
      expect(phases[1]).toBe("Standby");
      expect(phases[2]).toBe("Main1");
      expect(phases[3]).toBe("End");
    });
  });

  describe("isEndPhase", () => {
    it("should return true for End phase", () => {
      expect(isEndPhase("End")).toBe(true);
    });

    it("should return false for Draw phase", () => {
      expect(isEndPhase("Draw")).toBe(false);
    });

    it("should return false for Main1 phase", () => {
      expect(isEndPhase("Main1")).toBe(false);
    });
  });

  describe("validatePhaseTransition", () => {
    it("should return valid for Draw → Standby", () => {
      const result = validatePhaseTransition("Draw", "Standby");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return invalid with error for Draw → Main1", () => {
      const result = validatePhaseTransition("Draw", "Main1");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid phase transition");
      expect(result.error).toContain("Draw");
      expect(result.error).toContain("Main1");
    });

    it("should return invalid with error for Standby → End", () => {
      const result = validatePhaseTransition("Standby", "End");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Expected: Main1");
    });
  });
});
