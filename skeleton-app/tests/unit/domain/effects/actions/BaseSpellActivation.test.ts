/**
 * 魔法カード発動の抽象基底クラスのテスト
 */

import { describe, it, expect } from "vitest";
import { BaseSpellActivation } from "$lib/domain/effects/actions/activations/BaseSpellActivation";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { CardDataRegistry } from "$lib/domain/cards";
import { createTestInitialDeck, DUMMY_CARD_IDS } from "../../../../__testUtils__";

/**
 * テスト用の具象クラス
 */
class TestSpellAction extends BaseSpellActivation {
  readonly spellSpeed = 1 as const;

  constructor() {
    super(DUMMY_CARD_IDS.NORMAL_MONSTER);
  }

  protected subTypeConditions(_state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // テスト実装: サブタイプ制限なし
    return GameProcessing.Validation.success();
  }

  protected individualConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // テスト実装: デッキにカードがあるか確認
    if (state.space.mainDeck.length > 0) {
      return GameProcessing.Validation.success();
    }
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.INSUFFICIENT_DECK);
  }

  protected subTypePreActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected subTypePostActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected subTypePreResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected subTypePostResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }
}

describe("BaseSpellActivation", () => {
  const action = new TestSpellAction();

  describe("ChainableAction インターフェースのプロパティ", () => {
    it("effectCategory が 'activation' であること", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("spellSpeed がサブクラスで定義された値であること", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("サブタイプ条件と個別条件が満たされた場合に true を返すこと", () => {
      // Arrange: デッキにカードがある（individualConditions が true を返す）
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

    it("個別条件が満たされない場合に false を返すこと", () => {
      // Arrange: デッキが空（individualConditions が false を返す）
      const state = GameState.initialize(createTestInitialDeck([]), CardDataRegistry.getCard, {
        skipShuffle: true,
        skipInitialDraw: true,
      });
      const stateInMain1: GameSnapshot = {
        ...state,
        phase: "main1",
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1, stateInMain1.space.hand[0]).isValid).toBe(false);
    });
  });

  describe("createActivationSteps()", () => {
    // テスト用の sourceInstance を作成するヘルパー
    const createTestSourceInstance = (): CardInstance => ({
      id: DUMMY_CARD_IDS.NORMAL_MONSTER,
      instanceId: "test-instance-1",
      jaName: "Dummy Normal Monster",
      type: "spell",
      frameType: "spell",
      edition: "latest" as const,
      location: "hand",
    });

    it("カード情報を含むデフォルトの発動ステップを返すこと", () => {
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

      // Assert
      expect(steps).toHaveLength(2); // notifyActivationStep + emitSpellActivatedEventStep
      expect(steps[0].id).toBe(`${DUMMY_CARD_IDS.NORMAL_MONSTER}-activation-notification`);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《Dummy Normal Monster》を発動します"); // レジストリの getCardNameWithBrackets を使用
      expect(steps[0].notificationLevel).toBe("static");
      // イベント発行ステップの検証
      expect(steps[1].id).toBe("emit-spell-activated-test-instance-1");
      expect(steps[1].notificationLevel).toBe("silent");
    });

    it("状態を変更しないアクションを持つステップを返すこと", () => {
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
      const steps = action.createActivationSteps(state, sourceInstance);

      // Act
      const result = steps[0].action(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState).toStrictEqual(state);
      expect(result.message).toBe("《Dummy Normal Monster》 activated"); // レジストリの jaName を使用
    });
  });

  describe("抽象メソッド", () => {
    it("createResolutionSteps() が実装されていること", () => {
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
      expect(steps).toBeDefined();
      expect(Array.isArray(steps)).toBe(true);
    });
  });
});
