import { describe, it, expect } from "vitest";
import type { CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import {
  createSpellInstance,
  createMonsterOnField,
  createSpellOnField,
  createFilledMainDeck,
  createHand,
  createFilledMonsterZone,
  DUMMY_CARD_IDS,
} from "../../../__testUtils__";

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
        ...createHand([DUMMY_CARD_IDS.NORMAL_MONSTER]),
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
      const monsterCard = createMonsterOnField("monster-0");
      const spellCard = createSpellOnField("spell-0");
      const space: CardSpace = {
        ...createFilledMainDeck(1, DUMMY_CARD_IDS.NORMAL_MONSTER),
        extraDeck: [],
        hand: [createSpellInstance("hand-0", { spellType: "equip" })],
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
