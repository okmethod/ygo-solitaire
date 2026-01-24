import { describe, it, expect } from "vitest";
import { moveCard, type Zones } from "$lib/domain/models/Zone";
import { createCardInstances } from "../../../__testUtils__/gameStateFactory";

describe("Zone", () => {
  describe("moveCard", () => {
    // 代表例テスト: mainMonsterZone から graveyard への移動
    it("should move card from mainMonsterZone to graveyard", () => {
      const zones: Zones = {
        deck: [],
        hand: [],
        mainMonsterZone: createCardInstances(["12345678"], "mainMonsterZone"),
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const card = zones.mainMonsterZone[0];

      const result = moveCard(zones, card, "graveyard");

      expect(result.mainMonsterZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(card.instanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    // 代表例テスト: hand から graveyard への移動
    it("should move card from hand to graveyard", () => {
      const zones: Zones = {
        deck: [],
        hand: createCardInstances(["12345678"], "hand"),
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const card = zones.hand[0];

      const result = moveCard(zones, card, "graveyard");

      expect(result.hand.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(card.instanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    // 他ゾーンの保持確認: 変更対象以外のゾーンが保持されることを確認
    it("should preserve other zones when moving card", () => {
      const zones: Zones = {
        deck: createCardInstances(["1001"], "deck"),
        hand: createCardInstances(["1002"], "hand"),
        mainMonsterZone: createCardInstances(["1003"], "mainMonsterZone"),
        spellTrapZone: createCardInstances(["1004"], "spellTrapZone"),
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const card = zones.spellTrapZone[0];

      const result = moveCard(zones, card, "graveyard");

      // 変更対象以外のゾーンは保持される
      expect(result.deck.length).toBe(1);
      expect(result.hand.length).toBe(1);
      expect(result.mainMonsterZone.length).toBe(1);
      // 変更対象のゾーンは更新される
      expect(result.spellTrapZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(card.instanceId);
    });
  });
});
