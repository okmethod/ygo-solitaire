/**
 * フィールド魔法発動の抽象クラスのテスト
 */

import { describe, it, expect } from "vitest";
import { FieldSpellActivation } from "$lib/domain/effects/actions/activations/FieldSpellActivation";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { CardDataRegistry } from "$lib/domain/cards";
import { createTestInitialDeck, DUMMY_CARD_IDS, ACTUAL_CARD_IDS } from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestFieldSpell extends FieldSpellActivation {
  constructor() {
    super(DUMMY_CARD_IDS.NORMAL_MONSTER);
  }

  protected individualConditions(_state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // テスト実装: 常にtrue（追加条件なし）
    return GameProcessing.Validation.success();
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    // フィールド魔法は通常、解決ステップなし（永続効果のみ）
    return [];
  }
}

describe("FieldSpellActivation", () => {
  const action = new TestFieldSpell();

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
      const state = GameState.initialize(
        createTestInitialDeck([
          DUMMY_CARD_IDS.NORMAL_SPELL,
          DUMMY_CARD_IDS.EQUIP_SPELL,
          DUMMY_CARD_IDS.QUICKPLAY_SPELL,
        ]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );
      const stateInMain1: GameSnapshot = {
        ...state,
        phase: "main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1, stateInMain1.space.hand[0]).isValid).toBe(true);
    });

    it("フェイズがメインフェイズ1以外の場合は false を返すこと", () => {
      // Arrange: ドローフェイズ（FieldSpellActivation固有のフェーズ制約テスト）
      const state = GameState.initialize(
        createTestInitialDeck([
          DUMMY_CARD_IDS.NORMAL_SPELL,
          DUMMY_CARD_IDS.EQUIP_SPELL,
          DUMMY_CARD_IDS.QUICKPLAY_SPELL,
        ]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );
      // デフォルトフェイズは "Draw"

      // Act & Assert
      expect(action.canActivate(state, state.space.hand[0]).isValid).toBe(false);
    });

    it("デッキが空でも true を返すこと（追加条件なし）", () => {
      // Arrange: メインフェイズ1、デッキ空（フィールド魔法は追加条件なし）
      const state = GameState.initialize(createTestInitialDeck([]), CardDataRegistry.getCard, {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const stateInMain1: GameSnapshot = {
        ...state,
        phase: "main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1, stateInMain1.space.hand[0]).isValid).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    // テスト用の sourceInstance を作成するヘルパー
    const createTestSourceInstance = (): CardInstance => ({
      id: ACTUAL_CARD_IDS.CHICKEN_GAME,
      instanceId: "test-field-spell-1",
      jaName: "Test Field Spell",
      type: "spell",
      frameType: "spell",
      spellType: "field",
      edition: "latest" as const,
      location: "hand",
    });

    it("通知ステップとイベントステップを返すこと（フィールド魔法は追加の発動ステップなし）", () => {
      // Arrange
      const state = GameState.initialize(
        createTestInitialDeck([
          DUMMY_CARD_IDS.NORMAL_SPELL,
          DUMMY_CARD_IDS.EQUIP_SPELL,
          DUMMY_CARD_IDS.QUICKPLAY_SPELL,
        ]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );
      const sourceInstance = createTestSourceInstance();

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
      const state = GameState.initialize(
        createTestInitialDeck([
          DUMMY_CARD_IDS.NORMAL_SPELL,
          DUMMY_CARD_IDS.EQUIP_SPELL,
          DUMMY_CARD_IDS.QUICKPLAY_SPELL,
        ]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      // Act
      const steps = action.createResolutionSteps(state, state.space.hand[0]);

      // Assert
      expect(steps).toEqual([]);
    });
  });
});
