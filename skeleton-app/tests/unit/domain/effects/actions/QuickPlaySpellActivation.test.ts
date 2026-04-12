/**
 * 速攻魔法発動の抽象クラスのテスト
 */

import { describe, it, expect } from "vitest";
import { QuickPlaySpellActivation } from "$lib/domain/effects/actions/activations/QuickPlaySpellActivation";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { CardDataRegistry } from "$lib/domain/cards";
import { createTestInitialDeck, createSpellInstance, DUMMY_CARD_IDS } from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestQuickPlaySpell extends QuickPlaySpellActivation {
  constructor() {
    super(DUMMY_CARD_IDS.NORMAL_MONSTER);
  }

  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // テスト実装: 手札枚数チェック
    if (state.space.hand.length > 0) {
      return GameProcessing.Validation.success();
    }
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET);
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }
}

describe("QuickPlaySpellActivation", () => {
  const action = new TestQuickPlaySpell();

  describe("ChainableAction インターフェースのプロパティ", () => {
    it("effectCategory が 'activation' であること", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("スペルスピードが 2 であること", () => {
      expect(action.spellSpeed).toBe(2);
    });
  });

  describe("canActivate()", () => {
    it("全条件が満たされた場合（メインフェーズ + 追加条件）に true を返すこと", () => {
      // Arrange: メインフェーズ1、手札あり
      const baseState = GameState.initialize(
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
      const handCard: CardInstance = {
        ...baseState.space.mainDeck[0],
        instanceId: "hand-0",
        location: "hand",
      };
      const stateInMain1: GameSnapshot = {
        ...baseState,
        phase: "main1",
        space: {
          ...baseState.space,
          hand: [handCard],
        },
      };
      const sourceInstance = createSpellInstance("test-instance-0", { spellType: "quick-play" });

      // Act & Assert
      expect(action.canActivate(stateInMain1, sourceInstance).isValid).toBe(true);
    });

    it("フェーズがメイン1でない場合に false を返すこと", () => {
      // Arrange: フェーズがドロー（QuickPlaySpellActivation固有のフェーズ制約テスト）
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
      const sourceInstance = createSpellInstance("test-instance-0", { spellType: "quick-play" });
      // デフォルトフェーズは "Draw"

      // Act & Assert
      expect(action.canActivate(state, sourceInstance).isValid).toBe(false);
    });

    it("追加条件が満たされない場合に false を返すこと", () => {
      // Arrange: 手札が空（additionalActivationConditions が false を返す）
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
      const emptyHandState: GameSnapshot = {
        ...state,
        phase: "main1",
        space: {
          ...state.space,
          hand: [],
        },
      };
      const sourceInstance = createSpellInstance("test-instance-0", { spellType: "quick-play" });

      // Act & Assert
      expect(action.canActivate(emptyHandState, sourceInstance).isValid).toBe(false);
    });
  });

  describe("createActivationSteps()", () => {
    it("デフォルトの発動ステップを返すこと", () => {
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
      const sourceInstance = createSpellInstance("test-instance-0", { spellType: "quick-play" });

      // Act
      const steps = action.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(2); // notifyActivationStep + emitSpellActivatedEventStep
      expect(steps[0].id).toBe(`${DUMMY_CARD_IDS.NORMAL_MONSTER}-activation-notification`);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《Dummy Normal Monster》を発動します");
      expect(steps[1].id).toContain("emit-spell-activated-");
    });
  });
});
