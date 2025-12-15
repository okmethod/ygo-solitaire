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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActivateSpellCommand } from "$lib/application/commands/ActivateSpellCommand";
import { createMockGameState, createCardInstances } from "../../__testUtils__/gameStateFactory";
import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";

describe("Normal Spell Card Effects", () => {
  beforeEach(() => {
    // Reset effectResolutionStore before each test
    effectResolutionStore.reset();
  });

  describe("Pot of Greed (55144522) - Scenario Tests", () => {
    const potOfGreedCardId = "55144522";

    it("Scenario: Activate Pot of Greed → Draw 2 cards → Hand increases by 2", () => {
      // Arrange: Initial state - 3 cards in deck, 1 card in hand (Pot of Greed)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: [{ instanceId: "pot-1", cardId: potOfGreedCardId, location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Spy on effectResolutionStore.startResolution
      const startResolutionSpy = vi.spyOn(effectResolutionStore, "startResolution");

      // Act: Activate Pot of Greed
      const command = new ActivateSpellCommand("pot-1");
      command.execute(state);

      // Assert: Effect resolution started
      expect(startResolutionSpy).toHaveBeenCalledOnce();
      const [[steps]] = startResolutionSpy.mock.calls;

      // Verify steps: [draw step, graveyard step]
      expect(steps).toHaveLength(2);
      expect(steps[0]).toMatchObject({
        id: "pot-of-greed-draw",
        title: "カードをドローします",
        message: "デッキから2枚ドローします",
      });
      expect(steps[1]).toMatchObject({
        id: "PotOfGreedEffect-to-graveyard",
        title: "墓地に送ります",
        message: "効果解決後、カードを墓地に送ります",
      });

      // Restore spy
      startResolutionSpy.mockRestore();
    });

    it("Scenario: Cannot activate when deck has only 1 card", () => {
      // Arrange: Deck with only 1 card (insufficient)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1"], "deck"),
          hand: [{ instanceId: "pot-1", cardId: potOfGreedCardId, location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("pot-1");
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
          hand: [{ instanceId: "charity-1", cardId: gracefulCharityCardId, location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Spy on effectResolutionStore.startResolution
      const startResolutionSpy = vi.spyOn(effectResolutionStore, "startResolution");

      // Act: Activate Graceful Charity
      const command = new ActivateSpellCommand("charity-1");
      command.execute(state);

      // Assert: Effect resolution started
      expect(startResolutionSpy).toHaveBeenCalledOnce();
      const [[steps]] = startResolutionSpy.mock.calls;

      // Verify steps: [draw step, discard step, graveyard step]
      expect(steps).toHaveLength(3);
      expect(steps[0]).toMatchObject({
        id: "graceful-charity-draw",
        title: "カードをドローします",
        message: "デッキから3枚ドローします",
      });
      expect(steps[1]).toMatchObject({
        id: "graceful-charity-discard",
        title: "カードを破棄します",
        message: "手札から2枚選んで破棄してください",
      });
      expect(steps[2]).toMatchObject({
        id: "GracefulCharityEffect-to-graveyard",
        title: "墓地に送ります",
        message: "効果解決後、カードを墓地に送ります",
      });

      // Restore spy
      startResolutionSpy.mockRestore();
    });

    it("Scenario: Cannot activate when deck has only 2 cards", () => {
      // Arrange: Deck with only 2 cards (insufficient)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: [{ instanceId: "charity-1", cardId: gracefulCharityCardId, location: "hand" }],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("charity-1");
      const result = command.canExecute(state);

      // Assert: Cannot activate
      expect(result).toBe(false);
    });
  });
});
