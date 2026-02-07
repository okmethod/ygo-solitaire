/**
 * Unit tests for RoyalMagicalLibraryIgnitionEffect
 *
 * Tests the ignition effect of Royal Magical Library (王立魔法図書館)
 * Card ID: 70791313
 *
 * Effect: Remove 3 Spell Counters from this card; draw 1 card.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { RoyalMagicalLibraryIgnitionEffect } from "$lib/domain/effects/actions/Ignitions/individuals/monsters/RoyalMagicalLibraryIgnitionEffect";
import { createMockGameState } from "../../../../../../__testUtils__/gameStateFactory";
import { getCounterCount } from "$lib/domain/models/Counter";
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
      counters: [{ type: "spell", count: 3 }], // 魔力カウンター3つ
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
            counters: [],
          },
          {
            instanceId: "deck-1",
            id: 1002,
            jaName: "サンプルカード2",
            type: "spell" as const,
            frameType: "spell" as const,
            location: "deck" as const,
            placedThisTurn: false,
            counters: [],
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
    it("should have effectCategory = ignition", () => {
      expect(effect.effectCategory).toBe("ignition");
    });

    it("should have spellSpeed = 1 (ignition effect)", () => {
      expect(effect.spellSpeed).toBe(1);
    });

    it("should have correct effectId for once-per-turn tracking", () => {
      expect(effect.effectId).toBe("ignition-70791313-1");
    });
  });

  describe("canActivate", () => {
    it("should return valid when spell counters >= 3", () => {
      const result = effect.canActivate(initialState, sourceInstance);

      expect(result.isValid).toBe(true);
    });

    it("should return invalid when spell counters < 3", () => {
      const insufficientCounterInstance: CardInstance = {
        ...sourceInstance,
        counters: [{ type: "spell", count: 2 }],
      };

      const result = effect.canActivate(initialState, insufficientCounterInstance);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("INSUFFICIENT_COUNTERS");
    });

    it("should return invalid when no counters", () => {
      const noCounterInstance: CardInstance = {
        ...sourceInstance,
        counters: [],
      };

      const result = effect.canActivate(initialState, noCounterInstance);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("INSUFFICIENT_COUNTERS");
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

    it("should have no once-per-turn restriction (can activate multiple times if counters available)", () => {
      const effectKey = `${libraryInstanceId}:${effect.effectId}`;
      const activatedState = createMockGameState({
        ...initialState,
        activatedIgnitionEffectsThisTurn: new Set([effectKey]),
        zones: initialState.zones,
      });

      const result = effect.canActivate(activatedState, sourceInstance);

      expect(result.isValid).toBe(true);
    });

    it("should return valid when card is in defense position", () => {
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

      expect(result.isValid).toBe(true);
    });
  });

  describe("createActivationSteps", () => {
    it("should return activation steps with notify and counter removal", () => {
      const steps = effect.createActivationSteps(initialState, sourceInstance);

      expect(steps).toHaveLength(2);
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[1].summary).toBe("カウンターを取り除く");
    });

    it("should remove 3 spell counters when activation step executed", () => {
      const steps = effect.createActivationSteps(initialState, sourceInstance);
      const removeCounterStep = steps[1];

      const result = removeCounterStep.action(initialState);

      expect(result.success).toBe(true);
      const updatedLibrary = result.updatedState.zones.mainMonsterZone[0];
      expect(getCounterCount(updatedLibrary.counters, "spell")).toBe(0);
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
    it("should successfully execute full activation and resolution with counter consumption", () => {
      // Check can activate
      const canActivate = effect.canActivate(initialState, sourceInstance);
      expect(canActivate.isValid).toBe(true);

      // Execute activation steps
      const activationSteps = effect.createActivationSteps(initialState, sourceInstance);
      expect(activationSteps).toHaveLength(2);

      let currentState = initialState;
      for (const step of activationSteps) {
        const result = step.action(currentState);
        expect(result.success).toBe(true);
        currentState = result.updatedState;
      }

      // Verify counters removed after activation
      const libraryAfterActivation = currentState.zones.mainMonsterZone[0];
      expect(getCounterCount(libraryAfterActivation.counters, "spell")).toBe(0);

      // Execute resolution steps
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

    it("should be able to activate again after accumulating 3 more counters", () => {
      // After first activation (counters = 0), cannot activate
      const noCounterInstance: CardInstance = {
        ...sourceInstance,
        counters: [],
      };
      const canActivateWithoutCounters = effect.canActivate(initialState, noCounterInstance);
      expect(canActivateWithoutCounters.isValid).toBe(false);

      // After accumulating 3 counters again, can activate
      const threeCounterInstance: CardInstance = {
        ...sourceInstance,
        counters: [{ type: "spell", count: 3 }],
      };
      const canActivateWithCounters = effect.canActivate(initialState, threeCounterInstance);
      expect(canActivateWithCounters.isValid).toBe(true);
    });

    it("should work with exactly 3 counters (edge case)", () => {
      const exactlyThreeInstance: CardInstance = {
        ...sourceInstance,
        counters: [{ type: "spell", count: 3 }],
      };

      const canActivate = effect.canActivate(initialState, exactlyThreeInstance);
      expect(canActivate.isValid).toBe(true);

      const activationSteps = effect.createActivationSteps(initialState, exactlyThreeInstance);
      const stateWithExactly3 = {
        ...initialState,
        zones: {
          ...initialState.zones,
          mainMonsterZone: [exactlyThreeInstance],
        },
      };

      const removeStep = activationSteps[1];
      const result = removeStep.action(stateWithExactly3);

      expect(result.success).toBe(true);
      const updatedLibrary = result.updatedState.zones.mainMonsterZone[0];
      expect(getCounterCount(updatedLibrary.counters, "spell")).toBe(0);
    });

    it("should work with more than 3 counters", () => {
      const fiveCounterInstance: CardInstance = {
        ...sourceInstance,
        counters: [{ type: "spell", count: 5 }],
      };

      const canActivate = effect.canActivate(initialState, fiveCounterInstance);
      expect(canActivate.isValid).toBe(true);

      const activationSteps = effect.createActivationSteps(initialState, fiveCounterInstance);
      const stateWith5 = {
        ...initialState,
        zones: {
          ...initialState.zones,
          mainMonsterZone: [fiveCounterInstance],
        },
      };

      const removeStep = activationSteps[1];
      const result = removeStep.action(stateWith5);

      expect(result.success).toBe(true);
      const updatedLibrary = result.updatedState.zones.mainMonsterZone[0];
      expect(getCounterCount(updatedLibrary.counters, "spell")).toBe(2); // 5 - 3 = 2
    });
  });
});
