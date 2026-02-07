/**
 * Counter Accumulation Tests (Integration Layer)
 *
 * Tests for Royal Magical Library's continuous effect - automatic spell counter accumulation
 * when spell cards are activated.
 *
 * Test Responsibility:
 * - Trigger mechanism fires when spell cards are activated
 * - Spell counters are placed on Royal Magical Library (up to max 3)
 * - Multiple spell activations accumulate counters correctly
 * - Multiple Royal Magical Libraries each receive counters independently
 *
 * @module tests/integration/counter-accumulation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { createMockGameState } from "../__testUtils__/gameStateFactory";
import { initializeChainableActionRegistry } from "$lib/domain/effects/actions/index";
import { initializeAdditionalRuleRegistry } from "$lib/domain/effects/rules/index";
import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
import { getCounterCount } from "$lib/domain/models/Counter";
import type { CardInstance } from "$lib/domain/models/Card";

// Initialize registries
initializeChainableActionRegistry();
initializeAdditionalRuleRegistry();

describe("Counter Accumulation - Royal Magical Library", () => {
  const royalMagicalLibraryId = 70791313;
  const potOfGreedCardId = 55144522;

  // Helper function to create Royal Magical Library card instance
  const createLibraryCard = (instanceId: string, overrides: Partial<CardInstance> = {}): CardInstance => ({
    id: royalMagicalLibraryId,
    jaName: "王立魔法図書館",
    type: "monster",
    frameType: "effect",
    instanceId,
    location: "mainMonsterZone",
    position: "faceUp",
    placedThisTurn: false,
    counters: [],
    ...overrides,
  });

  // Helper function to create Pot of Greed card instance
  const createPotOfGreed = (instanceId: string): CardInstance => ({
    id: potOfGreedCardId,
    jaName: "強欲な壺",
    type: "spell",
    frameType: "spell",
    spellType: "normal",
    instanceId,
    location: "hand",
    position: "faceDown",
    placedThisTurn: false,
    counters: [],
  });

  // Helper function to create deck cards
  const createDeckCards = (count: number): CardInstance[] =>
    Array.from({ length: count }, (_, i) => ({
      id: 12345678 + i,
      jaName: `デッキカード${i + 1}`,
      type: "monster" as const,
      frameType: "normal" as const,
      desc: "テスト用カード",
      instanceId: `deck-${i}`,
      location: "deck" as const,
      position: "faceDown" as const,
      placedThisTurn: false,
      counters: [],
    }));

  beforeEach(() => {
    // Clear the registry before each test to ensure isolation
    AdditionalRuleRegistry.clear();
    initializeAdditionalRuleRegistry();
  });

  describe("US1: 魔力カウンターの自動蓄積", () => {
    it("Scenario: 王立魔法図書館がフィールドにいる状態で魔法発動 → カウンターが1つ置かれる", () => {
      // Arrange: Royal Magical Library on field, Pot of Greed in hand
      const libraryCard = createLibraryCard("library-0");
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [potOfGreed],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Pot of Greed
      const command = new ActivateSpellCommand("pot-0");
      const result = command.execute(state);

      // Assert: Activation successful
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();

      // Verify trigger execution step is included (new pattern: royal-magical-library-counter-${instanceId})
      const triggerStep = result.effectSteps!.find((step) => step.id.startsWith("royal-magical-library-counter-"));
      expect(triggerStep).toBeDefined();
      expect(triggerStep!.summary).toBe("魔力カウンター蓄積");

      // Execute the trigger step to verify counter is placed
      const stateAfterTrigger = triggerStep!.action(result.updatedState);
      expect(stateAfterTrigger.success).toBe(true);

      // Verify counter was placed on Royal Magical Library
      const updatedLibrary = stateAfterTrigger.updatedState.zones.mainMonsterZone[0];
      expect(getCounterCount(updatedLibrary.counters, "spell")).toBe(1);
    });

    it("Scenario: 魔法を3回発動 → カウンターが3つ置かれる（上限）", () => {
      // Arrange: Royal Magical Library on field, multiple spell cards
      const libraryCard = createLibraryCard("library-0");
      const spellCards: CardInstance[] = [
        createPotOfGreed("pot-0"),
        createPotOfGreed("pot-1"),
        createPotOfGreed("pot-2"),
      ];

      let currentState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(10),
          hand: spellCards,
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate 3 spell cards sequentially
      for (let i = 0; i < 3; i++) {
        const command = new ActivateSpellCommand(`pot-${i}`);
        const result = command.execute(currentState);
        expect(result.success).toBe(true);

        // Find and execute trigger step (new pattern)
        const triggerStep = result.effectSteps!.find((step) => step.id.startsWith("royal-magical-library-counter-"));
        expect(triggerStep).toBeDefined();

        const triggerResult = triggerStep!.action(result.updatedState);
        currentState = triggerResult.updatedState;
      }

      // Assert: Counter should be at max (3)
      const finalLibrary = currentState.zones.mainMonsterZone[0];
      expect(getCounterCount(finalLibrary.counters, "spell")).toBe(3);
    });

    it("Scenario: カウンターが3つある状態で魔法発動 → カウンターは3つのまま（上限超えない）", () => {
      // Arrange: Royal Magical Library with 3 counters
      const libraryCard = createLibraryCard("library-0", {
        counters: [{ type: "spell", count: 3 }],
      });
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [potOfGreed],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Pot of Greed
      const command = new ActivateSpellCommand("pot-0");
      const result = command.execute(state);

      // Execute trigger step (new pattern)
      const triggerStep = result.effectSteps!.find((step) => step.id.startsWith("royal-magical-library-counter-"));
      const triggerResult = triggerStep!.action(result.updatedState);

      // Assert: Counter should still be 3 (not exceed max)
      const updatedLibrary = triggerResult.updatedState.zones.mainMonsterZone[0];
      expect(getCounterCount(updatedLibrary.counters, "spell")).toBe(3);
    });

    it("Scenario: 王立魔法図書館が裏側表示の場合 → トリガーステップは追加されない（カウンターは置かれない）", () => {
      // Arrange: Royal Magical Library face-down
      const libraryCard = createLibraryCard("library-0", {
        position: "faceDown",
      });
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [potOfGreed],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Pot of Greed
      const command = new ActivateSpellCommand("pot-0");
      const result = command.execute(state);

      // Verify trigger step does NOT exist (face-down cards don't trigger)
      const triggerStep = result.effectSteps!.find((step) => step.id.startsWith("royal-magical-library-counter-"));
      expect(triggerStep).toBeUndefined();

      // Verify activation succeeds and library remains unchanged
      expect(result.success).toBe(true);
      const updatedLibrary = result.updatedState.zones.mainMonsterZone[0];
      expect(getCounterCount(updatedLibrary.counters, "spell")).toBe(0);
    });

    it("Scenario: 王立魔法図書館がフィールドにいない場合 → トリガーステップは追加されない", () => {
      // Arrange: No Royal Magical Library on field
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [potOfGreed],
          mainMonsterZone: [], // No monsters
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Pot of Greed
      const command = new ActivateSpellCommand("pot-0");
      const result = command.execute(state);

      // Verify trigger step does NOT exist (no trigger rules on field)
      const triggerStep = result.effectSteps!.find((step) => step.id.startsWith("royal-magical-library-counter-"));
      expect(triggerStep).toBeUndefined();

      // Activation should still succeed
      expect(result.success).toBe(true);
    });
  });

  describe("US3: 複数体の王立魔法図書館", () => {
    it("Scenario: 2体の王立魔法図書館がフィールドにいる状態で魔法発動 → 両方に1つずつカウンターが置かれる", () => {
      // Arrange: Two Royal Magical Libraries on field
      const library1 = createLibraryCard("library-0");
      const library2 = createLibraryCard("library-1");
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [potOfGreed],
          mainMonsterZone: [library1, library2],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Pot of Greed
      const command = new ActivateSpellCommand("pot-0");
      const result = command.execute(state);

      // Execute all trigger steps (each library creates its own step)
      const triggerSteps = result.effectSteps!.filter((step) => step.id.startsWith("royal-magical-library-counter-"));
      expect(triggerSteps).toHaveLength(2);

      let currentState = result.updatedState;
      for (const step of triggerSteps) {
        const stepResult = step.action(currentState);
        currentState = stepResult.updatedState;
      }

      // Assert: Both libraries should have 1 counter each
      const updatedLibrary1 = currentState.zones.mainMonsterZone[0];
      const updatedLibrary2 = currentState.zones.mainMonsterZone[1];

      expect(getCounterCount(updatedLibrary1.counters, "spell")).toBe(1);
      expect(getCounterCount(updatedLibrary2.counters, "spell")).toBe(1);
    });

    it("Scenario: 1体がカウンター3つ、もう1体が0個の状態で魔法発動 → 0個の方だけ増える", () => {
      // Arrange: One library at max, one at zero
      const library1 = createLibraryCard("library-0", {
        counters: [{ type: "spell", count: 3 }],
      });
      const library2 = createLibraryCard("library-1");
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [potOfGreed],
          mainMonsterZone: [library1, library2],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Pot of Greed
      const command = new ActivateSpellCommand("pot-0");
      const result = command.execute(state);

      // Execute all trigger steps (each library creates its own step)
      const triggerSteps = result.effectSteps!.filter((step) => step.id.startsWith("royal-magical-library-counter-"));
      expect(triggerSteps).toHaveLength(2);

      let currentState = result.updatedState;
      for (const step of triggerSteps) {
        const stepResult = step.action(currentState);
        currentState = stepResult.updatedState;
      }

      // Assert: First library stays at 3, second library gets 1
      const updatedLibrary1 = currentState.zones.mainMonsterZone[0];
      const updatedLibrary2 = currentState.zones.mainMonsterZone[1];

      expect(getCounterCount(updatedLibrary1.counters, "spell")).toBe(3);
      expect(getCounterCount(updatedLibrary2.counters, "spell")).toBe(1);
    });
  });
});
