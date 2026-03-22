/**
 * UpdateValidation Tests
 *
 * ゲーム状態更新の実行条件チェック結果モデルのテスト。
 * ValidationResultの生成とエラーメッセージ取得を検証する。
 *
 * @module tests/unit/domain/models/UpdateValidation
 */

import { describe, it, expect } from "vitest";
import {
  ERROR_CODES,
  successValidationResult,
  failureValidationResult,
  validationErrorMessage,
} from "$lib/domain/models/GameProcessing/UpdateValidation";
import type { ValidationResult } from "$lib/domain/models/GameProcessing/UpdateValidation";

describe("UpdateValidation", () => {
  describe("ERROR_CODES", () => {
    it("should have common error codes defined", () => {
      expect(ERROR_CODES.GAME_OVER).toBe("GAME_OVER");
      expect(ERROR_CODES.NOT_MAIN_PHASE).toBe("NOT_MAIN_PHASE");
    });

    it("should have card-related error codes defined", () => {
      expect(ERROR_CODES.CARD_NOT_FOUND).toBe("CARD_NOT_FOUND");
      expect(ERROR_CODES.CARD_NOT_IN_HAND).toBe("CARD_NOT_IN_HAND");
      expect(ERROR_CODES.NOT_SPELL_CARD).toBe("NOT_SPELL_CARD");
      expect(ERROR_CODES.NOT_MONSTER_CARD).toBe("NOT_MONSTER_CARD");
    });

    it("should have zone-related error codes defined", () => {
      expect(ERROR_CODES.SPELL_TRAP_ZONE_FULL).toBe("SPELL_TRAP_ZONE_FULL");
      expect(ERROR_CODES.MONSTER_ZONE_FULL).toBe("MONSTER_ZONE_FULL");
    });

    it("should have synchro-related error codes defined", () => {
      expect(ERROR_CODES.NOT_SYNCHRO_MONSTER).toBe("NOT_SYNCHRO_MONSTER");
      expect(ERROR_CODES.CARD_NOT_IN_EXTRA_DECK).toBe("CARD_NOT_IN_EXTRA_DECK");
      expect(ERROR_CODES.NO_VALID_SYNCHRO_MATERIALS).toBe("NO_VALID_SYNCHRO_MATERIALS");
    });
  });

  describe("successValidationResult", () => {
    it("should create a valid result with isValid true", () => {
      // Act
      const result = successValidationResult();

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errorCode).toBeUndefined();
      expect(result.errorParams).toBeUndefined();
    });

    it("should return a new object each time", () => {
      // Act
      const result1 = successValidationResult();
      const result2 = successValidationResult();

      // Assert
      expect(result1).not.toBe(result2);
    });
  });

  describe("failureValidationResult", () => {
    it("should create an invalid result with error code", () => {
      // Act
      const result = failureValidationResult(ERROR_CODES.GAME_OVER);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("GAME_OVER");
      expect(result.errorParams).toBeUndefined();
    });

    it("should create an invalid result with error params", () => {
      // Act
      const result = failureValidationResult(ERROR_CODES.INSUFFICIENT_DECK, {
        required: 2,
        actual: 1,
      });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("INSUFFICIENT_DECK");
      expect(result.errorParams).toEqual({ required: 2, actual: 1 });
    });

    it("should return a new object each time", () => {
      // Act
      const result1 = failureValidationResult(ERROR_CODES.GAME_OVER);
      const result2 = failureValidationResult(ERROR_CODES.GAME_OVER);

      // Assert
      expect(result1).not.toBe(result2);
    });
  });

  describe("validationErrorMessage", () => {
    it("should return empty string for valid result", () => {
      // Arrange
      const result = successValidationResult();

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("");
    });

    it("should return error message for GAME_OVER", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.GAME_OVER);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("ゲームは終了しています");
    });

    it("should return error message for NOT_MAIN_PHASE", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.NOT_MAIN_PHASE);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("メインフェイズではありません");
    });

    it("should return error message for CARD_NOT_IN_HAND", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.CARD_NOT_IN_HAND);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("カードが手札にありません");
    });

    it("should return error message for zone-related errors", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.SPELL_TRAP_ZONE_FULL);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("魔法・罠ゾーンに空きがありません");
    });

    it("should return error message for synchro-related errors", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.NO_VALID_SYNCHRO_MATERIALS);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("有効なシンクロ素材がありません");
    });

    it("should return empty string for invalid result without error code", () => {
      // Arrange - edge case: manually constructed invalid result
      const result: ValidationResult = { isValid: false };

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("");
    });

    it("should handle result with error params (template placeholder)", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.INSUFFICIENT_DECK, {
        required: 2,
        actual: 1,
      });

      // Act
      const message = validationErrorMessage(result);

      // Assert - currently just returns template, params are not substituted yet
      expect(message).toBe("デッキのカードが不足しています");
    });
  });
});
