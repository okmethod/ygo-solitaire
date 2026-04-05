/**
 * BaseTriggerEffect Tests
 *
 * 誘発効果の抽象基底クラスのテスト。
 * Template MethodパターンとisTriggerEffect型ガードを検証する。
 *
 * @module tests/unit/domain/effects/base/BaseTriggerEffect
 */

import { describe, it, expect } from "vitest";
import { BaseTriggerEffect, isTriggerEffect } from "$lib/domain/effects/actions/triggers/BaseTriggerEffect";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult, EventType } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ChainableAction, EffectId } from "$lib/domain/models/Effect";
import { createMockGameState, createMonsterOnField } from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestTriggerEffect extends BaseTriggerEffect {
  readonly triggers: readonly EventType[] = ["spellActivated"];
  readonly triggerTiming: "when" | "if" = "when";
  readonly isMandatory: boolean = false;
  readonly selfOnly: boolean = false;
  readonly excludeSelf: boolean = false;

  private shouldPass: boolean;

  constructor(cardId: number = 12345678, effectIndex: number = 1, spellSpeed: 1 | 2 = 1, shouldPass: boolean = true) {
    super(cardId, effectIndex, spellSpeed);
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
        id: "test-trigger-activation-step",
        summary: "Test Trigger Activation",
        description: "Test trigger activation step",
        notificationLevel: "silent",
        action: (s) => ({ success: true, updatedState: s, message: "Test trigger activation" }),
      },
    ];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: "test-trigger-resolution-step",
        summary: "Test Trigger Resolution",
        description: "Test trigger resolution step",
        notificationLevel: "silent",
        action: (s) => ({ success: true, updatedState: s, message: "Test trigger resolution" }),
      },
    ];
  }
}

/**
 * テスト用の具象クラス（任意効果、スペルスピード2）
 */
class TestSpellSpeed2TriggerEffect extends TestTriggerEffect {
  constructor(cardId: number = 12345678, effectIndex: number = 1) {
    super(cardId, effectIndex, 2, true);
  }
}

describe("BaseTriggerEffect", () => {
  describe("ChainableAction interface properties", () => {
    it("should have effectCategory = 'trigger'", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.effectCategory).toBe("trigger");
    });

    it("should have spellSpeed = 1 by default", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.spellSpeed).toBe(1);
    });

    it("should support spellSpeed = 2", () => {
      // Arrange
      const effect = new TestSpellSpeed2TriggerEffect();

      // Assert
      expect(effect.spellSpeed).toBe(2);
    });

    it("should have correct cardId", () => {
      // Arrange
      const effect = new TestTriggerEffect(12345678);

      // Assert
      expect(effect.cardId).toBe(12345678);
    });

    it("should generate effectId from cardId and effectIndex", () => {
      // Arrange
      const effect = new TestTriggerEffect(12345678, 2);

      // Assert
      expect(effect.effectId).toBe("trigger-12345678-2");
    });
  });

  describe("Trigger properties", () => {
    it("should have triggers array defined", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.triggers).toContain("spellActivated");
    });

    it("should have triggerTiming defined", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.triggerTiming).toBe("when");
    });

    it("should have isMandatory defined", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.isMandatory).toBe(false);
    });

    it("should have selfOnly defined", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.selfOnly).toBe(false);
    });

    it("should have excludeSelf defined", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.excludeSelf).toBe(false);
    });
  });

  describe("canActivate()", () => {
    it("should return true when individual conditions are met", () => {
      // Arrange
      const effect = new TestTriggerEffect(12345678, 1, 1, true);
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createMonsterOnField(12345678, "test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should return false when individual conditions are not met", () => {
      // Arrange
      const effect = new TestTriggerEffect(12345678, 1, 1, false); // shouldPass = false
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createMonsterOnField(12345678, "test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("ACTIVATION_CONDITIONS_NOT_MET");
    });

    it("should work in any phase (trigger effects are not restricted to main phase)", () => {
      // Arrange
      const effect = new TestTriggerEffect(12345678, 1, 1, true);
      const state = createMockGameState({ phase: "draw" });
      const sourceInstance = createMonsterOnField(12345678, "test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("should include notification step and individual steps", () => {
      // Arrange
      const effect = new TestTriggerEffect(12345678, 1);
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createMonsterOnField(12345678, "test-1");

      // Act
      const steps = effect.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps.length).toBeGreaterThanOrEqual(2);
      // First step should be notification
      expect(steps[0].id).toContain("activation-notification");
      // Second step should be from individualActivationSteps
      expect(steps[1].id).toBe("test-trigger-activation-step");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return individual resolution steps", () => {
      // Arrange
      const effect = new TestTriggerEffect(12345678, 1);
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createMonsterOnField(12345678, "test-1");

      // Act
      const steps = effect.createResolutionSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("test-trigger-resolution-step");
    });
  });
});

describe("isTriggerEffect type guard", () => {
  it("should return true for BaseTriggerEffect", () => {
    // Arrange
    const effect = new TestTriggerEffect();

    // Act & Assert
    expect(isTriggerEffect(effect)).toBe(true);
  });

  it("should return false for non-trigger effects", () => {
    // Arrange
    const mockIgnitionEffect: ChainableAction = {
      cardId: 12345678,
      effectId: "ignition-12345678-1" as EffectId,
      effectCategory: "ignition",
      spellSpeed: 1,
      canActivate: () => GameProcessing.Validation.success(),
      createActivationSteps: () => [],
      createResolutionSteps: () => [],
    };

    // Act & Assert
    expect(isTriggerEffect(mockIgnitionEffect)).toBe(false);
  });

  it("should return false for activation effects", () => {
    // Arrange
    const mockActivationEffect: ChainableAction = {
      cardId: 12345678,
      effectId: "activation-12345678" as EffectId,
      effectCategory: "activation",
      spellSpeed: 1,
      canActivate: () => GameProcessing.Validation.success(),
      createActivationSteps: () => [],
      createResolutionSteps: () => [],
    };

    // Act & Assert
    expect(isTriggerEffect(mockActivationEffect)).toBe(false);
  });
});
