import { describe, it, expect } from "vitest";
import { sendToGraveyard, type Zones } from "$lib/domain/models/Zone";
import { createCardInstances } from "../../../__testUtils__/gameStateFactory";

describe("Zone", () => {
  describe("sendToGraveyard", () => {
    // 代表例テスト: mainMonsterZone から graveyard への移動
    it("should send card from mainMonsterZone to graveyard", () => {
      const zones: Zones = {
        deck: [],
        hand: [],
        mainMonsterZone: createCardInstances(["12345678"], "mainMonsterZone"),
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const cardInstanceId = zones.mainMonsterZone[0].instanceId;

      const result = sendToGraveyard(zones, cardInstanceId);

      expect(result.mainMonsterZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(cardInstanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    // 代表例テスト: hand から graveyard への移動
    it("should send card from hand to graveyard", () => {
      const zones: Zones = {
        deck: [],
        hand: createCardInstances(["12345678"], "hand"),
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const cardInstanceId = zones.hand[0].instanceId;

      const result = sendToGraveyard(zones, cardInstanceId);

      expect(result.hand.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(cardInstanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    // エラーハンドリング: カードが見つからない場合
    it("should throw error if card not found in any zone", () => {
      const zones: Zones = {
        deck: [],
        hand: [],
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      };

      expect(() => sendToGraveyard(zones, "non-existent-id")).toThrow("Card with instanceId non-existent-id not found");
    });

    // 他ゾーンの保持確認: 変更対象以外のゾーンが保持されることを確認
    it("should preserve other zones when sending card to graveyard", () => {
      const zones: Zones = {
        deck: createCardInstances(["1001"], "deck"),
        hand: createCardInstances(["1002"], "hand"),
        mainMonsterZone: createCardInstances(["1003"], "mainMonsterZone"),
        spellTrapZone: createCardInstances(["1004"], "spellTrapZone"),
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const cardInstanceId = zones.spellTrapZone[0].instanceId;

      const result = sendToGraveyard(zones, cardInstanceId);

      // 変更対象以外のゾーンは保持される
      expect(result.deck.length).toBe(1);
      expect(result.hand.length).toBe(1);
      expect(result.mainMonsterZone.length).toBe(1);
      // 変更対象のゾーンは更新される
      expect(result.spellTrapZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(cardInstanceId);
    });
  });
});
