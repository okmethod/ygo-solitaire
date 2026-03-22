/**
 * argValidators.ts のテスト
 *
 * DSL引数のバリデーションユーティリティの動作を検証する。
 */

import { describe, it, expect } from "vitest";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { ArgValidationError } from "$lib/domain/dsl/types";

describe("ArgValidators", () => {
  // ===========================
  // 数値バリデーション
  // ===========================

  describe("positiveInt", () => {
    it("正の整数を返す", () => {
      expect(ArgValidators.positiveInt({ count: 1 }, "count")).toBe(1);
      expect(ArgValidators.positiveInt({ count: 100 }, "count")).toBe(100);
    });

    it("0でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.positiveInt({ count: 0 }, "count")).toThrow(ArgValidationError);
    });

    it("負数でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.positiveInt({ count: -1 }, "count")).toThrow(ArgValidationError);
    });

    it("小数でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.positiveInt({ count: 1.5 }, "count")).toThrow(ArgValidationError);
    });

    it("非数値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.positiveInt({ count: "1" }, "count")).toThrow(ArgValidationError);
      expect(() => ArgValidators.positiveInt({ count: undefined }, "count")).toThrow(ArgValidationError);
    });
  });

  describe("nonNegativeInt", () => {
    it("0を返す", () => {
      expect(ArgValidators.nonNegativeInt({ count: 0 }, "count")).toBe(0);
    });

    it("正の整数を返す", () => {
      expect(ArgValidators.nonNegativeInt({ count: 1 }, "count")).toBe(1);
      expect(ArgValidators.nonNegativeInt({ count: 100 }, "count")).toBe(100);
    });

    it("負数でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.nonNegativeInt({ count: -1 }, "count")).toThrow(ArgValidationError);
    });

    it("小数でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.nonNegativeInt({ count: 1.5 }, "count")).toThrow(ArgValidationError);
    });

    it("非数値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.nonNegativeInt({ count: "1" }, "count")).toThrow(ArgValidationError);
    });
  });

  describe("optionalPositiveInt", () => {
    it("正の整数を返す", () => {
      expect(ArgValidators.optionalPositiveInt({ count: 1 }, "count")).toBe(1);
    });

    it("undefinedの場合undefinedを返す", () => {
      expect(ArgValidators.optionalPositiveInt({}, "count")).toBeUndefined();
      expect(ArgValidators.optionalPositiveInt({ count: undefined }, "count")).toBeUndefined();
    });

    it("0でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalPositiveInt({ count: 0 }, "count")).toThrow(ArgValidationError);
    });

    it("負数でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalPositiveInt({ count: -1 }, "count")).toThrow(ArgValidationError);
    });

    it("小数でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalPositiveInt({ count: 1.5 }, "count")).toThrow(ArgValidationError);
    });
  });

  // ===========================
  // 文字列バリデーション
  // ===========================

  describe("string", () => {
    it("文字列を返す", () => {
      expect(ArgValidators.string({ name: "test" }, "name")).toBe("test");
      expect(ArgValidators.string({ name: "" }, "name")).toBe("");
    });

    it("非文字列でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.string({ name: 123 }, "name")).toThrow(ArgValidationError);
      expect(() => ArgValidators.string({ name: undefined }, "name")).toThrow(ArgValidationError);
      expect(() => ArgValidators.string({ name: null }, "name")).toThrow(ArgValidationError);
    });
  });

  describe("optionalString", () => {
    it("文字列を返す", () => {
      expect(ArgValidators.optionalString({ name: "test" }, "name")).toBe("test");
    });

    it("undefinedの場合undefinedを返す", () => {
      expect(ArgValidators.optionalString({}, "name")).toBeUndefined();
      expect(ArgValidators.optionalString({ name: undefined }, "name")).toBeUndefined();
    });

    it("非文字列でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalString({ name: 123 }, "name")).toThrow(ArgValidationError);
    });
  });

  describe("nonEmptyString", () => {
    it("非空文字列を返す", () => {
      expect(ArgValidators.nonEmptyString({ name: "test" }, "name")).toBe("test");
      expect(ArgValidators.nonEmptyString({ name: " " }, "name")).toBe(" ");
    });

    it("空文字列でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.nonEmptyString({ name: "" }, "name")).toThrow(ArgValidationError);
    });

    it("非文字列でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.nonEmptyString({ name: 123 }, "name")).toThrow(ArgValidationError);
      expect(() => ArgValidators.nonEmptyString({ name: undefined }, "name")).toThrow(ArgValidationError);
    });
  });

  // ===========================
  // ブールバリデーション
  // ===========================

  describe("boolean", () => {
    it("trueを返す", () => {
      expect(ArgValidators.boolean({ flag: true }, "flag")).toBe(true);
    });

    it("falseを返す", () => {
      expect(ArgValidators.boolean({ flag: false }, "flag")).toBe(false);
    });

    it("非ブール値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.boolean({ flag: "true" }, "flag")).toThrow(ArgValidationError);
      expect(() => ArgValidators.boolean({ flag: 1 }, "flag")).toThrow(ArgValidationError);
      expect(() => ArgValidators.boolean({ flag: undefined }, "flag")).toThrow(ArgValidationError);
    });
  });

  describe("optionalBoolean", () => {
    it("ブール値を返す", () => {
      expect(ArgValidators.optionalBoolean({ flag: true }, "flag", false)).toBe(true);
      expect(ArgValidators.optionalBoolean({ flag: false }, "flag", true)).toBe(false);
    });

    it("undefinedの場合デフォルト値を返す", () => {
      expect(ArgValidators.optionalBoolean({}, "flag", true)).toBe(true);
      expect(ArgValidators.optionalBoolean({}, "flag", false)).toBe(false);
      expect(ArgValidators.optionalBoolean({ flag: undefined }, "flag", true)).toBe(true);
    });

    it("非ブール値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalBoolean({ flag: "true" }, "flag", false)).toThrow(ArgValidationError);
      expect(() => ArgValidators.optionalBoolean({ flag: 1 }, "flag", false)).toThrow(ArgValidationError);
    });
  });

  // ===========================
  // 列挙型バリデーション
  // ===========================

  describe("oneOf", () => {
    const validValues = ["monster", "spell", "trap"] as const;

    it("有効な値を返す", () => {
      expect(ArgValidators.oneOf({ type: "monster" }, "type", validValues)).toBe("monster");
      expect(ArgValidators.oneOf({ type: "spell" }, "type", validValues)).toBe("spell");
      expect(ArgValidators.oneOf({ type: "trap" }, "type", validValues)).toBe("trap");
    });

    it("無効な値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.oneOf({ type: "invalid" }, "type", validValues)).toThrow(ArgValidationError);
    });

    it("非文字列でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.oneOf({ type: 123 }, "type", validValues)).toThrow(ArgValidationError);
      expect(() => ArgValidators.oneOf({ type: undefined }, "type", validValues)).toThrow(ArgValidationError);
    });
  });

  describe("optionalOneOf", () => {
    const validValues = ["attack", "defense"] as const;

    it("有効な値を返す", () => {
      expect(ArgValidators.optionalOneOf({ position: "attack" }, "position", validValues, "defense")).toBe("attack");
      expect(ArgValidators.optionalOneOf({ position: "defense" }, "position", validValues, "attack")).toBe("defense");
    });

    it("undefinedの場合デフォルト値を返す", () => {
      expect(ArgValidators.optionalOneOf({}, "position", validValues, "attack")).toBe("attack");
      expect(ArgValidators.optionalOneOf({ position: undefined }, "position", validValues, "defense")).toBe("defense");
    });

    it("無効な値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalOneOf({ position: "invalid" }, "position", validValues, "attack")).toThrow(
        ArgValidationError,
      );
    });

    it("非文字列でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalOneOf({ position: 123 }, "position", validValues, "attack")).toThrow(
        ArgValidationError,
      );
    });
  });

  describe("player", () => {
    it("playerを返す", () => {
      expect(ArgValidators.player({ target: "player" }, "target")).toBe("player");
    });

    it("opponentを返す", () => {
      expect(ArgValidators.player({ target: "opponent" }, "target")).toBe("opponent");
    });

    it("無効な値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.player({ target: "invalid" }, "target")).toThrow(ArgValidationError);
      expect(() => ArgValidators.player({ target: undefined }, "target")).toThrow(ArgValidationError);
    });
  });

  describe("optionalPlayer", () => {
    it("有効なプレイヤーを返す", () => {
      expect(ArgValidators.optionalPlayer({ target: "player" }, "target", "opponent")).toBe("player");
      expect(ArgValidators.optionalPlayer({ target: "opponent" }, "target", "player")).toBe("opponent");
    });

    it("undefinedの場合デフォルト値を返す", () => {
      expect(ArgValidators.optionalPlayer({}, "target", "player")).toBe("player");
      expect(ArgValidators.optionalPlayer({ target: undefined }, "target", "opponent")).toBe("opponent");
    });

    it("無効な値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalPlayer({ target: "invalid" }, "target", "player")).toThrow(ArgValidationError);
    });
  });

  describe("optionalCardType", () => {
    it("monsterを返す", () => {
      expect(ArgValidators.optionalCardType({ type: "monster" }, "type")).toBe("monster");
    });

    it("spellを返す", () => {
      expect(ArgValidators.optionalCardType({ type: "spell" }, "type")).toBe("spell");
    });

    it("trapを返す", () => {
      expect(ArgValidators.optionalCardType({ type: "trap" }, "type")).toBe("trap");
    });

    it("undefinedの場合undefinedを返す", () => {
      expect(ArgValidators.optionalCardType({}, "type")).toBeUndefined();
      expect(ArgValidators.optionalCardType({ type: undefined }, "type")).toBeUndefined();
    });

    it("無効な値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalCardType({ type: "invalid" }, "type")).toThrow(ArgValidationError);
      expect(() => ArgValidators.optionalCardType({ type: 123 }, "type")).toThrow(ArgValidationError);
    });
  });

  describe("optionalSpellSubType", () => {
    const validSpellSubTypes = ["normal", "quick-play", "continuous", "field", "equip", "ritual"] as const;

    validSpellSubTypes.forEach((subType) => {
      it(`${subType}を返す`, () => {
        expect(ArgValidators.optionalSpellSubType({ subType }, "subType")).toBe(subType);
      });
    });

    it("undefinedの場合undefinedを返す", () => {
      expect(ArgValidators.optionalSpellSubType({}, "subType")).toBeUndefined();
      expect(ArgValidators.optionalSpellSubType({ subType: undefined }, "subType")).toBeUndefined();
    });

    it("無効な値でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalSpellSubType({ subType: "invalid" }, "subType")).toThrow(ArgValidationError);
      expect(() => ArgValidators.optionalSpellSubType({ subType: 123 }, "subType")).toThrow(ArgValidationError);
    });
  });

  // ===========================
  // 配列バリデーション
  // ===========================

  describe("optionalStringArray", () => {
    it("文字列配列を返す", () => {
      expect(ArgValidators.optionalStringArray({ names: ["a", "b", "c"] }, "names")).toEqual(["a", "b", "c"]);
    });

    it("空配列を返す", () => {
      expect(ArgValidators.optionalStringArray({ names: [] }, "names")).toEqual([]);
    });

    it("undefinedの場合undefinedを返す", () => {
      expect(ArgValidators.optionalStringArray({}, "names")).toBeUndefined();
      expect(ArgValidators.optionalStringArray({ names: undefined }, "names")).toBeUndefined();
    });

    it("配列でない場合ArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalStringArray({ names: "not array" }, "names")).toThrow(ArgValidationError);
    });

    it("文字列以外を含む配列でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalStringArray({ names: ["a", 123, "b"] }, "names")).toThrow(ArgValidationError);
      expect(() => ArgValidators.optionalStringArray({ names: [1, 2, 3] }, "names")).toThrow(ArgValidationError);
    });
  });

  describe("optionalNumberArray", () => {
    it("数値配列を返す", () => {
      expect(ArgValidators.optionalNumberArray({ values: [1, 2, 3] }, "values")).toEqual([1, 2, 3]);
    });

    it("空配列を返す", () => {
      expect(ArgValidators.optionalNumberArray({ values: [] }, "values")).toEqual([]);
    });

    it("undefinedの場合undefinedを返す", () => {
      expect(ArgValidators.optionalNumberArray({}, "values")).toBeUndefined();
      expect(ArgValidators.optionalNumberArray({ values: undefined }, "values")).toBeUndefined();
    });

    it("配列でない場合ArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalNumberArray({ values: 123 }, "values")).toThrow(ArgValidationError);
    });

    it("数値以外を含む配列でArgValidationErrorをスロー", () => {
      expect(() => ArgValidators.optionalNumberArray({ values: [1, "2", 3] }, "values")).toThrow(ArgValidationError);
      expect(() => ArgValidators.optionalNumberArray({ values: ["a", "b"] }, "values")).toThrow(ArgValidationError);
    });
  });
});
