/**
 * NormalSpellAction Tests
 *
 * Tests for NormalSpellAction abstract class.
 *
 * Test Coverage:
 * - ChainableAction interface properties (spellSpeed = 1)
 * - canActivate() Normal Spell conditions (Main Phase check)
 * - Inherits BaseSpellAction behavior
 *
 * @module tests/unit/domain/effects/actions/spells/NormalSpellAction
 */

import { describe, it, expect } from "vitest";
import { NormalSpellAction } from "$lib/domain/effects/actions/activations/NormalSpellAction";
import { createInitialGameState, type InitialDeckCardIds } from "$lib/domain/models/GameStateOld";
import type { GameState } from "$lib/domain/models/GameStateOld";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { CardInstance } from "$lib/domain/models/CardOld";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/** テスト用ヘルパー: カードID配列をInitialDeckCardIdsに変換 */
function createTestInitialDeck(mainDeckCardIds: number[]): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds: [] };
}

/**
 * Concrete implementation of NormalSpellAction for testing
 */
class TestNormalSpell extends NormalSpellAction {
  constructor() {
    super(12345678); // Test Monster 2 from CardDataRegistry
  }

  protected individualConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
    // Test implementation: check deck size
    if (state.zones.deck.length >= 2) {
      return GameProcessing.Validation.success();
    }
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.INSUFFICIENT_DECK);
  }

  protected individualActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }
}

describe("NormalSpellAction", () => {
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
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1, stateInMain1.zones.hand[0]).isValid).toBe(true);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw (NormalSpellAction固有のフェーズ制約テスト)
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state, state.zones.hand[0]).isValid).toBe(false);
    });

    it("should return false when additional conditions are not met", () => {
      // Arrange: Deck has only 1 card (additionalActivationConditions returns false)
      const state = createInitialGameState(createTestInitialDeck([1001]), { skipShuffle: true, skipInitialDraw: true });
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1, stateInMain1.zones.hand[0]).isValid).toBe(false);
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
      location: "hand",
    });

    it("should return default activation step", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
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
