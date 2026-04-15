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
import { createFilledSpaceState, createSpellInstance } from "../../../../__testUtils__";

// ソースインスタンス（条件チェックの発動元として使用）
const sourceInstance = createSpellInstance("dummy-source");

// =============================================================================
// fieldHasCardCondition テスト
// =============================================================================

describe("fieldHasCardCondition", () => {
  it("フィールドにモンスターが指定枚数以上ある場合はtrueを返す", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 3 });

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "monster", minCount: 2 });

    expect(result.isValid).toBe(true);
  });

  it("フィールドにモンスターが指定枚数未満の場合はfalseを返す", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 1 });

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "monster", minCount: 2 });

    expect(result.isValid).toBe(false);
  });

  it("フィールドに魔法カードが指定枚数以上ある場合はtrueを返す", () => {
    const state = createFilledSpaceState({ spellTrapZoneCount: 2 });

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "spell", minCount: 1 });

    expect(result.isValid).toBe(true);
  });

  it("minCountが省略された場合はデフォルト1を使用する", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 1 });

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "monster" });

    expect(result.isValid).toBe(true);
  });

  it("フィールドに該当カードがない場合はfalseを返す", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 0 });

    const result = fieldHasCardCondition(state, sourceInstance, { filterType: "monster" });

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// fieldHasEquippedNameIncludesCondition テスト
// =============================================================================

describe("fieldHasEquippedNameIncludesCondition", () => {
  it("フィールドに名前パターンを含む装備カードがある場合はtrueを返す", () => {
    const state = createFilledSpaceState({ spellTrapZoneCount: 1 });
    (state.space.spellTrapZone[0] as unknown as { jaName: string }).jaName = "架空竹光";
    (state.space.spellTrapZone[0] as unknown as { spellType: string }).spellType = "equip";

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "竹光" });

    expect(result.isValid).toBe(true);
  });

  it("名前パターンを含まない装備カードがある場合はfalseを返す", () => {
    const state = createFilledSpaceState({ spellTrapZoneCount: 1 });
    (state.space.spellTrapZone[0] as unknown as { spellType: string }).spellType = "equip";

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "竹光" });

    expect(result.isValid).toBe(false);
  });

  it("名前パターンを含む通常魔法カードがある場合はfalseを返す", () => {
    const state = createFilledSpaceState({ spellTrapZoneCount: 1 });
    (state.space.spellTrapZone[0] as unknown as { jaName: string }).jaName = "架空竹光";

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "竹光" });

    expect(result.isValid).toBe(false);
  });

  it("名前パターンを含む装備カードが裏側表示の場合はfalseを返す", () => {
    const state = createFilledSpaceState({ spellTrapZoneCount: 1 });
    (state.space.spellTrapZone[0] as unknown as { jaName: string }).jaName = "折れ竹光";
    (state.space.spellTrapZone[0] as unknown as { spellType: string }).spellType = "equip";
    (state.space.spellTrapZone[0] as unknown as { stateOnField: { position: string } }).stateOnField = {
      ...(state.space.spellTrapZone[0].stateOnField ?? {}),
      position: "faceDown",
    };

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "竹光" });

    expect(result.isValid).toBe(false);
  });

  it("装備魔法以外のカードはマッチしない", () => {
    const state = createFilledSpaceState({ spellTrapZoneCount: 1 });

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "Test" });

    expect(result.isValid).toBe(false);
  });

  it("フィールドにカードがない場合はfalseを返す", () => {
    const state = createFilledSpaceState({ spellTrapZoneCount: 0 });

    const result = fieldHasEquippedNameIncludesCondition(state, sourceInstance, { namePattern: "test" });

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// fieldHasMonsterWithRaceCondition テスト
// =============================================================================

describe("fieldHasMonsterWithRaceCondition", () => {
  it("フィールドに指定種族の表側表示モンスターがある場合はtrueを返す", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 1 });
    (state.space.mainMonsterZone[0] as unknown as { race: string }).race = "warrior";

    const result = fieldHasMonsterWithRaceCondition(state, sourceInstance, { race: "warrior" });

    expect(result.isValid).toBe(true);
  });

  it("フィールドに指定種族のモンスターがない場合はfalseを返す", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 1 });
    (state.space.mainMonsterZone[0] as unknown as { race: string }).race = "warrior";

    const result = fieldHasMonsterWithRaceCondition(state, sourceInstance, { race: "dragon" });

    expect(result.isValid).toBe(false);
  });

  it("裏側表示のモンスターはマッチしない", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 1 });
    (state.space.mainMonsterZone[0] as unknown as { race: string }).race = "warrior";
    (state.space.mainMonsterZone[0] as unknown as { stateOnField: { position: string } }).stateOnField = {
      ...(state.space.mainMonsterZone[0].stateOnField ?? {}),
      position: "faceDown",
    };

    const result = fieldHasMonsterWithRaceCondition(state, sourceInstance, { race: "warrior" });

    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// fieldHasNonEffectMonsterCondition テスト
// =============================================================================

describe("fieldHasNonEffectMonsterCondition", () => {
  it("フィールドに効果モンスター以外の表側表示モンスターがある場合はtrueを返す", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 1 });

    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, {});

    expect(result.isValid).toBe(true);
  });

  it("フィールドに効果モンスターのみの場合はfalseを返す", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 1 });
    (state.space.mainMonsterZone[0] as unknown as { monsterTypeList: string[] }).monsterTypeList = ["effect"];

    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, {});

    expect(result.isValid).toBe(false);
  });

  it("minCountが指定された場合は指定枚数以上をチェックする", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 2 });
    (state.space.mainMonsterZone[0] as unknown as { monsterTypeList: string[] }).monsterTypeList = ["normal"];
    (state.space.mainMonsterZone[1] as unknown as { monsterTypeList: string[] }).monsterTypeList = ["normal"];

    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, { minCount: 2 });

    expect(result.isValid).toBe(true);
  });

  it("minCountに満たない場合はfalseを返す", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 1 });
    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, { minCount: 2 });

    expect(result.isValid).toBe(false);
  });

  it("裏側表示のモンスターはカウントしない", () => {
    const state = createFilledSpaceState({ monsterZoneCount: 1 });
    (state.space.mainMonsterZone[0] as unknown as { stateOnField: { position: string } }).stateOnField = {
      ...(state.space.mainMonsterZone[0].stateOnField ?? {}),
      position: "faceDown",
    };

    const result = fieldHasNonEffectMonsterCondition(state, sourceInstance, {});

    expect(result.isValid).toBe(false);
  });
});
