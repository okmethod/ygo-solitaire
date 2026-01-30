/**
 * ChainableActionRegistry Tests
 *
 * Tests for ChainableActionRegistry registration and retrieval functionality.
 *
 * Test Responsibility:
 * - registerActivation() functionality
 * - registerIgnition() functionality
 * - getActivation() functionality
 * - getIgnitionEffects() functionality
 * - hasIgnitionEffects() functionality
 * - clear() functionality
 * - getRegisteredCardIds() functionality
 * - Multiple registrations
 * - Unknown card ID handling
 *
 * @module tests/unit/domain/registries/ChainableActionRegistry
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
import type { ChainableAction } from "$lib/domain/models/ChainableAction";
import type { GameState } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { EffectCategory } from "$lib/domain/models/EffectCategory";
import type { ValidationResult } from "$lib/domain/models/ValidationResult";
import { successValidationResult } from "$lib/domain/models/ValidationResult";

/**
 * Mock ChainableAction for testing
 *
 * Simple implementation to test Registry functionality without real card logic.
 */
class MockChainableAction implements ChainableAction {
  constructor(
    private cardName: string,
    public readonly isCardActivation: boolean = true,
    public readonly spellSpeed: 1 | 2 | 3 = 1,
    public readonly effectCategory: EffectCategory = "activation",
    public readonly effectId: string = "mock-effect",
  ) {}

  canActivate(_state: GameState, _sourceInstance: CardInstance): ValidationResult {
    // Mock: always return valid
    return successValidationResult();
  }

  createActivationSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: `${this.cardName}-activation`,
        summary: `${this.cardName} Activation`,
        description: `${this.cardName} activation step`,
        action: (state: GameState) => {
          return { success: true, updatedState: state };
        },
      },
    ];
  }

  createResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: `${this.cardName}-resolution`,
        summary: `${this.cardName} Resolution`,
        description: `${this.cardName} resolution step`,
        action: (state: GameState) => {
          return { success: true, updatedState: state };
        },
      },
    ];
  }
}

