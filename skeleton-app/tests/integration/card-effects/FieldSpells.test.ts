/**
 * Field Spell Card Effects Tests (Integration Layer)
 *
 * Tests Field Spell card-specific scenarios integrated with the full application layer.
 * Focuses on actual gameplay scenarios rather than implementation details.
 *
 * Test Responsibility:
 * - Field Spell card activation scenarios (end-to-end gameplay flow)
 * - Registry integration (cardId → Effect retrieval → Effect execution)
 * - Field spell placement mechanics (stays on field, no graveyard step)
 * - Actual game state changes (hand → field, continuous effects)
 *
 * Test Strategy (from docs/architecture/testing-strategy.md):
 * - **Base class validation**: Tested in tests/unit/domain/effects/actions/spells/
 *   - BaseSpellAction.test.ts: Game-over check
 *   - FieldSpellAction.test.ts: spellSpeed=1, Main1 phase check, empty activation steps
 * - **Card scenarios**: Tested here
 *   - Chicken Game: Field placement → Ignition effect (pay LP, draw) → Continuous effect
 *
 * Rationale:
 * - Card-specific canActivate() conditions tested in base class
 * - Scenario-based tests detect real bugs more effectively
 * - Easy to add new cards without duplicating base class tests
 *
 * @module tests/integration/card-effects/FieldSpells
 */

import { describe, it, expect } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { AdvancePhaseCommand } from "$lib/domain/commands/AdvancePhaseCommand";
import { createMockGameState, createCardInstances } from "../../__testUtils__/gameStateFactory";
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/Ignitions/individuals/spells/ChickenGameIgnitionEffect";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameState } from "$lib/domain/models/GameState";

import { initializeChainableActionRegistry } from "$lib/domain/effects/actions/index";

initializeChainableActionRegistry();

