/**
 * ChainableActionRegistry Tests
 *
 * Tests for ChainableActionRegistry registration and retrieval functionality.
 *
 * Test Responsibility:
 * - registerActivation() functionality
 * - registerIgnition() functionality
 * - getActivation() functionality
 * - getIgnitionEffects() functionality
 * - hasIgnitionEffects() functionality
 * - collectChainableActions() functionality
 * - clear() functionality
 * - getRegisteredCardIds() functionality
 * - Multiple registrations
 * - Unknown card ID handling
 *
 * @module tests/unit/domain/registries/ChainableActionRegistry
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ChainableActionRegistry } from "$lib/domain/effects/actions";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { CardSpace } from "$lib/domain/models/GameState/CardSpace";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ChainableAction, ActionEffectCategory, EffectId } from "$lib/domain/models/Effect";

/**
 * Mock ChainableAction for testing
 *
 * Simple implementation to test Registry functionality without real card logic.
 */
class MockChainableAction implements ChainableAction {
  public readonly effectId: EffectId;

  constructor(
    public readonly cardId: number,
    public readonly cardName: string,
    public readonly spellSpeed: 1 | 2 | 3 = 1,
    public readonly effectCategory: ActionEffectCategory = "activation",
    effectId: string = "mock-effect",
  ) {
    this.effectId = effectId as EffectId;
  }

  canActivate(_state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // Mock: always return valid
    return GameProcessing.Validation.success();
  }

  createActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: `${this.cardId}-activation`,
        summary: `${this.cardId} Activation`,
        description: `${this.cardId} activation step`,
        action: (state: GameSnapshot) => {
          return { success: true, updatedState: state };
        },
      },
    ];
  }

  createResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: `${this.cardId}-resolution`,
        summary: `${this.cardId} Resolution`,
        description: `${this.cardId} resolution step`,
        action: (state: GameSnapshot) => {
          return { success: true, updatedState: state };
        },
      },
    ];
  }
}

