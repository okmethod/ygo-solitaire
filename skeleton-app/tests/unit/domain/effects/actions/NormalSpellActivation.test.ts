/**
 * NormalSpellActivation のテスト
 *
 * 通常魔法発動の抽象クラスのテスト。
 * BaseSpellActivation を継承した subTypeConditions を検証する。
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
    // Test implementation: check deck size
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

  describe("ChainableAction interface properties", () => {
    it("should have effect category = 'activation'", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("should have spell speed 1", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met (Main Phase + additional conditions)", () => {
      // Arrange: Main Phase 1, Deck >= 2
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

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw (NormalSpellActivation固有のフェーズ制約テスト)
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
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state, state.space.hand[0]).isValid).toBe(false);
    });

    it("should return false when additional conditions are not met", () => {
      // Arrange: Deck has only 1 card (additionalActivationConditions returns false)
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
    it("should return default activation step", () => {
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
      expect(steps).toHaveLength(2); // notifyActivationStep + emitSpellActivatedEventStep
      expect(steps[0].id).toBe(`${DUMMY_CARD_IDS.NORMAL_MONSTER}-activation-notification`);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《Dummy Normal Monster》を発動します");
      expect(steps[1].id).toBe("emit-spell-activated-test-normal-spell-1");
    });
  });
});
