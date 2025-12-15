/**
 * Unit tests for SpellActivationRule
 */

import { describe, it, expect } from "vitest";
import {
  canActivateSpell,
  isSpellActivationPhase,
  isCardInHand,
  validateSpellActivation,
  hasActivatableSpells,
  getActivatableSpellIds,
} from "$lib/domain/rules/SpellActivationRule";
import { createStateWithHand } from "../../../__testUtils__/gameStateFactory";

describe("SpellActivationRule", () => {
  describe("canActivateSpell", () => {
    it("should allow activation in Main1 phase with card in hand", () => {
      const state = createStateWithHand(["19613556"], "Main1"); // Pot of Greed
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = canActivateSpell(state, cardInstanceId);

      expect(result.canActivate).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should reject activation in Draw phase", () => {
      const state = createStateWithHand(["19613556"], "Draw");
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = canActivateSpell(state, cardInstanceId);

      expect(result.canActivate).toBe(false);
      expect(result.reason).toContain("メインフェイズでのみ");
    });

    it("should reject activation in Standby phase", () => {
      const state = createStateWithHand(["19613556"], "Standby");
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = canActivateSpell(state, cardInstanceId);

      expect(result.canActivate).toBe(false);
      expect(result.reason).toContain("メインフェイズでのみ");
    });

    it("should reject activation in End phase", () => {
      const state = createStateWithHand(["19613556"], "End");
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = canActivateSpell(state, cardInstanceId);

      expect(result.canActivate).toBe(false);
      expect(result.reason).toContain("メインフェイズでのみ");
    });

    it("should reject activation if card is not in hand", () => {
      const state = createStateWithHand(["19613556"], "Main1");
      const nonExistentId = "non-existent-card-id";

      const result = canActivateSpell(state, nonExistentId);

      expect(result.canActivate).toBe(false);
      expect(result.reason).toContain("手札に見つかりません");
    });
  });

  describe("isSpellActivationPhase", () => {
    it("should return true for Main1 phase", () => {
      expect(isSpellActivationPhase("Main1")).toBe(true);
    });

    it("should return false for Draw phase", () => {
      expect(isSpellActivationPhase("Draw")).toBe(false);
    });

    it("should return false for Standby phase", () => {
      expect(isSpellActivationPhase("Standby")).toBe(false);
    });

    it("should return false for End phase", () => {
      expect(isSpellActivationPhase("End")).toBe(false);
    });
  });

  describe("isCardInHand", () => {
    it("should return true if card is in hand", () => {
      const state = createStateWithHand(["19613556"]);
      const cardInstanceId = state.zones.hand[0].instanceId;

      expect(isCardInHand(state, cardInstanceId)).toBe(true);
    });

    it("should return false if card is not in hand", () => {
      const state = createStateWithHand(["19613556"]);

      expect(isCardInHand(state, "non-existent-id")).toBe(false);
    });

    it("should return false if hand is empty", () => {
      const state = createStateWithHand([]);

      expect(isCardInHand(state, "any-id")).toBe(false);
    });
  });

  describe("validateSpellActivation", () => {
    it("should return same result as canActivateSpell", () => {
      const state = createStateWithHand(["19613556"], "Main1");
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result1 = canActivateSpell(state, cardInstanceId);
      const result2 = validateSpellActivation(state, cardInstanceId);

      expect(result1).toEqual(result2);
    });
  });

  describe("hasActivatableSpells", () => {
    it("should return true if in Main1 phase with cards in hand", () => {
      const state = createStateWithHand(["19613556"], "Main1");

      expect(hasActivatableSpells(state)).toBe(true);
    });

    it("should return false if in Main1 phase but hand is empty", () => {
      const state = createStateWithHand([], "Main1");

      expect(hasActivatableSpells(state)).toBe(false);
    });

    it("should return false if not in Main1 phase even with cards in hand", () => {
      const state = createStateWithHand(["19613556"], "Draw");

      expect(hasActivatableSpells(state)).toBe(false);
    });

    it("should return false if in Standby phase with cards", () => {
      const state = createStateWithHand(["19613556"], "Standby");

      expect(hasActivatableSpells(state)).toBe(false);
    });
  });

  describe("getActivatableSpellIds", () => {
    it("should return all card instance IDs in Main1 phase", () => {
      const state = createStateWithHand(["19613556", "79571449", "32807846"], "Main1");

      const ids = getActivatableSpellIds(state);

      expect(ids).toHaveLength(3);
      expect(ids).toContain(state.zones.hand[0].instanceId);
      expect(ids).toContain(state.zones.hand[1].instanceId);
      expect(ids).toContain(state.zones.hand[2].instanceId);
    });

    it("should return empty array if not in Main1 phase", () => {
      const state = createStateWithHand(["19613556"], "Draw");

      const ids = getActivatableSpellIds(state);

      expect(ids).toHaveLength(0);
    });

    it("should return empty array if hand is empty", () => {
      const state = createStateWithHand([], "Main1");

      const ids = getActivatableSpellIds(state);

      expect(ids).toHaveLength(0);
    });
  });
});
