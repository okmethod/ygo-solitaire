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
 * @module tests/unit/domain/effects/base/spell/FieldSpellAction
 */

import { describe, it, expect } from "vitest";
import { FieldSpellAction } from "$lib/domain/effects/base/spell/FieldSpellAction";
import { createInitialGameState } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";
import type { EffectResolutionStep } from "$lib/domain/models/EffectResolutionStep";

/**
 * Concrete implementation of FieldSpellAction for testing
 */
class TestFieldSpell extends FieldSpellAction {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected additionalActivationConditions(_state: GameState): boolean {
    // Test implementation: always true (no additional conditions)
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createResolutionSteps(_state: GameState, _instanceId: string): EffectResolutionStep[] {
    // Field Spells typically have no resolution steps (only continuous effects)
    return [];
  }

  protected getCardId(): string {
    return "67616300";
  }

  protected getCardName(): string {
    return "Test Field Spell";
  }

  protected getActivationDescription(): string {
    return "テストフィールド魔法を発動します";
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
    it("should return true when all conditions are met", () => {
      // Arrange: Game not over, Main Phase 1
      const state = createInitialGameState([1001, 1002, 1003]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const state = createInitialGameState([1001, 1002, 1003]);
      const gameOverState: GameState = {
        ...state,
        phase: "Main1",
        result: {
          isGameOver: true,
          winner: "player",
          reason: "exodia",
        },
      };

      // Act & Assert
      expect(action.canActivate(gameOverState)).toBe(false);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw
      const state = createInitialGameState([1001, 1002, 1003]);
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state)).toBe(false);
    });

    it("should return false when phase is Standby", () => {
      // Arrange: Phase is Standby
      const state = createInitialGameState([1001, 1002, 1003]);
      const standbyState: GameState = {
        ...state,
        phase: "Standby",
      };

      // Act & Assert
      expect(action.canActivate(standbyState)).toBe(false);
    });

    it("should return true even without additional conditions", () => {
      // Arrange: Main Phase 1, no additional conditions
      const state = createInitialGameState([]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert (Field Spells can be activated without additional conditions)
      expect(action.canActivate(stateInMain1)).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return default activation step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("67616300-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("テストフィールド魔法を発動します");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return empty array (field spells have no resolution steps)", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);

      // Act
      const steps = action.createResolutionSteps(state, "test-instance");

      // Assert
      expect(steps).toEqual([]);
    });
  });
});
