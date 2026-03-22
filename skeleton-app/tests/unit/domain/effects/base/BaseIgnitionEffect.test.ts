/**
 * BaseIgnitionEffect Tests
 *
 * 起動効果の抽象基底クラスのテスト。
 * Template Methodパターンの動作を検証する。
 *
 * @module tests/unit/domain/effects/base/BaseIgnitionEffect
 */

import { describe, it, expect } from "vitest";
import { BaseIgnitionEffect } from "$lib/domain/effects/actions/ignitions/BaseIgnitionEffect";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { createMockGameState, createFieldCardInstance } from "../../../../__testUtils__/gameStateFactory";

/**
 * テスト用の具象クラス
 */
class TestIgnitionEffect extends BaseIgnitionEffect {
  private shouldPass: boolean;

  constructor(cardId: number = 12345678, effectIndex: number = 1, shouldPass: boolean = true) {
    super(cardId, effectIndex);
    this.shouldPass = shouldPass;
  }

  protected individualConditions(_state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    if (this.shouldPass) {
      return GameProcessing.Validation.success();
    }
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: "test-activation-step",
        summary: "Test Activation",
        description: "Test activation step",
        notificationLevel: "silent",
        action: (s) => ({ success: true, updatedState: s, message: "Test activation" }),
      },
    ];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: "test-resolution-step",
        summary: "Test Resolution",
        description: "Test resolution step",
        notificationLevel: "silent",
        action: (s) => ({ success: true, updatedState: s, message: "Test resolution" }),
      },
    ];
  }
}

describe("BaseIgnitionEffect", () => {
  describe("ChainableAction interface properties", () => {
    it("should have effectCategory = 'ignition'", () => {
      // Arrange
      const effect = new TestIgnitionEffect();

      // Assert
      expect(effect.effectCategory).toBe("ignition");
    });

    it("should have spellSpeed = 1", () => {
      // Arrange
      const effect = new TestIgnitionEffect();

      // Assert
      expect(effect.spellSpeed).toBe(1);
    });

    it("should have correct cardId", () => {
      // Arrange
      const effect = new TestIgnitionEffect(12345678);

      // Assert
      expect(effect.cardId).toBe(12345678);
    });

    it("should generate effectId from cardId and effectIndex", () => {
      // Arrange
      const effect = new TestIgnitionEffect(12345678, 1);

      // Assert
      expect(effect.effectId).toBe("ignition-12345678-1");
    });
  });

  describe("canActivate()", () => {
    it("should return true in main1 phase when individual conditions are met", () => {
      // Arrange
      const effect = new TestIgnitionEffect(12345678, 1, true);
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createFieldCardInstance({
        instanceId: "test-1",
        id: 12345678,
        jaName: "Test Card",
        type: "monster",
        frameType: "effect",
        location: "mainMonsterZone",
      });

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should return false in standby phase (NOT_MAIN_PHASE)", () => {
      // Arrange
      const effect = new TestIgnitionEffect(12345678, 1, true);
      const state = createMockGameState({ phase: "standby" });
      const sourceInstance = createFieldCardInstance({
        instanceId: "test-1",
        id: 12345678,
        jaName: "Test Card",
        type: "monster",
        frameType: "effect",
        location: "mainMonsterZone",
      });

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NOT_MAIN_PHASE");
    });

    it("should return false in draw phase (NOT_MAIN_PHASE)", () => {
      // Arrange
      const effect = new TestIgnitionEffect(12345678, 1, true);
      const state = createMockGameState({ phase: "draw" });
      const sourceInstance = createFieldCardInstance({
        instanceId: "test-1",
        id: 12345678,
        jaName: "Test Card",
        type: "monster",
        frameType: "effect",
        location: "mainMonsterZone",
      });

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NOT_MAIN_PHASE");
    });

    it("should return false when individual conditions are not met", () => {
      // Arrange
      const effect = new TestIgnitionEffect(12345678, 1, false); // shouldPass = false
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createFieldCardInstance({
        instanceId: "test-1",
        id: 12345678,
        jaName: "Test Card",
        type: "monster",
        frameType: "effect",
        location: "mainMonsterZone",
      });

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("ACTIVATION_CONDITIONS_NOT_MET");
    });
  });

  describe("createActivationSteps()", () => {
    it("should include notification step and individual steps", () => {
      // Arrange
      const effect = new TestIgnitionEffect(12345678, 1);
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createFieldCardInstance({
        instanceId: "test-1",
        id: 12345678,
        jaName: "Test Card",
        type: "monster",
        frameType: "effect",
        location: "mainMonsterZone",
      });

      // Act
      const steps = effect.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps.length).toBeGreaterThanOrEqual(2);
      // First step should be notification
      expect(steps[0].id).toContain("activation-notification");
      // Second step should be from individualActivationSteps
      expect(steps[1].id).toBe("test-activation-step");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return individual resolution steps", () => {
      // Arrange
      const effect = new TestIgnitionEffect(12345678, 1);
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createFieldCardInstance({
        instanceId: "test-1",
        id: 12345678,
        jaName: "Test Card",
        type: "monster",
        frameType: "effect",
        location: "mainMonsterZone",
      });

      // Act
      const steps = effect.createResolutionSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("test-resolution-step");
    });

    it("should return step that does not modify state", () => {
      // Arrange
      const effect = new TestIgnitionEffect(12345678, 1);
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createFieldCardInstance({
        instanceId: "test-1",
        id: 12345678,
        jaName: "Test Card",
        type: "monster",
        frameType: "effect",
        location: "mainMonsterZone",
      });

      // Act
      const steps = effect.createResolutionSteps(state, sourceInstance);
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState).toBe(state);
    });
  });
});
