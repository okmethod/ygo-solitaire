import { describe, it, expect } from "vitest";
import type { CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import { createFilledMainDeck, createHand, createFilledMonsterZone } from "../../../__testUtils__";
import { createMonsterInstance, createSpellInstance } from "../../../__testUtils__";

describe("CardSpace", () => {
  describe("moveCardInstance", () => {
    // 代表例テスト: mainMonsterZone から graveyard への移動
    it("should move card from mainMonsterZone to graveyard", () => {
      const space: CardSpace = {
        mainDeck: [],
        extraDeck: [],
        hand: [],
        ...createFilledMonsterZone(1),
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const card = space.mainMonsterZone[0];

      const result = GameState.Space.moveCard(space, card, "graveyard");

      expect(result.mainMonsterZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(card.instanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    // 代表例テスト: hand から graveyard への移動
    it("should move card from hand to graveyard", () => {
      const space: CardSpace = {
        mainDeck: [],
        extraDeck: [],
        ...createHand(["12345678"]),
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const card = space.hand[0];

      const result = GameState.Space.moveCard(space, card, "graveyard");

      expect(result.hand.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(card.instanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    // 他ゾーンの保持確認: 変更対象以外のゾーンが保持されることを確認
    it("should preserve other zones when moving card", () => {
      const monsterCard = createMonsterInstance("monster-0", { cardId: 1003, location: "mainMonsterZone" });
      const spellCard = createSpellInstance("spell-0", "normal", { cardId: 1004, location: "spellTrapZone" });
      const space: CardSpace = {
        ...createFilledMainDeck(1, 12345678),
        extraDeck: [],
        hand: [createSpellInstance("hand-0", "normal", { cardId: 1002, location: "hand" })],
        mainMonsterZone: [monsterCard],
        spellTrapZone: [spellCard],
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const card = space.spellTrapZone[0];

      const result = GameState.Space.moveCard(space, card, "graveyard");

      // 変更対象以外のゾーンは保持される
      expect(result.mainDeck.length).toBe(1);
      expect(result.hand.length).toBe(1);
      expect(result.mainMonsterZone.length).toBe(1);
      // 変更対象のゾーンは更新される
      expect(result.spellTrapZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(card.instanceId);
    });
  });
});
