/**
 * DarkFactoryAction Tests
 *
 * Tests for DarkFactoryAction ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase, Graveyard filtering)
 * - spellSpeed = 1 (Normal Spell)
 * - createActivationSteps() returns activation notification
 * - createResolutionSteps() returns 2 steps (Select from graveyard, Graveyard)
 * - Card selection with graveyard filter (Normal Monsters only)
 *
 * @module tests/unit/domain/effects/chainable/DarkFactoryAction
 */

import { describe, it, expect } from "vitest";
import { DarkFactoryAction } from "$lib/domain/effects/chainable/DarkFactoryAction";
import { createInitialGameState } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";

describe("DarkFactoryAction", () => {
  const action = new DarkFactoryAction();

  describe("ChainableAction interface properties", () => {
    it("should be a card activation", () => {
      expect(action.isCardActivation).toBe(true);
    });

    it("should have spell speed 1 (Normal Spell)", () => {
      expect(action.spellSpeed).toBe(1);
    });
  });

  describe("canActivate()", () => {
    it("should return true when all conditions are met", () => {
      // Arrange: Game not over, Main Phase 1, Graveyard >= 2 Normal Monsters
      const state = createInitialGameState([1001, 1002]);
      const stateWithGraveyard: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          graveyard: [
            {
              id: 2001,
              instanceId: "graveyard-0",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
            {
              id: 2002,
              instanceId: "graveyard-1",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateWithGraveyard)).toBe(true);
    });

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const state = createInitialGameState([1001, 1002]);
      const gameOverState: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          graveyard: [
            {
              id: 2001,
              instanceId: "graveyard-0",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
            {
              id: 2002,
              instanceId: "graveyard-1",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
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
      const stateWithGraveyard: GameState = {
        ...state,
        zones: {
          ...state.zones,
          graveyard: [
            {
              id: 2001,
              instanceId: "graveyard-0",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
            {
              id: 2002,
              instanceId: "graveyard-1",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateWithGraveyard)).toBe(false);
    });

    it("should return false when graveyard has only 1 Normal Monster", () => {
      // Arrange: Graveyard has 1 Normal Monster (not enough)
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          graveyard: [
            {
              id: 2001,
              instanceId: "graveyard-0",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
    });

    it("should return false when graveyard has only Effect Monsters", () => {
      // Arrange: Graveyard has 2 Effect Monsters (not Normal)
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          graveyard: [
            {
              id: 2001,
              instanceId: "graveyard-0",
              type: "monster",
              frameType: "effect",
              location: "graveyard",
            },
            {
              id: 2002,
              instanceId: "graveyard-1",
              type: "monster",
              frameType: "effect",
              location: "graveyard",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
    });

    it("should return true when graveyard has exactly 2 Normal Monsters", () => {
      // Arrange: Graveyard has exactly 2 Normal Monsters (edge case)
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          graveyard: [
            {
              id: 2001,
              instanceId: "graveyard-0",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
            {
              id: 2002,
              instanceId: "graveyard-1",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });

    it("should return true when graveyard has mix of Normal and Effect Monsters (>= 2 Normal)", () => {
      // Arrange: Graveyard has 2 Normal + 1 Effect Monster
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          graveyard: [
            {
              id: 2001,
              instanceId: "graveyard-0",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
            {
              id: 2002,
              instanceId: "graveyard-1",
              type: "monster",
              frameType: "effect",
              location: "graveyard",
            },
            {
              id: 2003,
              instanceId: "graveyard-2",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
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
      expect(steps[0].id).toBe("dark-factory-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("闇の量産工場を発動します");
      expect(steps[0].notificationLevel).toBe("info");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return 2 resolution steps", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const stateWithGraveyard: GameState = {
        ...state,
        zones: {
          ...state.zones,
          graveyard: [
            {
              id: 2001,
              instanceId: "graveyard-0",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
            {
              id: 2002,
              instanceId: "graveyard-1",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
          ],
        },
      };
      const activatedCardInstanceId = "dark-factory-instance-1";

      // Act
      const steps = action.createResolutionSteps(stateWithGraveyard, activatedCardInstanceId);

      // Assert
      expect(steps).toHaveLength(2);
    });

    it("should have monster selection step as first step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const normalMonster1: CardInstance = {
        id: 2001,
        instanceId: "graveyard-0",
        type: "monster",
        frameType: "normal",
        location: "graveyard",
      };
      const normalMonster2: CardInstance = {
        id: 2002,
        instanceId: "graveyard-1",
        type: "monster",
        frameType: "normal",
        location: "graveyard",
      };
      const stateWithGraveyard: GameState = {
        ...state,
        zones: {
          ...state.zones,
          graveyard: [normalMonster1, normalMonster2],
        },
      };
      const activatedCardInstanceId = "dark-factory-instance-1";

      // Act
      const steps = action.createResolutionSteps(stateWithGraveyard, activatedCardInstanceId);

      // Assert
      expect(steps[0].id).toBe("dark-factory-select");
      expect(steps[0].summary).toBe("モンスターを選択");
      expect(steps[0].notificationLevel).toBe("interactive");
      expect(steps[0].cardSelectionConfig).toBeDefined();
      expect(steps[0].cardSelectionConfig?.minCards).toBe(2);
      expect(steps[0].cardSelectionConfig?.maxCards).toBe(2);
      expect(steps[0].cardSelectionConfig?.cancelable).toBe(false); // Non-cancelable
      expect(steps[0].cardSelectionConfig?.availableCards).toHaveLength(2);
      expect(steps[0].cardSelectionConfig?.availableCards).toEqual([normalMonster1, normalMonster2]);
    });

    it("should filter out Effect Monsters from available cards", () => {
      // Arrange: Graveyard has 2 Normal + 1 Effect Monster
      const state = createInitialGameState([1001, 1002]);
      const normalMonster1: CardInstance = {
        id: 2001,
        instanceId: "graveyard-0",
        type: "monster",
        frameType: "normal",
        location: "graveyard",
      };
      const effectMonster: CardInstance = {
        id: 2002,
        instanceId: "graveyard-1",
        type: "monster",
        frameType: "effect",
        location: "graveyard",
      };
      const normalMonster2: CardInstance = {
        id: 2003,
        instanceId: "graveyard-2",
        type: "monster",
        frameType: "normal",
        location: "graveyard",
      };
      const stateWithGraveyard: GameState = {
        ...state,
        zones: {
          ...state.zones,
          graveyard: [normalMonster1, effectMonster, normalMonster2],
        },
      };
      const activatedCardInstanceId = "dark-factory-instance-1";

      // Act
      const steps = action.createResolutionSteps(stateWithGraveyard, activatedCardInstanceId);

      // Assert
      expect(steps[0].cardSelectionConfig?.availableCards).toHaveLength(2);
      expect(steps[0].cardSelectionConfig?.availableCards).toEqual([normalMonster1, normalMonster2]);
      expect(steps[0].cardSelectionConfig?.availableCards).not.toContainEqual(effectMonster);
    });

    it("should have graveyard step as second step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const stateWithGraveyard: GameState = {
        ...state,
        zones: {
          ...state.zones,
          graveyard: [
            {
              id: 2001,
              instanceId: "graveyard-0",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
            {
              id: 2002,
              instanceId: "graveyard-1",
              type: "monster",
              frameType: "normal",
              location: "graveyard",
            },
          ],
        },
      };
      const activatedCardInstanceId = "dark-factory-instance-1";

      // Act
      const steps = action.createResolutionSteps(stateWithGraveyard, activatedCardInstanceId);

      // Assert
      expect(steps[1].id).toBe("dark-factory-graveyard");
      expect(steps[1].summary).toBe("墓地へ送る");
      expect(steps[1].description).toBe("闇の量産工場を墓地に送ります");
    });

    describe("Monster selection step action", () => {
      it("should move 2 selected Normal Monsters from graveyard to hand", () => {
        // Arrange: Graveyard has 3 Normal Monsters
        const state = createInitialGameState([1001, 1002]);
        const stateWithGraveyard: GameState = {
          ...state,
          zones: {
            ...state.zones,
            graveyard: [
              {
                id: 2001,
                instanceId: "graveyard-0",
                type: "monster",
                frameType: "normal",
                location: "graveyard",
              },
              {
                id: 2002,
                instanceId: "graveyard-1",
                type: "monster",
                frameType: "normal",
                location: "graveyard",
              },
              {
                id: 2003,
                instanceId: "graveyard-2",
                type: "monster",
                frameType: "normal",
                location: "graveyard",
              },
            ],
          },
        };
        const activatedCardInstanceId = "dark-factory-instance-1";
        const steps = action.createResolutionSteps(stateWithGraveyard, activatedCardInstanceId);

        // Act: Select 2 Normal Monsters from graveyard
        const result = steps[0].action(stateWithGraveyard, ["graveyard-0", "graveyard-1"]);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.graveyard).toHaveLength(1); // 3 - 2 = 1
        expect(result.newState.zones.hand).toHaveLength(2); // 0 + 2 = 2
        expect(result.message).toBe("Added 2 Normal Monsters from graveyard to hand");
      });

      it("should return failure when not exactly 2 monsters selected", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const stateWithGraveyard: GameState = {
          ...state,
          zones: {
            ...state.zones,
            graveyard: [
              {
                id: 2001,
                instanceId: "graveyard-0",
                type: "monster",
                frameType: "normal",
                location: "graveyard",
              },
              {
                id: 2002,
                instanceId: "graveyard-1",
                type: "monster",
                frameType: "normal",
                location: "graveyard",
              },
            ],
          },
        };
        const activatedCardInstanceId = "dark-factory-instance-1";
        const steps = action.createResolutionSteps(stateWithGraveyard, activatedCardInstanceId);

        // Act: Select only 1 monster
        const result = steps[0].action(stateWithGraveyard, ["graveyard-0"]);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBe("Must select exactly 2 Normal Monsters from graveyard");
      });
    });

    describe("Graveyard step action", () => {
      it("should send activated card to graveyard", () => {
        // Arrange: Create state with activated card in hand
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "dark-factory-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 90928333,
                instanceId: activatedCardInstanceId,
                type: "spell",
                frameType: "spell",
                location: "hand",
              },
            ],
            graveyard: [
              {
                id: 2001,
                instanceId: "graveyard-0",
                type: "monster",
                frameType: "normal",
                location: "graveyard",
              },
              {
                id: 2002,
                instanceId: "graveyard-1",
                type: "monster",
                frameType: "normal",
                location: "graveyard",
              },
            ],
          },
        };

        const steps = action.createResolutionSteps(stateWithSpellInHand, activatedCardInstanceId);

        // Act
        const result = steps[1].action(stateWithSpellInHand);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.graveyard).toHaveLength(3); // 2 monsters + 1 spell
        expect(result.newState.zones.graveyard[2].instanceId).toBe(activatedCardInstanceId);
        expect(result.newState.zones.graveyard[2].location).toBe("graveyard");
        expect(result.message).toBe("Sent Dark Factory to graveyard");
      });
    });
  });
});
