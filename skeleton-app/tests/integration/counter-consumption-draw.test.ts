/**
 * Counter Consumption Draw Tests (Integration Layer)
 *
 * Tests for Royal Magical Library's ignition effect - consuming spell counters to draw.
 *
 * Test Responsibility:
 * - Ignition effect can only be activated with 3+ spell counters
 * - 3 spell counters are removed as cost
 * - 1 card is drawn as effect resolution
 * - Multiple activations possible if counters are available
 *
 * @module tests/integration/counter-consumption-draw
 */

import { describe, it, expect, beforeEach } from "vitest";
import { RoyalMagicalLibraryIgnitionEffect } from "$lib/domain/effects/actions/Ignitions/individuals/monsters/RoyalMagicalLibraryIgnitionEffect";
import { createMockGameState } from "../__testUtils__/gameStateFactory";
import { getCounterCount } from "$lib/domain/models/Counter";
import type { CardInstance } from "$lib/domain/models/CardOld";
import type { GameState } from "$lib/domain/models/GameStateOld";

describe("Counter Consumption Draw - Royal Magical Library Ignition Effect", () => {
  const royalMagicalLibraryId = 70791313;
  let effect: RoyalMagicalLibraryIgnitionEffect;

  // Helper function to create Royal Magical Library card instance
  const createLibraryCard = (instanceId: string, counterCount: number): CardInstance => ({
    id: royalMagicalLibraryId,
    jaName: "王立魔法図書館",
    type: "monster",
    frameType: "effect",
    instanceId,
    location: "mainMonsterZone",
    stateOnField: {
      position: "faceUp",
      battlePosition: "attack",
      placedThisTurn: false,
      counters: counterCount > 0 ? [{ type: "spell" as const, count: counterCount }] : [],
      activatedEffects: new Set(),
    },
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
    }));

  beforeEach(() => {
    effect = new RoyalMagicalLibraryIgnitionEffect();
  });

  describe("US4: カウンター消費によるドロー効果", () => {
    it("Scenario: 魔力カウンター3つで起動効果発動 → カウンター消費＋1枚ドロー", () => {
      // Arrange
      const libraryCard = createLibraryCard("library-0", 3);

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Check activation
      const canActivate = effect.canActivate(state, libraryCard);
      expect(canActivate.isValid).toBe(true);

      // Act: Execute activation steps (cost payment)
      const activationSteps = effect.createActivationSteps(state, libraryCard);
      let currentState = state;
      for (const step of activationSteps) {
        const result = step.action(currentState);
        expect(result.success).toBe(true);
        currentState = result.updatedState;
      }

      // Assert: Counters removed
      const libraryAfterActivation = currentState.zones.mainMonsterZone[0];
      expect(getCounterCount(libraryAfterActivation.stateOnField?.counters ?? [], "spell")).toBe(0);

      // Act: Execute resolution steps (draw)
      const resolutionSteps = effect.createResolutionSteps(currentState, libraryCard);
      for (const step of resolutionSteps) {
        const result = step.action(currentState);
        expect(result.success).toBe(true);
        currentState = result.updatedState;
      }

      // Assert: Drew 1 card
      expect(currentState.zones.hand).toHaveLength(1);
      expect(currentState.zones.deck).toHaveLength(4);
    });

    it("Scenario: 魔力カウンター2つでは起動効果を発動できない", () => {
      // Arrange
      const libraryCard = createLibraryCard("library-0", 2);

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      const canActivate = effect.canActivate(state, libraryCard);
      expect(canActivate.isValid).toBe(false);
      expect(canActivate.errorCode).toBe("INSUFFICIENT_COUNTERS");
    });

    it("Scenario: 魔力カウンター0個では起動効果を発動できない", () => {
      // Arrange
      const libraryCard = createLibraryCard("library-0", 0);

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act & Assert
      const canActivate = effect.canActivate(state, libraryCard);
      expect(canActivate.isValid).toBe(false);
      expect(canActivate.errorCode).toBe("INSUFFICIENT_COUNTERS");
    });

    it("Scenario: 魔力カウンター5つで起動効果発動 → 3つ消費して2つ残る", () => {
      // Arrange
      const libraryCard = createLibraryCard("library-0", 5);

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const activationSteps = effect.createActivationSteps(state, libraryCard);
      let currentState = state;
      for (const step of activationSteps) {
        const result = step.action(currentState);
        expect(result.success).toBe(true);
        currentState = result.updatedState;
      }

      // Assert: 5 - 3 = 2 counters remaining
      const libraryAfterActivation = currentState.zones.mainMonsterZone[0];
      expect(getCounterCount(libraryAfterActivation.stateOnField?.counters ?? [], "spell")).toBe(2);
    });

    it("Scenario: 起動効果は1ターンに複数回発動可能（カウンターがあれば）", () => {
      // Arrange: Start with 6 counters
      const libraryCard = createLibraryCard("library-0", 6);

      let currentState: GameState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createDeckCards(5),
          hand: [],
          mainMonsterZone: [libraryCard],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // First activation
      const canActivate1 = effect.canActivate(currentState, currentState.zones.mainMonsterZone[0]);
      expect(canActivate1.isValid).toBe(true);

      // Execute first activation
      const activationSteps1 = effect.createActivationSteps(currentState, currentState.zones.mainMonsterZone[0]);
      for (const step of activationSteps1) {
        const result = step.action(currentState);
        expect(result.success).toBe(true);
        currentState = result.updatedState;
      }
      const resolutionSteps1 = effect.createResolutionSteps(currentState, currentState.zones.mainMonsterZone[0]);
      for (const step of resolutionSteps1) {
        const result = step.action(currentState);
        expect(result.success).toBe(true);
        currentState = result.updatedState;
      }

      // After first activation: 6 - 3 = 3 counters, 1 card drawn
      expect(getCounterCount(currentState.zones.mainMonsterZone[0].stateOnField?.counters ?? [], "spell")).toBe(3);
      expect(currentState.zones.hand).toHaveLength(1);

      // Second activation should be possible
      const canActivate2 = effect.canActivate(currentState, currentState.zones.mainMonsterZone[0]);
      expect(canActivate2.isValid).toBe(true);

      // Execute second activation
      const activationSteps2 = effect.createActivationSteps(currentState, currentState.zones.mainMonsterZone[0]);
      for (const step of activationSteps2) {
        const result = step.action(currentState);
        expect(result.success).toBe(true);
        currentState = result.updatedState;
      }
      const resolutionSteps2 = effect.createResolutionSteps(currentState, currentState.zones.mainMonsterZone[0]);
      for (const step of resolutionSteps2) {
        const result = step.action(currentState);
        expect(result.success).toBe(true);
        currentState = result.updatedState;
      }

      // After second activation: 3 - 3 = 0 counters, 2 cards drawn
      expect(getCounterCount(currentState.zones.mainMonsterZone[0].stateOnField?.counters ?? [], "spell")).toBe(0);
      expect(currentState.zones.hand).toHaveLength(2);

      // Third activation should NOT be possible (no counters left)
      const canActivate3 = effect.canActivate(currentState, currentState.zones.mainMonsterZone[0]);
      expect(canActivate3.isValid).toBe(false);
      expect(canActivate3.errorCode).toBe("INSUFFICIENT_COUNTERS");
    });
  });
});
