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
 * Note: 新しいイベントトリガーシステムでは、トリガーステップは effectQueueStore の処理中に
 * 動的に挿入されます。このテストでは AdditionalRuleRegistry.collectTriggerSteps() を直接呼び出して
 * トリガーステップを取得し、カウンター蓄積ロジックをテストしています。
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createMockGameState } from "../__testUtils__/gameStateFactory";
import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { EventType } from "$lib/domain/models/GameProcessing";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { initializeChainableActionRegistry } from "$lib/domain/effects/actions";
import { AdditionalRuleRegistry, initializeAdditionalRuleRegistry } from "$lib/domain/effects/rules";

// Initialize registries
initializeChainableActionRegistry();
initializeAdditionalRuleRegistry();

describe("Counter Accumulation - Royal Magical Library", () => {
  const royalMagicalLibraryId = 70791313;
  const potOfGreedCardId = 55144522;

  // Helper function to create Royal Magical Library card instance
  const createLibraryCard = (
    instanceId: string,
    overrides: { position?: "faceUp" | "faceDown"; counters?: { type: "spell"; count: number }[] } = {},
  ): CardInstance => ({
    id: royalMagicalLibraryId,
    jaName: "王立魔法図書館",
    type: "monster",
    frameType: "effect",
    instanceId,
    location: "mainMonsterZone",
    stateOnField: {
      position: overrides.position ?? "faceUp",
      placedThisTurn: false,
      counters: overrides.counters ?? [],
      activatedEffects: new Set(),
    },
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
      location: "mainDeck" as const,
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
        phase: "main1",
        space: {
          mainDeck: createDeckCards(5),
          extraDeck: [],
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

      // 新しい設計: トリガーステップは effectQueueStore で動的に挿入される
      // ここでは AdditionalRuleRegistry.collectTriggerSteps() を直接呼び出してテスト
      const triggerSteps = AdditionalRuleRegistry.collectTriggerSteps(
        result.updatedState,
        "spellActivated" as EventType,
      );
      expect(triggerSteps).toHaveLength(1);
      expect(triggerSteps[0].id).toContain("add-counter-spell");
      expect(triggerSteps[0].summary).toBe("カウンターを置く");

      // Execute the trigger step to verify counter is placed
      const stateAfterTrigger = triggerSteps[0].action(result.updatedState);
      expect(stateAfterTrigger.success).toBe(true);

      // Verify counter was placed on Royal Magical Library
      const updatedLibrary = stateAfterTrigger.updatedState.space.mainMonsterZone[0];
      expect(Card.Counter.get(updatedLibrary.stateOnField?.counters ?? [], "spell")).toBe(1);
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
        phase: "main1",
        space: {
          mainDeck: createDeckCards(10),
          extraDeck: [],
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

        // 新しい設計: トリガーステップを直接収集して実行
        const triggerSteps = AdditionalRuleRegistry.collectTriggerSteps(
          result.updatedState,
          "spellActivated" as EventType,
        );
        expect(triggerSteps).toHaveLength(1);

        const triggerResult = triggerSteps[0].action(result.updatedState);
        currentState = triggerResult.updatedState;
      }

      // Assert: Counter should be at max (3)
      const finalLibrary = currentState.space.mainMonsterZone[0];
      expect(Card.Counter.get(finalLibrary.stateOnField?.counters ?? [], "spell")).toBe(3);
    });

    it("Scenario: カウンターが3つある状態で魔法発動 → カウンターは3つのまま（上限超えない）", () => {
      // Arrange: Royal Magical Library with 3 counters
      const libraryCard = createLibraryCard("library-0", {
        counters: [{ type: "spell", count: 3 }],
      });
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: createDeckCards(5),
          extraDeck: [],
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

      // 新しい設計: トリガーステップを直接収集して実行
      const triggerSteps = AdditionalRuleRegistry.collectTriggerSteps(
        result.updatedState,
        "spellActivated" as EventType,
      );
      expect(triggerSteps).toHaveLength(1);
      const triggerResult = triggerSteps[0].action(result.updatedState);

      // Assert: Counter should still be 3 (not exceed max)
      const updatedLibrary = triggerResult.updatedState.space.mainMonsterZone[0];
      expect(Card.Counter.get(updatedLibrary.stateOnField?.counters ?? [], "spell")).toBe(3);
    });

    it("Scenario: 王立魔法図書館が裏側表示の場合 → トリガーステップは追加されない（カウンターは置かれない）", () => {
      // Arrange: Royal Magical Library face-down
      const libraryCard = createLibraryCard("library-0", {
        position: "faceDown",
      });
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: createDeckCards(5),
          extraDeck: [],
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
      const updatedLibrary = result.updatedState.space.mainMonsterZone[0];
      expect(Card.Counter.get(updatedLibrary.stateOnField?.counters ?? [], "spell")).toBe(0);
    });

    it("Scenario: 王立魔法図書館がフィールドにいない場合 → トリガーステップは追加されない", () => {
      // Arrange: No Royal Magical Library on field
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: createDeckCards(5),
          extraDeck: [],
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
        phase: "main1",
        space: {
          mainDeck: createDeckCards(5),
          extraDeck: [],
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

      // 新しい設計: トリガーステップを直接収集して実行
      const triggerSteps = AdditionalRuleRegistry.collectTriggerSteps(
        result.updatedState,
        "spellActivated" as EventType,
      );
      expect(triggerSteps).toHaveLength(2);

      let currentState = result.updatedState;
      for (const step of triggerSteps) {
        const stepResult = step.action(currentState);
        currentState = stepResult.updatedState;
      }

      // Assert: Both libraries should have 1 counter each
      const updatedLibrary1 = currentState.space.mainMonsterZone[0];
      const updatedLibrary2 = currentState.space.mainMonsterZone[1];

      expect(Card.Counter.get(updatedLibrary1.stateOnField?.counters ?? [], "spell")).toBe(1);
      expect(Card.Counter.get(updatedLibrary2.stateOnField?.counters ?? [], "spell")).toBe(1);
    });

    it("Scenario: 1体がカウンター3つ、もう1体が0個の状態で魔法発動 → 0個の方だけ増える", () => {
      // Arrange: One library at max, one at zero
      const library1 = createLibraryCard("library-0", {
        counters: [{ type: "spell", count: 3 }],
      });
      const library2 = createLibraryCard("library-1");
      const potOfGreed = createPotOfGreed("pot-0");

      const state = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: createDeckCards(5),
          extraDeck: [],
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

      // 新しい設計: トリガーステップを直接収集して実行
      const triggerSteps = AdditionalRuleRegistry.collectTriggerSteps(
        result.updatedState,
        "spellActivated" as EventType,
      );
      expect(triggerSteps).toHaveLength(2);

      let currentState = result.updatedState;
      for (const step of triggerSteps) {
        const stepResult = step.action(currentState);
        currentState = stepResult.updatedState;
      }

      // Assert: First library stays at 3, second library gets 1
      const updatedLibrary1 = currentState.space.mainMonsterZone[0];
      const updatedLibrary2 = currentState.space.mainMonsterZone[1];

      expect(Card.Counter.get(updatedLibrary1.stateOnField?.counters ?? [], "spell")).toBe(3);
      expect(Card.Counter.get(updatedLibrary2.stateOnField?.counters ?? [], "spell")).toBe(1);
    });
  });
});
