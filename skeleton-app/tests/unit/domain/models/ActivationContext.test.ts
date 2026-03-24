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
import type { EffectId } from "$lib/domain/models/Effect";

// Test helper: EffectId constants
const EFFECT_1 = "effect-1" as EffectId;
const EFFECT_2 = "effect-2" as EffectId;
const NON_EXISTENT = "non-existent" as EffectId;

describe("ActivationContext", () => {
  describe("setActivationTargets / getActivationTargets", () => {
    it("should set targets for a new effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {};
      const effectId = EFFECT_1;
      const targets = ["card-1", "card-2"];

      // Act
      const result = setActivationTargets(contexts, effectId, targets);

      // Assert
      expect(result[effectId]).toBeDefined();
      expect(result[effectId].targets).toEqual(targets);
    });

    it("should get targets for an existing effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_1]: { targets: ["card-1", "card-2"] },
      };

      // Act
      const result = getActivationTargets(contexts, EFFECT_1);

      // Assert
      expect(result).toEqual(["card-1", "card-2"]);
    });

    it("should return empty array for non-existent effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {};

      // Act
      const result = getActivationTargets(contexts, NON_EXISTENT);

      // Assert
      expect(result).toEqual([]);
    });

    it("should preserve existing context properties when setting targets", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_1]: { targets: [], paidCosts: 100 },
      };

      // Act
      const result = setActivationTargets(contexts, EFFECT_1, ["card-1"]);

      // Assert
      expect(result[EFFECT_1].targets).toEqual(["card-1"]);
      expect(result[EFFECT_1].paidCosts).toBe(100);
    });

    it("should not mutate original contexts", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {};

      // Act
      setActivationTargets(contexts, EFFECT_1, ["card-1"]);

      // Assert - original should be unchanged
      expect(contexts[EFFECT_1]).toBeUndefined();
    });
  });

  describe("setPaidCosts / getPaidCosts", () => {
    it("should set paid costs for a new effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {};

      // Act
      const result = setPaidCosts(contexts, EFFECT_1, 1000);

      // Assert
      expect(result[EFFECT_1].paidCosts).toBe(1000);
    });

    it("should get paid costs for an existing effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_1]: { targets: [], paidCosts: 500 },
      };

      // Act
      const result = getPaidCosts(contexts, EFFECT_1);

      // Assert
      expect(result).toBe(500);
    });

    it("should return undefined for non-existent effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {};

      // Act
      const result = getPaidCosts(contexts, NON_EXISTENT);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("setCalculatedDamage / getCalculatedDamage", () => {
    it("should set calculated damage for an effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {};

      // Act
      const result = setCalculatedDamage(contexts, EFFECT_1, 2000);

      // Assert
      expect(result[EFFECT_1].calculatedDamage).toBe(2000);
    });

    it("should get calculated damage for an existing effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_1]: { targets: [], calculatedDamage: 1500 },
      };

      // Act
      const result = getCalculatedDamage(contexts, EFFECT_1);

      // Assert
      expect(result).toBe(1500);
    });

    it("should return undefined for effect without calculated damage", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_1]: { targets: [] },
      };

      // Act
      const result = getCalculatedDamage(contexts, EFFECT_1);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("setDeclaredInteger / getDeclaredInteger", () => {
    it("should set declared integer for an effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {};

      // Act
      const result = setDeclaredInteger(contexts, EFFECT_1, 5);

      // Assert
      expect(result[EFFECT_1].declaredInteger).toBe(5);
    });

    it("should get declared integer for an existing effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_1]: { targets: [], declaredInteger: 3 },
      };

      // Act
      const result = getDeclaredInteger(contexts, EFFECT_1);

      // Assert
      expect(result).toBe(3);
    });

    it("should return undefined for effect without declared integer", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {};

      // Act
      const result = getDeclaredInteger(contexts, NON_EXISTENT);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("clearActivationContext", () => {
    it("should remove context for specified effect", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_1]: { targets: ["card-1"] },
        [EFFECT_2]: { targets: ["card-2"] },
      };

      // Act
      const result = clearActivationContext(contexts, EFFECT_1);

      // Assert
      expect(result[EFFECT_1]).toBeUndefined();
      expect(result[EFFECT_2]).toBeDefined();
    });

    it("should return same object if effect does not exist", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_1]: { targets: [] },
      };

      // Act
      const result = clearActivationContext(contexts, NON_EXISTENT);

      // Assert
      expect(result).toBe(contexts);
    });

    it("should not mutate original contexts", () => {
      // Arrange
      const contexts: Record<EffectId, EffectActivationContext> = {
        [EFFECT_1]: { targets: ["card-1"] },
      };

      // Act
      clearActivationContext(contexts, EFFECT_1);

      // Assert - original should be unchanged
      expect(contexts[EFFECT_1]).toBeDefined();
    });
  });
});
