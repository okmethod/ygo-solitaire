/**
 * CardInstance.ts のテスト
 *
 * カードインスタンスのロケーションチェック、状態チェック、状態変更関数を検証する。
 */

import { describe, it, expect } from "vitest";
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
import type { CardInstance } from "$lib/domain/models/Card/CardInstance";
import { createTestMonsterCard, createFieldCardInstance, TEST_CARD_IDS } from "../../../__testUtils__/gameStateFactory";

describe("CardInstance", () => {
  // ===========================
  // ロケーションチェック
  // ===========================

  describe("inHand", () => {
    it("手札にあるカードはtrueを返す", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      expect(inHand(card)).toBe(true);
    });

    it("手札以外のカードはfalseを返す", () => {
      const fieldCard = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
      });
      expect(inHand(fieldCard)).toBe(false);

      const deckCard = createTestMonsterCard("test-2");
      (deckCard as { location: string }).location = "mainDeck";
      expect(inHand(deckCard)).toBe(false);
    });
  });

  describe("onField", () => {
    it("メインモンスターゾーンのカードはtrueを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
      });
      expect(onField(card)).toBe(true);
    });

    it("魔法・罠ゾーンのカードはtrueを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.SPELL_NORMAL,
        jaName: "Test Spell",
        type: "spell",
        frameType: "spell",
        location: "spellTrapZone",
      });
      expect(onField(card)).toBe(true);
    });

    it("フィールドゾーンのカードはtrueを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.SPELL_FIELD,
        jaName: "Test Field Spell",
        type: "spell",
        frameType: "spell",
        location: "fieldZone",
        spellType: "field",
      });
      expect(onField(card)).toBe(true);
    });

    it("フィールド以外のカードはfalseを返す", () => {
      const handCard = createTestMonsterCard("test-1", { location: "hand" });
      expect(onField(handCard)).toBe(false);
    });
  });

  describe("inGraveyard", () => {
    it("墓地にあるカードはtrueを返す", () => {
      const card: CardInstance = {
        ...createTestMonsterCard("test-1"),
        location: "graveyard",
      };
      expect(inGraveyard(card)).toBe(true);
    });

    it("墓地以外のカードはfalseを返す", () => {
      const handCard = createTestMonsterCard("test-1", { location: "hand" });
      expect(inGraveyard(handCard)).toBe(false);
    });
  });

  describe("isBanished", () => {
    it("除外されたカードはtrueを返す", () => {
      const card: CardInstance = {
        ...createTestMonsterCard("test-1"),
        location: "banished",
      };
      expect(isBanished(card)).toBe(true);
    });

    it("除外以外のカードはfalseを返す", () => {
      const handCard = createTestMonsterCard("test-1", { location: "hand" });
      expect(isBanished(handCard)).toBe(false);
    });
  });

  // ===========================
  // 状態チェック
  // ===========================

  describe("isFaceUp", () => {
    it("表側表示のカードはtrueを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
      });
      expect(isFaceUp(card)).toBe(true);
    });

    it("裏側表示のカードはfalseを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceDown",
      });
      expect(isFaceUp(card)).toBe(false);
    });

    it("stateOnFieldがないカードはfalseを返す", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      expect(isFaceUp(card)).toBe(false);
    });
  });

  describe("isFaceDown", () => {
    it("裏側表示のカードはtrueを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceDown",
      });
      expect(isFaceDown(card)).toBe(true);
    });

    it("表側表示のカードはfalseを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
      });
      expect(isFaceDown(card)).toBe(false);
    });

    it("stateOnFieldがないカードはfalseを返す", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      expect(isFaceDown(card)).toBe(false);
    });
  });

  describe("isAttackPosition", () => {
    it("攻撃表示のカードはtrueを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
        battlePosition: "attack",
      });
      expect(isAttackPosition(card)).toBe(true);
    });

    it("守備表示のカードはfalseを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
        battlePosition: "defense",
      });
      expect(isAttackPosition(card)).toBe(false);
    });

    it("stateOnFieldがないカードはfalseを返す", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      expect(isAttackPosition(card)).toBe(false);
    });
  });

  describe("isDefensePosition", () => {
    it("守備表示のカードはtrueを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
        battlePosition: "defense",
      });
      expect(isDefensePosition(card)).toBe(true);
    });

    it("攻撃表示のカードはfalseを返す", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
        battlePosition: "attack",
      });
      expect(isDefensePosition(card)).toBe(false);
    });

    it("stateOnFieldがないカードはfalseを返す", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      expect(isDefensePosition(card)).toBe(false);
    });
  });

  // ===========================
  // 状態変更
  // ===========================

  describe("movedInstance", () => {
    it("カードを新しいロケーションに移動する", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      const movedCard = movedInstance(card, "graveyard");

      expect(movedCard.location).toBe("graveyard");
      expect(movedCard.instanceId).toBe(card.instanceId);
      expect(movedCard.id).toBe(card.id);
    });

    it("移動時にstateOnFieldがクリアされる", () => {
      const fieldCard = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
      });
      const movedCard = movedInstance(fieldCard, "graveyard");

      expect(movedCard.stateOnField).toBeUndefined();
    });

    it("元のカードは変更されない（イミュータブル）", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      const originalLocation = card.location;
      movedInstance(card, "graveyard");

      expect(card.location).toBe(originalLocation);
    });
  });

  describe("placedOnFieldInstance", () => {
    it("カードをフィールドに配置しstateOnFieldを初期化する", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      const placedCard = placedOnFieldInstance(card, "mainMonsterZone", "faceUp", "attack");

      expect(placedCard.location).toBe("mainMonsterZone");
      expect(placedCard.stateOnField).toBeDefined();
      expect(placedCard.stateOnField?.position).toBe("faceUp");
      expect(placedCard.stateOnField?.battlePosition).toBe("attack");
      expect(placedCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("守備表示で配置できる", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      const placedCard = placedOnFieldInstance(card, "mainMonsterZone", "faceDown", "defense");

      expect(placedCard.stateOnField?.position).toBe("faceDown");
      expect(placedCard.stateOnField?.battlePosition).toBe("defense");
    });

    it("魔法・罠ゾーンに配置できる", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });
      const placedCard = placedOnFieldInstance(card, "spellTrapZone", "faceDown");

      expect(placedCard.location).toBe("spellTrapZone");
      expect(placedCard.stateOnField?.position).toBe("faceDown");
    });

    it("フィールド以外のロケーションにはエラーをスローする", () => {
      const card = createTestMonsterCard("test-1", { location: "hand" });

      expect(() => placedOnFieldInstance(card, "graveyard", "faceUp")).toThrow("Invalid location for placing on field");
      expect(() => placedOnFieldInstance(card, "hand", "faceUp")).toThrow("Invalid location for placing on field");
      expect(() => placedOnFieldInstance(card, "mainDeck", "faceUp")).toThrow("Invalid location for placing on field");
    });
  });

  describe("leavedFromFieldInstance", () => {
    it("カードをフィールドから取り除きstateOnFieldを削除する", () => {
      const fieldCard = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
      });
      const leavedCard = leavedFromFieldInstance(fieldCard, "graveyard");

      expect(leavedCard.location).toBe("graveyard");
      expect(leavedCard.stateOnField).toBeUndefined();
    });

    it("除外ゾーンに移動できる", () => {
      const fieldCard = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
      });
      const leavedCard = leavedFromFieldInstance(fieldCard, "banished");

      expect(leavedCard.location).toBe("banished");
    });

    it("フィールドへの移動はエラーをスローする", () => {
      const fieldCard = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
      });

      expect(() => leavedFromFieldInstance(fieldCard, "mainMonsterZone")).toThrow(
        "Invalid location for removing from field",
      );
      expect(() => leavedFromFieldInstance(fieldCard, "spellTrapZone")).toThrow(
        "Invalid location for removing from field",
      );
    });
  });

  describe("updateCardStateInPlace", () => {
    it("カードのフィールド状態を更新する", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
        battlePosition: "attack",
      });
      const updatedCard = updateCardStateInPlace(card, { battlePosition: "defense" });

      expect(updatedCard.stateOnField?.battlePosition).toBe("defense");
      expect(updatedCard.stateOnField?.position).toBe("faceUp"); // 変更なし
    });

    it("複数のプロパティを同時に更新できる", () => {
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceDown",
        battlePosition: "defense",
        placedThisTurn: true,
      });
      const updatedCard = updateCardStateInPlace(card, {
        position: "faceUp",
        battlePosition: "attack",
        placedThisTurn: false,
      });

      expect(updatedCard.stateOnField?.position).toBe("faceUp");
      expect(updatedCard.stateOnField?.battlePosition).toBe("attack");
      expect(updatedCard.stateOnField?.placedThisTurn).toBe(false);
    });

    it("フィールド外のカードにはエラーをスローする", () => {
      const handCard = createTestMonsterCard("test-1", { location: "hand" });

      expect(() => updateCardStateInPlace(handCard, { position: "faceUp" })).toThrow(
        "Card must be on the field to update state",
      );
    });

    it("stateOnFieldがないカードにはエラーをスローする", () => {
      // フィールドロケーションだがstateOnFieldがない異常状態をシミュレート
      const abnormalCard: CardInstance = {
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
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
      const card = createFieldCardInstance({
        instanceId: "test-1",
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster",
        frameType: "normal",
        location: "mainMonsterZone",
        position: "faceUp",
        battlePosition: "attack",
      });
      const originalPosition = card.stateOnField?.battlePosition;
      updateCardStateInPlace(card, { battlePosition: "defense" });

      expect(card.stateOnField?.battlePosition).toBe(originalPosition);
    });
  });
});
