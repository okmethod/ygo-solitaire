/**
 * CardEffectRegistry Tests (Layer 2: Registry Tests)
 *
 * Tests for CardEffectRegistry registration and retrieval functionality.
 *
 * Test Responsibility:
 * - register() functionality
 * - get() functionality
 * - clear() functionality
 * - size() functionality
 * - Multiple registrations
 * - Unknown card ID handling
 *
 * Test Architecture (3-Layer Pattern):
 *
 * Layer 1: CardEffect Unit Tests
 *   - tests/unit/card-effects/PotOfGreedEffect.test.ts
 *   - Tests: canActivate(), createSteps() in isolation
 *
 * Layer 2: CardEffectRegistry Tests (THIS FILE)
 *   - tests/unit/CardEffectRegistry.test.ts
 *   - Tests: register(), get(), clear(), size()
 *
 * Layer 3: Integration Tests
 *   - tests/unit/CardEffects.test.ts
 *   - Tests: ActivateSpellCommand + CardEffect integration
 *
 * @module tests/unit/CardEffectRegistry
 */

import { describe, it, expect, beforeEach } from "vitest";
import { CardEffectRegistry } from "$lib/application/effects/CardEffectRegistry";
import { NormalSpellEffect } from "$lib/domain/effects/bases/NormalSpellEffect";
import type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";
import type { GameState } from "$lib/domain/models/GameState";

/**
 * Mock CardEffect for testing
 *
 * Simple implementation to test Registry functionality without real card logic.
 */
class MockCardEffect extends NormalSpellEffect {
  constructor(private cardName: string) {
    super();
  }

  protected canActivateNormalSpell(): boolean {
    return true;
  }

  protected createCardSteps(): EffectResolutionStep[] {
    return [
      {
        id: `${this.cardName}-effect`,
        title: `${this.cardName} Effect`,
        message: `${this.cardName} effect message`,
        action: (state: GameState) => {
          // Mock action - returns CommandResult with unchanged state
          return { success: true, newState: state };
        },
      },
    ];
  }
}

describe("CardEffectRegistry", () => {
  // Clean up before each test to ensure test isolation
  beforeEach(() => {
    CardEffectRegistry.clear();
  });

  describe("register()", () => {
    it("should register a card effect", () => {
      // Arrange
      const cardId = 55144522; // Pot of Greed
      const effect = new MockCardEffect("Pot of Greed");

      // Act
      CardEffectRegistry.register(cardId, effect);

      // Assert
      const retrieved = CardEffectRegistry.get(cardId);
      expect(retrieved).toBe(effect);
    });

    it("should register multiple card effects", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      const potOfGreedEffect = new MockCardEffect("Pot of Greed");
      const gracefulCharityEffect = new MockCardEffect("Graceful Charity");

      // Act
      CardEffectRegistry.register(potOfGreedId, potOfGreedEffect);
      CardEffectRegistry.register(gracefulCharityId, gracefulCharityEffect);

      // Assert
      expect(CardEffectRegistry.get(potOfGreedId)).toBe(potOfGreedEffect);
      expect(CardEffectRegistry.get(gracefulCharityId)).toBe(gracefulCharityEffect);
      expect(CardEffectRegistry.size()).toBe(2);
    });

    it("should overwrite existing registration when registering same card ID", () => {
      // Arrange
      const cardId = 55144522;
      const firstEffect = new MockCardEffect("First Effect");
      const secondEffect = new MockCardEffect("Second Effect");

      // Act
      CardEffectRegistry.register(cardId, firstEffect);
      CardEffectRegistry.register(cardId, secondEffect); // Overwrite

      // Assert
      const retrieved = CardEffectRegistry.get(cardId);
      expect(retrieved).toBe(secondEffect);
      expect(retrieved).not.toBe(firstEffect);
      expect(CardEffectRegistry.size()).toBe(1); // Only 1 entry
    });
  });

  describe("get()", () => {
    it("should return registered card effect", () => {
      // Arrange
      const cardId = 55144522;
      const effect = new MockCardEffect("Pot of Greed");
      CardEffectRegistry.register(cardId, effect);

      // Act
      const retrieved = CardEffectRegistry.get(cardId);

      // Assert
      expect(retrieved).toBe(effect);
      expect(retrieved).toBeInstanceOf(MockCardEffect);
    });

    it("should return undefined for unknown card ID", () => {
      // Arrange
      const unknownCardId = 99999999;

      // Act
      const retrieved = CardEffectRegistry.get(unknownCardId);

      // Assert
      expect(retrieved).toBeUndefined();
    });

    it("should return undefined for card ID not registered", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      const potOfGreedEffect = new MockCardEffect("Pot of Greed");

      CardEffectRegistry.register(potOfGreedId, potOfGreedEffect);

      // Act
      const retrieved = CardEffectRegistry.get(gracefulCharityId); // Not registered

      // Assert
      expect(retrieved).toBeUndefined();
    });
  });

  describe("clear()", () => {
    it("should clear all registered card effects", () => {
      // Arrange
      const potOfGreedId = 55144522;
      const gracefulCharityId = 79571449;
      CardEffectRegistry.register(potOfGreedId, new MockCardEffect("Pot of Greed"));
      CardEffectRegistry.register(gracefulCharityId, new MockCardEffect("Graceful Charity"));

      expect(CardEffectRegistry.size()).toBe(2);

      // Act
      CardEffectRegistry.clear();

      // Assert
      expect(CardEffectRegistry.size()).toBe(0);
      expect(CardEffectRegistry.get(potOfGreedId)).toBeUndefined();
      expect(CardEffectRegistry.get(gracefulCharityId)).toBeUndefined();
    });

    it("should allow re-registration after clear", () => {
      // Arrange
      const cardId = 55144522;
      const firstEffect = new MockCardEffect("First Effect");
      const secondEffect = new MockCardEffect("Second Effect");

      CardEffectRegistry.register(cardId, firstEffect);
      CardEffectRegistry.clear();

      // Act
      CardEffectRegistry.register(cardId, secondEffect);

      // Assert
      expect(CardEffectRegistry.get(cardId)).toBe(secondEffect);
      expect(CardEffectRegistry.size()).toBe(1);
    });
  });

  describe("size()", () => {
    it("should return 0 when no effects are registered", () => {
      // Act & Assert
      expect(CardEffectRegistry.size()).toBe(0);
    });

    it("should return correct size after registrations", () => {
      // Arrange & Act
      CardEffectRegistry.register(55144522, new MockCardEffect("Pot of Greed"));
      expect(CardEffectRegistry.size()).toBe(1);

      CardEffectRegistry.register(79571449, new MockCardEffect("Graceful Charity"));
      expect(CardEffectRegistry.size()).toBe(2);

      CardEffectRegistry.register(12345678, new MockCardEffect("Another Card"));
      expect(CardEffectRegistry.size()).toBe(3);
    });

    it("should return correct size after clear", () => {
      // Arrange
      CardEffectRegistry.register(55144522, new MockCardEffect("Pot of Greed"));
      CardEffectRegistry.register(79571449, new MockCardEffect("Graceful Charity"));

      // Act
      CardEffectRegistry.clear();

      // Assert
      expect(CardEffectRegistry.size()).toBe(0);
    });
  });
});
