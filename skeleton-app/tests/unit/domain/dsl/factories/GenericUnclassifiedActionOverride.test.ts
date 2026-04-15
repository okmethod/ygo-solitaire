/**
 * DSL定義から分類されない効果の処理置換を生成するファクトリクラスのテスト
 *
 * TEST STRATEGY:
 * - DSL定義から正しくインスタンスが生成されること
 * - override フィールドが未指定の場合にエラーが発生すること
 * - canApply() が常に true を返すこと
 * - shouldApplyOverride() がハンドラに委譲して正しく判定すること
 * - getOverrideValue() がハンドラに委譲して正しい値を返すこと
 */

import { describe, it, expect } from "vitest";
import { GenericUnclassifiedActionOverride } from "$lib/domain/dsl/factories/GenericUnclassifiedActionOverride";
import type { AdditionalRuleDSL } from "$lib/domain/dsl/types";
import { OVERRIDE_NAMES } from "$lib/domain/dsl/overrides/OverrideNames";
import { createSpaceState, createMonsterOnField, DUMMY_CARD_IDS } from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

const EFFECT_MONSTER_ID = DUMMY_CARD_IDS.EFFECT_MONSTER;
const OTHER_CARD_ID = DUMMY_CARD_IDS.NORMAL_MONSTER;

const state = createSpaceState();

const baseDsl = (): AdditionalRuleDSL => ({
  category: "ActionOverride",
  override: OVERRIDE_NAMES.FIELD_DEPARTURE_DESTINATION,
});

// =============================================================================
// インスタンス生成テスト
// =============================================================================

describe("GenericUnclassifiedActionOverride - インスタンス生成", () => {
  it("正しいDSL定義からインスタンスを生成できる", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, {
      ...baseDsl(),
      args: { destination: "banished" },
    });

    expect(rule).toBeInstanceOf(GenericUnclassifiedActionOverride);
    expect(rule.cardId).toBe(EFFECT_MONSTER_ID);
  });

  it("category は 'ActionOverride'", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.category).toBe("ActionOverride");
  });

  it("overrideName は DSL定義から正しく設定される", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.overrideName).toBe(OVERRIDE_NAMES.FIELD_DEPARTURE_DESTINATION);
  });

  it("args は DSL定義から正しく設定される", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, {
      ...baseDsl(),
      args: { destination: "banished" },
    });

    expect(rule.args).toEqual({ destination: "banished" });
  });

  it("args が省略された場合は空オブジェクトがデフォルト", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.args).toEqual({});
  });

  it("override フィールドが未指定の場合は Error をスローする", () => {
    const dsl = {
      category: "ActionOverride",
      // override フィールドなし
    } as unknown as AdditionalRuleDSL;

    expect(() => new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, dsl)).toThrow();
  });

  it("isEffect は true（効果として無効化される可能性がある）", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.isEffect).toBe(true);
  });
});

// =============================================================================
// canApply テスト
// =============================================================================

describe("GenericUnclassifiedActionOverride - canApply", () => {
  it("canApply は常に true を返す", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.canApply(state)).toBe(true);
  });
});

// =============================================================================
// shouldApplyOverride テスト
// =============================================================================

describe("GenericUnclassifiedActionOverride - shouldApplyOverride", () => {
  it("自分自身のカードが表側表示の場合は shouldApplyOverride が true を返す", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, {
      ...baseDsl(),
      args: { destination: "banished" },
    });
    const card = createMonsterOnField("test-instance", { cardId: EFFECT_MONSTER_ID, position: "faceUp" });

    expect(rule.shouldApplyOverride(state, card)).toBe(true);
  });

  it("自分自身のカードが裏側表示の場合は shouldApplyOverride が false を返す", () => {
    const dsl: AdditionalRuleDSL = {
      category: "ActionOverride",
      override: OVERRIDE_NAMES.FIELD_DEPARTURE_DESTINATION,
      args: { destination: "banished" },
    };

    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, dsl);
    const card = createMonsterOnField("test-instance", { cardId: EFFECT_MONSTER_ID, position: "faceDown" });

    expect(rule.shouldApplyOverride(state, card)).toBe(false);
  });

  it("異なるカードIDの場合は shouldApplyOverride が false を返す", () => {
    const dsl: AdditionalRuleDSL = {
      category: "ActionOverride",
      override: OVERRIDE_NAMES.FIELD_DEPARTURE_DESTINATION,
      args: { destination: "banished" },
    };

    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, dsl);
    const otherCard = createMonsterOnField("other-instance", { cardId: OTHER_CARD_ID, position: "faceUp" });

    expect(rule.shouldApplyOverride(state, otherCard)).toBe(false);
  });
});

// =============================================================================
// getOverrideValue テスト
// =============================================================================

describe("GenericUnclassifiedActionOverride - getOverrideValue", () => {
  it("args.destination が 'banished' の場合は 'banished' を返す", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, {
      ...baseDsl(),
      args: { destination: "banished" },
    });

    expect(rule.getOverrideValue<string>()).toBe("banished");
  });

  it("args.destination が未指定の場合はデフォルト値 'banished' を返す", () => {
    const rule = new GenericUnclassifiedActionOverride(EFFECT_MONSTER_ID, baseDsl());

    expect(rule.getOverrideValue<string>()).toBe("banished");
  });
});
