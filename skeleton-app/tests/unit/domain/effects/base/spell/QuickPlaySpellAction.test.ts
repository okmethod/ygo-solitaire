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
 * @module tests/unit/domain/effects/base/spell/QuickPlaySpellAction
 */

import { describe, it, expect } from "vitest";
import { QuickPlaySpellAction } from "$lib/domain/effects/base/spell/QuickPlaySpellAction";
import { createInitialGameState, type InitialDeckCardIds } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";
import type { EffectResolutionStep } from "$lib/domain/models/EffectResolutionStep";

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

  protected additionalActivationConditions(state: GameState): boolean {
    // Test implementation: check hand size
    return state.zones.hand.length > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createResolutionSteps(_state: GameState, _instanceId: string): EffectResolutionStep[] {
    return [];
  }
}

describe("QuickPlaySpellAction", () => {
  const action = new TestQuickPlaySpell();

  describe("ChainableAction interface properties", () => {
    it("should be a card activation", () => {
      expect(action.isCardActivation).toBe(true);
    });

    it("should have spell speed 2", () => {
      expect(action.spellSpeed).toBe(2);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met (Main Phase + additional conditions)", () => {
      // Arrange: Main Phase 1, Hand not empty
      const baseState = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]));
      const stateInMain1: GameState = {
        ...baseState,
        phase: "Main1",
        zones: {
          ...baseState.zones,
          hand: [
            {
              ...baseState.zones.deck[0],
              instanceId: "hand-0",
              location: "hand",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw (QuickPlaySpellAction固有のフェーズ制約テスト)
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]));
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when additional conditions are not met", () => {
      // Arrange: Hand is empty (additionalActivationConditions returns false)
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]));
      const emptyHandState: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          hand: [],
        },
      };

      // Act & Assert
      expect(action.canActivate(emptyHandState)).toBe(false);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return default activation step", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]));

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("12345678-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《Test Monster A》を発動します");
    });
  });
});
