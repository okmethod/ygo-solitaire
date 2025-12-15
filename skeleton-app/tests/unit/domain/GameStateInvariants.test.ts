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
  isValidGameState,
  assertValidGameState,
} from "$lib/domain/models/GameStateInvariants";
import { createMockGameState } from "../../__testUtils__/gameStateFactory";

describe("GameStateInvariants", () => {
  describe("validateGameState", () => {
    it("should pass validation for valid state", () => {
      const state = createMockGameState();
      const result = validateGameState(state);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should aggregate errors from all validators", () => {
      const state = createMockGameState({
        turn: -1, // Invalid turn
        lp: { player: -100, opponent: 8000 }, // Invalid LP
      });

      const result = validateGameState(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((err) => err.includes("Turn"))).toBe(true);
      expect(result.errors.some((err) => err.includes("LP"))).toBe(true);
    });
  });

  describe("validateZones", () => {
    it("should pass for valid zones", () => {
      const state = createMockGameState();
      const result = validateZones(state);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail if deck exceeds 60 cards", () => {
      const largeDeck = Array.from({ length: 61 }, (_, i) => ({
        instanceId: `deck-${i}`,
        cardId: `card-${i}`,
        location: "deck" as const,
      }));

      const state = createMockGameState({
        zones: {
          deck: largeDeck,
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("too many cards"))).toBe(true);
    });

    it("should fail if hand exceeds 10 cards", () => {
      const largeHand = Array.from({ length: 11 }, (_, i) => ({
        instanceId: `hand-${i}`,
        cardId: `card-${i}`,
        location: "hand" as const,
      }));

      const state = createMockGameState({
        zones: {
          deck: [],
          hand: largeHand,
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("Hand has too many"))).toBe(true);
    });

    it("should fail if field exceeds 5 cards", () => {
      const largeField = Array.from({ length: 6 }, (_, i) => ({
        instanceId: `field-${i}`,
        cardId: `card-${i}`,
        location: "field" as const,
      }));

      const state = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: largeField,
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("Field has too many"))).toBe(true);
    });

    it("should fail if duplicate instance IDs exist", () => {
      const state = createMockGameState({
        zones: {
          deck: [
            { instanceId: "duplicate", cardId: "card1", location: "deck" },
            { instanceId: "duplicate", cardId: "card2", location: "deck" },
          ],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("Duplicate"))).toBe(true);
    });

    it("should fail if cards have missing IDs", () => {
      const state = createMockGameState({
        zones: {
          deck: [
            { instanceId: "", cardId: "card1", location: "deck" }, // Missing instanceId
          ],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("missing IDs"))).toBe(true);
    });

    it("should fail if location property doesn't match zone", () => {
      const state = createMockGameState({
        zones: {
          deck: [
            { instanceId: "card1", cardId: "card1", location: "hand" }, // Wrong location
          ],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = validateZones(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("incorrect location"))).toBe(true);
    });
  });

  describe("validateLifePoints", () => {
    it("should pass for valid LP", () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: 8000 },
      });

      const result = validateLifePoints(state);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail if player LP is negative", () => {
      const state = createMockGameState({
        lp: { player: -100, opponent: 8000 },
      });

      const result = validateLifePoints(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("Player LP is negative"))).toBe(true);
    });

    it("should fail if opponent LP is negative", () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: -500 },
      });

      const result = validateLifePoints(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("Opponent LP is negative"))).toBe(true);
    });

    it("should fail if LP exceeds maximum", () => {
      const state = createMockGameState({
        lp: { player: 100000, opponent: 8000 },
      });

      const result = validateLifePoints(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("exceeds maximum"))).toBe(true);
    });

    it("should allow LP of 0 (game over)", () => {
      const state = createMockGameState({
        lp: { player: 0, opponent: 8000 },
      });

      const result = validateLifePoints(state);

      expect(result.isValid).toBe(true);
    });
  });

  describe("validatePhase", () => {
    it("should pass for valid phases", () => {
      const validPhases = ["Draw", "Standby", "Main1", "End"] as const;

      validPhases.forEach((phase) => {
        const state = createMockGameState({ phase });
        const result = validatePhase(state);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("should fail for invalid phase", () => {
      // @ts-expect-error - Testing invalid phase
      const state = createMockGameState({ phase: "InvalidPhase" });

      const result = validatePhase(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("Invalid phase"))).toBe(true);
    });
  });

  describe("validateTurn", () => {
    it("should pass for valid turn numbers", () => {
      const state = createMockGameState({ turn: 5 });

      const result = validateTurn(state);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail if turn is less than 1", () => {
      const state = createMockGameState({ turn: 0 });

      const result = validateTurn(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("at least 1"))).toBe(true);
    });

    it("should fail if turn exceeds maximum", () => {
      const state = createMockGameState({ turn: 1000 });

      const result = validateTurn(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("exceeds maximum"))).toBe(true);
    });

    it("should fail if turn is not an integer", () => {
      const state = createMockGameState({ turn: 5.5 });

      const result = validateTurn(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("integer"))).toBe(true);
    });
  });

  describe("validateResult", () => {
    it("should pass for ongoing game with no winner", () => {
      const state = createMockGameState({
        result: { isGameOver: false },
      });

      const result = validateResult(state);

      expect(result.isValid).toBe(true);
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

      expect(result.isValid).toBe(true);
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

      expect(result.isValid).toBe(false);
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

      expect(result.isValid).toBe(false);
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

      expect(result.isValid).toBe(false);
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

      expect(result.isValid).toBe(false);
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

      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes("Invalid reason"))).toBe(true);
    });
  });

  describe("isValidGameState", () => {
    it("should return true for valid state", () => {
      const state = createMockGameState();

      expect(isValidGameState(state)).toBe(true);
    });

    it("should return false for invalid state", () => {
      const state = createMockGameState({
        turn: -1, // Invalid
      });

      expect(isValidGameState(state)).toBe(false);
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

      expect(() => assertValidGameState(state)).toThrow(/Turn must be at least 1/);
      expect(() => assertValidGameState(state)).toThrow(/Player LP is negative/);
    });
  });
});
