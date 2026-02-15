/**
 * Unit tests for PhaseRule
 */

import { describe, it, expect } from "vitest";
import { GameState } from "$lib/domain/models/GameState";

describe("PhaseRule", () => {
  describe("getPhaseDisplayName", () => {
    it("should return Japanese name for Draw phase", () => {
      expect(GameState.Phase.displayName("draw")).toBe("ドローフェイズ");
    });

    it("should return Japanese name for Standby phase", () => {
      expect(GameState.Phase.displayName("standby")).toBe("スタンバイフェイズ");
    });

    it("should return Japanese name for Main1 phase", () => {
      expect(GameState.Phase.displayName("main1")).toBe("メインフェイズ");
    });

    it("should return Japanese name for End phase", () => {
      expect(GameState.Phase.displayName("end")).toBe("エンドフェイズ");
    });
  });

  describe("validatePhaseTransition", () => {
    it("should return valid for Draw → Standby", () => {
      const result = GameState.Phase.changeable("draw", "standby");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return invalid with error for Draw → Main1", () => {
      const result = GameState.Phase.changeable("draw", "main1");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid phase transition");
      expect(result.error).toContain("draw");
      expect(result.error).toContain("main1");
    });

    it("should return invalid with error for Standby → End", () => {
      const result = GameState.Phase.changeable("standby", "end");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Expected: main1");
    });
  });

  describe("canActivateSpellsInPhase", () => {
    it("should return true for Main1 phase", () => {
      expect(GameState.Phase.isMain("main1")).toBe(true);
    });

    it("should return false for Draw phase", () => {
      expect(GameState.Phase.isMain("draw")).toBe(false);
    });

    it("should return false for Standby phase", () => {
      expect(GameState.Phase.isMain("standby")).toBe(false);
    });

    it("should return false for End phase", () => {
      expect(GameState.Phase.isMain("end")).toBe(false);
    });
  });

  describe("isEndPhase", () => {
    it("should return true for End phase", () => {
      expect(GameState.Phase.isEnd("end")).toBe(true);
    });

    it("should return false for Draw phase", () => {
      expect(GameState.Phase.isEnd("draw")).toBe(false);
    });

    it("should return false for Main1 phase", () => {
      expect(GameState.Phase.isEnd("main1")).toBe(false);
    });
  });
});
