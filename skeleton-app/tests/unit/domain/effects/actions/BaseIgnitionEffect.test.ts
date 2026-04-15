/**
 * 起動効果発動の抽象基底クラスのテスト
 */

import { describe, it, expect } from "vitest";
import { BaseIgnitionEffect } from "$lib/domain/effects/actions/ignitions/BaseIgnitionEffect";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { createPhaseState, createMonsterOnField, DUMMY_CARD_IDS } from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestIgnitionEffect extends BaseIgnitionEffect {
  private shouldPass: boolean;

  constructor(cardId: number = DUMMY_CARD_IDS.NORMAL_MONSTER, effectIndex: number = 1, shouldPass: boolean = true) {
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
  describe("ChainableAction インターフェースのプロパティ", () => {
    it("effectCategory が 'ignition' であること", () => {
      // Arrange
      const effect = new TestIgnitionEffect();

      // Assert
      expect(effect.effectCategory).toBe("ignition");
    });

    it("spellSpeed が 1 であること", () => {
      // Arrange
      const effect = new TestIgnitionEffect();

      // Assert
      expect(effect.spellSpeed).toBe(1);
    });

    it("cardId が正しく設定されること", () => {
      // Arrange
      const effect = new TestIgnitionEffect(DUMMY_CARD_IDS.NORMAL_MONSTER);

      // Assert
      expect(effect.cardId).toBe(DUMMY_CARD_IDS.NORMAL_MONSTER);
    });

    it("effectId が cardId と effectIndex から生成されること", () => {
      // Arrange
      const effect = new TestIgnitionEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1);

      // Assert
      expect(effect.effectId).toBe(`ignition-${DUMMY_CARD_IDS.NORMAL_MONSTER}-1`);
    });
  });

  describe("canActivate()", () => {
    it("メイン1フェイズかつ個別条件を満たす場合は true を返すこと", () => {
      // Arrange
      const effect = new TestIgnitionEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1, true);
      const state = createPhaseState("main1");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("スタンバイフェイズでは false を返すこと（NOT_MAIN_PHASE）", () => {
      // Arrange
      const effect = new TestIgnitionEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1, true);
      const state = createPhaseState("standby");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NOT_MAIN_PHASE");
    });

    it("ドローフェイズでは false を返すこと（NOT_MAIN_PHASE）", () => {
      // Arrange
      const effect = new TestIgnitionEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1, true);
      const state = createPhaseState("draw");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NOT_MAIN_PHASE");
    });

    it("個別条件を満たさない場合は false を返すこと", () => {
      // Arrange
      const effect = new TestIgnitionEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1, false); // shouldPass = false
      const state = createPhaseState("main1");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const result = effect.canActivate(state, sourceInstance);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("ACTIVATION_CONDITIONS_NOT_MET");
    });
  });

  describe("createActivationSteps()", () => {
    it("通知ステップと個別ステップが含まれること", () => {
      // Arrange
      const effect = new TestIgnitionEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1);
      const state = createPhaseState("main1");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const steps = effect.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps.length).toBeGreaterThanOrEqual(2);
      // 最初のステップは通知ステップであること
      expect(steps[0].id).toContain("activation-notification");
      // 2番目のステップは individualActivationSteps から取得されること
      expect(steps[1].id).toBe("test-activation-step");
    });
  });

  describe("createResolutionSteps()", () => {
    it("個別の解決ステップを返すこと", () => {
      // Arrange
      const effect = new TestIgnitionEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1);
      const state = createPhaseState("main1");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const steps = effect.createResolutionSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("test-resolution-step");
    });

    it("状態を変更しないステップを返すこと", () => {
      // Arrange
      const effect = new TestIgnitionEffect(DUMMY_CARD_IDS.NORMAL_MONSTER, 1);
      const state = createPhaseState("main1");
      const sourceInstance = createMonsterOnField("test-1");

      // Act
      const steps = effect.createResolutionSteps(state, sourceInstance);
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState).toBe(state);
    });
  });
});
