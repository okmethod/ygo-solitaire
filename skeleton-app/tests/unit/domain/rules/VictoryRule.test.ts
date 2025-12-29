/**
 * Unit tests for VictoryRule
 */

import { describe, it, expect } from "vitest";
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";
import {
  createMockGameState,
  createExodiaVictoryState,
  createDeckOutState,
  createLPZeroState,
} from "../../../__testUtils__/gameStateFactory";

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
});