describe("Chicken Game (67616300) - Integration Tests", () => {
  const chickenGameCardId = 67616300;

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
              jaName: "チキンゲーム",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "hand",
              placedThisTurn: false,
            },
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
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
      expect(result.effectSteps!.length).toBe(2); // Field spell has notification step + spell activated event step (no resolution steps)

      // Verify card moved to field
      expect(result.updatedState.zones.hand.length).toBe(0);
      expect(result.updatedState.zones.fieldZone.length).toBe(1);
      expect(result.updatedState.zones.fieldZone[0].id).toBe(chickenGameCardId);
      expect(result.updatedState.zones.fieldZone[0].stateOnField?.position).toBe("faceUp");
    });
  });

  describe("Ignition Effect (Pay 1000 LP, Draw 1 card)", () => {
    const chickenGameOnField: CardInstance = {
      instanceId: "field-0",
      id: chickenGameCardId,
      jaName: "チキンゲーム",
      type: "spell",
      frameType: "spell",
      spellType: "field",
      location: "fieldZone",
      stateOnField: {
        position: "faceUp",
        placedThisTurn: false,
        counters: [],
        activatedEffects: new Set(),
      },
    };

    it("Scenario: Activate ignition effect → Pay 1000 LP → Draw 1 card", async () => {
      // Arrange: Chicken Game on field, 8000 LP, 2 cards in deck
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [chickenGameOnField],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate ignition effect via ActivateIgnitionEffectCommand
      const { ActivateIgnitionEffectCommand } = await import("$lib/domain/commands/ActivateIgnitionEffectCommand");
      const command = new ActivateIgnitionEffectCommand("field-0");
      const commandResult = command.execute(state);
      expect(commandResult.success).toBe(true);

      // コマンド実行時に発動記録が stateOnField.activatedEffects に行われる
      const fieldCard = commandResult.updatedState.zones.fieldZone[0];
      expect(fieldCard.stateOnField?.activatedEffects.has("ignition-67616300-1")).toBe(true);

      // Execute effect steps
      let currentState = commandResult.updatedState;
      for (const step of commandResult.effectSteps!) {
        const stepResult = step.action(currentState);
        expect(stepResult.success).toBe(true);
        currentState = stepResult.updatedState;
      }

      // Assert: LP decreased by 1000, hand increased by 1
      expect(currentState.lp.player).toBe(7000); // 8000 - 1000
      expect(currentState.zones.hand.length).toBe(1);
      expect(currentState.zones.deck.length).toBe(1);
    });

    it("Scenario: Cannot activate twice in same turn (once per turn restriction)", () => {
      // Arrange: Effect already activated this turn
      const chickenGameAlreadyActivated: CardInstance = {
        instanceId: "field-0",
        id: chickenGameCardId,
        jaName: "チキンゲーム",
        type: "spell",
        frameType: "spell",
        spellType: "field",
        location: "fieldZone",
        stateOnField: {
          position: "faceUp",
          placedThisTurn: false,
          counters: [],
          activatedEffects: new Set(["ignition-67616300-1"]), // Already activated
        },
      };

      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [chickenGameAlreadyActivated],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Try to activate ignition effect again
      const ignitionEffect = new ChickenGameIgnitionEffect();
      const canActivate = ignitionEffect.canActivate(state, chickenGameAlreadyActivated);

      // Assert: Cannot activate
      expect(canActivate.isValid).toBe(false);
    });

    it("Scenario: Cannot activate when LP is less than 1000", () => {
      // Arrange: Player has only 500 LP
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 500, opponent: 8000 },
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [chickenGameOnField],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Try to activate ignition effect
      const ignitionEffect = new ChickenGameIgnitionEffect();
      const canActivate = ignitionEffect.canActivate(state, chickenGameOnField);

      // Assert: Cannot activate
      expect(canActivate.isValid).toBe(false);
    });

    it("Scenario: Once per turn restriction resets at End phase", () => {
      // Arrange: Effect activated in Main1, advance to End phase
      const chickenGameAlreadyActivated: CardInstance = {
        instanceId: "field-0",
        id: chickenGameCardId,
        jaName: "チキンゲーム",
        type: "spell",
        frameType: "spell",
        spellType: "field",
        location: "fieldZone",
        stateOnField: {
          position: "faceUp",
          placedThisTurn: false,
          counters: [],
          activatedEffects: new Set(["ignition-67616300-1"]), // Already activated
        },
      };

      const stateAfterActivation = createMockGameState({
        phase: "Main1",
        lp: { player: 7000, opponent: 8000 },
        zones: {
          deck: createCardInstances([1001, 1002], "deck"),
          hand: [
            {
              instanceId: "hand-0",
              id: 1001,
              jaName: "サンプルカード",
              type: "spell",
              frameType: "spell",
              location: "hand",
            },
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [chickenGameAlreadyActivated],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Advance from Main1 to End phase (MVP scope: no Battle Phase)
      const advanceToEnd = new AdvancePhaseCommand();
      const endPhaseResult = advanceToEnd.execute(stateAfterActivation);
      expect(endPhaseResult.success).toBe(true);
      expect(endPhaseResult.updatedState.phase).toBe("End");

      // Assert: stateOnField.activatedEffects is cleared at end phase
      const fieldCard = endPhaseResult.updatedState.zones.fieldZone[0];
      expect(fieldCard.stateOnField?.activatedEffects.size).toBe(0);
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
    it("Scenario: Activate card → Use ignition effect → Verify full state", async () => {
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
              jaName: "チキンゲーム",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "hand",
              placedThisTurn: false,
            },
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Step 1: Activate Chicken Game
      const activateCommand = new ActivateSpellCommand("hand-0");
      const activateResult = activateCommand.execute(initialState);
      expect(activateResult.success).toBe(true);

      const stateAfterActivation = activateResult.updatedState;
      expect(stateAfterActivation.zones.fieldZone.length).toBe(1);
      expect(stateAfterActivation.zones.fieldZone[0].id).toBe(chickenGameCardId);

      // Step 2: Use ignition effect via ActivateIgnitionEffectCommand
      const fieldCard = stateAfterActivation.zones.fieldZone[0];
      const ignitionEffect = new ChickenGameIgnitionEffect();

      expect(ignitionEffect.canActivate(stateAfterActivation, fieldCard).isValid).toBe(true);

      const { ActivateIgnitionEffectCommand } = await import("$lib/domain/commands/ActivateIgnitionEffectCommand");
      const ignitionCommand = new ActivateIgnitionEffectCommand(fieldCard.instanceId);
      const ignitionResult = ignitionCommand.execute(stateAfterActivation);
      expect(ignitionResult.success).toBe(true);

      // コマンド実行時に発動記録が stateOnField.activatedEffects に行われる
      const fieldCardAfterIgnition = ignitionResult.updatedState.zones.fieldZone[0];
      expect(fieldCardAfterIgnition.stateOnField?.activatedEffects.size).toBe(1);

      let currentState: GameState = ignitionResult.updatedState;
      for (const step of ignitionResult.effectSteps!) {
        const stepResult = step.action(currentState);
        expect(stepResult.success).toBe(true);
        currentState = stepResult.updatedState;
      }

      const finalState = currentState;

      // Assert final state
      expect(finalState.lp.player).toBe(7000); // 8000 - 1000
      expect(finalState.zones.fieldZone.length).toBe(1); // Chicken Game still on field
      expect(finalState.zones.hand.length).toBe(1); // Draw 1 card
      expect(finalState.zones.deck.length).toBe(2); // 3 - 1 = 2
      const finalFieldCard = finalState.zones.fieldZone[0];
      expect(finalFieldCard.stateOnField?.activatedEffects.size).toBe(1);

      // Step 3: Try to activate again (should fail)
      const ignitionEffect2 = new ChickenGameIgnitionEffect();
      expect(ignitionEffect2.canActivate(finalState, finalFieldCard).isValid).toBe(false);
    });
  });
});

// ===========================
// Toon World (15259703) - P3 Card
// TODO: 永続魔法なので、ファイルを分ける
// ===========================
describe("Field Spell Card Effects > Toon World (15259703)", () => {
  const toonWorldCardId = "15259703";

  it("Scenario: Activate with LP = 8000 → pay 1000 LP → LP = 7000, field = 1 (Toon World)", () => {
    // Arrange
    const state = createMockGameState({
      phase: "Main1",
      lp: { player: 8000, opponent: 8000 },
      zones: {
        deck: createCardInstances(["12345678"], "deck"),
        hand: createCardInstances([toonWorldCardId], "hand", "toon-world"),
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      },
    });

    // Act
    const command = new ActivateSpellCommand("toon-world-0");
    const result = command.execute(state);

    // Assert: Activation successful
    expect(result.success).toBe(true);
    expect(result.effectSteps).toBeDefined();
    expect(result.effectSteps!.length).toBe(3); // Notification step + spell activated event + LP payment step

    // Verify notification step and LP payment step
    expect(result.effectSteps![0].summary).toBe("カード発動");
    // index=1 is emitSpellActivatedEventStep (skipped in assertion)
    expect(result.effectSteps![2].id).toContain("pay-lp-player-1000");

    // Note: Card stays on field (not sent to graveyard)
    // Field spell placement is handled by ActivateSpellCommand
  });

  it("Scenario: Cannot activate when LP < 1000", () => {
    // Arrange: Player LP too low
    const state = createMockGameState({
      phase: "Main1",
      lp: { player: 500, opponent: 8000 },
      zones: {
        deck: createCardInstances(["12345678"], "deck"),
        hand: createCardInstances([toonWorldCardId], "hand", "toon-world"),
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      },
    });

    // Act
    const command = new ActivateSpellCommand("toon-world-0");
    const result = command.canExecute(state);

    // Assert: Cannot activate (insufficient LP)
    expect(result.isValid).toBe(false);
  });
});
