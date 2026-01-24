/**
 * FieldSpellAction Tests
 *
 * Tests for FieldSpellAction abstract class.
 *
 * Test Coverage:
 * - ChainableAction interface properties (spellSpeed = 1)
 * - canActivate() Field Spell conditions (Main Phase check)
 * - Inherits BaseSpellAction behavior
 *
 * @module tests/unit/domain/effects/actions/spells/FieldSpellAction
 */

import { describe, it, expect } from "vitest";
import { FieldSpellAction } from "$lib/domain/effects/actions/spells/FieldSpellAction";
import { createInitialGameState, type InitialDeckCardIds } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";

/** テスト用ヘルパー: カードID配列をInitialDeckCardIdsに変換 */
function createTestInitialDeck(mainDeckCardIds: number[]): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds: [] };
}

/**
 * Concrete implementation of FieldSpellAction for testing
 */
class TestFieldSpell extends FieldSpellAction {
  constructor() {
    super(12345678); // Test Monster 2 from CardDataRegistry
  }

  protected individualConditions(_state: GameState): boolean {
    // Test implementation: always true (no additional conditions)
    return true;
  }

  protected subTypePreActivationSteps(_state: GameState): AtomicStep[] {
    return [];
  }

  protected individualActivationSteps(_state: GameState): AtomicStep[] {
    return [];
  }

  protected subTypePostActivationSteps(_state: GameState): AtomicStep[] {
    return [];
  }

  protected subTypePreResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameState, _instanceId: string): AtomicStep[] {
    // Field Spells typically have no resolution steps (only continuous effects)
    return [];
  }

  protected subTypePostResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return [];
  }
}

describe("FieldSpellAction", () => {
  const action = new TestFieldSpell();

  describe("ChainableAction interface properties", () => {
    it("should be a card activation", () => {
      expect(action.isCardActivation).toBe(true);
    });

    it("should have spell speed 1", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met (Main Phase + no additional conditions required)", () => {
      // Arrange: Main Phase 1
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw (FieldSpellAction固有のフェーズ制約テスト)
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return true even with empty deck (no additional conditions)", () => {
      // Arrange: Main Phase 1, empty deck (Field Spells have no additional conditions)
      const state = createInitialGameState(createTestInitialDeck([]), { skipShuffle: true, skipInitialDraw: true });
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return only notification step (field spells have no additional activation steps)", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      // Act
      const steps = action.createActivationSteps(state);

      // Assert: Field Spells have only notification step (placement handled by ActivateSpellCommand)
      expect(steps).toHaveLength(1);
      expect(steps[0].summary).toBe("カード発動");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return empty array (field spells have no resolution steps)", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      // Act
      const steps = action.createResolutionSteps(state, "test-instance");

      // Assert
      expect(steps).toEqual([]);
    });
  });
});
