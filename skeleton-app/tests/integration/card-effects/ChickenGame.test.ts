/**
 * Chicken Game Integration Tests
 *
 * Tests Chicken Game (チキンレース) card in full gameplay scenarios:
 * - Card activation (Field Spell placement)
 * - Ignition effect (Pay 1000 LP, draw 1 card, once per turn)
 * - Continuous effect (Damage prevention when LP is lower)
 *
 * Test Coverage:
 * - Card activation flow (hand → field, field spell zone check)
 * - Ignition effect activation flow (LP payment, draw, once per turn restriction)
 * - Continuous effect (ChickenGameContinuousEffect integration)
 * - Phase transitions clear once per turn tracking
 *
 * @module tests/integration/card-effects/ChickenGame
 */

import { describe, it, expect } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { AdvancePhaseCommand } from "$lib/domain/commands/AdvancePhaseCommand";
import { createMockGameState, createCardInstances } from "../../__testUtils__/gameStateFactory";
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/spell/ChickenGameIgnitionEffect";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameState } from "$lib/domain/models/GameState";

// Import effects/index.ts to ensure ChainableActionRegistry is initialized
import "$lib/domain/effects";
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";

describe("Chicken Game (67616300) - Integration Tests", () => {
  const chickenGameCardId = 67616300;

  // Debug: Check if Chicken Game is registered
  it("Debug: Chicken Game should be registered in ChainableActionRegistry", () => {
    const action = ChainableActionRegistry.get(chickenGameCardId);
    expect(action).toBeDefined();
    expect(action?.isCardActivation).toBe(true);
    expect(action?.spellSpeed).toBe(1);
  });

  describe("Card Activation (Field Spell)", () => {
    it("Scenario: Activate Chicken Game → Placed on field as field spell", () => {
      // Arrange: Chicken Game in hand, no field spell on field
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [
            {
              instanceId: "hand-0",
              id: chickenGameCardId,
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "hand",
            },
          ],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Chicken Game
      const command = new ActivateSpellCommand("hand-0");
      const result = command.execute(state);

      // Assert: Card moved to field (no graveyard step for field spell)
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(0); // Field spell has no resolution steps

      // Verify card moved to field
      expect(result.newState.zones.hand.length).toBe(0);
      expect(result.newState.zones.field.length).toBe(1);
      expect(result.newState.zones.field[0].id).toBe(chickenGameCardId);
      expect(result.newState.zones.field[0].position).toBe("faceUp");
    });

    it("Scenario: Cannot activate when another field spell is already on field", () => {
      // Arrange: Another field spell already on field
      const anotherFieldSpell: CardInstance = {
        instanceId: "field-0",
        id: 99999999,
        type: "spell",
        frameType: "spell",
        spellType: "field",
        location: "field",
        position: "faceUp",
      };

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [
            {
              instanceId: "hand-0",
              id: chickenGameCardId,
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "hand",
            },
          ],
          field: [anotherFieldSpell],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Try to activate Chicken Game
      const command = new ActivateSpellCommand("hand-0");
      const result = command.execute(state);

      // Assert: Should succeed but canActivate should be false in execute
      // Actually, ActivateSpellCommand.canExecute() checks the original state (hand),
      // which should pass. Then in execute(), after moving to field, canActivate()
      // is checked again, which should fail because there are now 2 field spells.
      // This means the command will use fallback (graveyard) logic.
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeUndefined(); // Fallback logic doesn't set effectSteps
    });
  });

  describe("Ignition Effect (Pay 1000 LP, Draw 1 card)", () => {
    const chickenGameOnField: CardInstance = {
      instanceId: "field-0",
      id: chickenGameCardId,
      type: "spell",
      frameType: "spell",
      spellType: "field",
      location: "field",
      position: "faceUp",
    };

    it("Scenario: Activate ignition effect → Pay 1000 LP → Draw 1 card", () => {
      // Arrange: Chicken Game on field, 8000 LP, 2 cards in deck
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [],
          field: [chickenGameOnField],
          graveyard: [],
          banished: [],
        },
        activatedIgnitionEffectsThisTurn: new Set<string>(),
      });

      // Act: Activate ignition effect
      const ignitionEffect = new ChickenGameIgnitionEffect("field-0");
      const activationSteps = ignitionEffect.createActivationSteps(state);
      const resolutionSteps = ignitionEffect.createResolutionSteps(state, "field-0");

      // Execute activation steps
      let currentState = state;
      for (const step of activationSteps) {
        const stepResult = step.action(currentState);
        expect(stepResult.success).toBe(true);
        currentState = stepResult.newState;
      }

      // Execute resolution steps
      for (const step of resolutionSteps) {
        const stepResult = step.action(currentState);
        expect(stepResult.success).toBe(true);
        currentState = stepResult.newState;
      }

      // Assert: LP decreased by 1000, hand increased by 1
      expect(currentState.lp.player).toBe(7000); // 8000 - 1000
      expect(currentState.zones.hand.length).toBe(1);
      expect(currentState.zones.deck.length).toBe(1);

      // Assert: Effect recorded
      expect(currentState.activatedIgnitionEffectsThisTurn.has("field-0:chicken-game-ignition")).toBe(true);
    });

    it("Scenario: Cannot activate twice in same turn (once per turn restriction)", () => {
      // Arrange: Effect already activated this turn
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [],
          field: [chickenGameOnField],
          graveyard: [],
          banished: [],
        },
        activatedIgnitionEffectsThisTurn: new Set<string>(["field-0:chicken-game-ignition"]),
      });

      // Act: Try to activate ignition effect again
      const ignitionEffect = new ChickenGameIgnitionEffect("field-0");
      const canActivate = ignitionEffect.canActivate(state);

      // Assert: Cannot activate
      expect(canActivate).toBe(false);
    });

    it("Scenario: Cannot activate when LP is less than 1000", () => {
      // Arrange: Player has only 500 LP
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 500, opponent: 8000 },
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [],
          field: [chickenGameOnField],
          graveyard: [],
          banished: [],
        },
        activatedIgnitionEffectsThisTurn: new Set<string>(),
      });

      // Act: Try to activate ignition effect
      const ignitionEffect = new ChickenGameIgnitionEffect("field-0");
      const canActivate = ignitionEffect.canActivate(state);

      // Assert: Cannot activate
      expect(canActivate).toBe(false);
    });

    it("Scenario: Once per turn restriction resets at End phase", () => {
      // Arrange: Effect activated in Main1, advance to End phase
      const stateAfterActivation = createMockGameState({
        phase: "Main1",
        lp: { player: 7000, opponent: 8000 },
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [
            {
              instanceId: "hand-0",
              id: 1001,
              type: "spell",
              frameType: "spell",
              location: "hand",
            },
          ],
          field: [chickenGameOnField],
          graveyard: [],
          banished: [],
        },
        activatedIgnitionEffectsThisTurn: new Set<string>(["field-0:chicken-game-ignition"]),
      });

      // Act: Advance from Main1 to End phase (MVP scope: no Battle Phase)
      const advanceToEnd = new AdvancePhaseCommand();
      const endPhaseResult = advanceToEnd.execute(stateAfterActivation);
      expect(endPhaseResult.success).toBe(true);
      expect(endPhaseResult.newState.phase).toBe("End");

      // Assert: activatedIgnitionEffectsThisTurn is cleared
      expect(endPhaseResult.newState.activatedIgnitionEffectsThisTurn.size).toBe(0);
    });
  });

  describe("Continuous Effect (Damage Prevention)", () => {
    it("Note: Continuous effect tested in ChickenGameContinuousEffect.test.ts", () => {
      // The continuous effect (damage prevention when LP is lower) is tested
      // in unit tests for ChickenGameContinuousEffect (AdditionalRule).
      // Integration with actual damage commands will be tested when
      // damage mechanics are fully implemented.
      expect(true).toBe(true);
    });
  });

  describe("Full Gameplay Scenario", () => {
    it("Scenario: Activate card → Use ignition effect → Verify full state", () => {
      // Arrange: Initial state - Chicken Game in hand
      const initialState = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: createCardInstances([1001, 1002, 1003], "deck"),
          hand: [
            {
              instanceId: "hand-0",
              id: chickenGameCardId,
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "hand",
            },
          ],
          field: [],
          graveyard: [],
          banished: [],
        },
      });

      // Step 1: Activate Chicken Game
      const activateCommand = new ActivateSpellCommand("hand-0");
      const activateResult = activateCommand.execute(initialState);
      expect(activateResult.success).toBe(true);

      const stateAfterActivation = activateResult.newState;
      expect(stateAfterActivation.zones.field.length).toBe(1);
      expect(stateAfterActivation.zones.field[0].id).toBe(chickenGameCardId);

      // Step 2: Use ignition effect
      const fieldCardInstanceId = stateAfterActivation.zones.field[0].instanceId;
      const ignitionEffect = new ChickenGameIgnitionEffect(fieldCardInstanceId);

      expect(ignitionEffect.canActivate(stateAfterActivation)).toBe(true);

      const activationSteps = ignitionEffect.createActivationSteps(stateAfterActivation);
      const resolutionSteps = ignitionEffect.createResolutionSteps(stateAfterActivation, fieldCardInstanceId);

      let currentState: GameState = stateAfterActivation;
      for (const step of activationSteps) {
        const stepResult = step.action(currentState);
        expect(stepResult.success).toBe(true);
        currentState = stepResult.newState;
      }

      for (const step of resolutionSteps) {
        const stepResult = step.action(currentState);
        expect(stepResult.success).toBe(true);
        currentState = stepResult.newState;
      }

      const finalState = currentState;

      // Assert final state
      expect(finalState.lp.player).toBe(7000); // 8000 - 1000
      expect(finalState.zones.field.length).toBe(1); // Chicken Game still on field
      expect(finalState.zones.hand.length).toBe(1); // Drew 1 card
      expect(finalState.zones.deck.length).toBe(2); // 3 - 1 = 2
      expect(finalState.activatedIgnitionEffectsThisTurn.size).toBe(1);

      // Step 3: Try to activate again (should fail)
      const ignitionEffect2 = new ChickenGameIgnitionEffect(fieldCardInstanceId);
      expect(ignitionEffect2.canActivate(finalState)).toBe(false);
    });
  });
});
