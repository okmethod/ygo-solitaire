/**
 * 速攻魔法発動の抽象クラスのテスト
 *
 * createNoOp で生成される効果無しインスタンスにより動作検証する。
 */

import { describe, it, expect } from "vitest";
import { QuickPlaySpellActivation } from "$lib/domain/effects/actions/activations/QuickPlaySpellActivation";
import { createMockGameState, createSpellInstance, DUMMY_CARD_IDS } from "../../../../__testUtils__";

describe("QuickPlaySpellActivation", () => {
  const action = QuickPlaySpellActivation.createNoOp(DUMMY_CARD_IDS.QUICKPLAY_SPELL);

  describe("ChainableAction インターフェースのプロパティ", () => {
    it("effectCategory が 'activation' であること", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("スペルスピードが 2 であること", () => {
      expect(action.spellSpeed).toBe(2);
    });
  });

  describe("canActivate()", () => {
    it("全条件が満たされた場合（メインフェーズ）に true を返すこと", () => {
      // Arrange
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createSpellInstance("test-instance-0", { spellType: "quick-play" });

      // Act & Assert
      expect(action.canActivate(state, sourceInstance).isValid).toBe(true);
    });

    it("速攻魔法はフェーズ制限がないため、ドローフェーズでも true を返すこと", () => {
      // Arrange: 速攻魔法はチェーン中にも発動できるためフェーズ制限なし
      const state = createMockGameState({ phase: "draw" });
      const sourceInstance = createSpellInstance("test-instance-0", { spellType: "quick-play" });

      // Act & Assert
      expect(action.canActivate(state, sourceInstance).isValid).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("デフォルトの発動ステップを返すこと", () => {
      // Arrange
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createSpellInstance("test-instance-0", { spellType: "quick-play" });

      // Act
      const steps = action.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(2); // notifyActivationStep + emitSpellActivatedEventStep
      expect(steps[0].id).toBe(`${DUMMY_CARD_IDS.QUICKPLAY_SPELL}-activation-notification`);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBeDefined();
      expect(steps[1].id).toContain("emit-spell-activated-");
    });
  });
});
