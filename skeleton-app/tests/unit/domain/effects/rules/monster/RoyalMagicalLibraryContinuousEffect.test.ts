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
import { RoyalMagicalLibraryContinuousEffect } from "$lib/domain/effects/rules/continuouses/monsters/RoyalMagicalLibraryContinuousEffect";
import type { CardInstance, CounterState } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { createFieldCardInstance } from "../../../../../__testUtils__/gameStateFactory";

/**
 * Helper function to execute trigger steps and return the final state
 */
function executeTriggerSteps(
  rule: RoyalMagicalLibraryContinuousEffect,
  state: GameSnapshot,
  sourceInstance: CardInstance,
): GameSnapshot {
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
  const createLibraryCard = (
    options: {
      position?: "faceUp" | "faceDown";
      counters?: readonly CounterState[];
    } = {},
  ): CardInstance =>
    createFieldCardInstance({
      id: royalMagicalLibraryId,
      jaName: "王立魔法図書館",
      type: "monster",
      frameType: "effect",
      instanceId: "monster-0",
      location: "mainMonsterZone",
      position: options.position ?? "faceUp",
      placedThisTurn: false,
      counters: options.counters ?? [],
    });

  // Helper function to create a base game state
  const createBaseGameSnapshot = (overrides: Partial<GameSnapshot> = {}): GameSnapshot => ({
    space: {
      mainDeck: [],
      extraDeck: [],
      hand: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    },
    lp: { player: 8000, opponent: 8000 },
    phase: "main1",
    turn: 1,
    result: { isGameOver: false },
    normalSummonLimit: 1,
    normalSummonUsed: 0,
    activatedCardIds: new Set(),
    queuedEndPhaseEffectIds: [],
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
      const state = createBaseGameSnapshot();

      // Act
      const result = rule.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when Royal Magical Library is face-down", () => {
      // Arrange
      const libraryCard = createLibraryCard({ position: "faceDown" });
      const state = createBaseGameSnapshot({
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const state = createBaseGameSnapshot({
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const state = createBaseGameSnapshot({
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const updatedLibrary = newState.space.mainMonsterZone[0];
      expect(Card.Counter.get(updatedLibrary.stateOnField?.counters ?? [], "spell")).toBe(1);
    });

    it("should accumulate spell counters up to 3", () => {
      // Arrange
      const libraryCard = createLibraryCard({
        counters: [{ type: "spell", count: 2 }],
      });
      const state = createBaseGameSnapshot({
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const updatedLibrary = newState.space.mainMonsterZone[0];
      expect(Card.Counter.get(updatedLibrary.stateOnField?.counters ?? [], "spell")).toBe(3);
    });

    it("should not exceed max spell counters (3)", () => {
      // Arrange
      const libraryCard = createLibraryCard({
        counters: [{ type: "spell", count: 3 }],
      });
      const state = createBaseGameSnapshot({
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const updatedLibrary = newState.space.mainMonsterZone[0];
      expect(Card.Counter.get(updatedLibrary.stateOnField?.counters ?? [], "spell")).toBe(3);
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
      };
      const state = createBaseGameSnapshot({
        space: {
          mainDeck: [],
          extraDeck: [],
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
      const updatedOther = newState.space.mainMonsterZone[1];
      expect(Card.Counter.get(updatedOther.stateOnField?.counters ?? [], "spell")).toBe(0);
    });

    it("should maintain immutability (not modify original state)", () => {
      // Arrange
      const libraryCard = createLibraryCard();
      const state = createBaseGameSnapshot({
        space: {
          mainDeck: [],
          extraDeck: [],
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
      expect(Card.Counter.get(state.space.mainMonsterZone[0].stateOnField?.counters ?? [], "spell")).toBe(0);
    });
  });

  describe("王立魔法図書館の完全なユースケース", () => {
    it("should accumulate counters through multiple spell activations", () => {
      // Arrange
      const libraryCard = createLibraryCard();
      let state = createBaseGameSnapshot({
        space: {
          mainDeck: [],
          extraDeck: [],
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
        const currentLibrary = state.space.mainMonsterZone[0];
        state = executeTriggerSteps(rule, state, currentLibrary);
      }

      // Assert - Should cap at 3
      const finalLibrary = state.space.mainMonsterZone[0];
      expect(Card.Counter.get(finalLibrary.stateOnField?.counters ?? [], "spell")).toBe(3);
    });
  });
});
