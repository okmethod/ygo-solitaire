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
import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Zone";

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
      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [], // No cards on field
          graveyard: [],
          banished: [],
        },
        lp: { player: 7000, opponent: 8000 },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        activatedIgnitionEffectsThisTurn: new Set(),
        activatedOncePerTurnCards: new Set(),
        pendingEndPhaseEffects: [],
        damageNegation: false,
      };

      // Act
      const result = rule.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when Chicken Game is face-down", () => {
      // Arrange
      const faceDownCard: CardInstance = {
        id: chickenGameId,
        name: "Chicken Game",
        type: "Spell",
        frameType: "spell",
        desc: "Mock card",
        race: "Field",
        instanceId: "field-0",
        location: "fieldZone",
        position: "faceDown",
        placedThisTurn: false,
      };

      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [faceDownCard],
          graveyard: [],
          banished: [],
        },
        lp: { player: 7000, opponent: 8000 },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        activatedIgnitionEffectsThisTurn: new Set(),
        activatedOncePerTurnCards: new Set(),
        pendingEndPhaseEffects: [],
        damageNegation: false,
      };

      // Act
      const result = rule.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when Chicken Game is face-up on field", () => {
      // Arrange
      const chickenGameCard: CardInstance = {
        id: chickenGameId,
        name: "Chicken Game",
        type: "Spell",
        frameType: "spell",
        desc: "Mock card",
        race: "Field",
        instanceId: "field-0",
        location: "fieldZone",
        position: "faceUp",
        placedThisTurn: false,
      };

      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [chickenGameCard],
          graveyard: [],
          banished: [],
        },
        lp: { player: 8000, opponent: 8000 },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        activatedIgnitionEffectsThisTurn: new Set(),
        activatedOncePerTurnCards: new Set(),
        pendingEndPhaseEffects: [],
        damageNegation: false,
      };

      // Act
      const result = rule.canApply(state);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("checkPermission()", () => {
    it("should always return false (deny damage)", () => {
      // Arrange
      const state: GameState = {
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
        lp: { player: 8000, opponent: 8000 },
        phase: "Main1",
        turn: 1,
        chainStack: [],
        result: { isGameOver: false },
        normalSummonLimit: 1,
        normalSummonUsed: 0,
        activatedIgnitionEffectsThisTurn: new Set(),
        activatedOncePerTurnCards: new Set(),
        pendingEndPhaseEffects: [],
        damageNegation: false,
      };

      // Act
      const result = rule.checkPermission(state);

      // Assert
      expect(result).toBe(false); // Damage denied
    });
  });
});