describe("ChainableActionRegistry", () => {
  // Clean up before each test to ensure test isolation
  beforeEach(() => {
    ChainableActionRegistry.clear();
  });

  describe("registerActivation()", () => {
    it("should register an activation effect", () => {
      // Arrange
      const cardId = 55144522; // Pot of Greed
      const action = new MockChainableAction(cardId, "Pot of Greed");

      // Act
      ChainableActionRegistry.registerActivation(cardId, action);

      // Assert
      const retrieved = ChainableActionRegistry.getActivation(cardId);
      expect(retrieved).toBe(action);
    });

    it("should register multiple activation effects for different cards", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      const potOfGreedAction = new MockChainableAction(potOfGreedId, "Pot of Greed");
      const gracefulCharityAction = new MockChainableAction(gracefulCharityId, "Graceful Charity");

      // Act
      ChainableActionRegistry.registerActivation(potOfGreedId, potOfGreedAction);
      ChainableActionRegistry.registerActivation(gracefulCharityId, gracefulCharityAction);

      // Assert
      expect(ChainableActionRegistry.getActivation(potOfGreedId)).toBe(potOfGreedAction);
      expect(ChainableActionRegistry.getActivation(gracefulCharityId)).toBe(gracefulCharityAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(2);
    });

    it("should overwrite existing activation when registering same card ID", () => {
      // Arrange
      const cardId = 55144522;
      const firstAction = new MockChainableAction(cardId, "First Action");
      const secondAction = new MockChainableAction(cardId, "Second Action");

      // Act
      ChainableActionRegistry.registerActivation(cardId, firstAction);
      ChainableActionRegistry.registerActivation(cardId, secondAction); // Overwrite

      // Assert
      const retrieved = ChainableActionRegistry.getActivation(cardId);
      expect(retrieved).toBe(secondAction);
      expect(retrieved).not.toBe(firstAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1); // Only 1 entry
    });
  });

  describe("registerIgnition()", () => {
    it("should register an ignition effect", () => {
      // Arrange
      const cardId = 67616300; // Chicken Game
      const action = new MockChainableAction(cardId, "Chicken Game Ignition", 1, "ignition", "chicken-game-ignition");

      // Act
      ChainableActionRegistry.registerIgnition(cardId, action);

      // Assert
      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);
      expect(effects).toHaveLength(1);
      expect(effects[0]).toBe(action);
    });

    it("should register multiple ignition effects for same card", () => {
      // Arrange
      const cardId = 67616300;
      const effect1 = new MockChainableAction(cardId, "Effect 1", 1, "ignition", "effect-1");
      const effect2 = new MockChainableAction(cardId, "Effect 2", 1, "ignition", "effect-2");

      // Act
      ChainableActionRegistry.registerIgnition(cardId, effect1);
      ChainableActionRegistry.registerIgnition(cardId, effect2);

      // Assert
      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);
      expect(effects).toHaveLength(2);
      expect(effects).toContain(effect1);
      expect(effects).toContain(effect2);
    });
  });

  describe("getActivation()", () => {
    it("should return registered activation effect", () => {
      // Arrange
      const cardId = 55144522;
      const action = new MockChainableAction(cardId, "Pot of Greed");
      ChainableActionRegistry.registerActivation(cardId, action);

      // Act
      const retrieved = ChainableActionRegistry.getActivation(cardId);

      // Assert
      expect(retrieved).toBe(action);
      expect(retrieved).toBeInstanceOf(MockChainableAction);
    });

    it("should return undefined for unknown card ID", () => {
      // Arrange
      const unknownCardId = 99999999;

      // Act
      const retrieved = ChainableActionRegistry.getActivation(unknownCardId);

      // Assert
      expect(retrieved).toBeUndefined();
    });

    it("should return undefined for card ID not registered", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      const potOfGreedAction = new MockChainableAction(potOfGreedId, "Pot of Greed");

      ChainableActionRegistry.registerActivation(potOfGreedId, potOfGreedAction);

      // Act
      const retrieved = ChainableActionRegistry.getActivation(gracefulCharityId); // Not registered

      // Assert
      expect(retrieved).toBeUndefined();
    });
  });

  describe("getIgnitionEffects()", () => {
    it("should return empty array for card with no ignition effects", () => {
      // Arrange
      const cardId = 55144522;

      // Act
      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);

      // Assert
      expect(effects).toEqual([]);
    });

    it("should return all registered ignition effects", () => {
      // Arrange
      const cardId = 67616300;
      const effect1 = new MockChainableAction(cardId, "Effect 1", 1, "ignition", "effect-1");
      const effect2 = new MockChainableAction(cardId, "Effect 2", 1, "ignition", "effect-2");
      ChainableActionRegistry.registerIgnition(cardId, effect1);
      ChainableActionRegistry.registerIgnition(cardId, effect2);

      // Act
      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);

      // Assert
      expect(effects).toHaveLength(2);
    });
  });

  describe("hasIgnitionEffects()", () => {
    it("should return false for card with no ignition effects", () => {
      // Arrange
      const cardId = 55144522;

      // Assert
      expect(ChainableActionRegistry.hasIgnitionEffects(cardId)).toBe(false);
    });

    it("should return true for card with ignition effects", () => {
      // Arrange
      const cardId = 67616300;
      ChainableActionRegistry.registerIgnition(
        cardId,
        new MockChainableAction(cardId, "Ignition", 1, "ignition", "ignition"),
      );

      // Assert
      expect(ChainableActionRegistry.hasIgnitionEffects(cardId)).toBe(true);
    });
  });

  describe("activation and ignition coexistence", () => {
    it("should allow both activation and ignition for same card", () => {
      // Arrange
      const cardId = 67616300; // Chicken Game
      const activation = new MockChainableAction(
        cardId,
        "Chicken Game Activation",
        1,
        "activation",
        "chicken-game-activation",
      );
      const ignition = new MockChainableAction(cardId, "Chicken Game Ignition", 1, "ignition", "chicken-game-ignition");

      // Act
      ChainableActionRegistry.registerActivation(cardId, activation);
      ChainableActionRegistry.registerIgnition(cardId, ignition);

      // Assert
      expect(ChainableActionRegistry.getActivation(cardId)).toBe(activation);
      expect(ChainableActionRegistry.getIgnitionEffects(cardId)).toContain(ignition);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1);
    });
  });

  describe("clear()", () => {
    it("should clear all registered effects", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const chickenGameId = 67616300;
      ChainableActionRegistry.registerActivation(
        potOfGreedId,
        new MockChainableAction(potOfGreedId, "Pot of Greed", 1, "activation", "pot-of-greed"),
      );
      ChainableActionRegistry.registerActivation(
        chickenGameId,
        new MockChainableAction(chickenGameId, "Chicken Game", 1, "activation", "chicken-game"),
      );
      ChainableActionRegistry.registerIgnition(
        chickenGameId,
        new MockChainableAction(chickenGameId, "Ignition", 1, "ignition", "ignition"),
      );

      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(2);

      // Act
      ChainableActionRegistry.clear();

      // Assert
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.getActivation(potOfGreedId)).toBeUndefined();
      expect(ChainableActionRegistry.getActivation(chickenGameId)).toBeUndefined();
      expect(ChainableActionRegistry.getIgnitionEffects(chickenGameId)).toEqual([]);
    });

    it("should allow re-registration after clear", () => {
      // Arrange
      const cardId = 55144522;
      const firstAction = new MockChainableAction(cardId, "First Action", 1, "activation", "first-action");
      const secondAction = new MockChainableAction(cardId, "Second Action", 1, "activation", "second-action");

      ChainableActionRegistry.registerActivation(cardId, firstAction);
      ChainableActionRegistry.clear();

      // Act
      ChainableActionRegistry.registerActivation(cardId, secondAction);

      // Assert
      expect(ChainableActionRegistry.getActivation(cardId)).toBe(secondAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1);
    });
  });

  describe("getRegisteredCardIds()", () => {
    it("should return empty array when no actions are registered", () => {
      // Act & Assert
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toEqual([]);
    });

    it("should return correct card IDs after registrations", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;

      // Act
      ChainableActionRegistry.registerActivation(
        potOfGreedId,
        new MockChainableAction(potOfGreedId, "Pot of Greed", 1, "activation", "pot-of-greed"),
      );
      ChainableActionRegistry.registerActivation(
        gracefulCharityId,
        new MockChainableAction(gracefulCharityId, "Graceful Charity", 1, "activation", "graceful-charity"),
      );

      // Assert
      const registeredIds = ChainableActionRegistry.getRegisteredCardIds();
      expect(registeredIds).toHaveLength(2);
      expect(registeredIds).toContain(potOfGreedId);
      expect(registeredIds).toContain(gracefulCharityId);
    });

    it("should return correct card IDs after clear", () => {
      // Arrange
      ChainableActionRegistry.registerActivation(
        55144522,
        new MockChainableAction(55144522, "Pot of Greed", 1, "activation", "pot-of-greed"),
      );
      ChainableActionRegistry.registerActivation(
        79571449,
        new MockChainableAction(79571449, "Graceful Charity", 1, "activation", "graceful-charity"),
      );

      // Act
      ChainableActionRegistry.clear();

      // Assert
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toEqual([]);
    });
  });

  describe("collectChainableActions()", () => {
    // ==============================
    // テスト用ヘルパー関数
    // ==============================

    /** テスト用速攻魔法カードインスタンスを作成 */
    const createQuickPlaySpellInstance = (
      id: number,
      instanceId: string,
      location: "hand" | "spellTrapZone",
      options?: { placedThisTurn?: boolean; position?: "faceUp" | "faceDown" },
    ): CardInstance => ({
      id,
      instanceId,
      jaName: `速攻魔法${id}`,
      type: "spell",
      frameType: "spell",
      spellType: "quick-play",
      location,
      stateOnField:
        location === "spellTrapZone"
          ? {
              position: options?.position ?? "faceDown",
              placedThisTurn: options?.placedThisTurn ?? false,
              counters: [],
              activatedEffects: new Set<string>(),
            }
          : undefined,
    });

    /** テスト用罠カードインスタンスを作成 */
    const createTrapInstance = (
      id: number,
      instanceId: string,
      options?: { placedThisTurn?: boolean; position?: "faceUp" | "faceDown" },
    ): CardInstance => ({
      id,
      instanceId,
      jaName: `罠カード${id}`,
      type: "trap",
      frameType: "trap",
      trapType: "normal",
      location: "spellTrapZone",
      stateOnField: {
        position: options?.position ?? "faceDown",
        placedThisTurn: options?.placedThisTurn ?? false,
        counters: [],
        activatedEffects: new Set<string>(),
      },
    });

    /** テスト用通常魔法カードインスタンスを作成 */
    const createNormalSpellInstance = (id: number, instanceId: string): CardInstance => ({
      id,
      instanceId,
      jaName: `通常魔法${id}`,
      type: "spell",
      frameType: "spell",
      spellType: "normal",
      location: "hand",
    });

    /** テスト用空のCardSpaceを作成 */
    const createEmptyCardSpace = (): CardSpace => ({
      mainDeck: [],
      extraDeck: [],
      hand: [],
      mainMonsterZone: [],
      spellTrapZone: [],
      fieldZone: [],
      graveyard: [],
      banished: [],
    });

    /** テスト用GameSnapshotを作成 */
    const createTestGameSnapshot = (space: Partial<CardSpace> = {}): GameSnapshot => ({
      space: { ...createEmptyCardSpace(), ...space },
      lp: { player: 8000, opponent: 8000 },
      phase: "main1",
      turn: 1,
      result: { isGameOver: false },
      normalSummonLimit: 1,
      normalSummonUsed: 0,
      activatedCardIds: new Set<number>(),
      queuedEndPhaseEffectIds: [],
    });

    /** canActivateがfalseを返すMockChainableAction */
    class MockInvalidChainableAction extends MockChainableAction {
      canActivate(_state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
        return GameProcessing.Validation.failure("ACTIVATION_CONDITIONS_NOT_MET");
      }
    }

    // ==============================
    // テストケース
    // ==============================

    it("手札の速攻魔法を収集できる", () => {
      // Arrange
      const cardId = 12345;
      const quickPlaySpell = createQuickPlaySpellInstance(cardId, "hand-0", "hand");
      const state = createTestGameSnapshot({ hand: [quickPlaySpell] });
      const action = new MockChainableAction(cardId, "Quick-Play Spell", 2, "activation", "quick-play");
      ChainableActionRegistry.registerActivation(cardId, action);

      // Act
      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].instance).toBe(quickPlaySpell);
      expect(result[0].action).toBe(action);
    });

    it("セットされた速攻魔法（前ターンセット）を収集できる", () => {
      // Arrange
      const cardId = 12345;
      const setQuickPlaySpell = createQuickPlaySpellInstance(cardId, "spell-0", "spellTrapZone", {
        placedThisTurn: false,
        position: "faceDown",
      });
      const state = createTestGameSnapshot({ spellTrapZone: [setQuickPlaySpell] });
      const action = new MockChainableAction(cardId, "Set Quick-Play", 2, "activation", "set-quick-play");
      ChainableActionRegistry.registerActivation(cardId, action);

      // Act
      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].instance).toBe(setQuickPlaySpell);
    });

    it("セットされた罠カード（前ターンセット）を収集できる", () => {
      // Arrange
      const cardId = 54321;
      const setTrap = createTrapInstance(cardId, "trap-0", { placedThisTurn: false, position: "faceDown" });
      const state = createTestGameSnapshot({ spellTrapZone: [setTrap] });
      const action = new MockChainableAction(cardId, "Trap Card", 2, "activation", "trap");
      ChainableActionRegistry.registerActivation(cardId, action);

      // Act
      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].instance).toBe(setTrap);
    });

    it("セットしたターンのカードは収集されない（canActivateで判定）", () => {
      // Arrange
      const cardId = 12345;
      const setThisTurn = createQuickPlaySpellInstance(cardId, "spell-0", "spellTrapZone", {
        placedThisTurn: true,
        position: "faceDown",
      });
      const state = createTestGameSnapshot({ spellTrapZone: [setThisTurn] });
      // セットしたターンはcanActivateがfalseを返す（実際のQuickPlaySpellActivationの動作）
      const action = new MockInvalidChainableAction(cardId, "Set This Turn", 2, "activation", "set-this-turn");
      ChainableActionRegistry.registerActivation(cardId, action);

      // Act
      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // Assert
      expect(result).toHaveLength(0);
    });

    it("表側表示のカードも収集できる（永続魔法・罠の効果発動）", () => {
      // Arrange
      const cardId = 12345;
      const faceUpCard = createQuickPlaySpellInstance(cardId, "spell-0", "spellTrapZone", {
        placedThisTurn: false,
        position: "faceUp",
      });
      const state = createTestGameSnapshot({ spellTrapZone: [faceUpCard] });
      // 表側表示は「効果の発動」なので ignition を登録
      const action = new MockChainableAction(cardId, "Face Up Effect", 1, "ignition", "face-up-effect");
      ChainableActionRegistry.registerIgnition(cardId, action);

      // Act
      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // Assert - 表側表示の永続魔法・罠の効果発動が収集される
      expect(result).toHaveLength(1);
      expect(result[0].instance).toBe(faceUpCard);
    });

    it("表側表示のカードはactivationが収集されない（カードの発動は不可）", () => {
      // Arrange
      const cardId = 12345;
      const faceUpCard = createQuickPlaySpellInstance(cardId, "spell-0", "spellTrapZone", {
        placedThisTurn: false,
        position: "faceUp",
      });
      const state = createTestGameSnapshot({ spellTrapZone: [faceUpCard] });
      // 表側表示に activation を登録しても収集されない
      const action = new MockChainableAction(cardId, "Face Up", 2, "activation", "face-up");
      ChainableActionRegistry.registerActivation(cardId, action);

      // Act
      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // Assert - 表側表示では activation（カードの発動）は収集されない
      expect(result).toHaveLength(0);
    });

    it("requiredSpellSpeedで絞り込める", () => {
      // Arrange
      const spellSpeed1CardId = 11111;
      const spellSpeed2CardId = 22222;
      const spell1 = createQuickPlaySpellInstance(spellSpeed1CardId, "hand-0", "hand");
      const spell2 = createQuickPlaySpellInstance(spellSpeed2CardId, "hand-1", "hand");
      const state = createTestGameSnapshot({ hand: [spell1, spell2] });

      // spellSpeed 1 の効果
      ChainableActionRegistry.registerActivation(
        spellSpeed1CardId,
        new MockChainableAction(spellSpeed1CardId, "Speed 1", 1, "activation", "speed-1"),
      );
      // spellSpeed 2 の効果
      ChainableActionRegistry.registerActivation(
        spellSpeed2CardId,
        new MockChainableAction(spellSpeed2CardId, "Speed 2", 2, "activation", "speed-2"),
      );

      // Act - requiredSpellSpeed 2 で絞り込み
      const result = ChainableActionRegistry.collectChainableActions(state, 2);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].instance.id).toBe(spellSpeed2CardId);
    });

    it("excludeInstanceIdsで除外できる", () => {
      // Arrange
      const cardId1 = 11111;
      const cardId2 = 22222;
      const spell1 = createQuickPlaySpellInstance(cardId1, "hand-0", "hand");
      const spell2 = createQuickPlaySpellInstance(cardId2, "hand-1", "hand");
      const state = createTestGameSnapshot({ hand: [spell1, spell2] });

      ChainableActionRegistry.registerActivation(
        cardId1,
        new MockChainableAction(cardId1, "Spell 1", 2, "activation", "spell-1"),
      );
      ChainableActionRegistry.registerActivation(
        cardId2,
        new MockChainableAction(cardId2, "Spell 2", 2, "activation", "spell-2"),
      );

      // Act - hand-0 を除外
      const excludeIds = new Set(["hand-0"]);
      const result = ChainableActionRegistry.collectChainableActions(state, 1, excludeIds);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].instance.instanceId).toBe("hand-1");
    });

    it("canActivateがfalseの場合は収集されない", () => {
      // Arrange
      const cardId = 12345;
      const quickPlaySpell = createQuickPlaySpellInstance(cardId, "hand-0", "hand");
      const state = createTestGameSnapshot({ hand: [quickPlaySpell] });

      // canActivateがfalseを返すアクション
      const invalidAction = new MockInvalidChainableAction(cardId, "Invalid", 2, "activation", "invalid");
      ChainableActionRegistry.registerActivation(cardId, invalidAction);

      // Act
      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // Assert
      expect(result).toHaveLength(0);
    });

    it("通常魔法は収集されない（spellSpeed 1 < requiredSpellSpeed 2）", () => {
      // Arrange
      const cardId = 12345;
      const normalSpell = createNormalSpellInstance(cardId, "hand-0");
      const state = createTestGameSnapshot({ hand: [normalSpell] });

      // 通常魔法は spellSpeed 1
      const action = new MockChainableAction(cardId, "Normal Spell", 1, "activation", "normal");
      ChainableActionRegistry.registerActivation(cardId, action);

      // Act - チェーンを組む場合は通常 requiredSpellSpeed >= 2
      const result = ChainableActionRegistry.collectChainableActions(state, 2);

      // Assert
      expect(result).toHaveLength(0);
    });

    it("効果が登録されていないカードは収集されない", () => {
      // Arrange
      const unregisteredCardId = 99999;
      const quickPlaySpell = createQuickPlaySpellInstance(unregisteredCardId, "hand-0", "hand");
      const state = createTestGameSnapshot({ hand: [quickPlaySpell] });
      // 効果を登録しない

      // Act
      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // Assert
      expect(result).toHaveLength(0);
    });

    it("複数のチェーン可能カードを収集できる", () => {
      // Arrange
      const cardId1 = 11111;
      const cardId2 = 22222;
      const cardId3 = 33333;
      const handSpell = createQuickPlaySpellInstance(cardId1, "hand-0", "hand");
      const setSpell = createQuickPlaySpellInstance(cardId2, "spell-0", "spellTrapZone", {
        placedThisTurn: false,
        position: "faceDown",
      });
      const setTrap = createTrapInstance(cardId3, "trap-0", { placedThisTurn: false, position: "faceDown" });
      const state = createTestGameSnapshot({
        hand: [handSpell],
        spellTrapZone: [setSpell, setTrap],
      });

      ChainableActionRegistry.registerActivation(
        cardId1,
        new MockChainableAction(cardId1, "Hand Spell", 2, "activation", "hand-spell"),
      );
      ChainableActionRegistry.registerActivation(
        cardId2,
        new MockChainableAction(cardId2, "Set Spell", 2, "activation", "set-spell"),
      );
      ChainableActionRegistry.registerActivation(
        cardId3,
        new MockChainableAction(cardId3, "Set Trap", 2, "activation", "set-trap"),
      );

      // Act
      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // Assert
      expect(result).toHaveLength(3);
      const instanceIds = result.map((r) => r.instance.instanceId);
      expect(instanceIds).toContain("hand-0");
      expect(instanceIds).toContain("spell-0");
      expect(instanceIds).toContain("trap-0");
    });
  });
});
