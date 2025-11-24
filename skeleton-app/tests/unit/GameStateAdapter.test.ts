/**
 * Unit tests for GameStateAdapter
 */

import { describe, it, expect } from "vitest";
import { GameStateAdapter } from "$lib/presentation/adapters/GameStateAdapter";
import { DuelState } from "$lib/classes/DuelState";
import type { Card } from "$lib/types/card";

describe("GameStateAdapter", () => {
  const adapter = new GameStateAdapter();

  describe("fromDuelState", () => {
    it("should convert empty DuelState to GameState", () => {
      const duelState = new DuelState({
        name: "Test Deck",
        mainDeck: [],
        hands: [],
      });

      const gameState = adapter.fromDuelState(duelState);

      expect(gameState.zones.deck.length).toBe(0);
      expect(gameState.zones.hand.length).toBe(0);
      expect(gameState.lp.player).toBe(8000);
      expect(gameState.lp.opponent).toBe(8000);
      expect(gameState.phase).toBe("Main1"); // Default: "メインフェイズ1"
      expect(gameState.turn).toBe(1);
      expect(gameState.result.isGameOver).toBe(false);
    });

    it("should convert DuelState with cards to GameState", () => {
      const mockCards: Card[] = [
        {
          id: 12345678, // number
          name: "Test Card 1",
          type: "spell", // CardType
          description: "Test description",
          instanceId: "card-1",
        },
        {
          id: 87654321, // number
          name: "Test Card 2",
          type: "monster", // CardType
          description: "Test monster",
          monster: {
            attack: 1500,
            defense: 1000,
            level: 4,
            attribute: "EARTH",
            race: "Warrior",
          },
          instanceId: "card-2",
        },
      ];

      const duelState = new DuelState({
        name: "Test Deck",
        mainDeck: [mockCards[0]],
        hands: [mockCards[1]],
      });

      const gameState = adapter.fromDuelState(duelState);

      expect(gameState.zones.deck.length).toBe(1);
      expect(gameState.zones.hand.length).toBe(1);
      expect(gameState.zones.deck[0].cardId).toBe("12345678");
      expect(gameState.zones.hand[0].cardId).toBe("87654321");
      expect(gameState.zones.deck[0].location).toBe("deck");
      expect(gameState.zones.hand[0].location).toBe("hand");
    });

    it("should map phase names correctly", () => {
      const testCases: Array<[string, "Draw" | "Standby" | "Main1" | "End"]> = [
        ["ドローフェイズ", "Draw"],
        ["スタンバイフェイズ", "Standby"],
        ["メインフェイズ1", "Main1"],
        ["メインフェイズ", "Main1"],
        ["エンドフェイズ", "End"],
        ["Unknown Phase", "Draw"], // Default to Draw
      ];

      testCases.forEach(([japanesePhase, expectedPhase]) => {
        const duelState = new DuelState();
        // Manually set phase since DuelState constructor ignores it
        duelState.currentPhase = japanesePhase;
        const gameState = adapter.fromDuelState(duelState);
        expect(gameState.phase).toBe(expectedPhase);
      });
    });

    it("should convert game result correctly - win", () => {
      const duelState = new DuelState();
      // Manually set game result since DuelState constructor ignores it
      duelState.gameResult = "win";

      const gameState = adapter.fromDuelState(duelState);

      expect(gameState.result.isGameOver).toBe(true);
      expect(gameState.result.winner).toBe("player");
    });

    it("should convert game result correctly - lose", () => {
      const duelState = new DuelState();
      // Manually set game result and LP since DuelState constructor ignores them
      duelState.gameResult = "lose";
      duelState.playerLifePoints = 0;

      const gameState = adapter.fromDuelState(duelState);

      expect(gameState.result.isGameOver).toBe(true);
      expect(gameState.result.winner).toBe("opponent");
      expect(gameState.result.reason).toBe("lp0");
    });

    it("should convert game result correctly - ongoing", () => {
      const duelState = new DuelState();

      const gameState = adapter.fromDuelState(duelState);

      expect(gameState.result.isGameOver).toBe(false);
      expect(gameState.result.winner).toBeUndefined();
    });

    it("should handle field cards", () => {
      const mockMonster: Card = {
        id: 11111111, // number
        name: "Test Monster",
        type: "monster", // CardType
        description: "Test",
        monster: {
          attack: 2000,
          defense: 1500,
          level: 5,
          attribute: "DARK",
          race: "Warrior",
        },
        instanceId: "monster-1",
      };

      const mockSpell: Card = {
        id: 22222222, // number
        name: "Test Spell",
        type: "spell", // CardType
        description: "Test",
        instanceId: "spell-1",
      };

      const duelState = new DuelState({
        field: {
          monsterZones: [mockMonster, null, null, null, null],
          spellTrapZones: [mockSpell, null, null, null, null],
          fieldSpell: null,
        },
      });

      const gameState = adapter.fromDuelState(duelState);

      expect(gameState.zones.field.length).toBe(2); // 1 monster + 1 spell
      expect(gameState.zones.field[0].cardId).toBe("11111111");
      expect(gameState.zones.field[1].cardId).toBe("22222222");
    });

    it("should handle graveyard and banished cards", () => {
      const mockCard: Card = {
        id: 33333333, // number
        name: "Test Card",
        type: "spell", // CardType
        description: "Test",
        instanceId: "grave-1",
      };

      const duelState = new DuelState({
        graveyard: [mockCard],
        banished: [mockCard],
      });

      const gameState = adapter.fromDuelState(duelState);

      expect(gameState.zones.graveyard.length).toBe(1);
      expect(gameState.zones.banished.length).toBe(1);
      expect(gameState.zones.graveyard[0].location).toBe("graveyard");
      expect(gameState.zones.banished[0].location).toBe("banished");
    });
  });

  describe("toDuelStateDisplay", () => {
    it("should convert GameState to display object", () => {
      const gameState = {
        zones: {
          deck: [],
          hand: [],
          field: [],
          graveyard: [],
          banished: [],
        },
        lp: {
          player: 7000,
          opponent: 5000,
        },
        phase: "Main1" as const,
        turn: 3,
        chainStack: [],
        result: {
          isGameOver: false,
        },
      };

      const display = adapter.toDuelStateDisplay(gameState);

      expect(display.playerLifePoints).toBe(7000);
      expect(display.opponentLifePoints).toBe(5000);
      expect(display.currentTurn).toBe(3);
      expect(display.currentPhase).toBe("メインフェイズ1");
      expect(display.gameResult).toBe("ongoing");
    });

    it("should map phase names to Japanese", () => {
      const testCases: Array<["Draw" | "Standby" | "Main1" | "End", string]> = [
        ["Draw", "ドローフェイズ"],
        ["Standby", "スタンバイフェイズ"],
        ["Main1", "メインフェイズ1"],
        ["End", "エンドフェイズ"],
      ];

      testCases.forEach(([phase, expectedJapanese]) => {
        const gameState = {
          zones: { deck: [], hand: [], field: [], graveyard: [], banished: [] },
          lp: { player: 8000, opponent: 8000 },
          phase,
          turn: 1,
          chainStack: [],
          result: { isGameOver: false },
        };

        const display = adapter.toDuelStateDisplay(gameState);
        expect(display.currentPhase).toBe(expectedJapanese);
      });
    });
  });
});
