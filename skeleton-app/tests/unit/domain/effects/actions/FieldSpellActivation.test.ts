/**
 * フィールド魔法発動の抽象クラスのテスト
 *
 * createNoOp で生成される効果無しインスタンスにより動作検証する。
 */

import { describe, it, expect } from "vitest";
import { FieldSpellActivation } from "$lib/domain/effects/actions/activations/FieldSpellActivation";
import { createMockGameState, createSpellInstance, DUMMY_CARD_IDS } from "../../../../__testUtils__";

describe("FieldSpellActivation", () => {
  const action = FieldSpellActivation.createNoOp(DUMMY_CARD_IDS.FIELD_SPELL);

  describe("ChainableAction インターフェースのプロパティ", () => {
    it("effectCategory が 'activation' であること", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("spellSpeed が 1 であること", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("全条件を満たす場合（メインフェイズ＋追加条件なし）は true を返すこと", () => {
      // Arrange: メインフェイズ1
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createSpellInstance("test-field-spell-1", { spellType: "field" });

      // Act & Assert
      expect(action.canActivate(state, sourceInstance).isValid).toBe(true);
    });

    it("フェイズがメインフェイズ1以外の場合は false を返すこと", () => {
      // Arrange: ドローフェイズ（FieldSpellActivation固有のフェーズ制約テスト）
      const state = createMockGameState({ phase: "draw" });
      const sourceInstance = createSpellInstance("test-field-spell-1", { spellType: "field" });

      // Act & Assert
      expect(action.canActivate(state, sourceInstance).isValid).toBe(false);
    });

    it("デッキが空でも true を返すこと（追加条件なし）", () => {
      // Arrange: メインフェイズ1、デッキ空（フィールド魔法は追加条件なし）
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createSpellInstance("test-field-spell-1", { spellType: "field" });

      // Act & Assert
      expect(action.canActivate(state, sourceInstance).isValid).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("通知ステップとイベントステップを返すこと（フィールド魔法は追加の発動ステップなし）", () => {
      // Arrange
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createSpellInstance("test-field-spell-1", { spellType: "field" });

      // Act
      const steps = action.createActivationSteps(state, sourceInstance);

      // Assert: フィールド魔法は通知ステップ＋イベントステップ（配置は ActivateSpellCommand が担当）
      expect(steps).toHaveLength(2);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[1].id).toBe("emit-spell-activated-test-field-spell-1");
    });
  });

  describe("createResolutionSteps()", () => {
    it("空配列を返すこと（フィールド魔法は解決ステップなし）", () => {
      // Arrange
      const state = createMockGameState({ phase: "main1" });
      const sourceInstance = createSpellInstance("test-field-spell-1", { spellType: "field" });

      // Act
      const steps = action.createResolutionSteps(state, sourceInstance);

      // Assert
      expect(steps).toEqual([]);
    });
  });
});
