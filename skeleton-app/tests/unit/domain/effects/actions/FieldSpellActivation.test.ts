/**
 * FieldSpellActivation のテスト
 *
 * フィールド魔法発動の抽象クラスのテスト。
 * BaseSpellActivation を継承した subTypeConditions（メインフェイズ制約）を検証する。
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
    // Test implementation: always true (no additional conditions)
    return GameProcessing.Validation.success();
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    // Field Spells typically have no resolution steps (only continuous effects)
    return [];
  }
}

describe("FieldSpellActivation", () => {
  const action = new TestFieldSpell();

  describe("ChainableAction interface properties", () => {
    it("should have effect category = 'activation'", () => {
      expect(action.effectCategory).toBe("activation");
    });

    it("should have spell speed 1", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met (Main Phase + no additional conditions required)", () => {
      // Arrange: Main Phase 1
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
      // Arrange: Phase is Draw (FieldSpellActivation固有のフェーズ制約テスト)
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

    it("should return true even with empty deck (no additional conditions)", () => {
      // Arrange: Main Phase 1, empty deck (Field Spells have no additional conditions)
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

    it("should return notification and event steps (field spells have no additional activation steps)", () => {
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

      // Assert: Field Spells have notification + event step (placement handled by ActivateSpellCommand)
      expect(steps).toHaveLength(2);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[1].id).toBe("emit-spell-activated-test-field-spell-1");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return empty array (field spells have no resolution steps)", () => {
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
