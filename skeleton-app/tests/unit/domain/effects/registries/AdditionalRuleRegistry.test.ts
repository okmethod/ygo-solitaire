/**
 * AdditionalRuleRegistry Tests
 *
 * Tests for AdditionalRuleRegistry registration and retrieval functionality.
 *
 * Test Responsibility:
 * - register() functionality
 * - get() functionality
 * - getByCategory() functionality
 * - collectActiveRules() functionality
 * - clear() functionality
 * - getRegisteredCardIds() functionality
 * - Multiple rules per card registration
 * - Unknown card ID handling
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AdditionalRuleRegistry } from "$lib/domain/effects/rules";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, EventType, GameEvent } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/Effect";
import {
  createMonsterOnField,
  createSpellOnField,
  createStateWithMonsterZone,
  createStateWithFieldZone,
} from "../../../../__testUtils__";

/**
 * Mock AdditionalRule for testing
 *
 * Simple implementation to test Registry functionality without real card logic.
 */
class MockAdditionalRule implements AdditionalRule {
  constructor(
    _ruleName: string,
    public readonly isEffect: boolean = true,
    public readonly category: RuleCategory = "ActionPermission",
    private applyCondition: boolean = true,
  ) {}

  canApply(_state: GameSnapshot): boolean {
    return this.applyCondition;
  }

  checkPermission(_state: GameSnapshot): boolean {
    return false; // Mock: deny permission
  }

  apply(_state: GameSnapshot): GameSnapshot {
    return _state; // Mock: no state change
  }
}

