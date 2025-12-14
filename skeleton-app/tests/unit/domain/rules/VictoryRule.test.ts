/**
 * Unit tests for VictoryRule
 */

import { describe, it, expect } from "vitest";
import {
  checkVictoryConditions,
  hasExodiaVictory,
  hasLPDefeat,
  hasLPVictory,
  hasDeckOutDefeat,
  getMissingExodiaPieces,
  countExodiaPiecesInHand,
} from "$lib/domain/rules/VictoryRule";
import {
  createMockGameState,
  createExodiaVictoryState,
  createDeckOutState,
  createLPZeroState,
  createStateWithHand,
} from "../../../__testUtils__/gameStateFactory";
import { EXODIA_PIECE_IDS } from "$lib/domain/models/constants";

describe("VictoryRule", () => {
  describe("checkVictoryConditions", () => {
    it("should detect Exodia victory when all 5 pieces are in hand", () => {
      const state = createExodiaVictoryState();
      const result = checkVictoryConditions(state);

      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe("player");
      expect(result.reason).toBe("exodia");
      expect(result.message).toContain("エクゾディア");
    });

    it("should detect LP0 defeat when player's LP reaches 0", () => {
      const state = createLPZeroState();
      const result = checkVictoryConditions(state);

      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe("opponent");
      expect(result.reason).toBe("lp0");
      expect(result.message).toContain("ライフポイント");
    });

    it("should detect LP0 victory when opponent's LP reaches 0", () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: 0 },
      });
      const result = checkVictoryConditions(state);

      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe("player");
      expect(result.reason).toBe("lp0");
    });

    it("should detect deck out defeat when deck is empty in Draw phase", () => {
      const state = createDeckOutState();
      const result = checkVictoryConditions(state);

      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe("opponent");
      expect(result.reason).toBe("deckout");
      expect(result.message).toContain("デッキアウト");
    });

    it("should not detect deck out if deck is empty but not in Draw phase", () => {
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
        phase: "Main1",
      });
      const result = checkVictoryConditions(state);

      expect(result.isGameOver).toBe(false);
    });

    it("should return game not over when no victory conditions are met", () => {
      const state = createMockGameState();
      const result = checkVictoryConditions(state);

      expect(result.isGameOver).toBe(false);
      expect(result.winner).toBeUndefined();
      expect(result.reason).toBeUndefined();
    });
  });

  describe("hasExodiaVictory", () => {
    it("should return true when all 5 Exodia pieces are in hand", () => {
      const state = createStateWithHand([...EXODIA_PIECE_IDS]);
      expect(hasExodiaVictory(state)).toBe(true);
    });

    it("should return false when only 4 Exodia pieces are in hand", () => {
      const state = createStateWithHand([...EXODIA_PIECE_IDS.slice(0, 4)]);
      expect(hasExodiaVictory(state)).toBe(false);
    });

    it("should return false when no Exodia pieces are in hand", () => {
      const state = createStateWithHand(["12345678"]);
      expect(hasExodiaVictory(state)).toBe(false);
    });
  });

  describe("hasLPDefeat", () => {
    it("should return true when player LP is 0", () => {
      const state = createMockGameState({ lp: { player: 0, opponent: 8000 } });
      expect(hasLPDefeat(state)).toBe(true);
    });

    it("should return true when player LP is negative", () => {
      const state = createMockGameState({ lp: { player: -100, opponent: 8000 } });
      expect(hasLPDefeat(state)).toBe(true);
    });

    it("should return false when player LP is positive", () => {
      const state = createMockGameState({ lp: { player: 1000, opponent: 8000 } });
      expect(hasLPDefeat(state)).toBe(false);
    });
  });

  describe("hasLPVictory", () => {
    it("should return true when opponent LP is 0", () => {
      const state = createMockGameState({ lp: { player: 8000, opponent: 0 } });
      expect(hasLPVictory(state)).toBe(true);
    });

    it("should return false when opponent LP is positive", () => {
      const state = createMockGameState({ lp: { player: 8000, opponent: 1000 } });
      expect(hasLPVictory(state)).toBe(false);
    });
  });

  describe("hasDeckOutDefeat", () => {
    it("should return true when deck is empty in Draw phase", () => {
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
        phase: "Draw",
      });
      expect(hasDeckOutDefeat(state)).toBe(true);
    });

    it("should return false when deck has cards in Draw phase", () => {
      const state = createStateWithHand([], "Draw"); // Has 30 cards in deck
      expect(hasDeckOutDefeat(state)).toBe(false);
    });

    it("should return false when deck is empty but not in Draw phase", () => {
      const state = createMockGameState({
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
        phase: "Main1",
      });
      expect(hasDeckOutDefeat(state)).toBe(false);
    });
  });

  describe("getMissingExodiaPieces", () => {
    it("should return all 5 pieces when none are in hand", () => {
      const state = createStateWithHand([]);
      const missing = getMissingExodiaPieces(state);
      expect(missing).toHaveLength(5);
      expect(missing).toEqual(expect.arrayContaining([...EXODIA_PIECE_IDS]));
    });

    it("should return 1 piece when 4 are in hand", () => {
      const state = createStateWithHand([...EXODIA_PIECE_IDS.slice(0, 4)]);
      const missing = getMissingExodiaPieces(state);
      expect(missing).toHaveLength(1);
      expect(missing[0]).toBe(EXODIA_PIECE_IDS[4]);
    });

    it("should return empty array when all 5 pieces are in hand", () => {
      const state = createStateWithHand([...EXODIA_PIECE_IDS]);
      const missing = getMissingExodiaPieces(state);
      expect(missing).toHaveLength(0);
    });
  });

  describe("countExodiaPiecesInHand", () => {
    it("should return 0 when no Exodia pieces in hand", () => {
      const state = createStateWithHand(["12345678"]);
      expect(countExodiaPiecesInHand(state)).toBe(0);
    });

    it("should return 3 when 3 Exodia pieces in hand", () => {
      const state = createStateWithHand([...EXODIA_PIECE_IDS.slice(0, 3)]);
      expect(countExodiaPiecesInHand(state)).toBe(3);
    });

    it("should return 5 when all Exodia pieces in hand", () => {
      const state = createStateWithHand([...EXODIA_PIECE_IDS]);
      expect(countExodiaPiecesInHand(state)).toBe(5);
    });
  });
});
