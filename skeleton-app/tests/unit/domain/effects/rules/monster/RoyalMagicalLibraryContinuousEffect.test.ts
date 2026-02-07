/**
 * RoyalMagicalLibraryContinuousEffect Tests
 *
 * Tests for Royal Magical Library continuous effect (spell counter accumulation).
 *
 * Test Responsibility:
 * - metadata - isEffect, category, triggers
 * - canApply() - Field existence and position check
 * - createTriggerSteps() - Spell counter accumulation (max 3)
 *
 * @module tests/unit/domain/effects/rules/monster/RoyalMagicalLibraryContinuousEffect
 */

import { describe, it, expect } from "vitest";
import { RoyalMagicalLibraryContinuousEffect } from "$lib/domain/effects/rules/monsters/RoyalMagicalLibraryContinuousEffect";
import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import { getCounterCount } from "$lib/domain/models/Counter";

/**
 * Helper function to execute trigger steps and return the final state
 */
function executeTriggerSteps(
  rule: RoyalMagicalLibraryContinuousEffect,
  state: GameState,
  sourceInstance: CardInstance,
): GameState {
  const steps = rule.createTriggerSteps!(state, sourceInstance);
  let currentState = state;
  for (const step of steps) {
    const result = step.action(currentState);
    currentState = result.updatedState;
  }
  return currentState;
}

describe("RoyalMagicalLibraryContinuousEffect", () => {
  const royalMagicalLibraryId = 70791313;
  const rule = new RoyalMagicalLibraryContinuousEffect();

  // Helper function to create a Royal Magical Library card instance
  const createLibraryCard = (options: Partial<CardInstance> = {}): CardInstance => ({
    id: royalMagicalLibraryId,
    jaName: "王立魔法図書館",
    type: "monster",
    frameType: "effect",
    instanceId: "monster-0",
    location: "mainMonsterZone",
    position: "faceUp",
    placedThisTurn: false,
    counters: [],
    ...options,
  });

  // Helper function to create a base game state
  const createBaseGameState = (overrides: Partial<GameState> = {}): GameState => ({
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
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedIgnitionEffectsThisTurn: new Set(),
    activatedOncePerTurnCards: new Set(),
    pendingEndPhaseEffects: [],
    damageNegation: false,
    ...overrides,
  });

  describe("metadata", () => {
    it("should have correct isEffect flag", () => {
      expect(rule.isEffect).toBe(true);
    });

    it("should have correct category", () => {
      expect(rule.category).toBe("TriggerRule");
    });

    it("should have correct triggers", () => {
      expect(rule.triggers).toEqual(["spellActivated"]);
    });
  });

  describe("canApply()", () => {
    it("should return false when Royal Magical Library is not on field", () => {
      // Arrange
      const state = createBaseGameState();

      // Act
      const result = rule.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when Royal Magical Library is face-down", () => {
      // Arrange
      const libraryCard = createLibraryCard({ position: "faceDown" });
      const state = createBaseGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const result = rule.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when Royal Magical Library is face-up on field", () => {
      // Arrange
      const libraryCard = createLibraryCard();
      const state = createBaseGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
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

  describe("createTriggerSteps()", () => {
    it("should add one spell counter to the source instance", () => {
      // Arrange
      const libraryCard = createLibraryCard();
      const state = createBaseGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const newState = executeTriggerSteps(rule, state, libraryCard);

      // Assert
      const updatedLibrary = newState.zones.mainMonsterZone[0];
      expect(getCounterCount(updatedLibrary.counters, "spell")).toBe(1);
    });

    it("should accumulate spell counters up to 3", () => {
      // Arrange
      const libraryCard = createLibraryCard({
        counters: [{ type: "spell", count: 2 }],
      });
      const state = createBaseGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const newState = executeTriggerSteps(rule, state, libraryCard);

      // Assert
      const updatedLibrary = newState.zones.mainMonsterZone[0];
      expect(getCounterCount(updatedLibrary.counters, "spell")).toBe(3);
    });

    it("should not exceed max spell counters (3)", () => {
      // Arrange
      const libraryCard = createLibraryCard({
        counters: [{ type: "spell", count: 3 }],
      });
      const state = createBaseGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const newState = executeTriggerSteps(rule, state, libraryCard);

      // Assert
      const updatedLibrary = newState.zones.mainMonsterZone[0];
      expect(getCounterCount(updatedLibrary.counters, "spell")).toBe(3);
    });

    it("should not modify other cards in the zone", () => {
      // Arrange
      const libraryCard = createLibraryCard();
      const otherMonster: CardInstance = {
        id: 12345,
        jaName: "Other Monster",
        type: "monster",
        frameType: "normal",
        instanceId: "monster-1",
        location: "mainMonsterZone",
        position: "faceUp",
        placedThisTurn: false,
        counters: [],
      };
      const state = createBaseGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [libraryCard, otherMonster],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const newState = executeTriggerSteps(rule, state, libraryCard);

      // Assert
      const updatedOther = newState.zones.mainMonsterZone[1];
      expect(getCounterCount(updatedOther.counters, "spell")).toBe(0);
    });

    it("should maintain immutability (not modify original state)", () => {
      // Arrange
      const libraryCard = createLibraryCard();
      const state = createBaseGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      executeTriggerSteps(rule, state, libraryCard);

      // Assert - original state should be unchanged
      expect(getCounterCount(state.zones.mainMonsterZone[0].counters, "spell")).toBe(0);
    });
  });

  describe("王立魔法図書館の完全なユースケース", () => {
    it("should accumulate counters through multiple spell activations", () => {
      // Arrange
      const libraryCard = createLibraryCard();
      let state = createBaseGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act - Simulate 4 spell activations
      for (let i = 0; i < 4; i++) {
        const currentLibrary = state.zones.mainMonsterZone[0];
        state = executeTriggerSteps(rule, state, currentLibrary);
      }

      // Assert - Should cap at 3
      const finalLibrary = state.zones.mainMonsterZone[0];
      expect(getCounterCount(finalLibrary.counters, "spell")).toBe(3);
    });
  });
});
