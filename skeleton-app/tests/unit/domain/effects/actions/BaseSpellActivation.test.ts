/**
 * BaseSpellActivation のテスト
 *
 * 魔法発動の抽象基底クラスのテスト。
 * Template Methodパターンの動作を検証する。
 *
 * TEST STRATEGY:
 * - Base Class テストでは Template Method パターンの動作をテスト
 * - Subclass テストでは各サブクラス固有の条件（subTypeConditions, individualConditions）をテスト
 * - ゲームオーバーチェック等のコマンドレベルの条件は ActivateSpellCommand でテスト
 */

import { describe, it, expect } from "vitest";
import { BaseSpellActivation } from "$lib/domain/effects/actions/activations/BaseSpellActivation";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { CardDataRegistry } from "$lib/domain/cards";
import { createTestInitialDeck, TEST_CARD_IDS } from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestSpellAction extends BaseSpellActivation {
  readonly spellSpeed = 1 as const;

  constructor() {
    super(TEST_CARD_IDS.DUMMY);
  }

  protected subTypeConditions(_state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // Test implementation: no subtype restrictions
    return GameProcessing.Validation.success();
  }

  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // Test implementation: check deck has cards
    if (state.space.mainDeck.length > 0) {
      return GameProcessing.Validation.success();
    }
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.INSUFFICIENT_DECK);
  }

  protected subTypePreActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected subTypePostActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected subTypePreResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected subTypePostResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }
}

describe("BaseSpellActivation", () => {
  const action = new TestSpellAction();

  describe("ChainableAction interface properties", () => {
    it("should have effect category = 'activation'", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("should have spell speed defined by subclass", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when subtype conditions and individual conditions are met", () => {
      // Arrange: Deck has cards (individualConditions returns true)
      const state = GameState.initialize(
        createTestInitialDeck([TEST_CARD_IDS.SPELL_NORMAL, TEST_CARD_IDS.SPELL_EQUIP, TEST_CARD_IDS.SPELL_QUICK]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );
      const stateInMain1: GameSnapshot = {
        ...state,
        phase: "main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1, stateInMain1.space.hand[0]).isValid).toBe(true);
    });

    it("should return false when individual conditions are not met", () => {
      // Arrange: Deck is empty (individualConditions returns false)
      const state = GameState.initialize(createTestInitialDeck([]), CardDataRegistry.getCard, {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const stateInMain1: GameSnapshot = {
        ...state,
        phase: "main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1, stateInMain1.space.hand[0]).isValid).toBe(false);
    });
  });

  describe("createActivationSteps()", () => {
    // テスト用の sourceInstance を作成するヘルパー
    const createTestSourceInstance = (): CardInstance => ({
      id: TEST_CARD_IDS.DUMMY,
      instanceId: "test-instance-1",
      jaName: "Test Monster A",
      type: "spell",
      frameType: "spell",
      edition: "latest" as const,
      location: "hand",
    });

    it("should return default activation step with card info", () => {
      // Arrange
      const state = GameState.initialize(
        createTestInitialDeck([TEST_CARD_IDS.SPELL_NORMAL, TEST_CARD_IDS.SPELL_EQUIP, TEST_CARD_IDS.SPELL_QUICK]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );
      const sourceInstance = createTestSourceInstance();

      // Act
      const steps = action.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(2); // notifyActivationStep + emitSpellActivatedEventStep
      expect(steps[0].id).toBe(`${TEST_CARD_IDS.DUMMY}-activation-notification`);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《Test Monster A》を発動します"); // Uses getCardNameWithBrackets from registry
      expect(steps[0].notificationLevel).toBe("static");
      // イベント発行ステップの検証
      expect(steps[1].id).toBe("emit-spell-activated-test-instance-1");
      expect(steps[1].notificationLevel).toBe("silent");
    });

    it("should return step with action that does not modify state", () => {
      // Arrange
      const state = GameState.initialize(
        createTestInitialDeck([TEST_CARD_IDS.SPELL_NORMAL, TEST_CARD_IDS.SPELL_EQUIP, TEST_CARD_IDS.SPELL_QUICK]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );
      const sourceInstance = createTestSourceInstance();
      const steps = action.createActivationSteps(state, sourceInstance);

      // Act
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState).toStrictEqual(state);
      expect(result.message).toBe("《Test Monster A》 activated"); // Uses jaName from registry
    });
  });

  describe("Abstract methods", () => {
    it("should implement createResolutionSteps()", () => {
      // Arrange
      const state = GameState.initialize(
        createTestInitialDeck([TEST_CARD_IDS.SPELL_NORMAL, TEST_CARD_IDS.SPELL_EQUIP, TEST_CARD_IDS.SPELL_QUICK]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      // Act
      const steps = action.createResolutionSteps(state, state.space.hand[0]);

      // Assert
      expect(steps).toBeDefined();
      expect(Array.isArray(steps)).toBe(true);
    });
  });
});
