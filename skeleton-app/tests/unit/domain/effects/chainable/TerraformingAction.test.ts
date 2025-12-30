/**
 * TerraformingAction Tests
 *
 * Tests for TerraformingAction ChainableAction implementation.
 *
 * Test Coverage:
 * - canActivate() conditions (Game over, Phase, Deck filtering)
 * - spellSpeed = 1 (Normal Spell)
 * - createActivationSteps() returns activation notification
 * - createResolutionSteps() returns 2 steps (Select from deck, Graveyard)
 * - Card selection with deck filter (Field Spells only)
 *
 * @module tests/unit/domain/effects/chainable/TerraformingAction
 */

import { describe, it, expect } from "vitest";
import { TerraformingAction } from "$lib/domain/effects/chainable/TerraformingAction";
import { createInitialGameState } from "$lib/domain/models/GameState";
import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";

describe("TerraformingAction", () => {
  const action = new TerraformingAction();

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
      // Arrange: Game not over, Main Phase 1, Deck >= 1 Field Spell
      const state = createInitialGameState([1001, 1002]);
      const stateWithDeck: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          deck: [
            {
              id: 2001,
              instanceId: "deck-0",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "deck",
              jaName: "Test Card",
            },
            {
              id: 1001,
              instanceId: "deck-1",
              type: "monster",
              frameType: "normal",
              location: "deck",
              jaName: "Test Card",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateWithDeck)).toBe(true);
    });

    it("should return false when game is over", () => {
      // Arrange: Game is over
      const state = createInitialGameState([1001, 1002]);
      const gameOverState: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          deck: [
            {
              id: 2001,
              instanceId: "deck-0",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "deck",
              jaName: "Test Card",
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
      const stateWithDeck: GameState = {
        ...state,
        zones: {
          ...state.zones,
          deck: [
            {
              id: 2001,
              instanceId: "deck-0",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "deck",
              jaName: "Test Card",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateWithDeck)).toBe(false);
    });

    it("should return false when deck has no Field Spells", () => {
      // Arrange: Deck has no Field Spells
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          deck: [
            {
              id: 1001,
              instanceId: "deck-0",
              type: "monster",
              frameType: "normal",
              location: "deck",
              jaName: "Test Card",
            },
            {
              id: 2001,
              instanceId: "deck-1",
              type: "spell",
              frameType: "spell",
              spellType: "normal",
              location: "deck",
              jaName: "Test Card",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
    });

    it("should return false when deck has only Normal Spells", () => {
      // Arrange: Deck has only Normal Spells (not Field)
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          deck: [
            {
              id: 2001,
              instanceId: "deck-0",
              type: "spell",
              frameType: "spell",
              spellType: "normal",
              location: "deck",
              jaName: "Test Card",
            },
            {
              id: 2002,
              instanceId: "deck-1",
              type: "spell",
              frameType: "spell",
              spellType: "quick-play",
              location: "deck",
              jaName: "Test Card",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(false);
    });

    it("should return true when deck has exactly 1 Field Spell", () => {
      // Arrange: Deck has exactly 1 Field Spell (edge case)
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          deck: [
            {
              id: 2001,
              instanceId: "deck-0",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "deck",
              jaName: "Test Card",
            },
          ],
        },
      };

      // Act & Assert
      expect(action.canActivate(stateInMain1)).toBe(true);
    });

    it("should return true when deck has mix of Field and Normal Spells", () => {
      // Arrange: Deck has 1 Field + 2 Normal Spells
      const state = createInitialGameState([1001, 1002]);
      const stateInMain1: GameState = {
        ...state,
        phase: "Main1",
        zones: {
          ...state.zones,
          deck: [
            {
              id: 2001,
              instanceId: "deck-0",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "deck",
              jaName: "Test Card",
            },
            {
              id: 2002,
              instanceId: "deck-1",
              type: "spell",
              frameType: "spell",
              spellType: "normal",
              location: "deck",
              jaName: "Test Card",
            },
            {
              id: 1001,
              instanceId: "deck-2",
              type: "monster",
              frameType: "normal",
              location: "deck",
              jaName: "Test Card",
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
      expect(steps[0].id).toBe("terraforming-activation");
      expect(steps[0].summary).toBe("カード発動");
      expect(steps[0].description).toBe("《テラ・フォーミング》を発動します");
      expect(steps[0].notificationLevel).toBe("info");
    });
  });

  describe("createResolutionSteps()", () => {
    it("should return 3 resolution steps", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const stateWithDeck: GameState = {
        ...state,
        zones: {
          ...state.zones,
          deck: [
            {
              id: 2001,
              instanceId: "deck-0",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "deck",
              jaName: "Test Field Spell",
            },
          ],
        },
      };
      const activatedCardInstanceId = "terraforming-instance-1";

      // Act
      const steps = action.createResolutionSteps(stateWithDeck, activatedCardInstanceId);

      // Assert
      expect(steps).toHaveLength(3); // Select + Notification + Graveyard
    });

    it("should have Field Spell selection step as first step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const fieldSpell: CardInstance = {
        id: 2001,
        instanceId: "deck-0",
        type: "spell",
        frameType: "spell",
        spellType: "field",
        location: "deck",
        jaName: "Test Card",
      };
      const stateWithDeck: GameState = {
        ...state,
        zones: {
          ...state.zones,
          deck: [fieldSpell],
        },
      };
      const activatedCardInstanceId = "terraforming-instance-1";

      // Act
      const steps = action.createResolutionSteps(stateWithDeck, activatedCardInstanceId);

      // Assert
      expect(steps[0].id).toBe("terraforming-select");
      expect(steps[0].summary).toBe("フィールド魔法を選択");
      expect(steps[0].notificationLevel).toBe("interactive");
      expect(steps[0].cardSelectionConfig).toBeDefined();
      expect(steps[0].cardSelectionConfig?.minCards).toBe(1);
      expect(steps[0].cardSelectionConfig?.maxCards).toBe(1);
      expect(steps[0].cardSelectionConfig?.cancelable).toBe(false); // Non-cancelable
      expect(steps[0].cardSelectionConfig?.availableCards).toHaveLength(1);
      expect(steps[0].cardSelectionConfig?.availableCards).toEqual([fieldSpell]);
    });

    it("should filter out Normal Spells from available cards", () => {
      // Arrange: Deck has 1 Field Spell + 2 Normal Spells
      const state = createInitialGameState([1001, 1002]);
      const fieldSpell: CardInstance = {
        id: 2001,
        instanceId: "deck-0",
        type: "spell",
        frameType: "spell",
        spellType: "field",
        location: "deck",
        jaName: "Test Card",
      };
      const normalSpell: CardInstance = {
        id: 2002,
        instanceId: "deck-1",
        type: "spell",
        frameType: "spell",
        spellType: "normal",
        location: "deck",
        jaName: "Test Card",
      };
      const quickPlaySpell: CardInstance = {
        id: 2003,
        instanceId: "deck-2",
        type: "spell",
        frameType: "spell",
        spellType: "quick-play",
        location: "deck",
        jaName: "Test Card",
      };
      const stateWithDeck: GameState = {
        ...state,
        zones: {
          ...state.zones,
          deck: [fieldSpell, normalSpell, quickPlaySpell],
        },
      };
      const activatedCardInstanceId = "terraforming-instance-1";

      // Act
      const steps = action.createResolutionSteps(stateWithDeck, activatedCardInstanceId);

      // Assert
      expect(steps[0].cardSelectionConfig?.availableCards).toHaveLength(1);
      expect(steps[0].cardSelectionConfig?.availableCards).toEqual([fieldSpell]);
      expect(steps[0].cardSelectionConfig?.availableCards).not.toContainEqual(normalSpell);
      expect(steps[0].cardSelectionConfig?.availableCards).not.toContainEqual(quickPlaySpell);
    });

    it("should have notification step as second step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const stateWithDeck: GameState = {
        ...state,
        zones: {
          ...state.zones,
          deck: [
            {
              id: 2001,
              instanceId: "deck-0",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "deck",
              jaName: "Test Field Spell",
            },
          ],
        },
      };
      const activatedCardInstanceId = "terraforming-instance-1";

      // Act
      const steps = action.createResolutionSteps(stateWithDeck, activatedCardInstanceId);

      // Assert
      expect(steps[1].id).toBe("terraforming-add-to-hand");
      expect(steps[1].summary).toBe("手札に加える");
      expect(steps[1].notificationLevel).toBe("info");
    });

    it("should have graveyard step as third step", () => {
      // Arrange
      const state = createInitialGameState([1001, 1002]);
      const stateWithDeck: GameState = {
        ...state,
        zones: {
          ...state.zones,
          deck: [
            {
              id: 2001,
              instanceId: "deck-0",
              type: "spell",
              frameType: "spell",
              spellType: "field",
              location: "deck",
              jaName: "Test Field Spell",
            },
          ],
        },
      };
      const activatedCardInstanceId = "terraforming-instance-1";

      // Act
      const steps = action.createResolutionSteps(stateWithDeck, activatedCardInstanceId);

      // Assert
      expect(steps[2].id).toBe("terraforming-graveyard");
      expect(steps[2].summary).toBe("墓地へ送る");
      expect(steps[2].description).toBe("《テラ・フォーミング》を墓地に送ります");
    });

    describe("Field Spell selection step action", () => {
      it("should move 1 selected Field Spell from deck to hand", () => {
        // Arrange: Deck has 2 Field Spells
        const state = createInitialGameState([1001, 1002]);
        const stateWithDeck: GameState = {
          ...state,
          zones: {
            ...state.zones,
            deck: [
              {
                id: 2001,
                instanceId: "deck-0",
                type: "spell",
                frameType: "spell",
                spellType: "field",
                location: "deck",
                jaName: "Test Card",
              },
              {
                id: 2002,
                instanceId: "deck-1",
                type: "spell",
                frameType: "spell",
                spellType: "field",
                location: "deck",
                jaName: "Test Card",
              },
            ],
          },
        };
        const activatedCardInstanceId = "terraforming-instance-1";
        const steps = action.createResolutionSteps(stateWithDeck, activatedCardInstanceId);

        // Act: Select 1 Field Spell from deck
        const result = steps[0].action(stateWithDeck, ["deck-0"]);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.deck).toHaveLength(1); // 2 - 1 = 1
        expect(result.newState.zones.hand).toHaveLength(1); // 0 + 1 = 1
        expect(result.message).toBe("Added 1 Field Spell from deck to hand");
      });

      it("should return failure when not exactly 1 Field Spell selected", () => {
        // Arrange
        const state = createInitialGameState([1001, 1002]);
        const stateWithDeck: GameState = {
          ...state,
          zones: {
            ...state.zones,
            deck: [
              {
                id: 2001,
                instanceId: "deck-0",
                type: "spell",
                frameType: "spell",
                spellType: "field",
                location: "deck",
                jaName: "Test Card",
              },
            ],
          },
        };
        const activatedCardInstanceId = "terraforming-instance-1";
        const steps = action.createResolutionSteps(stateWithDeck, activatedCardInstanceId);

        // Act: Select 2 Field Spells (but only 1 exists)
        const result = steps[0].action(stateWithDeck, ["deck-0", "deck-1"]);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBe("Must select exactly 1 Field Spell from deck");
      });
    });

    describe("Graveyard step action", () => {
      it("should send activated card to graveyard", () => {
        // Arrange: Create state with activated card in hand
        const state = createInitialGameState([1001, 1002]);
        const activatedCardInstanceId = "terraforming-instance-1";
        const stateWithSpellInHand: GameState = {
          ...state,
          zones: {
            ...state.zones,
            hand: [
              ...state.zones.hand,
              {
                id: 73628505,
                instanceId: activatedCardInstanceId,
                type: "spell",
                frameType: "spell",
                location: "hand",
                jaName: "テラ・フォーミング",
              },
            ],
            deck: [
              {
                id: 2001,
                instanceId: "deck-0",
                type: "spell",
                frameType: "spell",
                spellType: "field",
                location: "deck",
                jaName: "Test Field Spell",
              },
            ],
          },
        };

        const steps = action.createResolutionSteps(stateWithSpellInHand, activatedCardInstanceId);

        // Act - Step 2 is now the graveyard step (index 2, not 1)
        const result = steps[2].action(stateWithSpellInHand);

        // Assert
        expect(result.success).toBe(true);
        expect(result.newState.zones.graveyard).toHaveLength(1);
        expect(result.newState.zones.graveyard[0].instanceId).toBe(activatedCardInstanceId);
        expect(result.newState.zones.graveyard[0].location).toBe("graveyard");
        expect(result.message).toBe("Sent Terraforming to graveyard");
      });
    });
  });
});
