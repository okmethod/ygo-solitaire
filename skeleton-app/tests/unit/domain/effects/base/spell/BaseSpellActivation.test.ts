/**
 * BaseSpellActivation Tests
 *
 * Tests for BaseSpellActivation abstract class.
 *
 * Test Coverage:
 * - ChainableAction interface properties (isCardActivation, spellSpeed)
 * - canActivate() Template Method pattern (delegates to subTypeConditions and individualConditions)
 * - createActivationSteps() default implementation
 * - Abstract methods must be implemented by subclasses
 *
 * TEST STRATEGY: Base Class テストでは Template Method パターンの動作をテスト。
 * Subclass テストでは、各サブクラス固有の条件（subTypeConditions, individualConditions）をテストする。
 * ゲームオーバーチェック等のコマンドレベルの条件は ActivateSpellCommand でテストする。
 *
 * @module tests/unit/domain/effects/actions/spells/BaseSpellActivation
 */

import { describe, it, expect } from "vitest";
import { BaseSpellActivation } from "$lib/domain/effects/actions/activations/BaseSpellActivation";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot, InitialDeckCardIds } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/** テスト用ヘルパー: カードID配列をInitialDeckCardIdsに変換 */
function createTestInitialDeck(mainDeckCardIds: number[]): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds: [] };
}

/**
 * Concrete implementation of BaseSpellActivation for testing
 */
class TestSpellAction extends BaseSpellActivation {
  readonly spellSpeed = 1 as const;

  constructor() {
    super(12345678); // Test card ID from registry
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
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const stateInMain1: GameSnapshot = {
        ...state,
        phase: "main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1, stateInMain1.space.hand[0]).isValid).toBe(true);
    });

    it("should return false when individual conditions are not met", () => {
      // Arrange: Deck is empty (individualConditions returns false)
      const state = GameState.initialize(createTestInitialDeck([]), { skipShuffle: true, skipInitialDraw: true });
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
      id: 12345678,
      instanceId: "test-instance-1",
      jaName: "Test Monster A",
      type: "spell",
      frameType: "spell",
      location: "hand",
    });

    it("should return default activation step with card info", () => {
      // Arrange
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const sourceInstance = createTestSourceInstance();

      // Act
      const steps = action.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(2); // notifyActivationStep + emitSpellActivatedEventStep
      expect(steps[0].id).toBe("12345678-activation-notification");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《Test Monster A》を発動します"); // Uses getCardNameWithBrackets from registry
      expect(steps[0].notificationLevel).toBe("info");
      // イベント発行ステップの検証
      expect(steps[1].id).toBe("emit-spell-activated-test-instance-1");
      expect(steps[1].notificationLevel).toBe("silent");
    });

    it("should return step with action that does not modify state", () => {
      // Arrange
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
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
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      // Act
      const steps = action.createResolutionSteps(state, state.space.hand[0]);

      // Assert
      expect(steps).toBeDefined();
      expect(Array.isArray(steps)).toBe(true);
    });
  });
});
