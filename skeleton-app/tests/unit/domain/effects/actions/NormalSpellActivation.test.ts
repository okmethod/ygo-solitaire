/**
 * 通常魔法発動の抽象クラスのテスト
 */

import { describe, it, expect } from "vitest";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { CardDataRegistry } from "$lib/domain/cards";
import { createTestInitialDeck, createMonsterInstance, DUMMY_CARD_IDS } from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestNormalSpell extends NormalSpellActivation {
  constructor() {
    super(DUMMY_CARD_IDS.NORMAL_MONSTER);
  }

  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // テスト用実装: デッキ枚数チェック
    if (state.space.mainDeck.length >= 2) {
      return GameProcessing.Validation.success();
    }
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.INSUFFICIENT_DECK);
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }
}

describe("NormalSpellActivation", () => {
  const action = new TestNormalSpell();

  describe("ChainableAction インターフェースのプロパティ", () => {
    it("effectCategory が 'activation' であること", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("spellSpeed が 1 であること", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("全条件が満たされた場合に true を返すこと（メインフェーズ + 追加条件）", () => {
      // Arrange: メインフェーズ1、デッキ >= 2
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

    it("フェーズが Main1 でない場合に false を返すこと", () => {
      // Arrange: フェーズがドロウ（NormalSpellActivation固有のフェーズ制約テスト）
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
      // デフォルトフェーズは "Draw"

      // Act & Assert
      expect(action.canActivate(state, state.space.hand[0]).isValid).toBe(false);
    });

    it("追加条件が満たされない場合に false を返すこと", () => {
      // Arrange: デッキが1枚のみ（individualConditions が false を返す）
      const state = GameState.initialize(
        createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL]),
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
      expect(action.canActivate(stateInMain1, stateInMain1.space.hand[0]).isValid).toBe(false);
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
      const sourceInstance = createMonsterInstance("test-normal-spell-1");

      // Act
      const steps = action.createActivationSteps(state, sourceInstance);

      // Assert
      expect(steps).toHaveLength(2); // notifyActivationStep + emitSpellActivatedEventStep（発動通知 + イベント発火）
      expect(steps[0].id).toBe(`${DUMMY_CARD_IDS.NORMAL_MONSTER}-activation-notification`);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《Dummy Normal Monster》を発動します");
      expect(steps[1].id).toBe("emit-spell-activated-test-normal-spell-1");
    });
  });
});
