/**
 * NormalSpellEffect Tests - Unit Tests for NormalSpellEffect base class
 *
 * Tests the common validation logic shared by all Normal Spell card effects.
 * Focuses on phase validation and automatic graveyard-sending step generation.
 *
 * Test Responsibility:
 * - canActivateSpell() phase validation (Main1 only)
 * - createSteps() automatic graveyard step appending
 *
 * Test Architecture:
 * - **Unit Test**: Tests NormalSpellEffect base class in isolation
 * - **Integration Test**: Card-specific scenarios in tests/integration/CardEffects.test.ts
 *
 * @module tests/unit/domain/effects/bases/NormalSpellEffect
 */

import { describe, it, expect } from "vitest";
import { NormalSpellEffect } from "$lib/domain/effects/bases/NormalSpellEffect";
import { createMockGameState } from "$lib/__testUtils__/gameStateFactory";
import type { GameState } from "$lib/domain/models/GameState";
import type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";

/**
 * Concrete test implementation of NormalSpellEffect
 * (NormalSpellEffect is abstract, so we need a test double)
 */
class TestNormalSpellEffect extends NormalSpellEffect {
  protected canActivateNormalSpell(state: GameState): boolean {
    // Test double: Always return true for card-specific validation
    // (We only test the phase check and graveyard step in this file)
    return true;
  }

  protected createCardSteps(state: GameState): EffectResolutionStep[] {
    // Test double: Return a single mock card step
    return [
      {
        id: "test-card-step",
        title: "テストステップ",
        message: "テストカード効果",
        action: (currentState: GameState) => ({
          success: true,
          newState: currentState,
          message: "Test step executed",
        }),
      },
    ];
  }
}

describe("NormalSpellEffect", () => {
  describe("canActivateSpell() - Phase validation", () => {
    it("should return false when phase is not Main1", () => {
      // Arrange: End Phase (not Main1)
      const state = createMockGameState({
        phase: "End",
        result: {
          isGameOver: false,
          winner: null,
        },
      });

      const effect = new TestNormalSpellEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Cannot activate during End Phase
      expect(result).toBe(false);
    });

    it("should return true when phase is Main1", () => {
      // Arrange: Main1 Phase
      const state = createMockGameState({
        phase: "Main1",
        result: {
          isGameOver: false,
          winner: null,
        },
      });

      const effect = new TestNormalSpellEffect();

      // Act
      const result = effect.canActivate(state);

      // Assert: Can activate during Main1 Phase
      // (TestNormalSpellEffect.canActivateNormalSpell() returns true)
      expect(result).toBe(true);
    });
  });

  describe("createSteps() - Automatic graveyard step appending", () => {
    it("should automatically append graveyard-sending step to card steps", () => {
      // Arrange
      const effect = new TestNormalSpellEffect();
      const state = createMockGameState({
        phase: "Main1",
      });
      const activatedCardInstanceId = "test-card-instance-1";

      // Act
      const steps = effect.createSteps(state, activatedCardInstanceId);

      // Assert: Should have 2 steps (1 card step + 1 graveyard step)
      expect(steps).toHaveLength(2);

      // First step: Card-specific step (from createCardSteps())
      expect(steps[0]).toMatchObject({
        id: "test-card-step",
        title: "テストステップ",
        message: "テストカード効果",
      });
      expect(steps[0].action).toBeTypeOf("function");

      // Second step: Graveyard-sending step (automatically appended)
      expect(steps[1]).toMatchObject({
        id: "TestNormalSpellEffect-to-graveyard",
        title: "墓地に送ります",
        message: "効果解決後、カードを墓地に送ります",
      });
      expect(steps[1].action).toBeTypeOf("function");
    });

    it("should include activatedCardInstanceId in graveyard step action", () => {
      // Arrange
      const effect = new TestNormalSpellEffect();
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: [
            {
              id: 55144522, // Pot of Greed
              instanceId: "test-card-instance-1",
              location: "hand",
              type: "spell",
            },
          ],
          field: [],
          graveyard: [],
          banished: [],
        },
      });
      const activatedCardInstanceId = "test-card-instance-1";

      // Act
      const steps = effect.createSteps(state, activatedCardInstanceId);
      const graveyardStep = steps[1];
      const result = graveyardStep.action(state);

      // Assert: Card should be moved from hand to graveyard
      expect(result.success).toBe(true);
      expect(result.newState.zones.hand).toHaveLength(0);
      expect(result.newState.zones.graveyard).toHaveLength(1);
      expect(result.newState.zones.graveyard[0].instanceId).toBe("test-card-instance-1");
    });
  });
});
