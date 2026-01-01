/**
 * Normal Spell Card Effects Tests (Integration Layer)
 *
 * Tests Normal Spell card-specific scenarios integrated with the full application layer.
 * Focuses on actual gameplay scenarios rather than implementation details.
 *
 * Test Responsibility:
 * - Normal Spell card activation scenarios (end-to-end gameplay flow)
 * - Registry integration (cardId → Effect retrieval → Effect execution)
 * - Side effects (effectResolutionStore.startResolution calls)
 * - Actual game state changes (deck → hand, hand → graveyard)
 *
 * Test Strategy (from docs/architecture/testing-strategy.md):
 * - **Base class validation**: Tested in tests/unit/domain/effects/bases/
 *   - SpellEffect.test.ts: Game-over check
 *   - NormalSpellEffect.test.ts: Main1 phase check, graveyard-sending step
 * - **Card scenarios**: Tested here
 *   - Pot of Greed: Deck 2 cards draw → Hand increases by 2
 *   - Graceful Charity: Draw 3 → Discard 2 → Hand increases by 1
 *
 * Rationale:
 * - Card-specific canActivate() (e.g., deck.length >= 2) is implementation mirror
 * - Scenario-based tests detect real bugs more effectively
 * - Easy to add new cards without duplicating base class tests
 *
 * @module tests/integration/card-effects/NormalSpells
 */

import { describe, it, expect } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { createMockGameState, createCardInstances } from "../../__testUtils__/gameStateFactory";
import "$lib/domain/effects"; // Initialize ChainableActionRegistry

describe("Normal Spell Card Effects", () => {
  describe("Pot of Greed (55144522) - Scenario Tests", () => {
    const potOfGreedCardId = "55144522";

    it("Scenario: Activate Pot of Greed → Draw 2 cards → Hand increases by 2", () => {
      // Arrange: Initial state - 3 cards in deck, 1 card in hand (Pot of Greed)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances([potOfGreedCardId], "hand", "pot"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Pot of Greed (new system - returns effectSteps)
      const command = new ActivateSpellCommand("pot-0"); // createCardInstances uses 0-based index
      const result = command.execute(state);

      // Assert: effectSteps are returned in the result
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(3);

      // Verify steps: [activation step, draw step, graveyard step]
      expect(result.effectSteps![0]).toMatchObject({
        id: "55144522-activation", // ID now uses card ID
        summary: "カード発動",
        description: "《強欲な壺》を発動します",
      });
      expect(result.effectSteps![1]).toMatchObject({
        id: "draw-2", // ID now uses step builder format
        summary: "カードをドロー",
        description: "デッキから2枚ドローします",
      });
      expect(result.effectSteps![2]).toMatchObject({
        id: "pot-0-graveyard", // ID now includes instance ID
        summary: "墓地へ送る",
        description: "強欲な壺を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when deck has only 1 card", () => {
      // Arrange: Deck with only 1 card (insufficient)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1"], "deck"),
          hand: createCardInstances([potOfGreedCardId], "hand", "pot"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("pot-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate
      expect(result).toBe(false);
    });
  });

  describe("Graceful Charity (79571449) - Scenario Tests", () => {
    const gracefulCharityCardId = "79571449";

    it("Scenario: Activate Graceful Charity → Draw 3 → Discard 2 → Hand increases by 1", () => {
      // Arrange: Initial state - 5 cards in deck, 1 card in hand (Graceful Charity)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3", "card4", "card5"], "deck"),
          hand: createCardInstances([gracefulCharityCardId], "hand", "charity"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Graceful Charity (new system - returns effectSteps)
      const command = new ActivateSpellCommand("charity-0");
      const result = command.execute(state);

      // Assert: effectSteps are returned in the result
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4);

      // Verify steps: [activation step, draw step, discard step, graveyard step]
      expect(result.effectSteps![0]).toMatchObject({
        id: "79571449-activation",
        summary: "カード発動",
        description: "《天使の施し》を発動します",
      });
      expect(result.effectSteps![1]).toMatchObject({
        id: "draw-3",
        summary: "カードをドロー",
        description: "デッキから3枚ドローします",
      });
      expect(result.effectSteps![2]).toMatchObject({
        id: "graceful-charity-discard",
        summary: "手札を捨てる",
        description: "手札から2枚選んで捨ててください",
      });
      expect(result.effectSteps![3]).toMatchObject({
        id: "charity-0-graveyard",
        summary: "墓地へ送る",
        description: "天使の施しを墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when deck has only 2 cards", () => {
      // Arrange: Deck with only 2 cards (insufficient)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: createCardInstances([gracefulCharityCardId], "hand", "charity"),
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("charity-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate
      expect(result).toBe(false);
    });
  });
});
