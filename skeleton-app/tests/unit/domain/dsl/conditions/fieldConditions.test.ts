/**
 * フィールド系条件チェックのテスト
 */

import { describe, it, expect } from "vitest";
import {
  fieldHasCardCondition,
  fieldHasEquippedNameIncludesCondition,
  fieldHasMonsterWithRaceCondition,
  fieldHasNonEffectMonsterCondition,
} from "$lib/domain/dsl/conditions/checkers/fieldConditions";
import type { CardInstance } from "$lib/domain/models/Card";
import {
  createMockGameState,
  createMonsterOnField,
  createFilledMonsterZone,
  createFilledSpellZone,
  createSpellOnField,
  createSpellInstance,
  ACTUAL_CARD_IDS,
} from "../../../../__testUtils__";

// =============================================================================
// テストヘルパー
// =============================================================================

/** ソースインスタンス（条件チェックの発動元として使用） */
const createSourceInstance = (): CardInstance =>
  createSpellInstance("source-instance", { spellType: "normal", location: "hand" });

/** モンスターをフィールドに配置した状態を生成 */
const createStateWithMonsters = (count: number) =>
  createMockGameState({
    space: createFilledMonsterZone(count),
    phase: "main1",
  });

/** 魔法カードを魔法・罠ゾーンに配置した状態を生成 */
const createStateWithSpells = (count: number) =>
  createMockGameState({
    space: createFilledSpellZone(count),
    phase: "main1",
  });

// =============================================================================
// fieldHasCardCondition テスト
// =============================================================================

describe("fieldHasCardCondition", () => {
  it("フィールドにモンスターが指定枚数以上ある場合はtrueを返す", () => {
    const state = createStateWithMonsters(3);
    const sourceInstance = createSourceInstance();

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "monster", minCount: 2 });

    expect(result.isValid).toBe(true);
  });

  it("フィールドにモンスターが指定枚数未満の場合はfalseを返す", () => {
    const state = createStateWithMonsters(1);
    const sourceInstance = createSourceInstance();

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "monster", minCount: 2 });

    expect(result.isValid).toBe(false);
  });

  it("フィールドに魔法カードが指定枚数以上ある場合はtrueを返す", () => {
    const state = createStateWithSpells(2);
    const sourceInstance = createSourceInstance();

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "spell", minCount: 1 });

    expect(result.isValid).toBe(true);
  });

  it("minCountが省略された場合はデフォルト1を使用する", () => {
    const state = createStateWithMonsters(1);
    const sourceInstance = createSourceInstance();

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "monster" });

    expect(result.isValid).toBe(true);
  });

  it("フィールドに該当カードがない場合はfalseを返す", () => {
    const state = createMockGameState({ phase: "main1" });
    const sourceInstance = createSourceInstance();

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "monster" });

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// fieldHasEquippedNameIncludesCondition テスト
// =============================================================================

describe("fieldHasEquippedNameIncludesCondition", () => {
  it("フィールドに名前パターンを含む装備カードがある場合はtrueを返す", () => {
    const state = createMockGameState({
      space: {
        spellTrapZone: [
          createSpellOnField("equip-1", { cardId: ACTUAL_CARD_IDS.BROKEN_BAMBOO_SWORD }), // 折れ竹光
        ],
      },
      phase: "main1",
    });
    const sourceInstance = createSourceInstance();

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "竹光" });

    expect(result.isValid).toBe(true);
  });

  it("フィールドに名前パターンを含む装備カードがない場合はfalseを返す", () => {
    const state = createMockGameState({
      space: {
        spellTrapZone: [
          createSpellOnField("equip-1", { cardId: ACTUAL_CARD_IDS.BROKEN_BAMBOO_SWORD }), // 折れ竹光
        ],
      },
      phase: "main1",
    });
    const sourceInstance = createSourceInstance();

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "魔導師" });

    expect(result.isValid).toBe(false);
  });

  it("装備魔法以外のカードはマッチしない", () => {
    const state = createStateWithSpells(1);
    const sourceInstance = createSourceInstance();

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "Test" });

    expect(result.isValid).toBe(false);
  });

  it("フィールドにカードがない場合はfalseを返す", () => {
    const state = createMockGameState({ phase: "main1" });
    const sourceInstance = createSourceInstance();

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "test" });

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// fieldHasMonsterWithRaceCondition テスト
// =============================================================================

