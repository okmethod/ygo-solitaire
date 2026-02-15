/**
 * ChickenGameContinuousEffect Tests
 *
 * Tests for Chicken Game continuous effect (damage prevention).
 *
 * @deprecated 現在未使用。ActionPermission カテゴリの実装時に
 * ダメージ対象・ダメージ量などの引数設計を再検討し、テストも更新する。
 *
 * Test Responsibility:
 * - canApply() - Field existence check
 * - checkPermission() - Damage denial
 * - Category validation
 *
 * @module tests/unit/domain/effects/additional/ChickenGameContinuousEffect
 */

import { describe, it, expect } from "vitest";
import { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/spells/ChickenGameContinuousEffect";
import { createMockGameState, createFieldCardInstance } from "../../../../../__testUtils__/gameStateFactory";

describe("ChickenGameContinuousEffect", () => {
  const chickenGameId = 67616300;
  const rule = new ChickenGameContinuousEffect();

  describe("metadata", () => {
    it("should have correct isEffect flag", () => {
      expect(rule.isEffect).toBe(true);
    });

    it("should have correct category", () => {
      expect(rule.category).toBe("ActionPermission");
    });
  });

  describe("canApply()", () => {
    it("should return false when Chicken Game is not on field", () => {
      // Arrange
      const state = createMockGameState({
        lp: { player: 7000, opponent: 8000 },
      });

      // Act
      const result = rule.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when Chicken Game is face-down", () => {
      // Arrange
      const faceDownCard = createFieldCardInstance({
        id: chickenGameId,
        jaName: "Chicken Game",
        type: "spell",
        frameType: "spell",
        instanceId: "field-0",
        location: "fieldZone",
        position: "faceDown",
      });

      const state = createMockGameState({
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [faceDownCard],
          graveyard: [],
          banished: [],
        },
        lp: { player: 7000, opponent: 8000 },
      });

      // Act
      const result = rule.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when Chicken Game is face-up on field", () => {
      // Arrange
      const chickenGameCard = createFieldCardInstance({
        id: chickenGameId,
        jaName: "Chicken Game",
        type: "spell",
        frameType: "spell",
        instanceId: "field-0",
        location: "fieldZone",
        position: "faceUp",
      });

      const state = createMockGameState({
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [chickenGameCard],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = rule.canApply(state);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("checkPermission()", () => {
    it("should always return false (deny damage)", () => {
      // Arrange
      const state = createMockGameState();

      // Act
      const result = rule.checkPermission(state);

      // Assert
      expect(result).toBe(false); // Damage denied
    });
  });
});
