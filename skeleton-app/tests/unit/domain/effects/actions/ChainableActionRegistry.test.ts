/**
 * 発動する効果レジストリのテスト
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ChainableActionRegistry } from "$lib/domain/effects/actions";
import { BaseTriggerEffect } from "$lib/domain/effects/actions/triggers/BaseTriggerEffect";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult, EventType, GameEvent } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ChainableAction, ActionEffectCategory, EffectId } from "$lib/domain/models/Effect";
import { createSpaceState, createMonsterOnField, ACTUAL_CARD_IDS, DUMMY_CARD_IDS } from "../../../../__testUtils__";

/**
 * テスト用のモック ChainableAction
 *
 * 実際のカードロジックなしでレジストリ機能をテストするシンプルな実装。
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
    // モック：常にバリデーション成功を返す
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

/**
 * テスト用のモック BaseTriggerEffect（トリガー登録・collectTriggerSteps用）
 */
class MockTriggerAction extends BaseTriggerEffect {
  readonly triggers: readonly EventType[];
  readonly triggerTiming = "when" as const;
  readonly isMandatory: boolean;
  readonly selfOnly = false;
  readonly excludeSelf = false;

  constructor(cardId: number, triggers: readonly EventType[] = ["spellActivated"], isMandatory = true) {
    super(cardId, 0);
    this.triggers = triggers;
    this.isMandatory = isMandatory;
  }

  protected individualConditions(_state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    return GameProcessing.Validation.success();
  }

  // notifyActivationStep が CardDataRegistry を参照するためオーバーライドしてスキップ
  createActivationSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: `mock-trigger-activation-${sourceInstance.instanceId}`,
        summary: "Mock trigger activation",
        description: "Mock trigger activation step",
        action: (state: GameSnapshot) => GameProcessing.Result.success(state, "Mock trigger activated"),
      },
    ];
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: `mock-trigger-${sourceInstance.instanceId}`,
        summary: "Mock trigger resolution",
        description: "Mock trigger resolution step",
        action: (state: GameSnapshot) => GameProcessing.Result.success(state, "Mock trigger resolved"),
      },
    ];
  }
}

