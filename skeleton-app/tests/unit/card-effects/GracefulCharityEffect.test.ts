/**
 * GracefulCharityEffect Tests (Layer 1: CardEffect Unit Tests)
 *
 * Tests for GracefulCharityEffect canActivate() and createSteps() in isolation.
 *
 * Test Responsibility:
 * - canActivate() validation logic
 *   - Game-over check (inherited from SpellEffect)
 *   - Phase check (inherited from NormalSpellEffect)
 *   - Deck size check (GracefulCharityEffect specific)
 * - createSteps() EffectResolutionStep generation
 *   - Step structure (id, title, message, action, cardSelectionConfig)
 *   - Action function existence (not execution)
 *   - Multi-step state transition verification (Integration Test)
 *
 * Test Architecture (3-Layer Pattern):
 *
 * Layer 1: CardEffect Unit Tests (THIS FILE)
 *   - tests/unit/card-effects/GracefulCharityEffect.test.ts
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
 * @module tests/unit/card-effects/GracefulCharityEffect
 */

import { describe, it, expect } from "vitest";
import { GracefulCharityEffect } from "$lib/domain/effects/cards/GracefulCharityEffect";
import { createMockGameState, createCardInstances } from "$lib/__testUtils__/gameStateFactory";

describe("GracefulCharityEffect", () => {
  describe("canActivate()", () => {
    it("should return false when game is over", () => {
      // Arrange: Game is over (Exodia victory)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
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

      const effect = new GracefulCharityEffect();

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
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new GracefulCharityEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Cannot activate during Battle Phase
      expect(result).toBe(false);
    });

    it("should return false when deck has less than 3 cards", () => {
      // Arrange: Deck has only 2 cards (insufficient)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"), // Only 2 cards
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new GracefulCharityEffect();

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

      const effect = new GracefulCharityEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Cannot activate with empty deck
      expect(result).toBe(false);
    });

    it("should return true when all conditions are met (deck has 3 cards)", () => {
      // Arrange: Main1 phase, game not over, deck has exactly 3 cards
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new GracefulCharityEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Can activate with exactly 3 cards in deck
      expect(result).toBe(true);
    });

    it("should return true when deck has more than 3 cards", () => {
      // Arrange: Main1 phase, game not over, deck has 10 cards
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(
            ["card1", "card2", "card3", "card4", "card5", "card6", "card7", "card8", "card9", "card10"],
            "deck",
          ),
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new GracefulCharityEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Can activate with more than 3 cards in deck
      expect(result).toBe(true);
    });
  });

  describe("createSteps()", () => {
    it("should create correct EffectResolutionStep structure with 3 steps", () => {
      // Arrange
      const effect = new GracefulCharityEffect();
      const mockState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances(["hand1", "hand2"], "hand"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const steps = effect.createSteps(mockState, "test-card-1");

      // Assert: NormalSpellEffect automatically appends graveyard-sending step
      // 1. Draw step
      // 2. Discard step
      // 3. Graveyard-sending step (auto-appended)
      expect(steps).toHaveLength(3);

      // Step 1: Draw 3 cards
      expect(steps[0]).toMatchObject({
        id: "graceful-charity-draw",
        title: "カードをドローします",
        message: "デッキから3枚ドローします",
      });
      expect(steps[0].action).toBeTypeOf("function");
      expect(steps[0].cardSelectionConfig).toBeUndefined();

      // Step 2: Discard 2 cards (with card selection)
      expect(steps[1]).toMatchObject({
        id: "graceful-charity-discard",
        title: "カードを破棄します",
        message: "手札から2枚選んで破棄してください",
      });
      expect(steps[1].action).toBeTypeOf("function");
      expect(steps[1].cardSelectionConfig).toBeDefined();
      expect(steps[1].cardSelectionConfig).toMatchObject({
        minCards: 2,
        maxCards: 2,
        title: "カードを破棄",
        message: "手札から2枚選んで破棄してください",
      });

      // Step 3: Graveyard-sending step (added by NormalSpellEffect)
      expect(steps[2]).toMatchObject({
        id: "GracefulCharityEffect-to-graveyard",
        title: "墓地に送ります",
        message: "効果解決後、カードを墓地に送ります",
      });
      expect(steps[2].action).toBeTypeOf("function");
    });

    it("should have card selection config with correct availableCards from input state", () => {
      // Arrange
      const effect = new GracefulCharityEffect();
      const hand = createCardInstances(["hand1", "hand2", "hand3", "hand4"], "hand");
      const mockState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck1", "deck2", "deck3"], "deck"),
          hand,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const steps = effect.createSteps(mockState, "test-card-1");

      // Assert: Step 2 should have card selection config with availableCards from input state
      expect(steps[1].cardSelectionConfig?.availableCards).toEqual(hand);
    });

    it("should create the same step structure regardless of hand size", () => {
      // Arrange
      const effect = new GracefulCharityEffect();
      const mockState1 = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances(["hand1", "hand2"], "hand"), // 2 cards in hand
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      const mockState2 = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances(["hand1", "hand2", "hand3", "hand4", "hand5"], "hand"), // 5 cards in hand
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const steps1 = effect.createSteps(mockState1, "test-card-1");
      const steps2 = effect.createSteps(mockState2, "test-card-2");

      // Assert: Both should have the same structure
      expect(steps1).toHaveLength(3);
      expect(steps2).toHaveLength(3);

      // Step 1: Draw
      expect(steps1[0]).toMatchObject({
        id: "graceful-charity-draw",
        title: "カードをドローします",
        message: "デッキから3枚ドローします",
      });
      expect(steps2[0]).toMatchObject({
        id: "graceful-charity-draw",
        title: "カードをドローします",
        message: "デッキから3枚ドローします",
      });

      // Step 2: Discard
      expect(steps1[1]).toMatchObject({
        id: "graceful-charity-discard",
        title: "カードを破棄します",
        message: "手札から2枚選んで破棄してください",
      });
      expect(steps2[1]).toMatchObject({
        id: "graceful-charity-discard",
        title: "カードを破棄します",
        message: "手札から2枚選んで破棄してください",
      });
    });

    it("should have action function in all steps", () => {
      // Arrange
      const effect = new GracefulCharityEffect();
      const mockState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances(["hand1", "hand2"], "hand"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const steps = effect.createSteps(mockState, "test-card-1");

      // Assert: All steps should have action functions
      expect(typeof steps[0].action).toBe("function");
      expect(typeof steps[1].action).toBe("function");
      expect(typeof steps[2].action).toBe("function");
    });
  });

  /**
   * Integration Tests: Multi-step Effect Execution
   *
   * These tests verify state transitions between steps.
   * This is critical for detecting bugs like "stale card selection state"
   * where step 2's cardSelectionConfig is created before step 1 executes.
   */
  describe("Integration: Multi-step Effect Execution", () => {
    it("step 1 (draw) should successfully draw 3 cards from deck to hand", async () => {
      // Arrange: Initial deck with 10 cards
      const initialDeck = createCardInstances(
        ["deck1", "deck2", "deck3", "deck4", "deck5", "deck6", "deck7", "deck8", "deck9", "deck10"],
        "deck",
      );

      const effect = new GracefulCharityEffect();

      // Assume Graceful Charity was activated (moved from hand to field)
      // Simulating ActivateSpellCommand execution (original hand: 5 cards, after activation: 4 cards)
      const stateAfterActivation = createMockGameState({
        phase: "Main1",
        zones: {
          deck: initialDeck,
          hand: createCardInstances(["hand1", "hand2", "hand3", "hand4"], "hand"), // 5 - 1 = 4 cards
          field: createCardInstances(["graceful-charity"], "field"),
          graveyard: [],
          banished: [],
        },
      });

      // Act: Create steps and execute step 1 (draw)
      const steps = effect.createSteps(stateAfterActivation, "graceful-charity");
      const step1 = steps[0];
      const step1Result = await step1.action(stateAfterActivation);

      // Assert: Step 1 should successfully draw 3 cards
      expect(step1Result.success).toBe(true);
      expect(step1Result.newState.zones.hand).toHaveLength(7); // 4 + 3 = 7
      expect(step1Result.newState.zones.deck).toHaveLength(7); // 10 - 3 = 7
      expect(step1Result.message).toBe("Drew 3 cards");

      // Verify the drawn cards are the top 3 from deck (drawn from the END of deck array)
      // Note: moveCard() updates the location property, so we verify cardId and instanceId
      const hand = step1Result.newState.zones.hand;
      expect(hand.slice(0, 4)).toEqual(stateAfterActivation.zones.hand); // First 4 cards unchanged
      expect(hand[4]).toMatchObject({ cardId: "deck10", instanceId: "deck-9", location: "hand" });
      expect(hand[5]).toMatchObject({ cardId: "deck9", instanceId: "deck-8", location: "hand" });
      expect(hand[6]).toMatchObject({ cardId: "deck8", instanceId: "deck-7", location: "hand" });
    });

    it("step 1 (draw) should fail when deck has less than 3 cards", async () => {
      // Arrange: Deck has only 2 cards
      const initialState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck1", "deck2"], "deck"), // Only 2 cards
          hand: createCardInstances(["hand1", "hand2", "hand3", "hand4"], "hand"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const effect = new GracefulCharityEffect();

      // Act: Create steps and execute step 1 (draw)
      const steps = effect.createSteps(initialState, "graceful-charity");
      const step1 = steps[0];
      const step1Result = await step1.action(initialState);

      // Assert: Step 1 should fail
      expect(step1Result.success).toBe(false);
      expect(step1Result.error).toBe("Cannot draw 3 cards. Not enough cards in deck.");
      expect(step1Result.newState).toEqual(initialState); // State unchanged
    });

    it("step 2 (discard) should successfully discard 2 cards from hand to graveyard", async () => {
      // Arrange: State after step 1 (7 cards in hand)
      const hand = createCardInstances(["hand1", "hand2", "hand3", "hand4", "deck1", "deck2", "deck3"], "hand");
      const stateAfterStep1 = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck4", "deck5", "deck6", "deck7"], "deck"),
          hand,
          field: createCardInstances(["graceful-charity"], "field"),
          graveyard: [],
          banished: [],
        },
      });

      const effect = new GracefulCharityEffect();

      // Act: Execute step 2 (discard) with selected cards
      const steps = effect.createSteps(stateAfterStep1, "graceful-charity");
      const step2 = steps[1];
      const selectedInstanceIds = [hand[0].instanceId, hand[1].instanceId]; // Select first 2 cards
      const step2Result = await step2.action(stateAfterStep1, selectedInstanceIds);

      // Assert: Step 2 should successfully discard 2 cards
      expect(step2Result.success).toBe(true);
      expect(step2Result.newState.zones.hand).toHaveLength(5); // 7 - 2 = 5
      expect(step2Result.newState.zones.graveyard).toHaveLength(2);

      // Verify the discarded cards are in graveyard
      expect(step2Result.newState.zones.graveyard).toContainEqual(
        expect.objectContaining({ instanceId: hand[0].instanceId }),
      );
      expect(step2Result.newState.zones.graveyard).toContainEqual(
        expect.objectContaining({ instanceId: hand[1].instanceId }),
      );
    });

    it("step 2 (discard) should fail when selectedInstanceIds is not provided", async () => {
      // Arrange
      const stateAfterStep1 = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck4", "deck5", "deck6", "deck7"], "deck"),
          hand: createCardInstances(["hand1", "hand2", "hand3", "hand4", "deck1", "deck2", "deck3"], "hand"),
          field: createCardInstances(["graceful-charity"], "field"),
          graveyard: [],
          banished: [],
        },
      });

      const effect = new GracefulCharityEffect();

      // Act: Execute step 2 without selectedInstanceIds
      const steps = effect.createSteps(stateAfterStep1, "graceful-charity");
      const step2 = steps[1];
      const step2Result = await step2.action(stateAfterStep1); // No selectedInstanceIds

      // Assert: Should fail
      expect(step2Result.success).toBe(false);
      expect(step2Result.error).toBe("Must select exactly 2 cards to discard");
    });

    it("step 2 (discard) should fail when selectedInstanceIds has wrong count", async () => {
      // Arrange
      const hand = createCardInstances(["hand1", "hand2", "hand3", "hand4", "deck1", "deck2", "deck3"], "hand");
      const stateAfterStep1 = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck4", "deck5", "deck6", "deck7"], "deck"),
          hand,
          field: createCardInstances(["graceful-charity"], "field"),
          graveyard: [],
          banished: [],
        },
      });

      const effect = new GracefulCharityEffect();

      // Act: Execute step 2 with only 1 selected card (should be 2)
      const steps = effect.createSteps(stateAfterStep1, "graceful-charity");
      const step2 = steps[1];
      const step2Result = await step2.action(stateAfterStep1, [hand[0].instanceId]); // Only 1 card

      // Assert: Should fail
      expect(step2Result.success).toBe(false);
      expect(step2Result.error).toBe("Must select exactly 2 cards to discard");
    });

    /**
     * CRITICAL TEST: This test verifies the bug fix for "stale card selection state"
     *
     * Bug Scenario:
     * - createSteps() is called with state BEFORE step 1 executes (4 cards in hand)
     * - cardSelectionConfig.availableCards captures this stale state (4 cards)
     * - Step 1 executes and draws 3 cards (hand becomes 7 cards)
     * - Step 2 opens CardSelectionModal with stale config (4 cards) instead of current state (7 cards)
     *
     * Fix:
     * - effectResolutionStore.confirmCurrentStep() overrides availableCards with currentGameState.zones.hand
     * - This ensures CardSelectionModal always shows the CURRENT hand, not the stale config
     *
     * Note:
     * - This test verifies that cardSelectionConfig is created with the input state's hand
     * - The runtime override happens in effectResolutionStore (Application Layer)
     * - This test documents the Domain Layer behavior (config creation with input state)
     */
    it("CRITICAL: step 2 cardSelectionConfig should reference input state's hand (runtime override tested elsewhere)", () => {
      // Arrange: Simulate state BEFORE step 1 executes
      // (This is the state passed to createSteps() in ActivateSpellCommand)
      const handBeforeStep1 = createCardInstances(["hand1", "hand2", "hand3", "hand4"], "hand"); // 4 cards
      const stateBeforeStep1 = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck1", "deck2", "deck3", "deck4", "deck5"], "deck"),
          hand: handBeforeStep1,
          field: createCardInstances(["graceful-charity"], "field"),
          graveyard: [],
          banished: [],
        },
      });

      const effect = new GracefulCharityEffect();

      // Act: Create steps with state BEFORE step 1 (4 cards in hand)
      const steps = effect.createSteps(stateBeforeStep1, "graceful-charity");

      // Assert: Step 2's cardSelectionConfig should reference the input state's hand
      // This is the Domain Layer behavior - it creates config with the input state
      // The Application Layer (effectResolutionStore) is responsible for overriding this at runtime
      expect(steps[1].cardSelectionConfig?.availableCards).toEqual(handBeforeStep1);
      expect(steps[1].cardSelectionConfig?.availableCards).toHaveLength(4);

      // This documents the known limitation:
      // - cardSelectionConfig is created with the input state (4 cards)
      // - The actual bug fix happens in effectResolutionStore.confirmCurrentStep()
      // - effectResolutionStore overrides availableCards with currentGameState.zones.hand (7 cards)
      //
      // Integration Test in effectResolutionStore.test.ts should verify:
      // - After step 1 executes, currentGameState.zones.hand has 7 cards
      // - confirmCurrentStep() overrides cardSelectionConfig.availableCards with 7 cards
      // - CardSelectionModal receives 7 cards, not 4 cards
    });
  });
});
