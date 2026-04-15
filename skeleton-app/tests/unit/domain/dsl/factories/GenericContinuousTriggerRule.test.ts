/**
 * DSL定義の永続効果トリガールールのテスト
 *
 * TEST STRATEGY:
 * - GenericContinuousTriggerRule が AdditionalRule インターフェースを正しく実装していること
 * - DSL定義からトリガールールを生成できること
 * - canApply がカードのフィールド状態を正しく判定すること
 * - createTriggerSteps がDSL定義に基づいてステップを生成すること
 */

import { describe, it, expect } from "vitest";
import { GenericContinuousTriggerRule } from "$lib/domain/dsl/factories/GenericContinuousTriggerRule";
import type { AdditionalRuleDSL } from "$lib/domain/dsl/types";
import { createMonsterOnField, createSpaceState, DUMMY_CARD_IDS } from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const EFFECT_MONSTER_ID = DUMMY_CARD_IDS.EFFECT_MONSTER;

const baseDsl = (): AdditionalRuleDSL => ({
  category: "TriggerRule",
  conditions: {
    trigger: { events: ["spellActivated"] },
  },
  resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1, limit: 3 } }],
});

const stateHasMonsterOnField = (hasMonster: boolean = true) =>
  createSpaceState({
    mainMonsterZone: hasMonster
      ? [createMonsterOnField(`instance-${EFFECT_MONSTER_ID}`, { cardId: EFFECT_MONSTER_ID })]
      : [],
  });

// =============================================================================
// GenericContinuousTriggerRule のテスト
// =============================================================================

describe("GenericContinuousTriggerRule", () => {
  it("TriggerRule カテゴリとして生成される", () => {
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.category).toBe("TriggerRule");
    expect(rule.isEffect).toBe(true);
  });

  it("triggers 配列が正しく設定される", () => {
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.triggers).toContain("spellActivated");
  });

  it("canApply がフィールドにカードが存在する場合 true を返す", () => {
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.canApply(stateHasMonsterOnField())).toBe(true);
  });

  it("canApply がフィールドにカードが存在しない場合 false を返す", () => {
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.canApply(stateHasMonsterOnField(false))).toBe(false);
  });

  it("createTriggerSteps が DSL定義に基づいてステップを生成する", () => {
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, baseDsl());
    const state = stateHasMonsterOnField(true);

    const steps = rule.createTriggerSteps(state, state.space.mainMonsterZone[0]);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].id).toContain("counter");
  });

  it("triggerTiming が正しく設定される", () => {
    const dsl: AdditionalRuleDSL = {
      ...baseDsl(),
      conditions: {
        trigger: { events: ["spellActivated"], timing: "if" },
      },
    };
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, dsl);

    expect(rule.triggerTiming).toBe("if");
  });

  it("triggerTiming がデフォルトで 'if'", () => {
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.triggerTiming).toBe("if");
  });

  it("isMandatory がデフォルトで true", () => {
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.isMandatory).toBe(true);
  });

  it("isMandatory を false に設定できる", () => {
    const dsl: AdditionalRuleDSL = {
      ...baseDsl(),
      conditions: {
        trigger: { events: ["spellActivated"], isMandatory: false },
      },
    };
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, dsl);

    expect(rule.isMandatory).toBe(false);
  });
});

// =============================================================================
// 複数トリガーのテスト
// =============================================================================

describe("GenericContinuousTriggerRule - Multiple Triggers", () => {
  it("複数のトリガーイベントに対応できる", () => {
    const dsl: AdditionalRuleDSL = {
      category: "TriggerRule",
      conditions: {
        trigger: { events: ["spellActivated", "normalSummoned"] },
      },
      resolutions: [{ step: "PLACE_COUNTER", args: { counterType: "spell", count: 1 } }],
    };
    const rule = new GenericContinuousTriggerRule(EFFECT_MONSTER_ID, dsl);

    expect(rule.triggers).toContain("spellActivated");
    expect(rule.triggers).toContain("normalSummoned");
  });
});
