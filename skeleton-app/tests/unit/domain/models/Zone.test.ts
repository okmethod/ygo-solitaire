import { describe, it, expect } from "vitest";
import { sendToGraveyard, type Zones } from "$lib/domain/models/Zone";
import { createCardInstances } from "../../../__testUtils__/gameStateFactory";

describe("Zone", () => {
  describe("sendToGraveyard", () => {
    it("should send card from mainMonsterZone to graveyard", () => {
      // Arrange
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

      // Act
      const result = sendToGraveyard(zones, cardInstanceId);

      // Assert
      expect(result.mainMonsterZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(cardInstanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    it("should send card from spellTrapZone to graveyard", () => {
      // Arrange
      const zones: Zones = {
        deck: [],
        hand: [],
        mainMonsterZone: [],
        spellTrapZone: createCardInstances(["12345678"], "spellTrapZone"),
        fieldZone: [],
        graveyard: [],
        banished: [],
      };
      const cardInstanceId = zones.spellTrapZone[0].instanceId;

      // Act
      const result = sendToGraveyard(zones, cardInstanceId);

      // Assert
      expect(result.spellTrapZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(cardInstanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    it("should send card from fieldZone to graveyard", () => {
      // Arrange
      const zones: Zones = {
        deck: [],
        hand: [],
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: createCardInstances(["12345678"], "fieldZone"),
        graveyard: [],
        banished: [],
      };
      const cardInstanceId = zones.fieldZone[0].instanceId;

      // Act
      const result = sendToGraveyard(zones, cardInstanceId);

      // Assert
      expect(result.fieldZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(cardInstanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    it("should send card from hand to graveyard", () => {
      // Arrange
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

      // Act
      const result = sendToGraveyard(zones, cardInstanceId);

      // Assert
      expect(result.hand.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
      expect(result.graveyard[0].instanceId).toBe(cardInstanceId);
      expect(result.graveyard[0].location).toBe("graveyard");
    });

    it("should throw error if card not found in any zone", () => {
      // Arrange
      const zones: Zones = {
        deck: [],
        hand: [],
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      };

      // Act & Assert
      expect(() => sendToGraveyard(zones, "non-existent-id")).toThrow("Card with instanceId non-existent-id not found");
    });

    it("should preserve other zones when sending card to graveyard", () => {
      // Arrange
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

      // Act
      const result = sendToGraveyard(zones, cardInstanceId);

      // Assert
      expect(result.deck.length).toBe(1);
      expect(result.hand.length).toBe(1);
      expect(result.mainMonsterZone.length).toBe(1);
      expect(result.spellTrapZone.length).toBe(0);
      expect(result.fieldZone.length).toBe(0);
      expect(result.graveyard.length).toBe(1);
    });
  });
});
