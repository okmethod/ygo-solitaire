/**
 * QuickPlaySpellAction Tests
 *
 * Tests for QuickPlaySpellAction abstract class.
 *
 * Test Coverage:
 * - ChainableAction interface properties (spellSpeed = 2)
 * - canActivate() Quick-Play Spell conditions (Main Phase check for current scope)
 * - Inherits BaseSpellAction behavior
 *
 * @module tests/unit/domain/effects/actions/spells/QuickPlaySpellAction
 */

import { describe, it, expect } from "vitest";
import { QuickPlaySpellAction } from "$lib/domain/effects/actions/activations/QuickPlaySpellAction";
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
 * Concrete implementation of QuickPlaySpellAction for testing
 */
class TestQuickPlaySpell extends QuickPlaySpellAction {
  constructor() {
    super(12345678); // Test Monster 2 from CardDataRegistry
  }

  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // Test implementation: check hand size
    if (state.space.hand.length > 0) {
      return GameProcessing.Validation.success();
    }
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }
}

/** テスト用ダミー CardInstance */
function createDummyCardInstance(overrides: Partial<CardInstance> = {}): CardInstance {
  return {
    id: 12345678,
    instanceId: "test-instance-0",
    enName: "Test Card",
    jaName: "テストカード",
    type: "spell",
    spellType: "quick-play",
    frameType: "spell",
    location: "hand",
    position: "faceUp",
    placedThisTurn: false,
    ...overrides,
  } as CardInstance;
}

describe("QuickPlaySpellAction", () => {
  const action = new TestQuickPlaySpell();

  describe("ChainableAction interface properties", () => {
    it("should have effect category = 'activation'", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("should have spell speed 2", () => {
      expect(action.spellSpeed).toBe(2);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met (Main Phase + additional conditions)", () => {
      // Arrange: Main Phase 1, Hand not empty
      const baseState = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const handCard: CardInstance = {
        ...baseState.space.mainDeck[0],
        instanceId: "hand-0",
        location: "hand",
      };
      const stateInMain1: GameSnapshot = {
        ...baseState,
        phase: "main1",
        space: {
          ...baseState.space,
          hand: [handCard],
        },
      };
      const sourceInstance = createDummyCardInstance({ location: "hand" });

      // Act & Assert
      expect(action.canActivate(stateInMain1, sourceInstance).isValid).toBe(true);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw (QuickPlaySpellAction固有のフェーズ制約テスト)
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const sourceInstance = createDummyCardInstance({ location: "hand" });
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state, sourceInstance).isValid).toBe(false);
    });

    it("should return false when additional conditions are not met", () => {
      // Arrange: Hand is empty (additionalActivationConditions returns false)
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const emptyHandState: GameSnapshot = {
        ...state,
        phase: "main1",
        space: {
          ...state.space,
          hand: [],
        },
      };
      const sourceInstance = createDummyCardInstance({ location: "hand" });

      // Act & Assert
      expect(action.canActivate(emptyHandState, sourceInstance).isValid).toBe(false);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return default activation step", () => {
      // Arrange
      const state = GameState.initialize(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const sourceInstance = createDummyCardInstance();

      // Act
      const steps = action.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(2); // notifyActivationStep + emitSpellActivatedEventStep
      expect(steps[0].id).toBe("12345678-activation-notification");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《Test Monster A》を発動します");
      expect(steps[1].id).toContain("emit-spell-activated-");
    });
  });
});
