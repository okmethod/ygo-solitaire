/**
 * ActivationContext Tests
 *
 * 効果発動時のコンテキスト管理機能のテスト。
 * 純粋関数のテストとして、入力と出力の検証および不変性の確認を行う。
 *
 * @module tests/unit/domain/models/ActivationContext
 */

import { describe, it, expect } from "vitest";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import {
  setActivationTargets,
  getActivationTargets,
  setPaidCosts,
  getPaidCosts,
  clearActivationContext,
  setCalculatedDamage,
  getCalculatedDamage,
  setDeclaredInteger,
  getDeclaredInteger,
} from "$lib/domain/models/GameState/ActivationContext";

describe("ActivationContext", () => {
  describe("setActivationTargets / getActivationTargets", () => {
    it("should set targets for a new effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {};
      const effectId = "effect-1";
      const targets = ["card-1", "card-2"];

      // Act
      const result = setActivationTargets(contexts, effectId, targets);

      // Assert
      expect(result[effectId]).toBeDefined();
      expect(result[effectId].targets).toEqual(targets);
    });

    it("should get targets for an existing effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {
        "effect-1": { targets: ["card-1", "card-2"] },
      };

      // Act
      const result = getActivationTargets(contexts, "effect-1");

      // Assert
      expect(result).toEqual(["card-1", "card-2"]);
    });

    it("should return empty array for non-existent effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {};

      // Act
      const result = getActivationTargets(contexts, "non-existent");

      // Assert
      expect(result).toEqual([]);
    });

    it("should preserve existing context properties when setting targets", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {
        "effect-1": { targets: [], paidCosts: 100 },
      };

      // Act
      const result = setActivationTargets(contexts, "effect-1", ["card-1"]);

      // Assert
      expect(result["effect-1"].targets).toEqual(["card-1"]);
      expect(result["effect-1"].paidCosts).toBe(100);
    });

    it("should not mutate original contexts", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {};

      // Act
      setActivationTargets(contexts, "effect-1", ["card-1"]);

      // Assert - original should be unchanged
      expect(contexts["effect-1"]).toBeUndefined();
    });
  });

  describe("setPaidCosts / getPaidCosts", () => {
    it("should set paid costs for a new effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {};

      // Act
      const result = setPaidCosts(contexts, "effect-1", 1000);

      // Assert
      expect(result["effect-1"].paidCosts).toBe(1000);
    });

    it("should get paid costs for an existing effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {
        "effect-1": { targets: [], paidCosts: 500 },
      };

      // Act
      const result = getPaidCosts(contexts, "effect-1");

      // Assert
      expect(result).toBe(500);
    });

    it("should return undefined for non-existent effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {};

      // Act
      const result = getPaidCosts(contexts, "non-existent");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("setCalculatedDamage / getCalculatedDamage", () => {
    it("should set calculated damage for an effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {};

      // Act
      const result = setCalculatedDamage(contexts, "effect-1", 2000);

      // Assert
      expect(result["effect-1"].calculatedDamage).toBe(2000);
    });

    it("should get calculated damage for an existing effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {
        "effect-1": { targets: [], calculatedDamage: 1500 },
      };

      // Act
      const result = getCalculatedDamage(contexts, "effect-1");

      // Assert
      expect(result).toBe(1500);
    });

    it("should return undefined for effect without calculated damage", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {
        "effect-1": { targets: [] },
      };

      // Act
      const result = getCalculatedDamage(contexts, "effect-1");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("setDeclaredInteger / getDeclaredInteger", () => {
    it("should set declared integer for an effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {};

      // Act
      const result = setDeclaredInteger(contexts, "effect-1", 5);

      // Assert
      expect(result["effect-1"].declaredInteger).toBe(5);
    });

    it("should get declared integer for an existing effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {
        "effect-1": { targets: [], declaredInteger: 3 },
      };

      // Act
      const result = getDeclaredInteger(contexts, "effect-1");

      // Assert
      expect(result).toBe(3);
    });

    it("should return undefined for effect without declared integer", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {};

      // Act
      const result = getDeclaredInteger(contexts, "non-existent");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("clearActivationContext", () => {
    it("should remove context for specified effect", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {
        "effect-1": { targets: ["card-1"] },
        "effect-2": { targets: ["card-2"] },
      };

      // Act
      const result = clearActivationContext(contexts, "effect-1");

      // Assert
      expect(result["effect-1"]).toBeUndefined();
      expect(result["effect-2"]).toBeDefined();
    });

    it("should return same object if effect does not exist", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {
        "effect-1": { targets: [] },
      };

      // Act
      const result = clearActivationContext(contexts, "non-existent");

      // Assert
      expect(result).toBe(contexts);
    });

    it("should not mutate original contexts", () => {
      // Arrange
      const contexts: Record<string, EffectActivationContext> = {
        "effect-1": { targets: ["card-1"] },
      };

      // Act
      clearActivationContext(contexts, "effect-1");

      // Assert - original should be unchanged
      expect(contexts["effect-1"]).toBeDefined();
    });
  });
});