describe("fieldHasMonsterWithRaceCondition", () => {
  it("フィールドに指定種族の表側表示モンスターがある場合はtrueを返す", () => {
    const state = createMockGameState({
      space: {
        mainMonsterZone: [
          createMonsterOnField("warrior-1", { cardId: 88888, position: "faceUp", battlePosition: "attack" }),
        ],
      },
      phase: "main1",
    });
    // モンスターにraceプロパティを追加
    (state.space.mainMonsterZone[0] as unknown as { race: string }).race = "warrior";
    const sourceInstance = createSourceInstance();

    const result = fieldHasMonsterWithRaceCondition(state, sourceInstance, { race: "warrior" });

    expect(result.isValid).toBe(true);
  });

  it("フィールドに指定種族のモンスターがない場合はfalseを返す", () => {
    const state = createStateWithMonsters(1);
    const sourceInstance = createSourceInstance();

    const result = fieldHasMonsterWithRaceCondition(state, sourceInstance, { race: "dragon" });

    expect(result.isValid).toBe(false);
  });

  it("裏側表示のモンスターはマッチしない", () => {
    const state = createMockGameState({
      space: {
        mainMonsterZone: [
          createMonsterOnField("facedown-1", { cardId: 88888, position: "faceDown", battlePosition: "defense" }),
        ],
      },
      phase: "main1",
    });
    (state.space.mainMonsterZone[0] as unknown as { race: string }).race = "warrior";
    const sourceInstance = createSourceInstance();

    const result = fieldHasMonsterWithRaceCondition(state, sourceInstance, { race: "warrior" });

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// fieldHasNonEffectMonsterCondition テスト
// =============================================================================

describe("fieldHasNonEffectMonsterCondition", () => {
  it("フィールドに効果モンスター以外の表側表示モンスターがある場合はtrueを返す", () => {
    const state = createMockGameState({
      space: {
        mainMonsterZone: [
          createMonsterOnField("normal-1", { cardId: 88888, position: "faceUp", battlePosition: "attack" }),
        ],
      },
      phase: "main1",
    });
    const sourceInstance = createSourceInstance();

    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, {});

    expect(result.isValid).toBe(true);
  });

  it("フィールドに効果モンスターのみの場合はfalseを返す", () => {
    const effectMonster = createMonsterOnField("effect-1", {
      cardId: 88888,
      position: "faceUp",
      battlePosition: "attack",
      frameType: "effect",
    });
    // 効果モンスター判定にはmonsterTypeListが必要
    (effectMonster as unknown as { monsterTypeList: string[] }).monsterTypeList = ["effect"];

    const state = createMockGameState({
      space: {
        mainMonsterZone: [effectMonster],
      },
      phase: "main1",
    });
    const sourceInstance = createSourceInstance();

    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, {});

    expect(result.isValid).toBe(false);
  });

  it("minCountが指定された場合は指定枚数以上をチェックする", () => {
    const state = createMockGameState({
      space: {
        mainMonsterZone: [
          createMonsterOnField("normal-1", { cardId: 88888, position: "faceUp", battlePosition: "attack" }),
          createMonsterOnField("normal-2", { cardId: 88889, position: "faceUp", battlePosition: "attack" }),
        ],
      },
      phase: "main1",
    });
    const sourceInstance = createSourceInstance();

    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, { minCount: 2 });

    expect(result.isValid).toBe(true);
  });

  it("minCountに満たない場合はfalseを返す", () => {
    const state = createMockGameState({
      space: {
        mainMonsterZone: [
          createMonsterOnField("normal-1", { cardId: 88888, position: "faceUp", battlePosition: "attack" }),
        ],
      },
      phase: "main1",
    });
    const sourceInstance = createSourceInstance();

    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, { minCount: 2 });

    expect(result.isValid).toBe(false);
  });

  it("裏側表示のモンスターはカウントしない", () => {
    const state = createMockGameState({
      space: {
        mainMonsterZone: [
          createMonsterOnField("facedown-1", { cardId: 88888, position: "faceDown", battlePosition: "defense" }),
        ],
      },
      phase: "main1",
    });
    const sourceInstance = createSourceInstance();

    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, {});

    expect(result.isValid).toBe(false);
  });
});
