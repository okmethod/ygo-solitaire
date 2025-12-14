/**
 * SpellEffect Tests - Unit Tests for SpellEffect base class
 *
 * Tests the common validation logic shared by all spell card effects.
 * Focuses on game-over check validation (Template Method Pattern).
 *
 * Test Responsibility:
 * - canActivate() game-over validation (common to ALL spells)
 *
 * Test Architecture:
 * - **Unit Test**: Tests SpellEffect base class in isolation
 * - **Integration Test**: Card-specific scenarios in tests/integration/CardEffects.test.ts
 *
 * @module tests/unit/domain/effects/bases/SpellEffect
 */

import { describe, it, expect } from "vitest";
import { SpellEffect } from "$lib/domain/effects/bases/SpellEffect";
import { createMockGameState } from "$lib/__testUtils__/gameStateFactory";
import type { GameState } from "$lib/domain/models/GameState";
import type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";

/**
 * Concrete test implementation of SpellEffect
 * (SpellEffect is abstract, so we need a test double)
 */
class TestSpellEffect extends SpellEffect {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected canActivateSpell(_state: GameState): boolean {
    // Test double: Always return true for spell-specific validation
    // (We only test the game-over check in this file)
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createSteps(_state: GameState, _activatedCardInstanceId: string): EffectResolutionStep[] {
    // Test double: Return empty array
    return [];
  }
}

describe("SpellEffect", () => {
  describe("canActivate() - Game-over validation", () => {
    it("should return false when game is over (victory)", () => {
      // Arrange: Game is over (Exodia victory)
      const state = createMockGameState({
        phase: "Main1",
        result: {
          isGameOver: true,
          winner: "player",
        },
      });

      const effect = new TestSpellEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Cannot activate when game is over
      expect(result).toBe(false);
    });

    it("should return false when game is over (defeat)", () => {
      // Arrange: Game is over (deck-out defeat)
      const state = createMockGameState({
        phase: "Main1",
        result: {
          isGameOver: true,
          winner: "opponent",
        },
      });

      const effect = new TestSpellEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Cannot activate when game is over
      expect(result).toBe(false);
    });

    it("should return true when game is not over", () => {
      // Arrange: Game is not over
      const state = createMockGameState({
        phase: "Main1",
        result: {
          isGameOver: false,
          winner: null,
        },
      });

      const effect = new TestSpellEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Can activate when game is not over
      // (TestSpellEffect.canActivateSpell() returns true)
      expect(result).toBe(true);
    });
  });
});
