/**
 * CardDestructionActivation Tests
 *
 * Tests for CardDestructionActivation ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase, Hand size >= 3)
 * - spellSpeed = 2 (Quick-Play Spell)
 * - createActivationSteps() returns activation notification
 * - createResolutionSteps() returns 4 steps (Discard player, Discard opponent, Draw both, Graveyard)
 * - Card selection with cancelable=false validation
 *
 * @module tests/unit/domain/effects/chainable/CardDestructionActivation
 */

import { describe, it, expect } from "vitest";
import { CardDestructionActivation } from "$lib/domain/effects/actions/spell/CardDestructionActivation";
import { createInitialGameState } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";

describe("CardDestructionActivation", () => {
  const action = new CardDestructionActivation();

  describe("ChainableAction interface properties", () => {
    it("should be a card activation", () => {
      expect(action.isCardActivation).toBe(true);
    });

    it("should have spell speed 2 (Quick-Play)", () => {
      expect(action.spellSpeed).toBe(2);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met", () => {
      // Arrange: Game not over, Main Phase 1, Hand >= 3 (spell + 2 to discard)
      const state = createInitialGameState([1001, 1002, 1003]);
      const stateWithCards: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          hand: [
            { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
            { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
            { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateWithCards)).toBe(true);
    });

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const state = createInitialGameState([1001, 1002]);
      const gameOverState: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          hand: [
            { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
            { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
            { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
          ],
        },
        result: {
          isGameOver: true,
          winner: "player",
          reason: "exodia",
        },
      };

      // Act & Assert
      expect(action.canActivate(gameOverState)).toBe(false);
    });

    it("should return false when phase is not Main1", () => {
      // Arrange: Phase is Draw
      const state = createInitialGameState([1001, 1002]);
      const stateWithCards: GameState = {
        ...state,
        zones: {
          ...state.zones,
          hand: [
            { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
            { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
            { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateWithCards)).toBe(false);
    });

    it("should return false when hand has only 2 cards", () => {
      // Arrange: Hand has 2 cards (not enough)
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          hand: [
            { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
            { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
    });

    it("should return true when hand has exactly 3 cards", () => {
      // Arrange: Hand has exactly 3 cards (edge case)
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          hand: [
            { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
            { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
            { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });
  });

  describe("createActivationSteps()", () => {
    it("should return activation notification step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);

      // Act
      const steps = action.createActivationSteps(state);

      // Assert
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("card-destruction-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("手札断札を発動します");
      expect(steps[0].notificationLevel).toBe("info");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return 4 resolution steps", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "card-destruction-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps).toHaveLength(4);
    });

    it("should have player discard step as first step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "card-destruction-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[0].id).toBe("card-destruction-discard-player");
      expect(steps[0].summary).toBe("手札を捨てる");
      expect(steps[0].notificationLevel).toBe("interactive");
      expect(steps[0].cardSelectionConfig).toBeDefined();
      expect(steps[0].cardSelectionConfig?.minCards).toBe(2);
      expect(steps[0].cardSelectionConfig?.maxCards).toBe(2);
      expect(steps[0].cardSelectionConfig?.cancelable).toBe(false); // Non-cancelable
    });

    it("should have opponent discard step as second step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "card-destruction-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[1].id).toBe("card-destruction-discard-opponent");
      expect(steps[1].summary).toBe("相手が手札を捨てる");
    });

    it("should have draw step as third step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "card-destruction-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[2].id).toBe("card-destruction-draw");
      expect(steps[2].summary).toBe("カードをドロー");
      expect(steps[2].description).toBe("両プレイヤーがデッキから2枚ドローします");
    });

    it("should have graveyard step as fourth step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002, 1003]);
      const activatedCardInstanceId = "card-destruction-instance-1";

      // Act
      const steps = action.createResolutionSteps(state, activatedCardInstanceId);

      // Assert
      expect(steps[3].id).toBe("card-destruction-graveyard");
      expect(steps[3].summary).toBe("墓地へ送る");
      expect(steps[3].description).toBe("手札断札を墓地に送ります");
    });

    describe("Player discard step action", () => {
      it("should discard 2 selected cards", () => {
        // Arrange: Hand has 4 cards
        const state = createInitialGameState([1001, 1002, 1003]);
        const stateWithCards: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
              { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
              { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
              { id: 2004, instanceId: "hand-3", name: "Card 4", type: "Monster", location: "hand" },
            ],
          },
        };
        const activatedCardInstanceId = "card-destruction-instance-1";
        const steps = action.createResolutionSteps(stateWithCards, activatedCardInstanceId);

        // Act: Select 2 cards to discard
        const result = steps[0].action(stateWithCards, ["hand-0", "hand-1"]);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.hand).toHaveLength(2); // 4 - 2 = 2
        expect(result.newState.zones.graveyard).toHaveLength(2);
      });

      it("should return failure when not exactly 2 cards selected", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003]);
        const stateWithCards: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              { id: 2001, instanceId: "hand-0", name: "Card 1", type: "Monster", location: "hand" },
              { id: 2002, instanceId: "hand-1", name: "Card 2", type: "Monster", location: "hand" },
              { id: 2003, instanceId: "hand-2", name: "Card 3", type: "Monster", location: "hand" },
            ],
          },
        };
        const activatedCardInstanceId = "card-destruction-instance-1";
        const steps = action.createResolutionSteps(stateWithCards, activatedCardInstanceId);

        // Act: Select only 1 card
        const result = steps[0].action(stateWithCards, ["hand-0"]);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBe("Must select exactly 2 cards to discard");
      });
    });

    describe("Opponent discard step action", () => {
      it("should succeed without state change (internal only)", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "card-destruction-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[1].action(state);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState).toBe(state); // No state change (opponent hand not tracked)
        expect(result.message).toBe("Opponent discarded 2 cards (internal)");
      });
    });

    describe("Draw step action", () => {
      it("should draw 2 cards for both players", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002, 1003, 1004]);
        const activatedCardInstanceId = "card-destruction-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[2].action(state);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.deck).toHaveLength(2); // 4 - 2 = 2
        expect(result.newState.zones.hand).toHaveLength(2); // 0 + 2 = 2
        expect(result.message).toBe("Both players drew 2 cards");
      });

      it("should return failure when deck has only 1 card", () => {
        // Arrange
        const state = createInitialGameState([1001]);
        const activatedCardInstanceId = "card-destruction-instance-1";
        const steps = action.createResolutionSteps(state, activatedCardInstanceId);

        // Act
        const result = steps[2].action(state);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBe("Cannot draw 2 cards. Not enough cards in deck.");
      });
    });

    describe("Graveyard step action", () => {
      it("should send activated card to graveyard", () => {
        // Arrange: Create state with activated card in hand
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "card-destruction-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 74519184,
                instanceId: activatedCardInstanceId,
                name: "Card Destruction",
                type: "Spell",
                location: "hand",
              },
            ],
          },
        };

        const steps = action.createResolutionSteps(stateWithSpellInHand, activatedCardInstanceId);

        // Act
        const result = steps[3].action(stateWithSpellInHand);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.graveyard).toHaveLength(1);
        expect(result.newState.zones.graveyard[0].instanceId).toBe(activatedCardInstanceId);
        expect(result.newState.zones.graveyard[0].location).toBe("graveyard");
        expect(result.message).toBe("Sent Card Destruction to graveyard");
      });
    });
  });
});
