/**
 * NormalSpellActivation のテスト
 *
 * 通常魔法発動の抽象クラスのテスト。
 * BaseSpellActivation を継承した subTypeConditions（メインフェイズ制約）を検証する。
 *
 * TEST STRATEGY:
 * - spellSpeed = 1 であること
 * - メインフェイズ以外では発動不可であること
 * - 追加条件（individualConditions）が満たされない場合に発動不可であること
 */

import { describe, it, expect } from "vitest";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { CardDataRegistry } from "$lib/domain/cards";
import { createTestInitialDeck } from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestNormalSpell extends NormalSpellActivation {
  constructor() {
    super(12345678); // Test Monster 2 from CardDataRegistry
  }

  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // Test implementation: check deck size
    if (state.space.mainDeck.length >= 2) {
      return GameProcessing.Validation.success();
    }
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.INSUFFICIENT_DECK);
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }
}

describe("NormalSpellActivation", () => {
  const action = new TestNormalSpell();

  describe("ChainableAction interface properties", () => {
    it("should have effect category = 'activation'", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("should have spell speed 1", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met (Main Phase + additional conditions)", () => {
      // Arrange: Main Phase 1, Deck >= 2
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), CardDataRegistry.getCard, {
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

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw (NormalSpellActivation固有のフェーズ制約テスト)
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), CardDataRegistry.getCard, {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state, state.space.hand[0]).isValid).toBe(false);
    });

    it("should return false when additional conditions are not met", () => {
      // Arrange: Deck has only 1 card (additionalActivationConditions returns false)
      const state = GameState.initialize(createTestInitialDeck([1001]), CardDataRegistry.getCard, {
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
      id: 12345678,
      instanceId: "test-normal-spell-1",
      jaName: "Test Monster A",
      type: "spell",
      frameType: "spell",
      spellType: "normal",
      edition: "latest" as const,
      location: "hand",
    });

    it("should return default activation step", () => {
      // Arrange
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), CardDataRegistry.getCard, {
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
      expect(steps[0].description).toBe("《Test Monster A》を発動します");
      expect(steps[1].id).toBe("emit-spell-activated-test-normal-spell-1");
    });
  });
});
