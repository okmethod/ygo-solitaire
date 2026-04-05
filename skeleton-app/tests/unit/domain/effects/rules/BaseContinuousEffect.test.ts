/**
 * BaseContinuousEffect Tests
 *
 * 永続効果の抽象基底クラスのテスト。
 * Template Methodパターンとフィールド上の表側表示チェックを検証する。
 */

import { describe, it, expect } from "vitest";
import { BaseContinuousEffect } from "$lib/domain/effects/rules/continuouses/BaseContinuousEffect";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { RuleCategory } from "$lib/domain/models/Effect";
import { createMockGameState, createMonsterOnField, createSpellOnField } from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestContinuousEffect extends BaseContinuousEffect {
  readonly category: RuleCategory = "StatusModifier";

  private shouldPass: boolean;

  constructor(cardId: number = 12345678, shouldPass: boolean = true) {
    super(cardId);
    this.shouldPass = shouldPass;
  }

  protected individualConditions(_state: GameSnapshot): boolean {
    return this.shouldPass;
  }
}

describe("BaseContinuousEffect", () => {
  describe("AdditionalRule interface properties", () => {
    it("should have isEffect = true", () => {
      // Arrange
      const effect = new TestContinuousEffect();

      // Assert
      expect(effect.isEffect).toBe(true);
    });

    it("should have correct cardId", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678);

      // Assert
      expect(effect.cardId).toBe(12345678);
    });

    it("should have category defined by subclass", () => {
      // Arrange
      const effect = new TestContinuousEffect();

      // Assert
      expect(effect.category).toBe("StatusModifier");
    });
  });

  describe("canApply()", () => {
    it("should return true when card is face-up on main monster zone and individual conditions are met", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678, true);
      const state = createMockGameState({
        space: {
          mainMonsterZone: [createMonsterOnField(12345678, "test-1")],
        },
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(true);
    });

    it("should return true when card is face-up on spell/trap zone", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678, true);
      const state = createMockGameState({
        space: {
          spellTrapZone: [createSpellOnField(12345678, "test-1", { spellType: "continuous" })],
        },
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(true);
    });

    it("should return true when card is face-up on field zone", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678, true);
      const state = createMockGameState({
        space: {
          fieldZone: [createSpellOnField(12345678, "test-1", { spellType: "field" })],
        },
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when card is face-down", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678, true);
      const state = createMockGameState({
        space: {
          spellTrapZone: [createSpellOnField(12345678, "test-1", { spellType: "continuous", position: "faceDown" })],
        },
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when card is not on field", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678, true);
      const state = createMockGameState({
        space: {
          hand: [
            {
              instanceId: "test-1",
              id: 12345678,
              jaName: "Test Spell",
              type: "spell",
              frameType: "spell",
              location: "hand",
              edition: "latest",
            },
          ],
        },
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when individual conditions are not met", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678, false); // shouldPass = false
      const state = createMockGameState({
        space: {
          mainMonsterZone: [createMonsterOnField(12345678, "test-1")],
        },
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when different card is on field", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678, true);
      const state = createMockGameState({
        space: {
          mainMonsterZone: [createMonsterOnField(87654321, "test-1")], // Different card ID
        },
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when field is empty", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678, true);
      const state = createMockGameState({
        space: {
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
        },
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should check all field zones for the card", () => {
      // Arrange
      const effect = new TestContinuousEffect(12345678, true);
      const state = createMockGameState({
        space: {
          mainMonsterZone: [createMonsterOnField(11111111, "monster-1")],
          spellTrapZone: [createSpellOnField(22222222, "spell-1")],
          fieldZone: [createSpellOnField(12345678, "field-1", { spellType: "field" })], // This is the card we're looking for
        },
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(true);
    });
  });
});
