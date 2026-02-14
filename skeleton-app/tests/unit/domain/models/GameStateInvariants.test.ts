/**
 * Unit tests for GameStateInvariants
 */

import { describe, it, expect } from "vitest";
import {
  validateGameState,
  validateZones,
  validateLifePoints,
  validatePhase,
  validateTurn,
  validateResult,
  assertValidGameState,
} from "$lib/domain/models/GameStateInvariants";
import { createMockGameState } from "../../../__testUtils__/gameStateFactory";

describe("GameStateInvariants", () => {
  describe("validateGameState", () => {
    it("should pass validation for valid state", () => {
      const state = createMockGameState();

      const result = validateGameState(state);
      expect(result.isConsistent).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should aggregate errors from all validators", () => {
      const state = createMockGameState({
        turn: -1, // Invalid turn
        lp: { player: -100, opponent: 8000 }, // Invalid LP
      });

      const result = validateGameState(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((err) => err.includes("Turn"))).toBe(true);
      expect(result.errors.some((err) => err.includes("LP"))).toBe(true);
    });
  });

  describe("validateZones", () => {
    it("should pass for valid zones", () => {
      const state = createMockGameState();

      const result = validateZones(state);
      expect(result.isConsistent).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail if deck exceeds 60 cards", () => {
      const largeDeck = Array.from({ length: 61 }, (_, i) => ({
        instanceId: `deck-${i}`,
        id: 1000 + i,
        jaName: `Card ${i}`,
        type: "spell" as const,
        frameType: "spell" as const,
        location: "deck" as const,
        placedThisTurn: false,
      }));

      const state = createMockGameState({
        zones: {
          deck: largeDeck,
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Deck size is out of bounds"))).toBe(true);
    });

    it("should fail if hand exceeds 10 cards", () => {
      const largeHand = Array.from({ length: 11 }, (_, i) => ({
        instanceId: `hand-${i}`,
        id: 1000 + i,
        jaName: `Card ${i}`,
        type: "spell" as const,
        frameType: "spell" as const,
        location: "hand" as const,
        placedThisTurn: false,
      }));

      const state = createMockGameState({
        zones: {
          deck: [],
          hand: largeHand,
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Hand size is out of bounds"))).toBe(true);
    });

    it("should fail if spellTrapZone exceeds 5 cards", () => {
      const largeSpellTrapZone = Array.from({ length: 6 }, (_, i) => ({
        instanceId: `spellTrap-${i}`,
        id: 1000 + i,
        jaName: `Card ${i}`,
        type: "spell" as const,
        frameType: "spell" as const,
        location: "spellTrapZone" as const,
        placedThisTurn: false,
      }));

      const state = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: largeSpellTrapZone,
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Spell/Trap Zone size is out of bounds"))).toBe(true);
    });

    it("should fail if mainMonsterZone exceeds 5 cards", () => {
      const largeMonsterZone = Array.from({ length: 6 }, (_, i) => ({
        instanceId: `monster-${i}`,
        id: 1000 + i,
        jaName: `Card ${i}`,
        type: "monster" as const,
        frameType: "normal" as const,
        location: "mainMonsterZone" as const,
        placedThisTurn: false,
      }));

      const state = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          mainMonsterZone: largeMonsterZone,
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Main Monster Zone size is out of bounds"))).toBe(true);
    });

    it("should fail if duplicate instance IDs exist", () => {
      const state = createMockGameState({
        zones: {
          deck: [
            {
              instanceId: "duplicate",
              id: 1001,
              jaName: "Card 1",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "deck" as const,
            },
            {
              instanceId: "duplicate",
              id: 1002,
              jaName: "Card 2",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "deck" as const,
            },
          ],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Duplicate"))).toBe(true);
    });

    it("should fail if cards have missing IDs", () => {
      const state = createMockGameState({
        zones: {
          deck: [
            {
              instanceId: "",
              id: 1001,
              jaName: "Card 1",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "deck" as const,
            }, // Missing instanceId
          ],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("missing IDs"))).toBe(true);
    });

    it("should fail if location property doesn't match zone", () => {
      const state = createMockGameState({
        zones: {
          deck: [
            {
              instanceId: "card1",
              id: 1001,
              jaName: "Card 1",
              type: "spell" as const,
              frameType: "spell" as const,
              location: "hand" as const,
            }, // Wrong location
          ],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("incorrect location"))).toBe(true);
    });
  });

  describe("validateLifePoints", () => {
    it("should pass for valid LP", () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
      });

      const result = validateLifePoints(state);
      expect(result.isConsistent).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail if player LP is negative", () => {
      const state = createMockGameState({
        lp: { player: -100, opponent: 8000 },
      });

      const result = validateLifePoints(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Player LP is out of bounds"))).toBe(true);
    });

    it("should fail if opponent LP is negative", () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: -500 },
      });

      const result = validateLifePoints(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Opponent LP is out of bounds"))).toBe(true);
    });

    it("should fail if LP exceeds maximum", () => {
      const state = createMockGameState({
        lp: { player: 100000, opponent: 8000 },
      });

      const result = validateLifePoints(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Player LP is out of bounds"))).toBe(true);
    });

    it("should allow LP of 0 (game over)", () => {
      const state = createMockGameState({
        lp: { player: 0, opponent: 8000 },
      });

      const result = validateLifePoints(state);
      expect(result.isConsistent).toBe(true);
    });
  });

  describe("validatePhase", () => {
    it("should pass for valid phases", () => {
      const validPhases = ["Draw", "Standby", "Main1", "End"] as const;

      validPhases.forEach((phase) => {
        const state = createMockGameState({ phase });

        const result = validatePhase(state);
        expect(result.isConsistent).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("should fail for invalid phase", () => {
      // @ts-expect-error - Testing invalid phase
      const state = createMockGameState({ phase: "InvalidPhase" });

      const result = validatePhase(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Invalid phase"))).toBe(true);
    });
  });

  describe("validateTurn", () => {
    it("should pass for valid turn numbers", () => {
      const state = createMockGameState({ turn: 5 });

      const result = validateTurn(state);
      expect(result.isConsistent).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail if turn is less than 1", () => {
      const state = createMockGameState({ turn: 0 });

      const result = validateTurn(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Turn is out of bounds"))).toBe(true);
    });

    it("should fail if turn exceeds maximum", () => {
      const state = createMockGameState({ turn: 1000 });

      const result = validateTurn(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Turn is out of bounds"))).toBe(true);
    });

    it("should fail if turn is not an integer", () => {
      const state = createMockGameState({ turn: 5.5 });

      const result = validateTurn(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Turn must be an integer"))).toBe(true);
    });
  });

  describe("validateResult", () => {
    it("should pass for ongoing game with no winner", () => {
      const state = createMockGameState({
        result: { isGameOver: false },
      });

      const result = validateResult(state);
      expect(result.isConsistent).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should pass for game over with winner and reason", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          winner: "player",
          reason: "exodia",
          message: "Exodia victory!",
        },
      });

      const result = validateResult(state);
      expect(result.isConsistent).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail if game is over but winner is missing", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          reason: "exodia",
        },
      });

      const result = validateResult(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("winner is not set"))).toBe(true);
    });

    it("should fail if game is over but reason is missing", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          winner: "player",
        },
      });

      const result = validateResult(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("reason is not set"))).toBe(true);
    });

    it("should fail if game is ongoing but winner is set", () => {
      const state = createMockGameState({
        result: {
          isGameOver: false,
          winner: "player",
        },
      });

      const result = validateResult(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("ongoing but winner is set"))).toBe(true);
    });

    it("should fail for invalid winner value", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          // @ts-expect-error - Testing invalid winner
          winner: "invalid",
          reason: "exodia",
        },
      });

      const result = validateResult(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Invalid winner"))).toBe(true);
    });

    it("should fail for invalid reason value", () => {
      const state = createMockGameState({
        result: {
          isGameOver: true,
          winner: "player",
          // @ts-expect-error - Testing invalid reason
          reason: "invalid",
        },
      });

      const result = validateResult(state);
      expect(result.isConsistent).toBe(false);
      expect(result.errors.some((err) => err.includes("Invalid reason"))).toBe(true);
    });
  });

  describe("assertValidGameState", () => {
    it("should not throw for valid state", () => {
      const state = createMockGameState();

      expect(() => assertValidGameState(state)).not.toThrow();
    });

    it("should throw for invalid state", () => {
      const state = createMockGameState({
        turn: -1, // Invalid
      });

      expect(() => assertValidGameState(state)).toThrow("Invalid GameState");
    });

    it("should include error details in thrown message", () => {
      const state = createMockGameState({
        turn: -1,
        lp: { player: -100, opponent: 8000 },
      });

      expect(() => assertValidGameState(state)).toThrow(/Turn is out of bounds/);
      expect(() => assertValidGameState(state)).toThrow(/Player LP is out of bounds/);
    });
  });
});
