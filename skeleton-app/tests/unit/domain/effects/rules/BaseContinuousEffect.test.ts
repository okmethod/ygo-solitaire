/**
 * 永続効果適用の抽象基底クラスのテスト
 */

import { describe, it, expect } from "vitest";
import { BaseContinuousEffect } from "$lib/domain/effects/rules/continuouses/BaseContinuousEffect";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { RuleCategory } from "$lib/domain/models/Effect";
import {
  createSpaceState,
  createMonsterInstance,
  createMonsterOnField,
  createSpellOnField,
  DUMMY_CARD_IDS,
} from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestContinuousEffect extends BaseContinuousEffect {
  readonly category: RuleCategory = "StatusModifier";

  private shouldPass: boolean;

  constructor(cardId: number = DUMMY_CARD_IDS.EFFECT_MONSTER, shouldPass: boolean = true) {
    super(cardId);
    this.shouldPass = shouldPass;
  }

  protected individualConditions(_state: GameSnapshot): boolean {
    return this.shouldPass;
  }
}

describe("BaseContinuousEffect", () => {
  describe("AdditionalRuleインターフェースのプロパティ", () => {
    it("isEffect が true であること", () => {
      // Arrange
      const effect = new TestContinuousEffect();

      // Assert
      expect(effect.isEffect).toBe(true);
    });

    it("cardId が正しく設定されていること", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.EFFECT_MONSTER);

      // Assert
      expect(effect.cardId).toBe(DUMMY_CARD_IDS.EFFECT_MONSTER);
    });

    it("category がサブクラスで定義した値であること", () => {
      // Arrange
      const effect = new TestContinuousEffect();

      // Assert
      expect(effect.category).toBe("StatusModifier");
    });
  });

  describe("canApply()", () => {
    it("メインモンスターゾーンに表側表示で存在し、個別条件を満たす場合は true を返すこと", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.EFFECT_MONSTER, true);
      const state = createSpaceState({
        mainMonsterZone: [createMonsterOnField("test-1", { frameType: "effect" })],
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(true);
    });

    it("魔法・罠ゾーンに表側表示で存在する場合は true を返すこと", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.CONTINUOUS_SPELL, true);
      const state = createSpaceState({
        spellTrapZone: [createSpellOnField("test-1", { spellType: "continuous" })],
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(true);
    });

    it("フィールドゾーンに表側表示で存在する場合は true を返すこと", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.FIELD_SPELL, true);
      const state = createSpaceState({
        fieldZone: [createSpellOnField("test-1", { spellType: "field" })],
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(true);
    });

    it("カードが裏側表示の場合は false を返すこと", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.EFFECT_MONSTER, true);
      const state = createSpaceState({
        spellTrapZone: [
          createMonsterOnField("test-1", {
            frameType: "effect",
            position: "faceDown",
          }),
        ],
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("カードがフィールドに存在しない場合は false を返すこと", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.EFFECT_MONSTER, true);
      const state = createSpaceState({
        hand: [createMonsterInstance("test-1", { frameType: "effect" })],
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("個別条件を満たさない場合は false を返すこと", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.EFFECT_MONSTER, false); // shouldPass = false
      const state = createSpaceState({
        mainMonsterZone: [createMonsterOnField("test-1", { frameType: "effect" })],
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("フィールドに別のカードが存在する場合は false を返すこと", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.EFFECT_MONSTER, true);
      const state = createSpaceState({
        mainMonsterZone: [createMonsterOnField("test-1", { cardId: DUMMY_CARD_IDS.OPTIONAL_TRIGGER_MONSTER })], // 異なるカードID
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("フィールドが空の場合は false を返すこと", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.EFFECT_MONSTER, true);
      const state = createSpaceState({
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(false);
    });

    it("全フィールドゾーンを横断して対象カードを検索すること", () => {
      // Arrange
      const effect = new TestContinuousEffect(DUMMY_CARD_IDS.EFFECT_MONSTER, true);
      const state = createSpaceState({
        mainMonsterZone: [createMonsterOnField("monster-1", { cardId: DUMMY_CARD_IDS.EFFECT_MONSTER })],
        spellTrapZone: [createSpellOnField("spell-1")],
        fieldZone: [createSpellOnField("field-1", { spellType: "field" })], // 検索対象のカード
      });

      // Act
      const result = effect.canApply(state);

      // Assert
      expect(result).toBe(true);
    });
  });
});
