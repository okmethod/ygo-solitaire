/**
 * カード発動ルールのテスト
 */

import { describe, it, expect } from "vitest";
import { placeCardForActivation } from "$lib/domain/rules/ActivationRule";
import {
  createSpaceState,
  createMonsterInstance,
  createSpellInstance,
  createSpellOnField,
} from "../../../__testUtils__";

describe("ActivationRule", () => {
  describe("placeCardForActivation", () => {
    describe("手札からフィールドへの配置", () => {
      it("通常魔法を手札から魔法・罠ゾーンに配置できる", () => {
        // Arrange
        const spell = createSpellInstance("spell-0", { spellType: "normal", location: "hand" });
        const state = createSpaceState({
          hand: [spell],
        });

        // Act
        const result = placeCardForActivation(state.space, spell);

        // Assert
        expect(result.hand).toHaveLength(0);
        expect(result.spellTrapZone).toHaveLength(1);
        expect(result.spellTrapZone[0].instanceId).toBe("spell-0");
        expect(result.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
      });

      it("速攻魔法を手札から魔法・罠ゾーンに配置できる", () => {
        // Arrange
        const spell = createSpellInstance("spell-0", { spellType: "quick-play", location: "hand" });
        const state = createSpaceState({
          hand: [spell],
        });

        // Act
        const result = placeCardForActivation(state.space, spell);

        // Assert
        expect(result.hand).toHaveLength(0);
        expect(result.spellTrapZone).toHaveLength(1);
        expect(result.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
      });

      it("永続魔法を手札から魔法・罠ゾーンに配置できる", () => {
        // Arrange
        const spell = createSpellInstance("spell-0", { spellType: "continuous", location: "hand" });
        const state = createSpaceState({
          hand: [spell],
        });

        // Act
        const result = placeCardForActivation(state.space, spell);

        // Assert
        expect(result.hand).toHaveLength(0);
        expect(result.spellTrapZone).toHaveLength(1);
      });

      it("フィールド魔法を手札からフィールドゾーンに配置できる", () => {
        // Arrange
        const spell = createSpellInstance("spell-0", { spellType: "field", location: "hand" });
        const state = createSpaceState({
          hand: [spell],
        });

        // Act
        const result = placeCardForActivation(state.space, spell);

        // Assert
        expect(result.hand).toHaveLength(0);
        expect(result.fieldZone).toHaveLength(1);
        expect(result.fieldZone[0].instanceId).toBe("spell-0");
        expect(result.fieldZone[0].stateOnField?.position).toBe("faceUp");
      });

      it("新しいフィールド魔法を置くと既存のフィールド魔法が墓地に送られる", () => {
        // Arrange
        const existingFieldSpell = createSpellOnField("existing-field-0", { spellType: "field" });
        const newFieldSpell = createSpellInstance("new-field-0", { spellType: "field", location: "hand" });
        const state = createSpaceState({
          hand: [newFieldSpell],
          fieldZone: [existingFieldSpell],
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

    describe("セット状態からの表向き発動", () => {
      it("魔法・罠ゾーンのセット魔法を表向きに反転できる", () => {
        // Arrange
        const setSpell = createSpellOnField("set-spell-0", {
          position: "faceDown",
          placedThisTurn: false,
        });
        const state = createSpaceState({
          spellTrapZone: [setSpell],
        });

        // Act
        const result = placeCardForActivation(state.space, setSpell);

        // Assert
        expect(result.spellTrapZone).toHaveLength(1);
        expect(result.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
      });

      it("フィールドゾーンのセットフィールド魔法を表向きに反転できる", () => {
        // Arrange
        const setFieldSpell = createSpellOnField("set-field-0", {
          spellType: "field",
          position: "faceDown",
          placedThisTurn: false,
        });
        const state = createSpaceState({
          fieldZone: [setFieldSpell],
        });

        // Act
        const result = placeCardForActivation(state.space, setFieldSpell);

        // Assert
        expect(result.fieldZone).toHaveLength(1);
        expect(result.fieldZone[0].stateOnField?.position).toBe("faceUp");
      });
    });

    describe("エラーケース", () => {
      it("手札のモンスターカードを発動しようとするとエラーが発生する", () => {
        // Arrange
        const monster = createMonsterInstance("monster-0");
        const state = createSpaceState({
          hand: [monster],
        });

        // Act & Assert
        expect(() => placeCardForActivation(state.space, monster)).toThrow("Invalid card type for activation");
      });
    });
  });
});