describe("AdditionalRuleRegistry", () => {
  // Clean up before each test to ensure test isolation
  beforeEach(() => {
    AdditionalRuleRegistry.clear();
  });

  describe("register()", () => {
    it("should register an additional rule", () => {
      // Arrange
      const cardId = 67616300; // Chicken Game
      const rule = new MockAdditionalRule("Chicken Game Continuous");

      // Act
      AdditionalRuleRegistry.register(cardId, rule);

      // Assert
      const retrieved = AdditionalRuleRegistry.get(cardId);
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toBe(rule);
    });

    it("should register multiple rules for the same card", () => {
      // Arrange
      const cardId = 67616300;
      const rule1 = new MockAdditionalRule("Rule 1", true, "ActionPermission");
      const rule2 = new MockAdditionalRule("Rule 2", false, "StatusModifier");

      // Act
      AdditionalRuleRegistry.register(cardId, rule1);
      AdditionalRuleRegistry.register(cardId, rule2);

      // Assert
      const retrieved = AdditionalRuleRegistry.get(cardId);
      expect(retrieved).toHaveLength(2);
      expect(retrieved).toContain(rule1);
      expect(retrieved).toContain(rule2);
    });

    it("should register rules for multiple cards", () => {
      // Arrange
      const cardId1 = 67616300; // Chicken Game
      const cardId2 = 12345678; // Mock Card
      const rule1 = new MockAdditionalRule("Rule 1");
      const rule2 = new MockAdditionalRule("Rule 2");

      // Act
      AdditionalRuleRegistry.register(cardId1, rule1);
      AdditionalRuleRegistry.register(cardId2, rule2);

      // Assert
      expect(AdditionalRuleRegistry.get(cardId1)).toContain(rule1);
      expect(AdditionalRuleRegistry.get(cardId2)).toContain(rule2);
      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toHaveLength(2);
    });
  });

  describe("get()", () => {
    it("should return registered rules", () => {
      // Arrange
      const cardId = 67616300;
      const rule = new MockAdditionalRule("Chicken Game Continuous");
      AdditionalRuleRegistry.register(cardId, rule);

      // Act
      const retrieved = AdditionalRuleRegistry.get(cardId);

      // Assert
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toBe(rule);
      expect(retrieved[0]).toBeInstanceOf(MockAdditionalRule);
    });

    it("should return empty array for unknown card ID", () => {
      // Arrange
      const unknownCardId = 99999999;

      // Act
      const retrieved = AdditionalRuleRegistry.get(unknownCardId);

      // Assert
      expect(retrieved).toEqual([]);
    });

    it("should return all rules for a card with multiple rules", () => {
      // Arrange
      const cardId = 67616300;
      const rule1 = new MockAdditionalRule("Rule 1");
      const rule2 = new MockAdditionalRule("Rule 2");
      const rule3 = new MockAdditionalRule("Rule 3");

      AdditionalRuleRegistry.register(cardId, rule1);
      AdditionalRuleRegistry.register(cardId, rule2);
      AdditionalRuleRegistry.register(cardId, rule3);

      // Act
      const retrieved = AdditionalRuleRegistry.get(cardId);

      // Assert
      expect(retrieved).toHaveLength(3);
      expect(retrieved).toEqual([rule1, rule2, rule3]);
    });
  });

  describe("getByCategory()", () => {
    it("should return rules filtered by category", () => {
      // Arrange
      const cardId = 67616300;
      const permissionRule = new MockAdditionalRule("Permission", true, "ActionPermission");
      const modifierRule = new MockAdditionalRule("Modifier", true, "StatusModifier");
      const replacementRule = new MockAdditionalRule("Replacement", true, "ActionOverride");

      AdditionalRuleRegistry.register(cardId, permissionRule);
      AdditionalRuleRegistry.register(cardId, modifierRule);
      AdditionalRuleRegistry.register(cardId, replacementRule);

      // Act
      const permissionRules = AdditionalRuleRegistry.getByCategory(cardId, "ActionPermission");
      const modifierRules = AdditionalRuleRegistry.getByCategory(cardId, "StatusModifier");

      // Assert
      expect(permissionRules).toHaveLength(1);
      expect(permissionRules[0]).toBe(permissionRule);
      expect(modifierRules).toHaveLength(1);
      expect(modifierRules[0]).toBe(modifierRule);
    });

    it("should return empty array when no rules match the category", () => {
      // Arrange
      const cardId = 67616300;
      const permissionRule = new MockAdditionalRule("Permission", true, "ActionPermission");

      AdditionalRuleRegistry.register(cardId, permissionRule);

      // Act
      const modifierRules = AdditionalRuleRegistry.getByCategory(cardId, "StatusModifier");

      // Assert
      expect(modifierRules).toEqual([]);
    });

    it("should return empty array for unknown card ID", () => {
      // Arrange
      const unknownCardId = 99999999;

      // Act
      const rules = AdditionalRuleRegistry.getByCategory(unknownCardId, "ActionPermission");

      // Assert
      expect(rules).toEqual([]);
    });
  });

  describe("collectActiveRules()", () => {
    it("should collect active rules from field", () => {
      // Arrange
      const chickenGameId = 67616300;
      const chickenGameRule = new MockAdditionalRule(
        "Chicken Game",
        true,
        "ActionPermission",
        true, // canApply returns true
      );

      AdditionalRuleRegistry.register(chickenGameId, chickenGameRule);

      const chickenGameCard = createSpellOnField(chickenGameId, "fieldZone-0", { spellType: "field" });
      const state = createStateWithFieldZone([chickenGameCard]);

      // Act
      const activeRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");

      // Assert
      expect(activeRules).toHaveLength(1);
      expect(activeRules[0]).toBe(chickenGameRule);
    });

    it("should not collect rules from face-down cards", () => {
      // Arrange
      const cardId = 67616300;
      const rule = new MockAdditionalRule("Rule", true, "ActionPermission", true);

      AdditionalRuleRegistry.register(cardId, rule);

      const state = createStateWithFieldZone([
        createSpellOnField(cardId, "fieldZone-0", { spellType: "field", position: "faceDown" }),
      ]);

      // Act
      const activeRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");

      // Assert
      expect(activeRules).toHaveLength(0);
    });

    it("should not collect rules when canApply returns false", () => {
      // Arrange
      const cardId = 67616300;
      const rule = new MockAdditionalRule(
        "Rule",
        true,
        "ActionPermission",
        false, // canApply returns false
      );

      AdditionalRuleRegistry.register(cardId, rule);

      const state = createStateWithFieldZone([createSpellOnField(cardId, "fieldZone-0", { spellType: "field" })]);

      // Act
      const activeRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");

      // Assert
      expect(activeRules).toHaveLength(0);
    });

    it("should only collect rules matching the specified category", () => {
      // Arrange
      const cardId = 67616300;
      const permissionRule = new MockAdditionalRule("Permission", true, "ActionPermission", true);
      const modifierRule = new MockAdditionalRule("Modifier", true, "StatusModifier", true);

      AdditionalRuleRegistry.register(cardId, permissionRule);
      AdditionalRuleRegistry.register(cardId, modifierRule);

      const state = createStateWithFieldZone([createSpellOnField(cardId, "fieldZone-0", { spellType: "field" })]);

      // Act
      const permissionRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");
      const modifierRules = AdditionalRuleRegistry.collectActiveRules(state, "StatusModifier");

      // Assert
      expect(permissionRules).toHaveLength(1);
      expect(permissionRules[0]).toBe(permissionRule);
      expect(modifierRules).toHaveLength(1);
      expect(modifierRules[0]).toBe(modifierRule);
    });

    it("should collect rules from multiple cards", () => {
      // Arrange
      const cardId1 = 67616300;
      const cardId2 = 12345678;
      const rule1 = new MockAdditionalRule("Rule 1", true, "ActionPermission", true);
      const rule2 = new MockAdditionalRule("Rule 2", true, "ActionPermission", true);

      AdditionalRuleRegistry.register(cardId1, rule1);
      AdditionalRuleRegistry.register(cardId2, rule2);

      const state = createStateWithFieldZone([
        createSpellOnField(cardId1, "fieldZone-0", { spellType: "field" }),
        createSpellOnField(cardId2, "fieldZone-1", { spellType: "field" }),
      ]);

      // Act
      const activeRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");

      // Assert
      expect(activeRules).toHaveLength(2);
      expect(activeRules).toContain(rule1);
      expect(activeRules).toContain(rule2);
    });
  });

  describe("clear()", () => {
    it("should clear all registered rules", () => {
      // Arrange
      const cardId1 = 67616300;
      const cardId2 = 12345678;
      AdditionalRuleRegistry.register(cardId1, new MockAdditionalRule("Rule 1"));
      AdditionalRuleRegistry.register(cardId2, new MockAdditionalRule("Rule 2"));

      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toHaveLength(2);

      // Act
      AdditionalRuleRegistry.clear();

      // Assert
      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(AdditionalRuleRegistry.get(cardId1)).toEqual([]);
      expect(AdditionalRuleRegistry.get(cardId2)).toEqual([]);
    });

    it("should allow re-registration after clear", () => {
      // Arrange
      const cardId = 67616300;
      const firstRule = new MockAdditionalRule("First Rule");
      const secondRule = new MockAdditionalRule("Second Rule");

      AdditionalRuleRegistry.register(cardId, firstRule);
      AdditionalRuleRegistry.clear();

      // Act
      AdditionalRuleRegistry.register(cardId, secondRule);

      // Assert
      const retrieved = AdditionalRuleRegistry.get(cardId);
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toBe(secondRule);
      expect(retrieved[0]).not.toBe(firstRule);
    });
  });

  describe("getRegisteredCardIds()", () => {
    it("should return empty array when no rules are registered", () => {
      // Act & Assert
      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toEqual([]);
    });

    it("should return correct card IDs after registrations", () => {
      // Arrange
      const cardId1 = 67616300;
      const cardId2 = 12345678;

      // Act
      AdditionalRuleRegistry.register(cardId1, new MockAdditionalRule("Rule 1"));
      AdditionalRuleRegistry.register(cardId2, new MockAdditionalRule("Rule 2"));

      // Assert
      const registeredIds = AdditionalRuleRegistry.getRegisteredCardIds();
      expect(registeredIds).toHaveLength(2);
      expect(registeredIds).toContain(cardId1);
      expect(registeredIds).toContain(cardId2);
    });

    it("should return correct card IDs after clear", () => {
      // Arrange
      AdditionalRuleRegistry.register(67616300, new MockAdditionalRule("Rule 1"));
      AdditionalRuleRegistry.register(12345678, new MockAdditionalRule("Rule 2"));

      // Act
      AdditionalRuleRegistry.clear();

      // Assert
      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toEqual([]);
    });

    it("should not duplicate card IDs when multiple rules are registered for same card", () => {
      // Arrange
      const cardId = 67616300;

      // Act
      AdditionalRuleRegistry.register(cardId, new MockAdditionalRule("Rule 1"));
      AdditionalRuleRegistry.register(cardId, new MockAdditionalRule("Rule 2"));
      AdditionalRuleRegistry.register(cardId, new MockAdditionalRule("Rule 3"));

      // Assert
      const registeredIds = AdditionalRuleRegistry.getRegisteredCardIds();
      expect(registeredIds).toHaveLength(1);
      expect(registeredIds[0]).toBe(cardId);
    });
  });

  describe("collectTriggerRules()", () => {
    /**
     * Mock TriggerRule for testing trigger functionality
     */
    class MockTriggerRule implements AdditionalRule {
      constructor(
        public readonly triggers: readonly EventType[] = ["spellActivated"],
        private applyCondition: boolean = true,
      ) {}

      readonly isEffect = true;
      readonly category: RuleCategory = "TriggerRule";

      canApply(_state: GameSnapshot): boolean {
        return this.applyCondition;
      }

      createTriggerSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
        return [];
      }
    }

    it("should collect trigger rules for specified event from monster zone", () => {
      // Arrange
      const cardId = 70791313; // Royal Magical Library
      const triggerRule = new MockTriggerRule(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const monsterCard = createMonsterOnField(cardId, "mainMonsterZone-0");
      const state = createStateWithMonsterZone([monsterCard]);

      // Act
      const results = AdditionalRuleRegistry.collectTriggerRules(state, "spellActivated");

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].rule).toBe(triggerRule);
      expect(results[0].sourceInstance).toBe(monsterCard);
    });

    it("should not collect trigger rules for different events", () => {
      // Arrange
      const cardId = 70791313;
      const triggerRule = new MockTriggerRule(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const state = createStateWithMonsterZone([createMonsterOnField(cardId, "mainMonsterZone-0")]);

      // Act
      const results = AdditionalRuleRegistry.collectTriggerRules(state, "normalSummoned");

      // Assert
      expect(results).toHaveLength(0);
    });

    it("should not collect trigger rules from face-down cards", () => {
      // Arrange
      const cardId = 70791313;
      const triggerRule = new MockTriggerRule(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const state = createStateWithMonsterZone([
        createMonsterOnField(cardId, "mainMonsterZone-0", { position: "faceDown" }),
      ]);

      // Act
      const results = AdditionalRuleRegistry.collectTriggerRules(state, "spellActivated");

      // Assert
      expect(results).toHaveLength(0);
    });

    it("should collect trigger rules from multiple cards", () => {
      // Arrange
      const cardId = 70791313;
      const triggerRule = new MockTriggerRule(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const monsterCard1 = createMonsterOnField(cardId, "mainMonsterZone-0");
      const monsterCard2 = createMonsterOnField(cardId, "mainMonsterZone-1");
      const state = createStateWithMonsterZone([monsterCard1, monsterCard2]);

      // Act
      const results = AdditionalRuleRegistry.collectTriggerRules(state, "spellActivated");

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].sourceInstance).toBe(monsterCard1);
      expect(results[1].sourceInstance).toBe(monsterCard2);
    });
  });

  describe("collectTriggerSteps()", () => {
    /**
     * Mock TriggerRule that creates steps for testing
     */
    class MockTriggerRuleWithEffect implements AdditionalRule {
      public executionCount = 0;

      constructor(
        public readonly triggers: readonly EventType[] = ["spellActivated"],
        private applyCondition: boolean = true,
      ) {}

      readonly isEffect = true;
      readonly category: RuleCategory = "TriggerRule";

      canApply(_state: GameSnapshot): boolean {
        return this.applyCondition;
      }

      createTriggerSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
        // Capture execution count increment in closure
        const incrementExecution = () => {
          this.executionCount++;
        };
        return [
          {
            id: `mock-trigger-${sourceInstance.instanceId}`,
            summary: "Mock trigger effect",
            description: "Test effect",
            notificationLevel: "silent",
            action: (currentState: GameSnapshot) => {
              incrementExecution();
              // Return state with modified LP as a marker
              return GameProcessing.Result.success(
                {
                  ...currentState,
                  lp: {
                    ...currentState.lp,
                    player: currentState.lp.player - 100,
                  },
                },
                "Mock trigger executed",
              );
            },
          },
        ];
      }
    }

    /**
     * Helper to execute collected steps
     */
    function executeSteps(steps: AtomicStep[], state: GameSnapshot): GameSnapshot {
      let currentState = state;
      for (const step of steps) {
        const result = step.action(currentState);
        currentState = result.updatedState;
      }
      return currentState;
    }

    it("should collect trigger steps and execute them to update state", () => {
      // Arrange
      const cardId = 70791313;
      const triggerRule = new MockTriggerRuleWithEffect(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const state = createStateWithMonsterZone([createMonsterOnField(cardId, "mainMonsterZone-0")]);

      // Act
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345, sourceInstanceId: "test-instance" };
      const { mandatorySteps } = AdditionalRuleRegistry.collectTriggerSteps(state, event);
      const newState = executeSteps(mandatorySteps, state);

      // Assert
      expect(mandatorySteps).toHaveLength(1);
      expect(triggerRule.executionCount).toBe(1);
      expect(newState.lp.player).toBe(7900);
    });

    it("should not collect trigger steps when canApply returns false", () => {
      // Arrange
      const cardId = 70791313;
      const triggerRule = new MockTriggerRuleWithEffect(["spellActivated"], false);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const state = createStateWithMonsterZone([createMonsterOnField(cardId, "mainMonsterZone-0")]);

      // Act
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345, sourceInstanceId: "test-instance" };
      const { mandatorySteps } = AdditionalRuleRegistry.collectTriggerSteps(state, event);
      const newState = executeSteps(mandatorySteps, state);

      // Assert
      expect(mandatorySteps).toHaveLength(0);
      expect(triggerRule.executionCount).toBe(0);
      expect(newState.lp.player).toBe(8000);
    });

    it("should collect steps from multiple trigger rules", () => {
      // Arrange
      const cardId = 70791313;
      const triggerRule = new MockTriggerRuleWithEffect(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const monsterCard1 = createMonsterOnField(cardId, "mainMonsterZone-0");
      const monsterCard2 = createMonsterOnField(cardId, "mainMonsterZone-1");
      const state = createStateWithMonsterZone([monsterCard1, monsterCard2]);

      // Act
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345, sourceInstanceId: "test-instance" };
      const { mandatorySteps } = AdditionalRuleRegistry.collectTriggerSteps(state, event);
      const newState = executeSteps(mandatorySteps, state);

      // Assert
      expect(mandatorySteps).toHaveLength(2);
      expect(triggerRule.executionCount).toBe(2);
      expect(newState.lp.player).toBe(7800); // 8000 - 100 - 100
    });
  });
});
