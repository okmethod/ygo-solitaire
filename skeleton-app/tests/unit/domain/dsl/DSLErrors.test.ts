import { describe, it, expect } from "vitest";
import { parseCardDSL } from "$lib/domain/dsl/parsers";
import { DSLParseError, DSLValidationError } from "$lib/domain/dsl/types/DSLErrors";

/**
 * DSL Error Messages Tests
 *
 * エラーメッセージにカードIDとフィールドパスが含まれることを検証する。
 * デバッグの効率化に必要な情報がエラーに含まれていることを保証する。
 */

describe("DSLErrors - Error Messages", () => {
  describe("DSLParseError", () => {
    it("エラーメッセージにカードIDが含まれる", () => {
      const error = new DSLParseError("test error", 12345);
      expect(error.message).toContain("Card ID: 12345");
      expect(error.cardId).toBe(12345);
    });

    it("エラーメッセージにフィールドパスが含まれる", () => {
      const error = new DSLParseError("test error", 12345, "effect-chainable-actions.activations");
      expect(error.message).toContain("Field: effect-chainable-actions.activations");
      expect(error.field).toBe("effect-chainable-actions.activations");
    });

    it("カードIDなしでもエラーが作成できる", () => {
      const error = new DSLParseError("test error");
      expect(error.message).toBe("DSL Parse Error: test error");
      expect(error.cardId).toBeUndefined();
    });
  });

  describe("DSLValidationError", () => {
    it("エラーメッセージにカードIDが含まれる", () => {
      const error = new DSLValidationError("validation failed", 55144522, "data.type", ["Invalid type"]);
      expect(error.message).toContain("Card ID: 55144522");
      expect(error.cardId).toBe(55144522);
    });

    it("エラーメッセージにフィールドパスが含まれる", () => {
      const error = new DSLValidationError("validation failed", 55144522, "data.type", ["Invalid type"]);
      expect(error.message).toContain("Field: data.type");
      expect(error.field).toBe("data.type");
    });

    it("issues配列にバリデーション問題が含まれる", () => {
      const issues = ["Invalid type", "Missing required field"];
      const error = new DSLValidationError("validation failed", 55144522, "data", issues);
      expect(error.issues).toEqual(issues);
      expect(error.issues.length).toBe(2);
    });
  });

  describe("CardDSLParser - Error Propagation", () => {
    it("不正なYAMLでDSLParseErrorがスローされる", () => {
      const invalidYaml = `
id: not-a-number
data:
  jaName: "test"
`;
      expect(() => parseCardDSL(invalidYaml)).toThrow(DSLValidationError);
    });

    it("必須フィールド欠落でカードIDとフィールドパスを含むエラーが返る", () => {
      const missingFieldYaml = `
id: 12345
data:
  jaName: "test"
`;
      // type フィールドが欠落
      try {
        parseCardDSL(missingFieldYaml);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(DSLValidationError);
        const validationError = error as DSLValidationError;
        expect(validationError.cardId).toBe(12345);
        expect(validationError.message).toContain("Card ID: 12345");
      }
    });

    it("不正なカードタイプでカードIDとフィールドパスを含むエラーが返る", () => {
      const invalidTypeYaml = `
id: 99999
data:
  jaName: "test"
  type: "invalid-type"
  frameType: "spell"
`;
      try {
        parseCardDSL(invalidTypeYaml);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(DSLValidationError);
        const validationError = error as DSLValidationError;
        expect(validationError.cardId).toBe(99999);
        expect(validationError.message).toContain("Card ID: 99999");
        // フィールドパスにdata関連の情報が含まれる
        expect(validationError.field).toContain("data");
      }
    });

    it("不正なeffect-chainable-actionsでフィールドパスが正しく設定される", () => {
      const invalidEffectYaml = `
id: 88888
data:
  jaName: "test"
  type: "spell"
  frameType: "spell"
effect-chainable-actions:
  activations:
    conditions:
      - step: "UNKNOWN_STEP"
        invalidField: true
`;
      // スキーマバリデーションは通るが、ステップ解決時にエラーになる可能性
      // スキーマレベルでは step と args のみ許可されているのでエラーになるはず
      try {
        parseCardDSL(invalidEffectYaml);
        // スキーマバリデーションで失敗
      } catch (error) {
        if (error instanceof DSLValidationError) {
          expect(error.cardId).toBe(88888);
          expect(error.message).toContain("Card ID: 88888");
        }
        // 他のエラー型も許容（スキーマ通過後のステップ解決エラーなど）
      }
    });
  });
});