describe("ChainableActionRegistry", () => {
  // Clean up before each test to ensure test isolation
  beforeEach(() => {
    ChainableActionRegistry.clear();
  });

  describe("registerActivation()", () => {
    it("should register an activation effect", () => {
      // Arrange
      const cardId = 55144522; // Pot of Greed
      const action = new MockChainableAction("Pot of Greed");

      // Act
      ChainableActionRegistry.registerActivation(cardId, action);

      // Assert
      const retrieved = ChainableActionRegistry.getActivation(cardId);
      expect(retrieved).toBe(action);
    });

    it("should register multiple activation effects for different cards", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      const potOfGreedAction = new MockChainableAction("Pot of Greed");
      const gracefulCharityAction = new MockChainableAction("Graceful Charity");

      // Act
      ChainableActionRegistry.registerActivation(potOfGreedId, potOfGreedAction);
      ChainableActionRegistry.registerActivation(gracefulCharityId, gracefulCharityAction);

      // Assert
      expect(ChainableActionRegistry.getActivation(potOfGreedId)).toBe(potOfGreedAction);
      expect(ChainableActionRegistry.getActivation(gracefulCharityId)).toBe(gracefulCharityAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(2);
    });

    it("should overwrite existing activation when registering same card ID", () => {
      // Arrange
      const cardId = 55144522;
      const firstAction = new MockChainableAction("First Action");
      const secondAction = new MockChainableAction("Second Action");

      // Act
      ChainableActionRegistry.registerActivation(cardId, firstAction);
      ChainableActionRegistry.registerActivation(cardId, secondAction); // Overwrite

      // Assert
      const retrieved = ChainableActionRegistry.getActivation(cardId);
      expect(retrieved).toBe(secondAction);
      expect(retrieved).not.toBe(firstAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1); // Only 1 entry
    });
  });

  describe("registerIgnition()", () => {
    it("should register an ignition effect", () => {
      // Arrange
      const cardId = 67616300; // Chicken Game
      const action = new MockChainableAction("Chicken Game Ignition", false, 1, "ignition", "chicken-game-ignition");

      // Act
      ChainableActionRegistry.registerIgnition(cardId, action);

      // Assert
      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);
      expect(effects).toHaveLength(1);
      expect(effects[0]).toBe(action);
    });

    it("should register multiple ignition effects for same card", () => {
      // Arrange
      const cardId = 67616300;
      const effect1 = new MockChainableAction("Effect 1", false, 1, "ignition", "effect-1");
      const effect2 = new MockChainableAction("Effect 2", false, 1, "ignition", "effect-2");

      // Act
      ChainableActionRegistry.registerIgnition(cardId, effect1);
      ChainableActionRegistry.registerIgnition(cardId, effect2);

      // Assert
      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);
      expect(effects).toHaveLength(2);
      expect(effects).toContain(effect1);
      expect(effects).toContain(effect2);
    });
  });

  describe("getActivation()", () => {
    it("should return registered activation effect", () => {
      // Arrange
      const cardId = 55144522;
      const action = new MockChainableAction("Pot of Greed");
      ChainableActionRegistry.registerActivation(cardId, action);

      // Act
      const retrieved = ChainableActionRegistry.getActivation(cardId);

      // Assert
      expect(retrieved).toBe(action);
      expect(retrieved).toBeInstanceOf(MockChainableAction);
    });

    it("should return undefined for unknown card ID", () => {
      // Arrange
      const unknownCardId = 99999999;

      // Act
      const retrieved = ChainableActionRegistry.getActivation(unknownCardId);

      // Assert
      expect(retrieved).toBeUndefined();
    });

    it("should return undefined for card ID not registered", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      const potOfGreedAction = new MockChainableAction("Pot of Greed");

      ChainableActionRegistry.registerActivation(potOfGreedId, potOfGreedAction);

      // Act
      const retrieved = ChainableActionRegistry.getActivation(gracefulCharityId); // Not registered

      // Assert
      expect(retrieved).toBeUndefined();
    });
  });

  describe("getIgnitionEffects()", () => {
    it("should return empty array for card with no ignition effects", () => {
      // Arrange
      const cardId = 55144522;

      // Act
      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);

      // Assert
      expect(effects).toEqual([]);
    });

    it("should return all registered ignition effects", () => {
      // Arrange
      const cardId = 67616300;
      const effect1 = new MockChainableAction("Effect 1", false, 1, "ignition");
      const effect2 = new MockChainableAction("Effect 2", false, 1, "ignition");
      ChainableActionRegistry.registerIgnition(cardId, effect1);
      ChainableActionRegistry.registerIgnition(cardId, effect2);

      // Act
      const effects = ChainableActionRegistry.getIgnitionEffects(cardId);

      // Assert
      expect(effects).toHaveLength(2);
    });
  });

  describe("hasIgnitionEffects()", () => {
    it("should return false for card with no ignition effects", () => {
      // Arrange
      const cardId = 55144522;

      // Assert
      expect(ChainableActionRegistry.hasIgnitionEffects(cardId)).toBe(false);
    });

    it("should return true for card with ignition effects", () => {
      // Arrange
      const cardId = 67616300;
      ChainableActionRegistry.registerIgnition(cardId, new MockChainableAction("Ignition", false, 1, "ignition"));

      // Assert
      expect(ChainableActionRegistry.hasIgnitionEffects(cardId)).toBe(true);
    });
  });

  describe("activation and ignition coexistence", () => {
    it("should allow both activation and ignition for same card", () => {
      // Arrange
      const cardId = 67616300; // Chicken Game
      const activation = new MockChainableAction("Chicken Game Activation", true, 1, "activation");
      const ignition = new MockChainableAction("Chicken Game Ignition", false, 1, "ignition");

      // Act
      ChainableActionRegistry.registerActivation(cardId, activation);
      ChainableActionRegistry.registerIgnition(cardId, ignition);

      // Assert
      expect(ChainableActionRegistry.getActivation(cardId)).toBe(activation);
      expect(ChainableActionRegistry.getIgnitionEffects(cardId)).toContain(ignition);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1);
    });
  });

  describe("clear()", () => {
    it("should clear all registered effects", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const chickenGameId = 67616300;
      ChainableActionRegistry.registerActivation(potOfGreedId, new MockChainableAction("Pot of Greed"));
      ChainableActionRegistry.registerActivation(chickenGameId, new MockChainableAction("Chicken Game"));
      ChainableActionRegistry.registerIgnition(
        chickenGameId,
        new MockChainableAction("Ignition", false, 1, "ignition"),
      );

      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(2);

      // Act
      ChainableActionRegistry.clear();

      // Assert
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.getActivation(potOfGreedId)).toBeUndefined();
      expect(ChainableActionRegistry.getActivation(chickenGameId)).toBeUndefined();
      expect(ChainableActionRegistry.getIgnitionEffects(chickenGameId)).toEqual([]);
    });

    it("should allow re-registration after clear", () => {
      // Arrange
      const cardId = 55144522;
      const firstAction = new MockChainableAction("First Action");
      const secondAction = new MockChainableAction("Second Action");

      ChainableActionRegistry.registerActivation(cardId, firstAction);
      ChainableActionRegistry.clear();

      // Act
      ChainableActionRegistry.registerActivation(cardId, secondAction);

      // Assert
      expect(ChainableActionRegistry.getActivation(cardId)).toBe(secondAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1);
    });
  });

  describe("getRegisteredCardIds()", () => {
    it("should return empty array when no actions are registered", () => {
      // Act & Assert
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toEqual([]);
    });

    it("should return correct card IDs after registrations", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;

      // Act
      ChainableActionRegistry.registerActivation(potOfGreedId, new MockChainableAction("Pot of Greed"));
      ChainableActionRegistry.registerActivation(gracefulCharityId, new MockChainableAction("Graceful Charity"));

      // Assert
      const registeredIds = ChainableActionRegistry.getRegisteredCardIds();
      expect(registeredIds).toHaveLength(2);
      expect(registeredIds).toContain(potOfGreedId);
      expect(registeredIds).toContain(gracefulCharityId);
    });

    it("should return correct card IDs after clear", () => {
      // Arrange
      ChainableActionRegistry.registerActivation(55144522, new MockChainableAction("Pot of Greed"));
      ChainableActionRegistry.registerActivation(79571449, new MockChainableAction("Graceful Charity"));

      // Act
      ChainableActionRegistry.clear();

      // Assert
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toEqual([]);
    });
  });
});
