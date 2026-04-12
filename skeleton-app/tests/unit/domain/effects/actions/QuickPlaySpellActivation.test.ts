/**
 * QuickPlaySpellActivation のテスト
 *
 * 速攻魔法発動の抽象クラスのテスト。
 * BaseSpellActivation を継承した subTypeConditions を検証する。
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
    // Test implementation: check hand size
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

  describe("ChainableAction interface properties", () => {
    it("should have effect category = 'activation'", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("should have spell speed 2", () => {
      expect(action.spellSpeed).toBe(2);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met (Main Phase + additional conditions)", () => {
      // Arrange: Main Phase 1, Hand not empty
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

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw (QuickPlaySpellActivation固有のフェーズ制約テスト)
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
      // Default phase is "Draw"

      // Act & Assert
      expect(action.canActivate(state, sourceInstance).isValid).toBe(false);
    });

    it("should return false when additional conditions are not met", () => {
      // Arrange: Hand is empty (additionalActivationConditions returns false)
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
