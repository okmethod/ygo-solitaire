/**
 * CardInstance.ts のテスト
 *
 * カードインスタンスのロケーションチェック、状態チェック、状態変更関数を検証する。
 */

import { describe, it, expect } from "vitest";
import type { CardInstance } from "$lib/domain/models/Card";
import {
  inHand,
  onField,
  inGraveyard,
  isBanished,
  isFaceUp,
  isFaceDown,
  isAttackPosition,
  isDefensePosition,
  movedInstance,
  placedOnFieldInstance,
  leavedFromFieldInstance,
  updateCardStateInPlace,
} from "$lib/domain/models/Card/CardInstance";
import {
  createMonsterInstance,
  createMonsterOnField,
  createSpellOnField,
  DUMMY_CARD_IDS,
} from "../../../__testUtils__";

const monsterInHand = createMonsterInstance("card-in-hand", { location: "hand" });
const monsterBanished = createMonsterInstance("card-banished", { location: "banished" });
const monsterOnField = createMonsterOnField("monster-card-on-field");
const monsterOnFieldFaceDown = createMonsterOnField("monster-card-on-field-face-down", {
  position: "faceDown",
  battlePosition: "defense",
});

const normalSpellOnField = createSpellOnField("normal-spell-card-on-field");
const fieldSpellOnField = createSpellOnField("field-spell-card-on-field", { spellType: "field" });