describe("ChainableActionRegistry", () => {
  // テストの独立性を保つため各テスト前にクリア
  beforeEach(() => {
    ChainableActionRegistry.clear();
  });

  describe("registerActivation()", () => {
    it("発動効果を登録できる", () => {
      const cardId = ACTUAL_CARD_IDS.POT_OF_GREED; // Pot of Greed
      const action = new MockChainableAction(cardId, "Pot of Greed");

      ChainableActionRegistry.registerActivation(cardId, action);

      const retrieved = ChainableActionRegistry.getActivation(cardId);
      expect(retrieved).toBe(action);
    });

    it("異なるカードに複数の発動効果を登録できる", () => {
      const potOfGreedId = ACTUAL_CARD_IDS.POT_OF_GREED;
      const gracefulCharityId = ACTUAL_CARD_IDS.GRACEFUL_CHARITY;
      const potOfGreedAction = new MockChainableAction(potOfGreedId, "Pot of Greed");
      const gracefulCharityAction = new MockChainableAction(gracefulCharityId, "Graceful Charity");

      ChainableActionRegistry.registerActivation(potOfGreedId, potOfGreedAction);
      ChainableActionRegistry.registerActivation(gracefulCharityId, gracefulCharityAction);

      expect(ChainableActionRegistry.getActivation(potOfGreedId)).toBe(potOfGreedAction);
      expect(ChainableActionRegistry.getActivation(gracefulCharityId)).toBe(gracefulCharityAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(2);
    });

    it("同じカードIDを登録すると既存の発動効果を上書きできる", () => {
      const cardId = ACTUAL_CARD_IDS.POT_OF_GREED;
      const firstAction = new MockChainableAction(cardId, "First Action");
      const secondAction = new MockChainableAction(cardId, "Second Action");

      ChainableActionRegistry.registerActivation(cardId, firstAction);
      ChainableActionRegistry.registerActivation(cardId, secondAction); // 上書き

      const retrieved = ChainableActionRegistry.getActivation(cardId);
      expect(retrieved).toBe(secondAction);
      expect(retrieved).not.toBe(firstAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1); // エントリは1件のみ
    });
  });

  describe("registerIgnition()", () => {
    it("起動効果を登録できる", () => {
      const cardId = ACTUAL_CARD_IDS.CHICKEN_GAME;
      const action = new MockChainableAction(cardId, "Chicken Game Ignition", 1, "ignition", "chicken-game-ignition");

      ChainableActionRegistry.registerIgnition(cardId, action);

      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);
      expect(effects).toHaveLength(1);
      expect(effects[0]).toBe(action);
    });

    it("同じカードに複数の起動効果を登録できる", () => {
      const cardId = ACTUAL_CARD_IDS.CHICKEN_GAME;
      const effect1 = new MockChainableAction(cardId, "Effect 1", 1, "ignition", "effect-1");
      const effect2 = new MockChainableAction(cardId, "Effect 2", 1, "ignition", "effect-2");

      ChainableActionRegistry.registerIgnition(cardId, effect1);
      ChainableActionRegistry.registerIgnition(cardId, effect2);

      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);
      expect(effects).toHaveLength(2);
      expect(effects).toContain(effect1);
      expect(effects).toContain(effect2);
    });
  });

  describe("getActivation()", () => {
    it("登録した発動効果を取得できる", () => {
      const cardId = ACTUAL_CARD_IDS.POT_OF_GREED;
      const action = new MockChainableAction(cardId, "Pot of Greed");
      ChainableActionRegistry.registerActivation(cardId, action);

      const retrieved = ChainableActionRegistry.getActivation(cardId);

      expect(retrieved).toBe(action);
      expect(retrieved).toBeInstanceOf(MockChainableAction);
    });

    it("未知のカードIDはundefinedを返す", () => {
      const retrieved = ChainableActionRegistry.getActivation(DUMMY_CARD_IDS.NOT_EXISTING_CARD);

      expect(retrieved).toBeUndefined();
    });

    it("未登録のカードIDはundefinedを返す", () => {
      const potOfGreedId = ACTUAL_CARD_IDS.POT_OF_GREED;
      const gracefulCharityId = ACTUAL_CARD_IDS.GRACEFUL_CHARITY;
      const potOfGreedAction = new MockChainableAction(potOfGreedId, "Pot of Greed");

      ChainableActionRegistry.registerActivation(potOfGreedId, potOfGreedAction);

      const retrieved = ChainableActionRegistry.getActivation(gracefulCharityId); // 未登録

      expect(retrieved).toBeUndefined();
    });
  });

  describe("getIgnitionEffects()", () => {
    it("起動効果がないカードは空配列を返す", () => {
      const cardId = ACTUAL_CARD_IDS.POT_OF_GREED;

      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);

      expect(effects).toEqual([]);
    });

    it("登録した全起動効果を返す", () => {
      const cardId = ACTUAL_CARD_IDS.CHICKEN_GAME;
      const effect1 = new MockChainableAction(cardId, "Effect 1", 1, "ignition", "effect-1");
      const effect2 = new MockChainableAction(cardId, "Effect 2", 1, "ignition", "effect-2");
      ChainableActionRegistry.registerIgnition(cardId, effect1);
      ChainableActionRegistry.registerIgnition(cardId, effect2);

      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);

      expect(effects).toHaveLength(2);
    });
  });

  describe("hasIgnitionEffects()", () => {
    it("起動効果がないカードはfalseを返す", () => {
      const cardId = ACTUAL_CARD_IDS.POT_OF_GREED;

      expect(ChainableActionRegistry.hasIgnitionEffects(cardId)).toBe(false);
    });

    it("起動効果があるカードはtrueを返す", () => {
      const cardId = ACTUAL_CARD_IDS.CHICKEN_GAME;
      ChainableActionRegistry.registerIgnition(
        cardId,
        new MockChainableAction(cardId, "Ignition", 1, "ignition", "ignition"),
      );

      expect(ChainableActionRegistry.hasIgnitionEffects(cardId)).toBe(true);
    });
  });

  describe("発動効果と起動効果の共存", () => {
    it("同じカードに発動効果と起動効果を両方登録できる", () => {
      const cardId = ACTUAL_CARD_IDS.CHICKEN_GAME; // Chicken Game
      const activation = new MockChainableAction(
        cardId,
        "Chicken Game Activation",
        1,
        "activation",
        "chicken-game-activation",
      );
      const ignition = new MockChainableAction(cardId, "Chicken Game Ignition", 1, "ignition", "chicken-game-ignition");

      ChainableActionRegistry.registerActivation(cardId, activation);
      ChainableActionRegistry.registerIgnition(cardId, ignition);

      expect(ChainableActionRegistry.getActivation(cardId)).toBe(activation);
      expect(ChainableActionRegistry.getIgnitionEffects(cardId)).toContain(ignition);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1);
    });
  });

  describe("clear()", () => {
    it("登録済みの全効果をクリアできる", () => {
      const potOfGreedId = ACTUAL_CARD_IDS.POT_OF_GREED;
      const chickenGameId = ACTUAL_CARD_IDS.CHICKEN_GAME;
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

      ChainableActionRegistry.clear();

      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.getActivation(potOfGreedId)).toBeUndefined();
      expect(ChainableActionRegistry.getActivation(chickenGameId)).toBeUndefined();
      expect(ChainableActionRegistry.getIgnitionEffects(chickenGameId)).toEqual([]);
    });

    it("clear後に再登録できる", () => {
      const cardId = ACTUAL_CARD_IDS.POT_OF_GREED;
      const firstAction = new MockChainableAction(cardId, "First Action", 1, "activation", "first-action");
      const secondAction = new MockChainableAction(cardId, "Second Action", 1, "activation", "second-action");

      ChainableActionRegistry.registerActivation(cardId, firstAction);
      ChainableActionRegistry.clear();

      ChainableActionRegistry.registerActivation(cardId, secondAction);

      expect(ChainableActionRegistry.getActivation(cardId)).toBe(secondAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1);
    });
  });

  describe("getRegisteredCardIds()", () => {
    it("アクションが未登録の場合は空配列を返す", () => {
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toEqual([]);
    });

    it("登録後に正しいカードIDを返す", () => {
      const potOfGreedId = ACTUAL_CARD_IDS.POT_OF_GREED;
      const gracefulCharityId = ACTUAL_CARD_IDS.GRACEFUL_CHARITY;

      ChainableActionRegistry.registerActivation(
        potOfGreedId,
        new MockChainableAction(potOfGreedId, "Pot of Greed", 1, "activation", "pot-of-greed"),
      );
      ChainableActionRegistry.registerActivation(
        gracefulCharityId,
        new MockChainableAction(gracefulCharityId, "Graceful Charity", 1, "activation", "graceful-charity"),
      );

      const registeredIds = ChainableActionRegistry.getRegisteredCardIds();
      expect(registeredIds).toHaveLength(2);
      expect(registeredIds).toContain(potOfGreedId);
      expect(registeredIds).toContain(gracefulCharityId);
    });

    it("clear後に正しいカードIDを返す", () => {
      ChainableActionRegistry.registerActivation(
        ACTUAL_CARD_IDS.POT_OF_GREED,
        new MockChainableAction(ACTUAL_CARD_IDS.POT_OF_GREED, "Pot of Greed", 1, "activation", "pot-of-greed"),
      );
      ChainableActionRegistry.registerActivation(
        ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
        new MockChainableAction(
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          "Graceful Charity",
          1,
          "activation",
          "graceful-charity",
        ),
      );

      ChainableActionRegistry.clear();

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
      edition: "latest",
      spellType: "quick-play",
      location,
      stateOnField:
        location === "spellTrapZone"
          ? {
              slotIndex: 0,
              position: options?.position ?? "faceDown",
              placedThisTurn: options?.placedThisTurn ?? false,
              counters: [],
              activatedEffects: [],
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
      edition: "latest",
      trapType: "normal",
      location: "spellTrapZone",
      stateOnField: {
        slotIndex: 0,
        position: options?.position ?? "faceDown",
        placedThisTurn: options?.placedThisTurn ?? false,
        counters: [],
        activatedEffects: [],
      },
    });

    /** テスト用通常魔法カードインスタンスを作成 */
    const createNormalSpellInstance = (id: number, instanceId: string): CardInstance => ({
      id,
      instanceId,
      jaName: `通常魔法${id}`,
      type: "spell",
      frameType: "spell",
      edition: "latest",
      spellType: "normal",
      location: "hand",
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
      const cardId = 12345;
      const quickPlaySpell = createQuickPlaySpellInstance(cardId, "hand-0", "hand");
      const state = createSpaceState({ hand: [quickPlaySpell] });
      const action = new MockChainableAction(cardId, "Quick-Play Spell", 2, "activation", "quick-play");
      ChainableActionRegistry.registerActivation(cardId, action);

      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      expect(result).toHaveLength(1);
      expect(result[0].instance).toBe(quickPlaySpell);
      expect(result[0].action).toBe(action);
    });

    it("セットされた速攻魔法（前ターンセット）を収集できる", () => {
      const cardId = 12345;
      const setQuickPlaySpell = createQuickPlaySpellInstance(cardId, "spell-0", "spellTrapZone", {
        placedThisTurn: false,
        position: "faceDown",
      });
      const state = createSpaceState({ spellTrapZone: [setQuickPlaySpell] });
      const action = new MockChainableAction(cardId, "Set Quick-Play", 2, "activation", "set-quick-play");
      ChainableActionRegistry.registerActivation(cardId, action);

      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      expect(result).toHaveLength(1);
      expect(result[0].instance).toBe(setQuickPlaySpell);
    });

    it("セットされた罠カード（前ターンセット）を収集できる", () => {
      const cardId = 54321;
      const setTrap = createTrapInstance(cardId, "trap-0", { placedThisTurn: false, position: "faceDown" });
      const state = createSpaceState({ spellTrapZone: [setTrap] });
      const action = new MockChainableAction(cardId, "Trap Card", 2, "activation", "trap");
      ChainableActionRegistry.registerActivation(cardId, action);

      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      expect(result).toHaveLength(1);
      expect(result[0].instance).toBe(setTrap);
    });

    it("セットしたターンのカードは収集されない（canActivateで判定）", () => {
      const cardId = 12345;
      const setThisTurn = createQuickPlaySpellInstance(cardId, "spell-0", "spellTrapZone", {
        placedThisTurn: true,
        position: "faceDown",
      });
      const state = createSpaceState({ spellTrapZone: [setThisTurn] });
      // セットしたターンはcanActivateがfalseを返す（実際のQuickPlaySpellActivationの動作）
      const action = new MockInvalidChainableAction(cardId, "Set This Turn", 2, "activation", "set-this-turn");
      ChainableActionRegistry.registerActivation(cardId, action);

      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      expect(result).toHaveLength(0);
    });

    it("表側表示のカードも収集できる（永続魔法・罠の効果発動）", () => {
      const cardId = 12345;
      const faceUpCard = createQuickPlaySpellInstance(cardId, "spell-0", "spellTrapZone", {
        placedThisTurn: false,
        position: "faceUp",
      });
      const state = createSpaceState({ spellTrapZone: [faceUpCard] });
      // 表側表示は「効果の発動」なので ignition を登録
      const action = new MockChainableAction(cardId, "Face Up Effect", 1, "ignition", "face-up-effect");
      ChainableActionRegistry.registerIgnition(cardId, action);

      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // 表側表示の永続魔法・罠の効果発動が収集される
      expect(result).toHaveLength(1);
      expect(result[0].instance).toBe(faceUpCard);
    });

    it("表側表示のカードはactivationが収集されない（カードの発動は不可）", () => {
      const cardId = 12345;
      const faceUpCard = createQuickPlaySpellInstance(cardId, "spell-0", "spellTrapZone", {
        placedThisTurn: false,
        position: "faceUp",
      });
      const state = createSpaceState({ spellTrapZone: [faceUpCard] });
      // 表側表示に activation を登録しても収集されない
      const action = new MockChainableAction(cardId, "Face Up", 2, "activation", "face-up");
      ChainableActionRegistry.registerActivation(cardId, action);

      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      // 表側表示では activation（カードの発動）は収集されない
      expect(result).toHaveLength(0);
    });

    it("requiredSpellSpeedで絞り込める", () => {
      const spellSpeed1CardId = 11111;
      const spellSpeed2CardId = 22222;
      const spell1 = createQuickPlaySpellInstance(spellSpeed1CardId, "hand-0", "hand");
      const spell2 = createQuickPlaySpellInstance(spellSpeed2CardId, "hand-1", "hand");
      const state = createSpaceState({ hand: [spell1, spell2] });

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

      // requiredSpellSpeed 2 で絞り込み
      const result = ChainableActionRegistry.collectChainableActions(state, 2);

      expect(result).toHaveLength(1);
      expect(result[0].instance.id).toBe(spellSpeed2CardId);
    });

    it("excludeInstanceIdsで除外できる", () => {
      const cardId1 = 11111;
      const cardId2 = 22222;
      const spell1 = createQuickPlaySpellInstance(cardId1, "hand-0", "hand");
      const spell2 = createQuickPlaySpellInstance(cardId2, "hand-1", "hand");
      const state = createSpaceState({ hand: [spell1, spell2] });

      ChainableActionRegistry.registerActivation(
        cardId1,
        new MockChainableAction(cardId1, "Spell 1", 2, "activation", "spell-1"),
      );
      ChainableActionRegistry.registerActivation(
        cardId2,
        new MockChainableAction(cardId2, "Spell 2", 2, "activation", "spell-2"),
      );

      // hand-0 を除外
      const excludeIds = new Set(["hand-0"]);
      const result = ChainableActionRegistry.collectChainableActions(state, 1, excludeIds);

      expect(result).toHaveLength(1);
      expect(result[0].instance.instanceId).toBe("hand-1");
    });

    it("canActivateがfalseの場合は収集されない", () => {
      const cardId = 12345;
      const quickPlaySpell = createQuickPlaySpellInstance(cardId, "hand-0", "hand");
      const state = createSpaceState({ hand: [quickPlaySpell] });

      // canActivateがfalseを返すアクション
      const invalidAction = new MockInvalidChainableAction(cardId, "Invalid", 2, "activation", "invalid");
      ChainableActionRegistry.registerActivation(cardId, invalidAction);

      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      expect(result).toHaveLength(0);
    });

    it("通常魔法は収集されない（spellSpeed 1 < requiredSpellSpeed 2）", () => {
      const cardId = 12345;
      const normalSpell = createNormalSpellInstance(cardId, "hand-0");
      const state = createSpaceState({ hand: [normalSpell] });

      // 通常魔法は spellSpeed 1
      const action = new MockChainableAction(cardId, "Normal Spell", 1, "activation", "normal");
      ChainableActionRegistry.registerActivation(cardId, action);

      // チェーンを組む場合は通常 requiredSpellSpeed >= 2
      const result = ChainableActionRegistry.collectChainableActions(state, 2);

      expect(result).toHaveLength(0);
    });

    it("効果が登録されていないカードは収集されない", () => {
      const quickPlaySpell = createQuickPlaySpellInstance(DUMMY_CARD_IDS.NOT_EXISTING_CARD, "hand-0", "hand");
      const state = createSpaceState({ hand: [quickPlaySpell] });
      // 効果を登録しない

      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      expect(result).toHaveLength(0);
    });

    it("複数のチェーン可能カードを収集できる", () => {
      const cardId1 = 11111;
      const cardId2 = 22222;
      const cardId3 = 33333;
      const handSpell = createQuickPlaySpellInstance(cardId1, "hand-0", "hand");
      const setSpell = createQuickPlaySpellInstance(cardId2, "spell-0", "spellTrapZone", {
        placedThisTurn: false,
        position: "faceDown",
      });
      const setTrap = createTrapInstance(cardId3, "trap-0", { placedThisTurn: false, position: "faceDown" });
      const state = createSpaceState({
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

      const result = ChainableActionRegistry.collectChainableActions(state, 1);

      expect(result).toHaveLength(3);
      const instanceIds = result.map((r) => r.instance.instanceId);
      expect(instanceIds).toContain("hand-0");
      expect(instanceIds).toContain("spell-0");
      expect(instanceIds).toContain("trap-0");
    });
  });

  describe("registerTrigger() / getTriggerEffects() / hasTriggerEffects()", () => {
    it("トリガー効果を登録できる", () => {
      const cardId = 12345;
      const action = new MockTriggerAction(cardId);
      ChainableActionRegistry.registerTrigger(cardId, action);

      const effects = ChainableActionRegistry.getTriggerEffects(cardId);
      expect(effects).toHaveLength(1);
      expect(effects[0]).toBe(action);
    });

    it("同じカードに複数のトリガー効果を登録できる", () => {
      const cardId = 12345;
      const action1 = new MockTriggerAction(cardId, ["spellActivated"]);
      const action2 = new MockTriggerAction(cardId, ["normalSummoned"]);
      ChainableActionRegistry.registerTrigger(cardId, action1);
      ChainableActionRegistry.registerTrigger(cardId, action2);

      expect(ChainableActionRegistry.getTriggerEffects(cardId)).toHaveLength(2);
    });

    it("トリガー効果がないカードは空配列を返す", () => {
      expect(ChainableActionRegistry.getTriggerEffects(DUMMY_CARD_IDS.NOT_EXISTING_CARD)).toEqual([]);
    });

    it("hasTriggerEffects()は未登録時にfalseを返す", () => {
      expect(ChainableActionRegistry.hasTriggerEffects(DUMMY_CARD_IDS.NOT_EXISTING_CARD)).toBe(false);
    });

    it("hasTriggerEffects()は登録済みの場合trueを返す", () => {
      const cardId = 12345;
      ChainableActionRegistry.registerTrigger(cardId, new MockTriggerAction(cardId));
      expect(ChainableActionRegistry.hasTriggerEffects(cardId)).toBe(true);
    });
  });

  describe("collectTriggerSteps()", () => {
    const makeEvent = (type: EventType = "spellActivated", sourceInstanceId = "other-instance"): GameEvent => ({
      type,
      sourceCardId: 99999,
      sourceInstanceId,
    });

    it("強制効果は mandatoryChainBlocks と mandatorySteps に収集される", () => {
      const cardId = 12345;
      ChainableActionRegistry.registerTrigger(cardId, new MockTriggerAction(cardId, ["spellActivated"], true));
      const card = createMonsterOnField("mainMonsterZone-0", { cardId });
      const state = createSpaceState({ mainMonsterZone: [card] });

      const result = ChainableActionRegistry.collectTriggerSteps(state, makeEvent("spellActivated"));

      expect(result.mandatoryChainBlocks).toHaveLength(1);
      expect(result.mandatoryChainBlocks[0].sourceInstanceId).toBe("mainMonsterZone-0");
      expect(result.mandatorySteps.length).toBeGreaterThan(0);
      expect(result.optionalEffects).toHaveLength(0);
    });

    it("任意効果は optionalEffects に収集される", () => {
      const cardId = 12345;
      ChainableActionRegistry.registerTrigger(cardId, new MockTriggerAction(cardId, ["spellActivated"], false));
      const card = createMonsterOnField("mainMonsterZone-0", { cardId });
      const state = createSpaceState({ mainMonsterZone: [card] });

      const result = ChainableActionRegistry.collectTriggerSteps(state, makeEvent("spellActivated"));

      expect(result.optionalEffects).toHaveLength(1);
      expect(result.optionalEffects[0].instance).toBe(card);
      expect(result.mandatoryChainBlocks).toHaveLength(0);
      expect(result.mandatorySteps).toHaveLength(0);
    });

    it("トリガーが一致しないイベントでは収集されない", () => {
      const cardId = 12345;
      ChainableActionRegistry.registerTrigger(cardId, new MockTriggerAction(cardId, ["spellActivated"], true));
      const state = createSpaceState({ mainMonsterZone: [createMonsterOnField("mainMonsterZone-0", { cardId })] });

      const result = ChainableActionRegistry.collectTriggerSteps(state, makeEvent("normalSummoned"));

      expect(result.mandatoryChainBlocks).toHaveLength(0);
      expect(result.mandatorySteps).toHaveLength(0);
      expect(result.optionalEffects).toHaveLength(0);
    });

    it("裏側表示のカードは収集されない", () => {
      const cardId = 12345;
      ChainableActionRegistry.registerTrigger(cardId, new MockTriggerAction(cardId, ["spellActivated"], true));
      const faceDownCard: CardInstance = {
        ...createMonsterOnField("mainMonsterZone-0", { cardId }),
        stateOnField: {
          slotIndex: 0,
          position: "faceDown",
          placedThisTurn: false,
          counters: [],
          activatedEffects: [],
        },
      };
      const state = createSpaceState({ mainMonsterZone: [faceDownCard] });

      const result = ChainableActionRegistry.collectTriggerSteps(state, makeEvent("spellActivated"));

      expect(result.mandatoryChainBlocks).toHaveLength(0);
      expect(result.mandatorySteps).toHaveLength(0);
    });

    it("複数カードの強制効果をまとめて収集できる", () => {
      const cardId = 12345;
      ChainableActionRegistry.registerTrigger(cardId, new MockTriggerAction(cardId, ["spellActivated"], true));
      const state = createSpaceState({
        mainMonsterZone: [
          createMonsterOnField("mainMonsterZone-0", { cardId }),
          createMonsterOnField("mainMonsterZone-1", { cardId }),
        ],
      });

      const result = ChainableActionRegistry.collectTriggerSteps(state, makeEvent("spellActivated"));

      expect(result.mandatoryChainBlocks).toHaveLength(2);
      expect(result.mandatoryChainBlocks.map((b) => b.sourceInstanceId)).toEqual([
        "mainMonsterZone-0",
        "mainMonsterZone-1",
      ]);
    });
  });
});
