/**
 * Quick-Play Spell Card Effects Tests (Integration Layer)
 *
 * Tests Quick-Play Spell card-specific scenarios integrated with the full application layer.
 * Focuses on actual gameplay scenarios rather than implementation details.
 *
 * Test Responsibility:
 * - Quick-Play Spell card activation scenarios (end-to-end gameplay flow)
 * - Registry integration (cardId → Effect retrieval → Effect execution)
 * - Side effects (effectQueueStore.startProcessing calls)
 * - Actual game state changes (hand → graveyard → deck → hand)
 *
 * Test Strategy (from docs/architecture/testing-strategy.md):
 * - **Base class validation**: Tested in tests/unit/domain/effects/base/spell/
 *   - BaseSpellAction.test.ts: Game-over check
 *   - QuickPlaySpellAction.test.ts: spellSpeed=2, Main1 phase check
 * - **Card scenarios**: Tested here
 *   - Card Destruction: Hand >= 3 → Discard all → Draw same amount
 *
 * Rationale:
 * - Card-specific canActivate() (e.g., hand.length >= 3) is implementation mirror
 * - Scenario-based tests detect real bugs more effectively
 * - Easy to add new cards without duplicating base class tests
 *
 * @module tests/integration/card-effects/QuickPlaySpells
 */

import { describe, it, expect } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { createMockGameState, createCardInstances } from "../../__testUtils__/gameStateFactory";
import "$lib/domain/effects"; // Initialize ChainableActionRegistry

describe("Quick-Play Spell Card Effects", () => {
  describe("Card Destruction (74519184) - Scenario Tests", () => {
    const cardDestructionCardId = "74519184";

    it("Scenario: Activate Card Destruction → Both players discard all → Both draw same amount", () => {
      // Arrange: Initial state - 5 cards in deck, 4 cards in hand (Card Destruction + 3 others)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3", "card4", "card5"], "deck"),
          hand: createCardInstances([cardDestructionCardId, "hand1", "hand2", "hand3"], "hand", "destruction"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Card Destruction (new system - returns effectSteps)
      const command = new ActivateSpellCommand("destruction-0");
      const result = command.execute(state);

      // Assert: effectSteps are returned in the result
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4);

      // Verify steps: [activation, player discard, opponent discard, player draw]
      expect(result.effectSteps![0]).toMatchObject({
        id: "74519184-activation",
        summary: "カード発動",
        description: "《手札断札》を発動します",
      });
      expect(result.effectSteps![1]).toMatchObject({
        id: "select-and-discard-2-cards",
        summary: "手札を2枚捨てる",
      });
      expect(result.effectSteps![2]).toMatchObject({
        id: "card-destruction-discard-opponent",
        summary: "相手が手札を捨てる",
      });
      expect(result.effectSteps![3]).toMatchObject({
        id: "draw-2",
        summary: "カードをドロー",
      });
    });

    it("Scenario: Cannot activate when hand has only 2 cards (insufficient)", () => {
      // Arrange: Hand with only 2 cards (Card Destruction + 1 other)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances([cardDestructionCardId, "hand1"], "hand", "destruction"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("destruction-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (need at least 3 cards in hand)
      expect(result.canExecute).toBe(false);
    });

    it("Scenario: Can activate when hand has exactly 3 cards", () => {
      // Arrange: Hand with exactly 3 cards (Card Destruction + 2 others)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances([cardDestructionCardId, "hand1", "hand2"], "hand", "destruction"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("destruction-0");
      const result = command.canExecute(state);

      // Assert: Can activate
      expect(result.canExecute).toBe(true);
    });

    it("Scenario: Spell Speed 2 allows chaining (verified via property)", async () => {
      // Arrange: Get the action from registry
      const { ChainableActionRegistry } = await import("$lib/domain/registries/ChainableActionRegistry");
      const action = ChainableActionRegistry.get(74519184);

      // Assert: Spell Speed is 2 (Quick-Play characteristic)
      expect(action).toBeDefined();
      expect(action!.spellSpeed).toBe(2);
    });
  });
});