describe("CardInstance", () => {
  // ===========================
  // ロケーションチェック
  // ===========================

  describe("inHand", () => {
    it("手札にあるカードはtrueを返す", () => {
      const card = createMonsterInstance("test-1", { location: "hand" });
      expect(inHand(card)).toBe(true);
    });

    it("手札以外のカードはfalseを返す", () => {
      expect(inHand(monsterOnField)).toBe(false);
      expect(inHand(normalSpellOnField)).toBe(false);
      expect(inHand(fieldSpellOnField)).toBe(false);

      const deckCard = createMonsterInstance("test-2");
      (deckCard as { location: string }).location = "mainDeck";
      expect(inHand(deckCard)).toBe(false);
    });
  });

  describe("onField", () => {
    it("メインモンスターゾーンのカードはtrueを返す", () => {
      expect(onField(monsterOnField)).toBe(true);
    });

    it("魔法・罠ゾーンのカードはtrueを返す", () => {
      expect(onField(normalSpellOnField)).toBe(true);
    });

    it("フィールドゾーンのカードはtrueを返す", () => {
      expect(onField(fieldSpellOnField)).toBe(true);
    });

    it("フィールド以外のカードはfalseを返す", () => {
      expect(onField(monsterInHand)).toBe(false);
      expect(onField(monsterBanished)).toBe(false);
    });
  });

  describe("inGraveyard", () => {
    it("墓地にあるカードはtrueを返す", () => {
      const card: CardInstance = {
        ...createMonsterInstance("test-1"),
        location: "graveyard",
      };
      expect(inGraveyard(card)).toBe(true);
    });

    it("墓地以外のカードはfalseを返す", () => {
      expect(inGraveyard(monsterInHand)).toBe(false);
      expect(inGraveyard(monsterOnField)).toBe(false);
      expect(inGraveyard(normalSpellOnField)).toBe(false);
      expect(inGraveyard(fieldSpellOnField)).toBe(false);
    });
  });

  describe("isBanished", () => {
    it("除外されたカードはtrueを返す", () => {
      expect(isBanished(monsterBanished)).toBe(true);
    });

    it("除外以外のカードはfalseを返す", () => {
      expect(isBanished(monsterInHand)).toBe(false);
      expect(isBanished(monsterOnField)).toBe(false);
      expect(isBanished(normalSpellOnField)).toBe(false);
      expect(isBanished(fieldSpellOnField)).toBe(false);
    });
  });

  // ===========================
  // 状態チェック
  // ===========================

  describe("isFaceUp", () => {
    it("表側表示のカードはtrueを返す", () => {
      expect(isFaceUp(monsterOnField)).toBe(true);
      expect(isFaceUp(normalSpellOnField)).toBe(true);
      expect(isFaceUp(fieldSpellOnField)).toBe(true);
    });

    it("裏側表示のカードはfalseを返す", () => {
      expect(isFaceUp(monsterOnFieldFaceDown)).toBe(false);
    });

    it("stateOnFieldがないカードはfalseを返す", () => {
      const card = createMonsterInstance("test-1", { location: "hand" });
      expect(isFaceUp(card)).toBe(false);
    });
  });

  describe("isFaceDown", () => {
    it("裏側表示のカードはtrueを返す", () => {
      expect(isFaceDown(monsterOnFieldFaceDown)).toBe(true);
    });

    it("表側表示のカードはfalseを返す", () => {
      expect(isFaceDown(monsterOnField)).toBe(false);
      expect(isFaceDown(normalSpellOnField)).toBe(false);
      expect(isFaceDown(fieldSpellOnField)).toBe(false);
    });

    it("stateOnFieldがないカードはfalseを返す", () => {
      expect(isFaceDown(monsterInHand)).toBe(false);
      expect(isFaceDown(monsterBanished)).toBe(false);
    });
  });

  describe("isAttackPosition", () => {
    it("攻撃表示のカードはtrueを返す", () => {
      expect(isAttackPosition(monsterOnField)).toBe(true);
    });

    it("守備表示のカードはfalseを返す", () => {
      expect(isAttackPosition(monsterOnFieldFaceDown)).toBe(false);
    });

    it("モンスターカード以外はfalseを返す", () => {
      expect(isAttackPosition(normalSpellOnField)).toBe(false);
      expect(isAttackPosition(fieldSpellOnField)).toBe(false);
    });

    it("stateOnFieldがないカードはfalseを返す", () => {
      expect(isAttackPosition(monsterInHand)).toBe(false);
      expect(isAttackPosition(monsterBanished)).toBe(false);
    });
  });

  describe("isDefensePosition", () => {
    it("守備表示のカードはtrueを返す", () => {
      expect(isDefensePosition(monsterOnFieldFaceDown)).toBe(true);
    });

    it("攻撃表示のカードはfalseを返す", () => {
      expect(isDefensePosition(monsterOnField)).toBe(false);
    });

    it("モンスターカード以外はfalseを返す", () => {
      expect(isDefensePosition(normalSpellOnField)).toBe(false);
      expect(isDefensePosition(fieldSpellOnField)).toBe(false);
    });

    it("stateOnFieldがないカードはfalseを返す", () => {
      expect(isDefensePosition(monsterInHand)).toBe(false);
      expect(isDefensePosition(monsterBanished)).toBe(false);
    });
  });

  // ===========================
  // 状態変更
  // ===========================

  describe("movedInstance", () => {
    it("カードを新しいロケーションに移動する", () => {
      const movedCard = movedInstance(monsterInHand, "graveyard");

      expect(movedCard.location).toBe("graveyard");
      expect(movedCard.instanceId).toBe(monsterInHand.instanceId);
      expect(movedCard.id).toBe(monsterInHand.id);
    });

    it("移動時にstateOnFieldがクリアされる", () => {
      const movedCard = movedInstance(monsterOnField, "graveyard");

      expect(movedCard.stateOnField).toBeUndefined();
    });

    it("元のカードは変更されない（イミュータブル）", () => {
      const originalLocation = monsterInHand.location;
      movedInstance(monsterInHand, "graveyard");

      expect(monsterInHand.location).toBe(originalLocation);
    });
  });

  describe("placedOnFieldInstance", () => {
    it("カードをフィールドに配置しstateOnFieldを初期化する", () => {
      const placedCard = placedOnFieldInstance(monsterInHand, "mainMonsterZone", 0, "faceUp", "attack");

      expect(placedCard.location).toBe("mainMonsterZone");
      expect(placedCard.stateOnField).toBeDefined();
      expect(placedCard.stateOnField?.slotIndex).toBe(0);
      expect(placedCard.stateOnField?.position).toBe("faceUp");
      expect(placedCard.stateOnField?.battlePosition).toBe("attack");
      expect(placedCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("守備表示で配置できる", () => {
      const placedCard = placedOnFieldInstance(monsterInHand, "mainMonsterZone", 0, "faceDown", "defense");

      expect(placedCard.stateOnField?.position).toBe("faceDown");
      expect(placedCard.stateOnField?.battlePosition).toBe("defense");
    });

    it("魔法・罠ゾーンに配置できる", () => {
      const placedCard = placedOnFieldInstance(monsterInHand, "spellTrapZone", 0, "faceDown");

      expect(placedCard.location).toBe("spellTrapZone");
      expect(placedCard.stateOnField?.position).toBe("faceDown");
    });

    it("フィールド以外のロケーションにはエラーをスローする", () => {
      expect(() => placedOnFieldInstance(monsterInHand, "graveyard", 0, "faceUp")).toThrow(
        "Invalid location for placing on field",
      );
      expect(() => placedOnFieldInstance(monsterInHand, "hand", 0, "faceUp")).toThrow(
        "Invalid location for placing on field",
      );
      expect(() => placedOnFieldInstance(monsterInHand, "mainDeck", 0, "faceUp")).toThrow(
        "Invalid location for placing on field",
      );
    });
  });

  describe("leavedFromFieldInstance", () => {
    it("カードをフィールドから取り除きstateOnFieldを削除する", () => {
      const leavedCard = leavedFromFieldInstance(monsterOnField, "graveyard");

      expect(leavedCard.location).toBe("graveyard");
      expect(leavedCard.stateOnField).toBeUndefined();
    });

    it("除外ゾーンに移動できる", () => {
      const leavedCard = leavedFromFieldInstance(monsterOnField, "banished");

      expect(leavedCard.location).toBe("banished");
    });

    it("フィールドへの移動はエラーをスローする", () => {
      const leavedCard = leavedFromFieldInstance(monsterOnField, "banished");

      expect(leavedCard.location).toBe("banished");
    });

    it("フィールドへの移動はエラーをスローする", () => {
      expect(() => leavedFromFieldInstance(monsterOnField, "mainMonsterZone")).toThrow(
        "Invalid location for removing from field",
      );
      expect(() => leavedFromFieldInstance(monsterOnField, "spellTrapZone")).toThrow(
        "Invalid location for removing from field",
      );
    });
  });

  describe("updateCardStateInPlace", () => {
    it("カードのフィールド状態を更新する", () => {
      const updatedCard = updateCardStateInPlace(monsterOnField, { battlePosition: "defense" });

      expect(updatedCard.stateOnField?.battlePosition).toBe("defense");
      expect(updatedCard.stateOnField?.position).toBe("faceUp"); // 変更なし
    });

    it("複数のプロパティを同時に更新できる", () => {
      const updatedCard = updateCardStateInPlace(monsterOnFieldFaceDown, {
        position: "faceUp",
        battlePosition: "attack",
        placedThisTurn: false,
      });

      expect(updatedCard.stateOnField?.position).toBe("faceUp");
      expect(updatedCard.stateOnField?.battlePosition).toBe("attack");
      expect(updatedCard.stateOnField?.placedThisTurn).toBe(false);
    });

    it("フィールド外のカードにはエラーをスローする", () => {
      expect(() => updateCardStateInPlace(monsterInHand, { position: "faceUp" })).toThrow(
        "Card must be on the field to update state",
      );
    });

    it("stateOnFieldがないカードにはエラーをスローする", () => {
      // フィールドロケーションだがstateOnFieldがない異常状態をシミュレート
      const abnormalCard: CardInstance = {
        instanceId: "test-1",
        id: DUMMY_CARD_IDS.NORMAL_MONSTER,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        edition: "latest",
        location: "mainMonsterZone",
        // stateOnField is undefined
      };

      expect(() => updateCardStateInPlace(abnormalCard, { position: "faceUp" })).toThrow(
        "Card has no stateOnField to update",
      );
    });

    it("元のカードは変更されない（イミュータブル）", () => {
      const originalPosition = monsterOnField.stateOnField?.battlePosition;
      updateCardStateInPlace(monsterOnField, { battlePosition: "defense" });

      expect(monsterOnField.stateOnField?.battlePosition).toBe(originalPosition);
    });
  });
});
