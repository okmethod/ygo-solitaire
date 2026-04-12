/**
 * 通常魔法発動の抽象クラスのテスト
 *
 * createNoOp で生成される効果無しインスタンスにより動作検証する。
 */

import { describe, it, expect } from "vitest";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import { createMockGameState, createMonsterInstance, DUMMY_CARD_IDS } from "../../../../__testUtils__";

describe("NormalSpellActivation", () => {
  const action = NormalSpellActivation.createNoOp(DUMMY_CARD_IDS.NORMAL_SPELL);

  describe("ChainableAction インターフェースのプロパティ", () => {
    it("effectCategory が 'activation' であること", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("spellSpeed が 1 であること", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("main1 フェーズで true を返すこと", () => {
      // Arrange
      const state = createMockGameState({ phase: "main1" });

      // Act & Assert
      expect(action.canActivate(state, state.space.hand[0]).isValid).toBe(true);
    });

    it("フェーズが Main1 でない場合に false を返すこと", () => {
      // Arrange: フェーズがドロウ（NormalSpellActivation固有のフェーズ制約テスト）
      const state = createMockGameState({ phase: "draw" });

      // Act & Assert
      expect(action.canActivate(state, state.space.hand[0]).isValid).toBe(false);
    });
  });

  describe("createActivationSteps()", () => {
    it("デフォルトの発動ステップを返すこと", () => {
      // Arrange
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createMonsterInstance("test-normal-spell-1");

      // Act
      const steps = action.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(2); // notifyActivationStep + emitSpellActivatedEventStep（発動通知 + イベント発火）
      expect(steps[0].id).toBe(`${DUMMY_CARD_IDS.NORMAL_SPELL}-activation-notification`);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBeDefined();
      expect(steps[1].id).toBe("emit-spell-activated-test-normal-spell-1");
    });
  });
});
