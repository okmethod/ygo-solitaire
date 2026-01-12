/**
 * Unit tests for SpellActivationRule
 */

import { describe, it, expect } from "vitest";
import { canActivateSpell } from "$lib/domain/rules/SpellActivationRule";
import { createStateWithHand } from "../../../__testUtils__/gameStateFactory";
import { getCardData } from "$lib/domain/registries/CardDataRegistry";
import type { CardInstance } from "$lib/domain/models/Card";

describe("SpellActivationRule", () => {
  describe("canActivateSpell", () => {
    it("should allow activation in Main1 phase with card in hand", () => {
      const state = createStateWithHand(["19613556"], "Main1"); // Pot of Greed
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = canActivateSpell(state, cardInstanceId);

      expect(result.canExecute).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should reject activation in Draw phase", () => {
      const state = createStateWithHand(["19613556"], "Draw");
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = canActivateSpell(state, cardInstanceId);

      expect(result.canExecute).toBe(false);
      expect(result.reason).toBe("メインフェイズではありません");
    });

    it("should reject activation in Standby phase", () => {
      const state = createStateWithHand(["19613556"], "Standby");
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = canActivateSpell(state, cardInstanceId);

      expect(result.canExecute).toBe(false);
      expect(result.reason).toBe("メインフェイズではありません");
    });

    it("should reject activation in End phase", () => {
      const state = createStateWithHand(["19613556"], "End");
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = canActivateSpell(state, cardInstanceId);

      expect(result.canExecute).toBe(false);
      expect(result.reason).toBe("メインフェイズではありません");
    });

    it("should reject activation if card is not in hand", () => {
      const state = createStateWithHand(["19613556"], "Main1");
      const nonExistentId = "non-existent-card-id";

      const result = canActivateSpell(state, nonExistentId);

      expect(result.canExecute).toBe(false);
      expect(result.reason).toContain("発動可能な位置");
    });
  });

  describe("canActivateSpell - Set Card Activation (T030-1)", () => {
    it("should allow activating normal spell from spellTrapZone", () => {
      const state = createStateWithHand([], "Main1");
      const cardData = getCardData(55144522); // 強欲な壺 (normal spell)
      const cardInstanceId = "test-normal-spell-1";

      const normalSpellCard: CardInstance = {
        ...cardData,
        instanceId: cardInstanceId,
        location: "spellTrapZone",
        position: "faceDown",
        placedThisTurn: false,
      };

      const stateWithSetCard = {
        ...state,
        zones: {
          ...state.zones,
          spellTrapZone: [normalSpellCard],
        },
      };

      const result = canActivateSpell(stateWithSetCard, cardInstanceId);

      expect(result.canExecute).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should allow activating field spell from fieldZone", () => {
      const state = createStateWithHand([], "Main1");
      const cardData = getCardData(67616300); // Chicken Game (field spell)
      const cardInstanceId = "test-field-spell-2";

      const fieldSpellCard: CardInstance = {
        ...cardData,
        instanceId: cardInstanceId,
        location: "fieldZone",
        position: "faceDown",
        placedThisTurn: false,
      };

      const stateWithSetCard = {
        ...state,
        zones: {
          ...state.zones,
          fieldZone: [fieldSpellCard],
        },
      };

      const result = canActivateSpell(stateWithSetCard, cardInstanceId);

      expect(result.canExecute).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should reject activating quick-play spell set this turn", () => {
      const state = createStateWithHand([], "Main1");
      const cardData = getCardData(74519184); // 手札断札 (quick-play)
      const cardInstanceId = "test-quick-play-1";

      // Create CardInstance with actual CardData
      const quickPlayCard: CardInstance = {
        ...cardData,
        instanceId: cardInstanceId,
        location: "spellTrapZone",
        position: "faceDown",
        placedThisTurn: true, // Set this turn - should be blocked
      };

      const stateWithSetCard = {
        ...state,
        zones: {
          ...state.zones,
          spellTrapZone: [quickPlayCard],
        },
      };

      const result = canActivateSpell(stateWithSetCard, cardInstanceId);

      expect(result.canExecute).toBe(false);
      expect(result.reason).toContain("速攻魔法");
      expect(result.reason).toContain("セットしたターン");
    });

    it("should allow activating quick-play spell NOT set this turn", () => {
      const state = createStateWithHand([], "Main1");
      const cardData = getCardData(74519184); // 手札断札 (quick-play)
      const cardInstanceId = "test-quick-play-2";

      const quickPlayCard: CardInstance = {
        ...cardData,
        instanceId: cardInstanceId,
        location: "spellTrapZone",
        position: "faceDown",
        placedThisTurn: false, // NOT set this turn - should be allowed
      };

      const stateWithSetCard = {
        ...state,
        zones: {
          ...state.zones,
          spellTrapZone: [quickPlayCard],
        },
      };

      const result = canActivateSpell(stateWithSetCard, cardInstanceId);

      expect(result.canExecute).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should reject activating card not in hand/field zones", () => {
      const state = createStateWithHand(["19613556"], "Main1");
      const cardInstanceId = state.zones.hand[0].instanceId;

      // Place card in graveyard (invalid location)
      const stateWithCardInGraveyard = {
        ...state,
        zones: {
          ...state.zones,
          hand: [],
          graveyard: [
            {
              ...state.zones.hand[0],
              location: "graveyard" as const,
              position: undefined,
            },
          ],
        },
      };

      const result = canActivateSpell(stateWithCardInGraveyard, cardInstanceId);

      expect(result.canExecute).toBe(false);
      expect(result.reason).toContain("発動可能な位置");
    });

    it("should reject activating field spell from spellTrapZone (not supported in MVP)", () => {
      const state = createStateWithHand([], "Main1");
      const cardData = getCardData(67616300); // Chicken Game (field spell)
      const cardInstanceId = "test-field-spell-1";

      const fieldSpellCard: CardInstance = {
        ...cardData,
        instanceId: cardInstanceId,
        location: "spellTrapZone",
        position: "faceDown",
        placedThisTurn: false,
      };

      const stateWithSetCard = {
        ...state,
        zones: {
          ...state.zones,
          spellTrapZone: [fieldSpellCard],
        },
      };

      const result = canActivateSpell(stateWithSetCard, cardInstanceId);

      // Field spells in spellTrapZone is conceptually invalid (should be in fieldZone)
      expect(result.canExecute).toBe(false);
      expect(result.reason).toContain("フィールド魔法");
    });
  });
});
