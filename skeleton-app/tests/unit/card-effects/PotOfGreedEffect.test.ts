/**
 * PotOfGreedEffect Tests (Layer 1: CardEffect Unit Tests)
 *
 * Tests for PotOfGreedEffect canActivate() and createSteps() in isolation.
 *
 * Test Responsibility:
 * - canActivate() validation logic
 *   - Game-over check (inherited from SpellEffect)
 *   - Phase check (inherited from NormalSpellEffect)
 *   - Deck size check (PotOfGreedEffect specific)
 * - createSteps() EffectResolutionStep generation
 *   - Step structure (id, title, message, action)
 *   - Action function existence (not execution)
 *
 * Test Architecture (3-Layer Pattern):
 *
 * Layer 1: CardEffect Unit Tests (THIS FILE)
 *   - tests/unit/card-effects/PotOfGreedEffect.test.ts
 *   - Tests: canActivate(), createSteps() in isolation
 *
 * Layer 2: CardEffectRegistry Tests
 *   - tests/unit/CardEffectRegistry.test.ts
 *   - Tests: register(), get(), clear()
 *
 * Layer 3: Integration Tests
 *   - tests/unit/CardEffects.test.ts
 *   - Tests: ActivateSpellCommand + CardEffect integration
 *
 * @module tests/unit/card-effects/PotOfGreedEffect
 */

import { describe, it, expect } from "vitest";
import { PotOfGreedEffect } from "$lib/domain/effects/cards/PotOfGreedEffect";
import { createMockGameState, createCardInstances } from "$lib/__testUtils__/gameStateFactory";

describe("PotOfGreedEffect", () => {
  describe("canActivate()", () => {
    it("should return false when game is over", () => {
      // Arrange: Game is over (Exodia victory)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
        result: {
          isGameOver: true,
          winner: "player",
        },
      });

      const effect = new PotOfGreedEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Cannot activate when game is over
      expect(result).toBe(false);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Battle Phase (not Main1)
      const state = createMockGameState({
        phase: "Battle",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new PotOfGreedEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Cannot activate during Battle Phase
      expect(result).toBe(false);
    });

    it("should return false when deck has less than 2 cards", () => {
      // Arrange: Deck has only 1 card (insufficient)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1"], "deck"), // Only 1 card
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new PotOfGreedEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Cannot activate with insufficient deck
      expect(result).toBe(false);
    });

    it("should return false when deck is empty", () => {
      // Arrange: Deck is empty
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [], // Empty deck
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new PotOfGreedEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Cannot activate with empty deck
      expect(result).toBe(false);
    });

    it("should return true when all conditions are met (deck has 2 cards)", () => {
      // Arrange: Main1 phase, game not over, deck has exactly 2 cards
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new PotOfGreedEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Can activate with exactly 2 cards in deck
      expect(result).toBe(true);
    });

    it("should return true when deck has more than 2 cards", () => {
      // Arrange: Main1 phase, game not over, deck has 5 cards
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3", "card4", "card5"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new PotOfGreedEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Can activate with more than 2 cards in deck
      expect(result).toBe(true);
    });
  });

  describe("createSteps()", () => {
    it("should create correct EffectResolutionStep structure", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new PotOfGreedEffect();

      // Act
      const steps = effect.createSteps(state);

      // Assert: Check step structure
      expect(steps).toHaveLength(1);
      expect(steps[0]).toMatchObject({
        id: "pot-of-greed-draw",
        title: "カードをドローします",
        message: "デッキから2枚ドローします",
      });
      expect(steps[0].action).toBeTypeOf("function");
    });

    it("should create the same step structure regardless of deck size", () => {
      // Arrange: Different deck sizes
      const state1 = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const state2 = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3", "card4", "card5"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new PotOfGreedEffect();

      // Act
      const steps1 = effect.createSteps(state1);
      const steps2 = effect.createSteps(state2);

      // Assert: Both should have the same structure
      expect(steps1).toHaveLength(1);
      expect(steps2).toHaveLength(1);
      expect(steps1[0]).toMatchObject({
        id: "pot-of-greed-draw",
        title: "カードをドローします",
        message: "デッキから2枚ドローします",
      });
      expect(steps2[0]).toMatchObject({
        id: "pot-of-greed-draw",
        title: "カードをドローします",
        message: "デッキから2枚ドローします",
      });
    });

    it("should have action function in step", () => {
      // Arrange
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new PotOfGreedEffect();

      // Act
      const steps = effect.createSteps(state);

      // Assert: action should be a function
      expect(typeof steps[0].action).toBe("function");
    });
  });
});
