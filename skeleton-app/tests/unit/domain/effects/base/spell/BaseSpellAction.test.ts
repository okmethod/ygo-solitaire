/**
 * BaseSpellAction Tests
 *
 * Tests for BaseSpellAction abstract class.
 *
 * Test Coverage:
 * - ChainableAction interface properties (isCardActivation, spellSpeed)
 * - canActivate() common conditions (game over check)
 * - createActivationSteps() default implementation
 * - Abstract methods must be implemented by subclasses
 *
 * @module tests/unit/domain/effects/base/spell/BaseSpellAction
 */

import { describe, it, expect } from "vitest";
import { BaseSpellAction } from "$lib/domain/effects/base/spell/BaseSpellAction";
import { createInitialGameState } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";
import type { EffectResolutionStep } from "$lib/domain/models/EffectResolutionStep";

/**
 * Concrete implementation of BaseSpellAction for testing
 */
class TestSpellAction extends BaseSpellAction {
  readonly spellSpeed = 1 as const;

  protected additionalActivationConditions(state: GameState): boolean {
    // Test implementation: always true
    return state.zones.deck.length > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createResolutionSteps(_state: GameState, _instanceId: string): EffectResolutionStep[] {
    return [];
  }

  protected getCardId(): string {
    return "12345678";
  }

  protected getCardName(): string {
    return "Test Spell";
  }

  protected getActivationDescription(): string {
    return "テストスペルを発動します";
  }
}

describe("BaseSpellAction", () => {
  const action = new TestSpellAction();

  describe("ChainableAction interface properties", () => {
    it("should be a card activation", () => {
      expect(action.isCardActivation).toBe(true);
    });

    it("should have spell speed defined by subclass", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when game is not over and additional conditions are met", () => {
      // Arrange: Game not over, deck has cards
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

    it("should return false when additional conditions are not met", () => {
      // Arrange: Deck is empty (additionalActivationConditions returns false)
      const state = createInitialGameState([]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return default activation step with card info", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("12345678-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("テストスペルを発動します");
      expect(steps[0].notificationLevel).toBe("info");
    });

    it("should return step with action that does not modify state", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const steps = action.createActivationSteps(state);

      // Act
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newState).toBe(state);
      expect(result.message).toBe("Test Spell activated");
    });
  });

  describe("Abstract methods", () => {
    it("should implement createResolutionSteps()", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);

      // Act
      const steps = action.createResolutionSteps(state, "test-instance");

      // Assert
      expect(steps).toBeDefined();
      expect(Array.isArray(steps)).toBe(true);
    });

    it("should implement getCardId()", () => {
      // Act & Assert
      expect(action["getCardId"]()).toBe("12345678");
    });

    it("should implement getCardName()", () => {
      // Act & Assert
      expect(action["getCardName"]()).toBe("Test Spell");
    });

    it("should implement getActivationDescription()", () => {
      // Act & Assert
      expect(action["getActivationDescription"]()).toBe("テストスペルを発動します");
    });
  });
});
