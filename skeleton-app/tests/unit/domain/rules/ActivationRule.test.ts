/**
 * ActivationRule Tests
 *
 * カード発動ルールのテスト。
 * placeCardForActivationの動作を検証する。
 *
 * @module tests/unit/domain/rules/ActivationRule
 */

import { describe, it, expect } from "vitest";
import { placeCardForActivation } from "$lib/domain/rules/ActivationRule";
import { createMockGameState, createTestSpellCard, createSetCard, createSpellOnField } from "../../../__testUtils__";

describe("ActivationRule", () => {
  describe("placeCardForActivation", () => {
    describe("hand to field placement", () => {
      it("should place normal spell from hand to spellTrapZone", () => {
        // Arrange
        const spell = createTestSpellCard("spell-0", "normal", { location: "hand" });
        const state = createMockGameState({
          space: {
            hand: [spell],
          },
        });

        // Act
        const result = placeCardForActivation(state.space, spell);

        // Assert
        expect(result.hand).toHaveLength(0);
        expect(result.spellTrapZone).toHaveLength(1);
        expect(result.spellTrapZone[0].instanceId).toBe("spell-0");
        expect(result.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
      });

      it("should place quick-play spell from hand to spellTrapZone", () => {
        // Arrange
        const spell = createTestSpellCard("spell-0", "quick-play", { location: "hand" });
        const state = createMockGameState({
          space: {
            hand: [spell],
          },
        });

        // Act
        const result = placeCardForActivation(state.space, spell);

        // Assert
        expect(result.hand).toHaveLength(0);
        expect(result.spellTrapZone).toHaveLength(1);
        expect(result.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
      });

      it("should place continuous spell from hand to spellTrapZone", () => {
        // Arrange
        const spell = createTestSpellCard("spell-0", "continuous", { location: "hand" });
        const state = createMockGameState({
          space: {
            hand: [spell],
          },
        });

        // Act
        const result = placeCardForActivation(state.space, spell);

        // Assert
        expect(result.hand).toHaveLength(0);
        expect(result.spellTrapZone).toHaveLength(1);
      });

      it("should place field spell from hand to fieldZone", () => {
        // Arrange
        const spell = createTestSpellCard("spell-0", "field", { location: "hand" });
        const state = createMockGameState({
          space: {
            hand: [spell],
          },
        });

        // Act
        const result = placeCardForActivation(state.space, spell);

        // Assert
        expect(result.hand).toHaveLength(0);
        expect(result.fieldZone).toHaveLength(1);
        expect(result.fieldZone[0].instanceId).toBe("spell-0");
        expect(result.fieldZone[0].stateOnField?.position).toBe("faceUp");
      });

      it("should send existing field spell to graveyard when placing new field spell", () => {
        // Arrange
        const existingFieldSpell = createSpellOnField(1006, "existing-field-0");
        const newFieldSpell = createTestSpellCard("new-field-0", "field", { location: "hand" });
        const state = createMockGameState({
          space: {
            hand: [newFieldSpell],
            fieldZone: [existingFieldSpell],
          },
        });

        // Act
        const result = placeCardForActivation(state.space, newFieldSpell);

        // Assert
        expect(result.hand).toHaveLength(0);
        expect(result.fieldZone).toHaveLength(1);
        expect(result.fieldZone[0].instanceId).toBe("new-field-0");
        expect(result.graveyard).toHaveLength(1);
        expect(result.graveyard[0].instanceId).toBe("existing-field-0");
      });
    });

    describe("set to face-up activation", () => {
      it("should flip set spell to face-up in spellTrapZone", () => {
        // Arrange
        const setSpell = createSetCard("set-spell-0", 1001, "spellTrapZone", { placedThisTurn: false });
        const state = createMockGameState({
          space: {
            spellTrapZone: [setSpell],
          },
        });

        // Act
        const result = placeCardForActivation(state.space, setSpell);

        // Assert
        expect(result.spellTrapZone).toHaveLength(1);
        expect(result.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
      });

      it("should flip set field spell to face-up in fieldZone", () => {
        // Arrange
        const setFieldSpell = createSetCard("set-field-0", 1006, "fieldZone", { placedThisTurn: false });
        const state = createMockGameState({
          space: {
            fieldZone: [setFieldSpell],
          },
        });

        // Act
        const result = placeCardForActivation(state.space, setFieldSpell);

        // Assert
        expect(result.fieldZone).toHaveLength(1);
        expect(result.fieldZone[0].stateOnField?.position).toBe("faceUp");
      });
    });

    describe("error cases", () => {
      it("should throw error for non-spell/trap card activation from hand", () => {
        // Arrange
        const monster = {
          instanceId: "monster-0",
          id: 12345678,
          jaName: "Test Monster",
          type: "monster" as const,
          frameType: "normal" as const,
          edition: "latest" as const,
          location: "hand" as const,
        };
        const state = createMockGameState({
          space: {
            hand: [monster],
          },
        });

        // Act & Assert
        expect(() => placeCardForActivation(state.space, monster)).toThrow("Invalid card type for activation");
      });
    });
  });
});
