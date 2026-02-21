/**
 * Integration tests for summon flow
 *
 * Tests the complete flow of monster summoning, setting, and spell/trap placement
 * across multiple commands and state transitions.
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { GameSnapshot, InitialDeckCardIds } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import { SummonMonsterCommand } from "$lib/domain/commands/SummonMonsterCommand";
import { SetMonsterCommand } from "$lib/domain/commands/SetMonsterCommand";
import { SetSpellTrapCommand } from "$lib/domain/commands/SetSpellTrapCommand";
import { AdvancePhaseCommand } from "$lib/domain/commands/AdvancePhaseCommand";
import { CardDataRegistry } from "$lib/domain/cards";

/** テスト用ヘルパー: カードID配列をInitialDeckCardIdsに変換 */
function createTestInitialDeck(mainDeckCardIds: number[], extraDeckCardIds: number[] = []): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds };
}

/** テスト用ヘルパー: 指定枚数カードをドローする */
function drawCardsToHand(state: GameSnapshot, count: number): GameSnapshot {
  const updatedSpace = GameState.Space.drawCards(state.space, count);
  return {
    ...state,
    space: updatedSpace,
  };
}

describe("Summon Flow Integration", () => {
  let initialState: GameSnapshot;
  const EXODIA_PIECE_IDS = [
    33396948, // 本体
    7902349, // 左腕
    70903634, // 右腕
    44519536, // 左足
    8124921, // 右足
  ] as const;

  beforeEach(() => {
    // Initialize game with Exodia pieces and spell cards
    // Note: First card in deck array is at the BOTTOM of deck
    // So we reverse order to control what gets drawn first
    const deckIds = [
      EXODIA_PIECE_IDS[3], // Right Arm - extra cards to prevent deck out
      EXODIA_PIECE_IDS[4], // Left Arm
      67616300, // Chicken Game (field spell) - will be drawn 5th
      EXODIA_PIECE_IDS[2], // Left Leg - will be drawn 4th
      70368879, // Upstart Goblin (spell) - will be drawn 3rd
      EXODIA_PIECE_IDS[1], // Right Leg - will be drawn 2nd
      EXODIA_PIECE_IDS[0], // Exodia the Forbidden One - will be drawn 1st
    ];
    initialState = GameState.initialize(createTestInitialDeck(deckIds, []), CardDataRegistry.getCard, {
      skipShuffle: true,
      skipInitialDraw: true,
    });
  });

  describe("Basic Summon Flow", () => {
    it("should allow summoning a monster after drawing and advancing to Main1", () => {
      // Arrange: Start in Draw phase, draw a card, advance to Main1
      let state = initialState;
      state = drawCardsToHand(state, 1);

      const advanceToStandby = new AdvancePhaseCommand();
      state = advanceToStandby.execute(state).updatedState;

      const advanceToMain1 = new AdvancePhaseCommand();
      state = advanceToMain1.execute(state).updatedState;

      expect(state.phase).toBe("main1");
      expect(state.space.hand.length).toBe(1);
      expect(state.space.hand[0].type).toBe("monster");

      // Act: Summon the monster
      const monsterInstanceId = state.space.hand[0].instanceId;
      const summonCommand = new SummonMonsterCommand(monsterInstanceId);
      const result = summonCommand.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);
      expect(result.updatedState.space.mainMonsterZone[0].stateOnField?.position).toBe("faceUp");
      expect(result.updatedState.space.mainMonsterZone[0].stateOnField?.battlePosition).toBe("attack");
      expect(result.updatedState.normalSummonUsed).toBe(1);
    });

    it("should allow setting a monster instead of summoning", () => {
      // Arrange
      let state = initialState;
      state = drawCardsToHand(state, 1);

      const advanceToStandby = new AdvancePhaseCommand();
      state = advanceToStandby.execute(state).updatedState;

      const advanceToMain1 = new AdvancePhaseCommand();
      state = advanceToMain1.execute(state).updatedState;

      // Act: Set the monster
      const monsterInstanceId = state.space.hand[0].instanceId;
      const setCommand = new SetMonsterCommand(monsterInstanceId);
      const result = setCommand.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);
      expect(result.updatedState.space.mainMonsterZone[0].stateOnField?.position).toBe("faceDown");
      expect(result.updatedState.space.mainMonsterZone[0].stateOnField?.battlePosition).toBe("defense");
      expect(result.updatedState.normalSummonUsed).toBe(1);
    });
  });

  describe("Summon Limit Management", () => {
    it("should prevent second summon after already summoning once", () => {
      // Arrange: Draw 2 monsters, advance to Main1, summon first
      let state = initialState;
      state = drawCardsToHand(state, 2);

      const advanceToStandby = new AdvancePhaseCommand();
      state = advanceToStandby.execute(state).updatedState;

      const advanceToMain1 = new AdvancePhaseCommand();
      state = advanceToMain1.execute(state).updatedState;

      expect(state.space.hand.length).toBe(2);
      expect(state.space.hand[0].type).toBe("monster");
      expect(state.space.hand[1].type).toBe("monster");

      const monster1Id = state.space.hand[0].instanceId;
      const summonCommand1 = new SummonMonsterCommand(monster1Id);
      state = summonCommand1.execute(state).updatedState;

      expect(state.normalSummonUsed).toBe(1);

      // Act: Try to summon second monster
      const monster2Id = state.space.hand[0].instanceId; // Now first card in hand
      const summonCommand2 = new SummonMonsterCommand(monster2Id);
      const result = summonCommand2.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("should prevent summoning after setting a monster", () => {
      // Arrange: Draw 2 monsters, set first
      let state = initialState;
      state = drawCardsToHand(state, 2);

      const advanceToStandby = new AdvancePhaseCommand();
      state = advanceToStandby.execute(state).updatedState;

      const advanceToMain1 = new AdvancePhaseCommand();
      state = advanceToMain1.execute(state).updatedState;

      const monster1Id = state.space.hand[0].instanceId;
      const setCommand = new SetMonsterCommand(monster1Id);
      state = setCommand.execute(state).updatedState;

      // Act: Try to summon second monster
      const monster2Id = state.space.hand[0].instanceId;
      const summonCommand = new SummonMonsterCommand(monster2Id);
      const result = summonCommand.execute(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });
  });

  describe("Spell/Trap Setting Flow", () => {
    it("should allow setting a spell card without consuming summon rights", () => {
      // Arrange: Draw spell card
      let state = initialState;
      state = drawCardsToHand(state, 3); // This should be Upstart Goblin

      const advanceToStandby = new AdvancePhaseCommand();
      state = advanceToStandby.execute(state).updatedState;

      const advanceToMain1 = new AdvancePhaseCommand();
      state = advanceToMain1.execute(state).updatedState;

      // Find spell card in hand
      const spellCard = state.space.hand.find((card) => card.type === "spell");
      expect(spellCard).toBeDefined();

      // Act: Set the spell card
      const setSpellCommand = new SetSpellTrapCommand(spellCard!.instanceId);
      const result = setSpellCommand.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone[0].stateOnField?.position).toBe("faceDown");
      expect(result.updatedState.normalSummonUsed).toBe(0); // Should NOT consume summon rights
    });

    it("should allow both setting spell and summoning monster in same turn", () => {
      // Arrange: Draw both monster and spell
      let state = initialState;
      state = drawCardsToHand(state, 3); // Monster, Monster, Spell

      const advanceToStandby = new AdvancePhaseCommand();
      state = advanceToStandby.execute(state).updatedState;

      const advanceToMain1 = new AdvancePhaseCommand();
      state = advanceToMain1.execute(state).updatedState;

      const spellCard = state.space.hand.find((card) => card.type === "spell");
      const monsterCard = state.space.hand.find((card) => card.type === "monster");

      // Act: Set spell first
      const setSpellCommand = new SetSpellTrapCommand(spellCard!.instanceId);
      state = setSpellCommand.execute(state).updatedState;

      // Act: Then summon monster
      const summonCommand = new SummonMonsterCommand(monsterCard!.instanceId);
      const result = summonCommand.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.mainMonsterZone.length).toBe(1);
      expect(result.updatedState.normalSummonUsed).toBe(1);
    });
  });

  describe("Field Spell Flow", () => {
    it("should set field spell to fieldZone", () => {
      // Arrange: Draw field spell (Chicken Game)
      let state = initialState;
      state = drawCardsToHand(state, 5);

      const advanceToStandby = new AdvancePhaseCommand();
      state = advanceToStandby.execute(state).updatedState;

      const advanceToMain1 = new AdvancePhaseCommand();
      state = advanceToMain1.execute(state).updatedState;

      // Find field spell in hand
      const fieldSpell = state.space.hand.find((card) => card.type === "spell" && card.spellType === "field");
      expect(fieldSpell).toBeDefined();

      // Act: Set field spell
      const setFieldCommand = new SetSpellTrapCommand(fieldSpell!.instanceId);
      const result = setFieldCommand.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.fieldZone.length).toBe(1);
      expect(result.updatedState.space.fieldZone[0].stateOnField?.position).toBe("faceDown");
      expect(result.updatedState.space.spellTrapZone.length).toBe(0); // Should NOT go to spellTrapZone
    });

    it("should replace existing field spell when setting a new one", () => {
      // Arrange: Activate first field spell, then draw and set another
      let state = initialState;
      state = drawCardsToHand(state, 5);

      const advanceToStandby = new AdvancePhaseCommand();
      state = advanceToStandby.execute(state).updatedState;

      const advanceToMain1 = new AdvancePhaseCommand();
      state = advanceToMain1.execute(state).updatedState;

      // Find field spell and set it (not activate)
      const fieldSpell1 = state.space.hand.find((card) => card.type === "spell" && card.spellType === "field");
      const setFieldCommand1 = new SetSpellTrapCommand(fieldSpell1!.instanceId);
      state = setFieldCommand1.execute(state).updatedState;

      expect(state.space.fieldZone.length).toBe(1);
      const oldFieldSpellId = state.space.fieldZone[0].instanceId;

      // Add another field spell to hand for testing
      const newFieldSpell = {
        ...fieldSpell1!,
        instanceId: "new-field-spell",
        location: "hand" as const,
        position: undefined,
      };
      state = {
        ...state,
        space: {
          ...state.space,
          hand: [...state.space.hand, newFieldSpell],
        },
      };

      // Act: Set new field spell
      const setNewFieldCommand = new SetSpellTrapCommand("new-field-spell");
      const result = setNewFieldCommand.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.fieldZone.length).toBe(1);
      expect(result.updatedState.space.fieldZone[0].instanceId).toBe("new-field-spell");
      expect(result.updatedState.space.graveyard.some((card) => card.instanceId === oldFieldSpellId)).toBe(true);
    });
  });

  describe("Complete Placement Flow", () => {
    it("should handle complete flow: summon → set spell", () => {
      // Arrange
      let state = initialState;
      state = drawCardsToHand(state, 3); // Monster, Monster, Upstart Goblin

      const advanceToStandby = new AdvancePhaseCommand();
      state = advanceToStandby.execute(state).updatedState;

      const advanceToMain1 = new AdvancePhaseCommand();
      state = advanceToMain1.execute(state).updatedState;

      const monsterCard = state.space.hand.find((card) => card.type === "monster");
      const spellCard = state.space.hand.find((card) => card.type === "spell");

      // Act: Step 1 - Summon monster
      const summonCommand = new SummonMonsterCommand(monsterCard!.instanceId);
      state = summonCommand.execute(state).updatedState;

      expect(state.space.mainMonsterZone.length).toBe(1);
      expect(state.normalSummonUsed).toBe(1);

      // Act: Step 2 - Set spell
      const setSpellCommand = new SetSpellTrapCommand(spellCard!.instanceId);
      const result = setSpellCommand.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone[0].stateOnField?.position).toBe("faceDown");
      expect(result.updatedState.space.hand.length).toBe(1); // 1 monster left in hand
      expect(result.updatedState.normalSummonUsed).toBe(1); // Setting spell doesn't consume summon rights
    });
  });
});
