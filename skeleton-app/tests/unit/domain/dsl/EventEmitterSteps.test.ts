import { describe, it, expect } from "vitest";
import {
  emitSpellActivatedEventStep,
  emitMonsterSummonedEventStep,
  emitSentToGraveyardEventStep,
} from "$lib/domain/dsl/steps/primitives/eventEmitters";
import { createMockGameState, createTestMonsterCard, createTestSpellCard } from "../../../__testUtils__";

/**
 * EventEmitterSteps Tests - イベント発行系ステップのテスト
 *
 * TEST STRATEGY:
 * - emitSpellActivatedEventStep が正しくイベントを発行すること
 * - emitMonsterSummonedEventStep が正しくイベントを発行すること
 * - emitSentToGraveyardEventStep が正しくイベントを発行すること
 * - イベントがトリガーシステムで検出可能な形式であること
 */

// =============================================================================
// emitSpellActivatedEventStep のテスト
// =============================================================================

describe("emitSpellActivatedEventStep", () => {
  it("魔法発動イベントを発行するステップを生成できる", () => {
    const spellCard = createTestSpellCard("spell-instance-1", "normal", { location: "spellTrapZone" });

    const step = emitSpellActivatedEventStep(spellCard);

    expect(step.id).toContain("emit-spell-activated");
    expect(step.id).toContain("spell-instance-1");
    expect(step.summary).toContain("魔法発動");
    expect(step.notificationLevel).toBe("silent");
  });

  it("action実行でspellActivatedイベントを発行する", () => {
    const spellCard = createTestSpellCard("spell-instance-1", "normal", { location: "spellTrapZone" });
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
    const spellCard = createTestSpellCard("spell-instance-1", "normal", { location: "spellTrapZone" });
    const state = createMockGameState();

    const step = emitSpellActivatedEventStep(spellCard);
    const result = step.action(state);

    expect(result.updatedState).toEqual(state);
  });
});

// =============================================================================
// emitMonsterSummonedEventStep のテスト
// =============================================================================

describe("emitMonsterSummonedEventStep", () => {
  it("モンスター召喚イベントを発行するステップを生成できる", () => {
    const monsterCard = createTestMonsterCard("monster-instance-1", { location: "mainMonsterZone" });

    const step = emitMonsterSummonedEventStep(monsterCard);

    expect(step.id).toContain("emit-monster-summoned");
    expect(step.id).toContain("monster-instance-1");
    expect(step.summary).toContain("モンスター召喚");
    expect(step.notificationLevel).toBe("silent");
  });

  it("action実行でmonsterSummonedイベントを発行する", () => {
    const monsterCard = createTestMonsterCard("monster-instance-1", { location: "mainMonsterZone" });
    const state = createMockGameState();

    const step = emitMonsterSummonedEventStep(monsterCard);
    const result = step.action(state);

    expect(result.success).toBe(true);
    expect(result.emittedEvents).toBeDefined();
    expect(result.emittedEvents?.length).toBe(1);

    const event = result.emittedEvents?.[0];
    expect(event?.type).toBe("monsterSummoned");
    expect(event?.sourceInstanceId).toBe("monster-instance-1");
  });

  it("状態は変更されない", () => {
    const monsterCard = createTestMonsterCard("monster-instance-1", { location: "mainMonsterZone" });
    const state = createMockGameState();

    const step = emitMonsterSummonedEventStep(monsterCard);
    const result = step.action(state);

    expect(result.updatedState).toEqual(state);
  });
});

// =============================================================================
// emitSentToGraveyardEventStep のテスト
// =============================================================================

describe("emitSentToGraveyardEventStep", () => {
  it("墓地送りイベントを発行するステップを生成できる", () => {
    const card = createTestMonsterCard("card-instance-1", { location: "graveyard" });

    const step = emitSentToGraveyardEventStep(card);

    expect(step.id).toContain("emit-sent-to-graveyard");
    expect(step.id).toContain("card-instance-1");
    expect(step.summary).toContain("墓地送り");
    expect(step.notificationLevel).toBe("silent");
  });

  it("action実行でsentToGraveyardイベントを発行する", () => {
    const card = createTestMonsterCard("card-instance-1", { location: "graveyard" });
    const state = createMockGameState();

    const step = emitSentToGraveyardEventStep(card);
    const result = step.action(state);

    expect(result.success).toBe(true);
    expect(result.emittedEvents).toBeDefined();
    expect(result.emittedEvents?.length).toBe(1);

    const event = result.emittedEvents?.[0];
    expect(event?.type).toBe("sentToGraveyard");
    expect(event?.sourceInstanceId).toBe("card-instance-1");
  });

  it("状態は変更されない", () => {
    const card = createTestMonsterCard("card-instance-1", { location: "graveyard" });
    const state = createMockGameState();

    const step = emitSentToGraveyardEventStep(card);
    const result = step.action(state);

    expect(result.updatedState).toEqual(state);
  });

  it("魔法カードでもイベントを発行できる", () => {
    const spellCard = createTestSpellCard("spell-instance-1", "normal", { location: "graveyard" });
    const state = createMockGameState();

    const step = emitSentToGraveyardEventStep(spellCard);
    const result = step.action(state);

    expect(result.success).toBe(true);
    expect(result.emittedEvents?.[0]?.type).toBe("sentToGraveyard");
    expect(result.emittedEvents?.[0]?.sourceInstanceId).toBe("spell-instance-1");
  });
});

// =============================================================================
// イベント形式の共通テスト
// =============================================================================

describe("イベント形式", () => {
  it("全てのイベントにsourceCardIdとsourceInstanceIdが含まれる", () => {
    const monster = createTestMonsterCard("test-monster", { location: "mainMonsterZone" });
    const spell = createTestSpellCard("test-spell", "normal", { location: "spellTrapZone" });
    const state = createMockGameState();

    const spellStep = emitSpellActivatedEventStep(spell);
    const monsterStep = emitMonsterSummonedEventStep(monster);
    const graveyardStep = emitSentToGraveyardEventStep(monster);

    const spellResult = spellStep.action(state);
    const monsterResult = monsterStep.action(state);
    const graveyardResult = graveyardStep.action(state);

    // spellActivated
    expect(spellResult.emittedEvents?.[0]).toHaveProperty("sourceCardId");
    expect(spellResult.emittedEvents?.[0]).toHaveProperty("sourceInstanceId");

    // monsterSummoned
    expect(monsterResult.emittedEvents?.[0]).toHaveProperty("sourceCardId");
    expect(monsterResult.emittedEvents?.[0]).toHaveProperty("sourceInstanceId");

    // sentToGraveyard
    expect(graveyardResult.emittedEvents?.[0]).toHaveProperty("sourceCardId");
    expect(graveyardResult.emittedEvents?.[0]).toHaveProperty("sourceInstanceId");
  });

  it("notificationLevelがsilentに設定されている（トリガー専用）", () => {
    const monster = createTestMonsterCard("test-monster", { location: "mainMonsterZone" });
    const spell = createTestSpellCard("test-spell", "normal", { location: "spellTrapZone" });

    expect(emitSpellActivatedEventStep(spell).notificationLevel).toBe("silent");
    expect(emitMonsterSummonedEventStep(monster).notificationLevel).toBe("silent");
    expect(emitSentToGraveyardEventStep(monster).notificationLevel).toBe("silent");
  });
});
