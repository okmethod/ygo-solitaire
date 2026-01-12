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
 * @module tests/unit/domain/effects/base/spell/NormalSpellAction
 */

import { describe, it, expect } from "vitest";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { createInitialGameState, type InitialDeckCardIds } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";
import type { EffectResolutionStep } from "$lib/domain/models/EffectResolutionStep";

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

  protected additionalActivationConditions(state: GameState): boolean {
    // Test implementation: check deck size
    return state.zones.deck.length >= 2;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createResolutionSteps(_state: GameState, _instanceId: string): EffectResolutionStep[] {
    return [];
  }
}

describe("NormalSpellAction", () => {
  const action = new TestNormalSpell();

  describe("ChainableAction interface properties", () => {
    it("should be a card activation", () => {
      expect(action.isCardActivation).toBe(true);
    });

    it("should have spell speed 1", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met (Main Phase + additional conditions)", () => {
      // Arrange: Main Phase 1, Deck >= 2
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]));
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw (NormalSpellAction固有のフェーズ制約テスト)
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]));
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when additional conditions are not met", () => {
      // Arrange: Deck has only 1 card (additionalActivationConditions returns false)
      const state = createInitialGameState(createTestInitialDeck([1001]));
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
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
