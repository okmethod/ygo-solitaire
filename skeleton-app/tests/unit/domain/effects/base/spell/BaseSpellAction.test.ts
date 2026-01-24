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
 * TEST STRATEGY: Base Class テストでは全サブクラス共通のルール（ゲームオーバーチェック等）をテスト。
 * Subclass テストでは、各サブクラス固有の条件（フェーズ制約、追加発動条件）のみをテストする。
 * これにより、重複を避け、テストの保守性を向上させる。
 *
 * @module tests/unit/domain/effects/base/spell/BaseSpellAction
 */

import { describe, it, expect } from "vitest";
import { BaseSpellAction } from "$lib/domain/effects/base/spell/BaseSpellAction";
import { createInitialGameState, type InitialDeckCardIds } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";

/** テスト用ヘルパー: カードID配列をInitialDeckCardIdsに変換 */
function createTestInitialDeck(mainDeckCardIds: number[]): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds: [] };
}

/**
 * Concrete implementation of BaseSpellAction for testing
 */
class TestSpellAction extends BaseSpellAction {
  readonly spellSpeed = 1 as const;

  constructor() {
    super(12345678); // Test card ID from registry
  }

  protected additionalActivationConditions(state: GameState): boolean {
    // Test implementation: always true
    return state.zones.deck.length > 0;
  }

  createResolutionSteps(_state: GameState, _instanceId: string): AtomicStep[] {
    return [];
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

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
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
      const state = createInitialGameState(createTestInitialDeck([]), { skipShuffle: true, skipInitialDraw: true });
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
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("12345678-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《Test Monster A》を発動します"); // Uses getCardNameWithBrackets from registry
      expect(steps[0].notificationLevel).toBe("info");
    });

    it("should return step with action that does not modify state", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const steps = action.createActivationSteps(state);

      // Act
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState).toBe(state);
      expect(result.message).toBe("Test Monster A activated"); // Uses jaName from registry
    });
  });

  describe("Abstract methods", () => {
    it("should implement createResolutionSteps()", () => {
      // Arrange
      const state = createInitialGameState(createTestInitialDeck([1001, 1002, 1003]), {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      // Act
      const steps = action.createResolutionSteps(state, "test-instance");

      // Assert
      expect(steps).toBeDefined();
      expect(Array.isArray(steps)).toBe(true);
    });
  });
});
