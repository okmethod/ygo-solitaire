/**
 * 誘発効果発動の抽象基底クラスのテスト
 */

import { describe, it, expect } from "vitest";
import { BaseTriggerEffect, isTriggerEffect } from "$lib/domain/effects/actions/triggers/BaseTriggerEffect";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult, EventType } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { ChainableAction, EffectId } from "$lib/domain/models/Effect";
import { createPhaseState, createMonsterOnField, DUMMY_CARD_IDS } from "../../../../__testUtils__";

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

  constructor(
    cardId: number = DUMMY_CARD_IDS.NORMAL_MONSTER,
    effectIndex: number = 1,
    spellSpeed: 1 | 2 = 1,
    shouldPass: boolean = true,
  ) {
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
  constructor(cardId: number = DUMMY_CARD_IDS.NORMAL_MONSTER, effectIndex: number = 1) {
    super(cardId, effectIndex, 2, true);
  }
}

describe("BaseTriggerEffect", () => {
  describe("ChainableActionインターフェースのプロパティ", () => {
    it("effectCategory が 'trigger' であること", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.effectCategory).toBe("trigger");
    });

    it("デフォルトで spellSpeed が 1 であること", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.spellSpeed).toBe(1);
    });

    it("spellSpeed = 2 を設定できること", () => {
      // Arrange
      const effect = new TestSpellSpeed2TriggerEffect();

      // Assert
      expect(effect.spellSpeed).toBe(2);
    });

    it("cardId が正しく設定されること", () => {
      // Arrange
      const effect = new TestTriggerEffect(DUMMY_CARD_IDS.NORMAL_MONSTER);

      // Assert
      expect(effect.cardId).toBe(DUMMY_CARD_IDS.NORMAL_MONSTER);
    });

    it("cardId と effectIndex から effectId が生成されること", () => {
      // Arrange
      const effect = new TestTriggerEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 2);

      // Assert
      expect(effect.effectId).toBe(`trigger-${DUMMY_CARD_IDS.NORMAL_MONSTER}-2`);
    });
  });

  describe("誘発効果固有のプロパティ", () => {
    it("triggers 配列が定義されていること", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.triggers).toContain("spellActivated");
    });

    it("triggerTiming が定義されていること", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.triggerTiming).toBe("when");
    });

    it("isMandatory が定義されていること", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.isMandatory).toBe(false);
    });

    it("selfOnly が定義されていること", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.selfOnly).toBe(false);
    });

    it("excludeSelf が定義されていること", () => {
      // Arrange
      const effect = new TestTriggerEffect();

      // Assert
      expect(effect.excludeSelf).toBe(false);
    });
  });

  describe("canActivate()", () => {
    it("個別条件を満たす場合に true を返すこと", () => {
      // Arrange
      const effect = new TestTriggerEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1, 1, true);
      const state = createPhaseState("main1");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("個別条件を満たさない場合に false を返すこと", () => {
      // Arrange
      const effect = new TestTriggerEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1, 1, false); // shouldPass = false
      const state = createPhaseState("main1");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("ACTIVATION_CONDITIONS_NOT_MET");
    });

    it("任意のフェーズで発動できること（誘発効果はメインフェーズに限定されない）", () => {
      // Arrange
      const effect = new TestTriggerEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1, 1, true);
      const state = createPhaseState("draw");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("通知ステップと個別ステップを含むこと", () => {
      // Arrange
      const effect = new TestTriggerEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1);
      const state = createPhaseState("main1");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const steps = effect.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps.length).toBeGreaterThanOrEqual(2);
      // 最初のステップは通知ステップ
      expect(steps[0].id).toContain("activation-notification");
      // 次のステップは individualActivationSteps からのステップ
      expect(steps[1].id).toBe("test-trigger-activation-step");
    });
  });

  describe("createResolutionSteps()", () => {
    it("個別の解決ステップを返すこと", () => {
      // Arrange
      const effect = new TestTriggerEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1);
      const state = createPhaseState("main1");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const steps = effect.createResolutionSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("test-trigger-resolution-step");
    });
  });
});

describe("isTriggerEffect 型ガード", () => {
  it("BaseTriggerEffect に対して true を返すこと", () => {
    // Arrange
    const effect = new TestTriggerEffect();

    // Act & Assert
    expect(isTriggerEffect(effect)).toBe(true);
  });

  it("誘発効果以外に対して false を返すこと", () => {
    // Arrange
    const mockIgnitionEffect: ChainableAction = {
      cardId: DUMMY_CARD_IDS.NORMAL_MONSTER,
      effectId: `ignition-${DUMMY_CARD_IDS.NORMAL_MONSTER}-1` as EffectId,
      effectCategory: "ignition",
      spellSpeed: 1,
      canActivate: () => GameProcessing.Validation.success(),
      createActivationSteps: () => [],
      createResolutionSteps: () => [],
    };

    // Act & Assert
    expect(isTriggerEffect(mockIgnitionEffect)).toBe(false);
  });

  it("発動効果に対して false を返すこと", () => {
    // Arrange
    const mockActivationEffect: ChainableAction = {
      cardId: DUMMY_CARD_IDS.NORMAL_MONSTER,
      effectId: `activation-${DUMMY_CARD_IDS.NORMAL_MONSTER}` as EffectId,
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
