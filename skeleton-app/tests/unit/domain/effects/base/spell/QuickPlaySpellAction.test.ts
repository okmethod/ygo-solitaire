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
import { createInitialGameState, type InitialDeckCardIds } from "$lib/domain/models/GameStateOld";
import type { GameState } from "$lib/domain/models/GameStateOld";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import {
  successValidationResult,
  failureValidationResult,
  ValidationErrorCode,
} from "$lib/domain/models/ValidationResult";

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

  protected individualConditions(state: GameState, _sourceInstance: CardInstance): ValidationResult {
    // Test implementation: check hand size
    if (state.zones.hand.length > 0) {
      return successValidationResult();
    }
    return failureValidationResult(ValidationErrorCode.ACTIVATION_CONDITIONS_NOT_MET);
  }

  protected individualActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
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
      const baseState = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const handCard: CardInstance = {
        ...baseState.zones.deck[0],
        instanceId: "hand-0",
        location: "hand",
      };
      const stateInMain1: GameState = {
        ...baseState,
        phase: "Main1",
        zones: {
          ...baseState.zones,
          hand: [handCard],
        },
      };
      const sourceInstance = createDummyCardInstance({ location: "hand" });

      // Act & Assert
      expect(action.canActivate(stateInMain1, sourceInstance).isValid).toBe(true);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw (QuickPlaySpellAction固有のフェーズ制約テスト)
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
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
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const emptyHandState: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
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
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
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
