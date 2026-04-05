import { describe, it, expect } from "vitest";
import { GenericContinuousTriggerRule } from "$lib/domain/dsl/factories/GenericContinuousTriggerRule";
import type { AdditionalRuleDSL } from "$lib/domain/dsl/types";
import type { CardInstance } from "$lib/domain/models/Card";
import { createMockGameState } from "../../../../__testUtils__";

/**
 * GenericContinuousTriggerRule Tests - DSL定義の永続効果トリガールールのテスト
 *
 * TEST STRATEGY:
 * - GenericContinuousTriggerRule が AdditionalRule インターフェースを正しく実装していること
 * - DSL定義からトリガールールを生成できること
 * - canApply がカードのフィールド状態を正しく判定すること
 * - createTriggerSteps がDSL定義に基づいてステップを生成すること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

const createMockCardInstance = (
  cardId: number,
  location: "mainMonsterZone" | "hand" = "mainMonsterZone",
): CardInstance =>
  ({
    instanceId: `instance-${cardId}`,
    id: cardId,
    jaName: "テストモンスター",
    type: "monster",
    frameType: "effect",
    location,
    stateOnField:
      location === "mainMonsterZone"
        ? {
            position: "faceUp",
            battlePosition: "attack",
            placedThisTurn: false,
            counters: [],
            activatedEffects: new Set<string>(),
          }
        : undefined,
  }) as CardInstance;

/** モンスターゾーンにモンスターを配置した状態を生成 */
const createStateWithMonster = (monsterOnField?: CardInstance) =>
  createMockGameState({
    space: {
      mainMonsterZone: monsterOnField ? [monsterOnField] : [],
    },
  });

// =============================================================================
// GenericContinuousTriggerRule のテスト
// =============================================================================

describe("GenericContinuousTriggerRule", () => {
  it("TriggerRule カテゴリとして生成される", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated"] },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
    };
    const rule = new GenericContinuousTriggerRule(70791313, dslDefinition);

    expect(rule.category).toBe("TriggerRule");
    expect(rule.isEffect).toBe(true);
  });

  it("triggers 配列が正しく設定される", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated"] },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
    };
    const rule = new GenericContinuousTriggerRule(70791313, dslDefinition);

    expect(rule.triggers).toContain("spellActivated");
  });

  it("canApply がフィールドにカードが存在する場合 true を返す", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated"] },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
    };
    const cardId = 70791313;
    const rule = new GenericContinuousTriggerRule(cardId, dslDefinition);
    const monster = createMockCardInstance(cardId, "mainMonsterZone");
    const state = createStateWithMonster(monster);

    expect(rule.canApply(state)).toBe(true);
  });

  it("canApply がフィールドにカードが存在しない場合 false を返す", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated"] },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
    };
    const rule = new GenericContinuousTriggerRule(70791313, dslDefinition);
    const state = createStateWithMonster();

    expect(rule.canApply(state)).toBe(false);
  });

  it("createTriggerSteps が DSL定義に基づいてステップを生成する", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated"] },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
    };
    const cardId = 70791313;
    const rule = new GenericContinuousTriggerRule(cardId, dslDefinition);
    const monster = createMockCardInstance(cardId, "mainMonsterZone");
    const state = createStateWithMonster(monster);

    const steps = rule.createTriggerSteps(state, monster);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].id).toContain("counter");
  });

  it("triggerTiming が正しく設定される", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated"], timing: "if" },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
    };
    const rule = new GenericContinuousTriggerRule(70791313, dslDefinition);

    expect(rule.triggerTiming).toBe("if");
  });

  it("triggerTiming がデフォルトで 'if'", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated"] },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
    };
    const rule = new GenericContinuousTriggerRule(70791313, dslDefinition);

    expect(rule.triggerTiming).toBe("if");
  });

  it("isMandatory がデフォルトで true", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated"] },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
    };
    const rule = new GenericContinuousTriggerRule(70791313, dslDefinition);

    expect(rule.isMandatory).toBe(true);
  });

  it("isMandatory を false に設定できる", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated"], isMandatory: false },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
    };
    const rule = new GenericContinuousTriggerRule(70791313, dslDefinition);

    expect(rule.isMandatory).toBe(false);
  });
});

// =============================================================================
// 複数トリガーのテスト
// =============================================================================

describe("GenericContinuousTriggerRule - Multiple Triggers", () => {
  it("複数のトリガーイベントに対応できる", () => {
    const dslDefinition: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated", "normalSummoned"] },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1 } }],
    };
    const rule = new GenericContinuousTriggerRule(12345, dslDefinition);

    expect(rule.triggers).toContain("spellActivated");
    expect(rule.triggers).toContain("normalSummoned");
  });
});
