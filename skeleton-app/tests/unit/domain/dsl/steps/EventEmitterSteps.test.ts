import { describe, it, expect } from "vitest";
import {
  emitSpellActivatedEventStep,
  emitNormalSummonedEventStep,
} from "$lib/domain/dsl/steps/primitives/eventEmitters";
import { createMockGameState, createMonsterInstance, createSpellInstance } from "../../../../__testUtils__";

/**
 * EventEmitterSteps Tests - イベント発行系ステップのテスト
 *
 * TEST STRATEGY:
 * - emitSpellActivatedEventStep が正しくイベントを発行すること
 * - emitNormalSummonedEventStep が正しくイベントを発行すること
 * - イベントがトリガーシステムで検出可能な形式であること
 */

// =============================================================================
// emitSpellActivatedEventStep のテスト
// =============================================================================

describe("emitSpellActivatedEventStep", () => {
  it("魔法発動イベントを発行するステップを生成できる", () => {
    const spellCard = createSpellInstance("spell-instance-1", { spellType: "normal", location: "spellTrapZone" });

    const step = emitSpellActivatedEventStep(spellCard);

    expect(step.id).toContain("emit-spell-activated");
    expect(step.id).toContain("spell-instance-1");
    expect(step.summary).toContain("魔法発動");
    expect(step.notificationLevel).toBe("silent");
  });

  it("action実行でspellActivatedイベントを発行する", () => {
    const spellCard = createSpellInstance("spell-instance-1", { spellType: "normal", location: "spellTrapZone" });
    const state = createMockGameState();

    const step = emitSpellActivatedEventStep(spellCard);
    const result = step.action(state);

    expect(result.success).toBe(true);
    expect(result.emittedEvents).toBeDefined();
    expect(result.emittedEvents?.length).toBe(1);

    const event = result.emittedEvents?.[0];
    expect(event?.type).toBe("spellActivated");
    expect(event?.sourceInstanceId).toBe("spell-instance-1");
  });

  it("状態は変更されない", () => {
    const spellCard = createSpellInstance("spell-instance-1", { spellType: "normal", location: "spellTrapZone" });
    const state = createMockGameState();

    const step = emitSpellActivatedEventStep(spellCard);
    const result = step.action(state);

    expect(result.updatedState).toEqual(state);
  });
});

// =============================================================================
// emitNormalSummonedEventStep のテスト
// =============================================================================

describe("emitNormalSummonedEventStep", () => {
  it("モンスター召喚イベントを発行するステップを生成できる", () => {
    const monsterCard = createMonsterInstance("monster-instance-1", { location: "mainMonsterZone" });

    const step = emitNormalSummonedEventStep(monsterCard);

    expect(step.id).toContain("emit-monster-summoned");
    expect(step.id).toContain("monster-instance-1");
    expect(step.summary).toContain("モンスター召喚");
    expect(step.notificationLevel).toBe("silent");
  });

  it("action実行でnormalSummonedイベントを発行する", () => {
    const monsterCard = createMonsterInstance("monster-instance-1", { location: "mainMonsterZone" });
    const state = createMockGameState();

    const step = emitNormalSummonedEventStep(monsterCard);
    const result = step.action(state);

    expect(result.success).toBe(true);
    expect(result.emittedEvents).toBeDefined();
    expect(result.emittedEvents?.length).toBe(1);

    const event = result.emittedEvents?.[0];
    expect(event?.type).toBe("normalSummoned");
    expect(event?.sourceInstanceId).toBe("monster-instance-1");
  });

  it("状態は変更されない", () => {
    const monsterCard = createMonsterInstance("monster-instance-1", { location: "mainMonsterZone" });
    const state = createMockGameState();

    const step = emitNormalSummonedEventStep(monsterCard);
    const result = step.action(state);

    expect(result.updatedState).toEqual(state);
  });
});

// =============================================================================
// イベント形式の共通テスト
// =============================================================================

describe("イベント形式", () => {
  it("全てのイベントにsourceCardIdとsourceInstanceIdが含まれる", () => {
    const monster = createMonsterInstance("test-monster", { location: "mainMonsterZone" });
    const spell = createSpellInstance("test-spell", { spellType: "normal", location: "spellTrapZone" });
    const state = createMockGameState();

    const spellStep = emitSpellActivatedEventStep(spell);
    const monsterStep = emitNormalSummonedEventStep(monster);

    const spellResult = spellStep.action(state);
    const monsterResult = monsterStep.action(state);

    // spellActivated
    expect(spellResult.emittedEvents?.[0]).toHaveProperty("sourceCardId");
    expect(spellResult.emittedEvents?.[0]).toHaveProperty("sourceInstanceId");

    // normalSummoned
    expect(monsterResult.emittedEvents?.[0]).toHaveProperty("sourceCardId");
    expect(monsterResult.emittedEvents?.[0]).toHaveProperty("sourceInstanceId");
  });

  it("notificationLevelがsilentに設定されている（トリガー専用）", () => {
    const monster = createMonsterInstance("test-monster", { location: "mainMonsterZone" });
    const spell = createSpellInstance("test-spell", { spellType: "normal", location: "spellTrapZone" });

    expect(emitSpellActivatedEventStep(spell).notificationLevel).toBe("silent");
    expect(emitNormalSummonedEventStep(monster).notificationLevel).toBe("silent");
  });
});
