/**
 * Unit tests for PhaseRule
 */

import { describe, it, expect } from "vitest";
import { getPhaseDisplayName, validatePhaseTransition, isMainPhase, isEndPhase } from "$lib/domain/models/Phase";

describe("PhaseRule", () => {
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

  describe("canActivateSpellsInPhase", () => {
    it("should return true for Main1 phase", () => {
      expect(isMainPhase("Main1")).toBe(true);
    });

    it("should return false for Draw phase", () => {
      expect(isMainPhase("Draw")).toBe(false);
    });

    it("should return false for Standby phase", () => {
      expect(isMainPhase("Standby")).toBe(false);
    });

    it("should return false for End phase", () => {
      expect(isMainPhase("End")).toBe(false);
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
});
