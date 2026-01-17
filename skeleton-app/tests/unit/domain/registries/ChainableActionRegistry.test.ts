/**
 * ChainableActionRegistry Tests
 *
 * Tests for ChainableActionRegistry registration and retrieval functionality.
 *
 * Test Responsibility:
 * - register() functionality
 * - get() functionality
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
import type { AtomicStep } from "$lib/domain/models/AtomicStep";

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
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(state: GameState): boolean {
    // Mock: always return true
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createActivationSteps(state: GameState): AtomicStep[] {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      {
        id: `${this.cardName}-resolution`,
        summary: `${this.cardName} Resolution`,
        description: `${this.cardName} resolution step
        `,
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

  describe("register()", () => {
    it("should register a chainable action", () => {
      // Arrange
      const cardId = 55144522; // Pot of Greed
      const action = new MockChainableAction("Pot of Greed");

      // Act
      ChainableActionRegistry.register(cardId, action);

      // Assert
      const retrieved = ChainableActionRegistry.get(cardId);
      expect(retrieved).toBe(action);
    });

    it("should register multiple chainable actions", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      const potOfGreedAction = new MockChainableAction("Pot of Greed");
      const gracefulCharityAction = new MockChainableAction("Graceful Charity");

      // Act
      ChainableActionRegistry.register(potOfGreedId, potOfGreedAction);
      ChainableActionRegistry.register(gracefulCharityId, gracefulCharityAction);

      // Assert
      expect(ChainableActionRegistry.get(potOfGreedId)).toBe(potOfGreedAction);
      expect(ChainableActionRegistry.get(gracefulCharityId)).toBe(gracefulCharityAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(2);
    });

    it("should overwrite existing registration when registering same card ID", () => {
      // Arrange
      const cardId = 55144522;
      const firstAction = new MockChainableAction("First Action");
      const secondAction = new MockChainableAction("Second Action");

      // Act
      ChainableActionRegistry.register(cardId, firstAction);
      ChainableActionRegistry.register(cardId, secondAction); // Overwrite

      // Assert
      const retrieved = ChainableActionRegistry.get(cardId);
      expect(retrieved).toBe(secondAction);
      expect(retrieved).not.toBe(firstAction);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(1); // Only 1 entry
    });
  });

  describe("get()", () => {
    it("should return registered chainable action", () => {
      // Arrange
      const cardId = 55144522;
      const action = new MockChainableAction("Pot of Greed");
      ChainableActionRegistry.register(cardId, action);

      // Act
      const retrieved = ChainableActionRegistry.get(cardId);

      // Assert
      expect(retrieved).toBe(action);
      expect(retrieved).toBeInstanceOf(MockChainableAction);
    });

    it("should return undefined for unknown card ID", () => {
      // Arrange
      const unknownCardId = 99999999;

      // Act
      const retrieved = ChainableActionRegistry.get(unknownCardId);

      // Assert
      expect(retrieved).toBeUndefined();
    });

    it("should return undefined for card ID not registered", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      const potOfGreedAction = new MockChainableAction("Pot of Greed");

      ChainableActionRegistry.register(potOfGreedId, potOfGreedAction);

      // Act
      const retrieved = ChainableActionRegistry.get(gracefulCharityId); // Not registered

      // Assert
      expect(retrieved).toBeUndefined();
    });
  });

  describe("clear()", () => {
    it("should clear all registered chainable actions", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      ChainableActionRegistry.register(potOfGreedId, new MockChainableAction("Pot of Greed"));
      ChainableActionRegistry.register(gracefulCharityId, new MockChainableAction("Graceful Charity"));

      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(2);

      // Act
      ChainableActionRegistry.clear();

      // Assert
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.get(potOfGreedId)).toBeUndefined();
      expect(ChainableActionRegistry.get(gracefulCharityId)).toBeUndefined();
    });

    it("should allow re-registration after clear", () => {
      // Arrange
      const cardId = 55144522;
      const firstAction = new MockChainableAction("First Action");
      const secondAction = new MockChainableAction("Second Action");

      ChainableActionRegistry.register(cardId, firstAction);
      ChainableActionRegistry.clear();

      // Act
      ChainableActionRegistry.register(cardId, secondAction);

      // Assert
      expect(ChainableActionRegistry.get(cardId)).toBe(secondAction);
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
      ChainableActionRegistry.register(potOfGreedId, new MockChainableAction("Pot of Greed"));
      ChainableActionRegistry.register(gracefulCharityId, new MockChainableAction("Graceful Charity"));

      // Assert
      const registeredIds = ChainableActionRegistry.getRegisteredCardIds();
      expect(registeredIds).toHaveLength(2);
      expect(registeredIds).toContain(potOfGreedId);
      expect(registeredIds).toContain(gracefulCharityId);
    });

    it("should return correct card IDs after clear", () => {
      // Arrange
      ChainableActionRegistry.register(55144522, new MockChainableAction("Pot of Greed"));
      ChainableActionRegistry.register(79571449, new MockChainableAction("Graceful Charity"));

      // Act
      ChainableActionRegistry.clear();

      // Assert
      expect(ChainableActionRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(ChainableActionRegistry.getRegisteredCardIds()).toEqual([]);
    });
  });
});
