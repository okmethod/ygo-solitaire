/**
 * Unit tests for RoyalMagicalLibraryIgnitionEffect
 *
 * Tests the simplified ignition effect of Royal Magical Library (王立魔法図書館)
 * Card ID: 70791313
 *
 * Note: This is a simplified implementation without spell counter cost.
 * The full spell counter system will be implemented in a future spec.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { RoyalMagicalLibraryIgnitionEffect } from "$lib/domain/effects/actions/monsters/individuals/RoyalMagicalLibraryIgnitionEffect";
import { createMockGameState } from "../../../../../../__testUtils__/gameStateFactory";
import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";

describe("RoyalMagicalLibraryIgnitionEffect", () => {
  let effect: RoyalMagicalLibraryIgnitionEffect;
  let initialState: GameState;
  let sourceInstance: CardInstance;

  const ROYAL_MAGICAL_LIBRARY_ID = 70791313;
  const libraryInstanceId = "monster-royal-library-1";

  beforeEach(() => {
    effect = new RoyalMagicalLibraryIgnitionEffect();

    sourceInstance = {
      instanceId: libraryInstanceId,
      id: ROYAL_MAGICAL_LIBRARY_ID,
      jaName: "王立魔法図書館",
      type: "monster" as const,
      frameType: "effect" as const,
      location: "mainMonsterZone" as const,
      position: "faceUp" as const,
      battlePosition: "attack" as const,
      placedThisTurn: false,
    };

    // Create state with Royal Magical Library face-up attack on monster zone
    initialState = createMockGameState({
      phase: "Main1",
      lp: { player: 8000, opponent: 8000 },
      zones: {
        deck: [
          {
            instanceId: "deck-0",
            id: 1001,
            jaName: "サンプルカード",
            type: "spell" as const,
            frameType: "spell" as const,
            location: "deck" as const,
            placedThisTurn: false,
          },
          {
            instanceId: "deck-1",
            id: 1002,
            jaName: "サンプルカード2",
            type: "spell" as const,
            frameType: "spell" as const,
            location: "deck" as const,
            placedThisTurn: false,
          },
        ],
        hand: [],
        mainMonsterZone: [sourceInstance],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      },
    });
  });

  describe("static properties", () => {
    it("should have isCardActivation = false (effect activation, not card activation)", () => {
      expect(effect.isCardActivation).toBe(false);
    });

    it("should have spellSpeed = 1 (ignition effect)", () => {
      expect(effect.spellSpeed).toBe(1);
    });

    it("should have effectCategory = ignition", () => {
      expect(effect.effectCategory).toBe("ignition");
    });

    it("should have correct effectId for once-per-turn tracking", () => {
      expect(effect.effectId).toBe("royal-magical-library-ignition");
    });
  });

  describe("canActivate", () => {
    it("should return valid when all conditions are met", () => {
      const result = effect.canActivate(initialState, sourceInstance);

      expect(result.isValid).toBe(true);
    });

    it("should return invalid when game is over", () => {
      const gameOverState = createMockGameState({
        ...initialState,
        result: {
          isGameOver: true,
          winner: "player" as const,
          reason: "exodia" as const,
        },
        zones: initialState.zones,
      });

      const result = effect.canActivate(gameOverState, sourceInstance);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("GAME_OVER");
    });

    it("should return invalid when not in Main Phase", () => {
      const drawPhaseState = createMockGameState({
        ...initialState,
        phase: "Draw",
        zones: initialState.zones,
      });

      const result = effect.canActivate(drawPhaseState, sourceInstance);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NOT_MAIN_PHASE");
    });

    it("should have no once-per-turn restriction (can activate multiple times)", () => {
      // Note: Royal Magical Library has no once-per-turn restriction
      // The cost (removing 3 Spell Counters) limits activations in the real game
      // In this simplified version without Spell Counters, it can be activated unlimited times
      const effectKey = `${libraryInstanceId}:${effect.effectId}`;
      const activatedState = createMockGameState({
        ...initialState,
        activatedIgnitionEffectsThisTurn: new Set([effectKey]),
        zones: initialState.zones,
      });

      const result = effect.canActivate(activatedState, sourceInstance);

      // Should still be valid even after previous activation
      expect(result.isValid).toBe(true);
    });

    it("should return invalid when card is not on monster zone", () => {
      const notOnFieldState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: initialState.zones.deck,
          hand: [sourceInstance],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = effect.canActivate(notOnFieldState, sourceInstance);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("CARD_NOT_ON_FIELD");
    });

    it("should return valid when card is in defense position (ignition effects work in any battle position)", () => {
      const defenseInstance: CardInstance = {
        ...sourceInstance,
        position: "faceUp" as const,
        battlePosition: "defense" as const,
      };
      const defenseState = createMockGameState({
        phase: "Main1",
        zones: {
          deck: initialState.zones.deck,
          hand: [],
          mainMonsterZone: [defenseInstance],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const result = effect.canActivate(defenseState, defenseInstance);

      // Ignition effects can be activated in any battle position as long as the card is face-up
      expect(result.isValid).toBe(true);
    });
  });

  describe("createActivationSteps", () => {
    it("should return empty array (no activation cost in simplified version)", () => {
      const steps = effect.createActivationSteps(initialState, sourceInstance);

      // Simplified version has no cost, so no activation steps
      expect(steps).toHaveLength(0);
    });
  });

  describe("createResolutionSteps", () => {
    it("should return resolution steps with draw effect", () => {
      const steps = effect.createResolutionSteps(initialState, sourceInstance);

      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("draw-1");
    });

    it("should draw 1 card when resolved", () => {
      const steps = effect.createResolutionSteps(initialState, sourceInstance);
      const drawStep = steps[0];

      const result = drawStep.action(initialState);

      expect(result.success).toBe(true);
      expect(result.updatedState.zones.deck).toHaveLength(1); // Started with 2
      expect(result.updatedState.zones.hand).toHaveLength(1); // Started with 0
    });
  });

  describe("integration: full effect flow", () => {
    it("should successfully execute full activation and resolution", () => {
      // Check can activate
      const canActivate = effect.canActivate(initialState, sourceInstance);
      expect(canActivate.isValid).toBe(true);

      // Execute activation steps (empty in simplified version)
      const activationSteps = effect.createActivationSteps(initialState, sourceInstance);
      expect(activationSteps).toHaveLength(0);

      // Execute resolution steps
      let currentState = initialState;
      const resolutionSteps = effect.createResolutionSteps(currentState, sourceInstance);

      for (const step of resolutionSteps) {
        const result = step.action(currentState);
        expect(result.success).toBe(true);
        currentState = result.updatedState;
      }

      // Verify draw occurred
      expect(currentState.zones.hand).toHaveLength(1);
      expect(currentState.zones.deck).toHaveLength(1);
    });

    it("should be able to activate multiple times in the same turn (no once-per-turn restriction)", () => {
      // First activation
      const canActivateFirst = effect.canActivate(initialState, sourceInstance);
      expect(canActivateFirst.isValid).toBe(true);

      // After first activation, should still be able to activate again
      // (Royal Magical Library has no once-per-turn restriction)
      const canActivateSecond = effect.canActivate(initialState, sourceInstance);
      expect(canActivateSecond.isValid).toBe(true);
    });
  });
});
