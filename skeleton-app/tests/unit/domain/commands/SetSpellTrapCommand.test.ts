/**
 * 魔法・罠カードセットコマンドのテスト
 */

import { describe, it, expect } from "vitest";
import { SetSpellTrapCommand } from "$lib/domain/commands/SetSpellTrapCommand";
import {
  createMockGameState,
  createSpaceState,
  createSpellInstance,
  createSpellOnField,
  createMonsterInstance,
  createFilledSpellZone,
  createExodiaVictoryState,
} from "../../../__testUtils__";

describe("SetSpellTrapCommand", () => {
  describe("canExecute", () => {
    it("条件を満たす場合に通常魔法をセットできる", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const state = createSpaceState({
        hand: [spellCard],
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("フィールドゾーンが使用中でもフィールド魔法をセットできる", () => {
      // Arrange
      const fieldSpell1 = createSpellInstance("field-1", { spellType: "field" });
      const fieldSpell2 = createSpellInstance("field-2", { spellType: "field", location: "fieldZone" });
      const state = createSpaceState({
        hand: [fieldSpell1],
        fieldZone: [fieldSpell2],
      });

      const command = new SetSpellTrapCommand("field-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("メイン1フェイズでない場合は失敗する", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const state = createMockGameState({
        phase: "draw",
        space: { hand: [spellCard] },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("魔法・罠ゾーンが満杯の場合（5枚）は失敗する", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const state = createSpaceState({
        hand: [spellCard],
        ...createFilledSpellZone(5),
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("カードが見つからない場合は失敗する", () => {
      // Arrange
      const state = createMockGameState();

      const command = new SetSpellTrapCommand("non-existent-id");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("カードが手札にない場合は失敗する", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1", { spellType: "normal", location: "mainDeck" });
      const state = createSpaceState({
        mainDeck: [spellCard],
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("カードが魔法・罠でない場合は失敗する", () => {
      // Arrange
      const monsterCard = createMonsterInstance("monster-1");
      const state = createSpaceState({
        hand: [monsterCard],
      });

      const command = new SetSpellTrapCommand("monster-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });

    it("ゲームが既に終了している場合は失敗する", () => {
      // Arrange
      const state = createExodiaVictoryState();

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("通常魔法を裏向きで魔法・罠ゾーンにセットする", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const state = createSpaceState({
        hand: [spellCard],
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(0);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);

      const setCard = result.updatedState.space.spellTrapZone[0];
      expect(setCard.instanceId).toBe("spell-1");
      expect(setCard.location).toBe("spellTrapZone");
      expect(setCard.stateOnField?.position).toBe("faceDown");
      expect(setCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("速攻魔法を裏向きで魔法・罠ゾーンにセットする", () => {
      // Arrange
      const spellCard = createSpellInstance("quick-1", { spellType: "quick-play" });
      const state = createSpaceState({
        hand: [spellCard],
      });

      const command = new SetSpellTrapCommand("quick-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);

      const setCard = result.updatedState.space.spellTrapZone[0];
      expect(setCard.instanceId).toBe("quick-1");
      expect(setCard.stateOnField?.position).toBe("faceDown");
      expect(setCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("永続魔法を裏向きで魔法・罠ゾーンにセットする", () => {
      // Arrange
      const spellCard = createSpellInstance("continuous-1", { spellType: "continuous" });
      const state = createSpaceState({
        hand: [spellCard],
      });

      const command = new SetSpellTrapCommand("continuous-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);

      const setCard = result.updatedState.space.spellTrapZone[0];
      expect(setCard.instanceId).toBe("continuous-1");
      expect(setCard.stateOnField?.position).toBe("faceDown");
    });

    it("フィールド魔法を裏向きでフィールドゾーンにセットする", () => {
      // Arrange
      const fieldSpell = createSpellInstance("field-1", { spellType: "field" });
      const state = createSpaceState({
        hand: [fieldSpell],
      });

      const command = new SetSpellTrapCommand("field-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.hand.length).toBe(0);
      expect(result.updatedState.space.fieldZone.length).toBe(1);

      const setCard = result.updatedState.space.fieldZone[0];
      expect(setCard.instanceId).toBe("field-1");
      expect(setCard.location).toBe("fieldZone");
      expect(setCard.stateOnField?.position).toBe("faceDown");
      expect(setCard.stateOnField?.placedThisTurn).toBe(true);
    });

    it("新しいフィールド魔法をセットする際に既存のフィールド魔法を置き換える", () => {
      // Arrange
      const oldFieldSpell = createSpellOnField("field-old", { spellType: "field" });
      const newFieldSpell = createSpellInstance("field-new", { spellType: "field" });
      const state = createSpaceState({
        hand: [newFieldSpell],
        fieldZone: [oldFieldSpell],
      });

      const command = new SetSpellTrapCommand("field-new");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.fieldZone.length).toBe(1);
      expect(result.updatedState.space.fieldZone[0].instanceId).toBe("field-new");
      expect(result.updatedState.space.graveyard.length).toBe(1);
      expect(result.updatedState.space.graveyard[0].instanceId).toBe("field-old");
    });

    it("魔法をセットしても normalSummonUsed を消費しない", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const state = createMockGameState({
        normalSummonUsed: 0,
        space: { hand: [spellCard] },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.normalSummonUsed).toBe(0); // Should NOT increment
    });

    it("メイン1フェイズでない場合は失敗する", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const state = createMockGameState({
        phase: "draw",
        space: { hand: [spellCard] },
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });

    it("カードが見つからない場合は失敗する", () => {
      // Arrange
      const state = createMockGameState();

      const command = new SetSpellTrapCommand("non-existent-id");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");
    });

    it("カードが手札にない場合は失敗する", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1", { spellType: "normal", location: "mainDeck" });
      const state = createSpaceState({
        mainDeck: [spellCard],
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが手札にありません");
    });

    it("魔法・罠ゾーンが満杯の場合は失敗する", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const existingSpells = createFilledSpellZone(5).spellTrapZone.map((s) => ({
        ...s,
        location: "spellTrapZone" as const,
      }));
      const state = createSpaceState({
        hand: [spellCard],
        spellTrapZone: existingSpells,
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("魔法・罠ゾーンに空きがありません");
    });

    it("セット時に他のゾーンを保持する", () => {
      // Arrange
      const spellCard = createSpellInstance("spell-1");
      const existingDeckCard = createSpellInstance("deck-card", { spellType: "normal", location: "mainDeck" });
      const existingGraveyardCard = createSpellInstance("gy-card", { spellType: "normal", location: "graveyard" });

      const state = createSpaceState({
        mainDeck: [existingDeckCard],
        hand: [spellCard],
        graveyard: [existingGraveyardCard],
      });

      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainDeck).toEqual([existingDeckCard]);
      expect(result.updatedState.space.graveyard).toEqual([existingGraveyardCard]);
    });
  });

  describe("getCardInstanceId", () => {
    it("カードインスタンス ID を返す", () => {
      // Arrange
      const command = new SetSpellTrapCommand("spell-1");

      // Act
      const result = command.getCardInstanceId();

      // Assert
      expect(result).toBe("spell-1");
    });
  });
});
