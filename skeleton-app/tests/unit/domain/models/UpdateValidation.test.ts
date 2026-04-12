/**
 * ValidationResult モデルのテスト
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
    it("汎用エラーコードが定義されている", () => {
      expect(ERROR_CODES.GAME_OVER).toBe("GAME_OVER");
      expect(ERROR_CODES.NOT_MAIN_PHASE).toBe("NOT_MAIN_PHASE");
    });

    it("カード関連エラーコードが定義されている", () => {
      expect(ERROR_CODES.CARD_NOT_FOUND).toBe("CARD_NOT_FOUND");
      expect(ERROR_CODES.CARD_NOT_IN_HAND).toBe("CARD_NOT_IN_HAND");
      expect(ERROR_CODES.NOT_SPELL_CARD).toBe("NOT_SPELL_CARD");
      expect(ERROR_CODES.NOT_MONSTER_CARD).toBe("NOT_MONSTER_CARD");
    });

    it("ゾーン関連エラーコードが定義されている", () => {
      expect(ERROR_CODES.SPELL_TRAP_ZONE_FULL).toBe("SPELL_TRAP_ZONE_FULL");
      expect(ERROR_CODES.MONSTER_ZONE_FULL).toBe("MONSTER_ZONE_FULL");
    });

    it("シンクロ関連エラーコードが定義されている", () => {
      expect(ERROR_CODES.NOT_SYNCHRO_MONSTER).toBe("NOT_SYNCHRO_MONSTER");
      expect(ERROR_CODES.CARD_NOT_IN_EXTRA_DECK).toBe("CARD_NOT_IN_EXTRA_DECK");
      expect(ERROR_CODES.NO_VALID_SYNCHRO_MATERIALS).toBe("NO_VALID_SYNCHRO_MATERIALS");
    });
  });

  describe("successValidationResult", () => {
    it("isValid が true の成功結果を生成する", () => {
      // Act
      const result = successValidationResult();

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errorCode).toBeUndefined();
      expect(result.errorParams).toBeUndefined();
    });

    it("呼び出すたびに新しいオブジェクトを返す", () => {
      // Act
      const result1 = successValidationResult();
      const result2 = successValidationResult();

      // Assert
      expect(result1).not.toBe(result2);
    });
  });

  describe("failureValidationResult", () => {
    it("エラーコードを持つ失敗結果を生成する", () => {
      // Act
      const result = failureValidationResult(ERROR_CODES.GAME_OVER);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("GAME_OVER");
      expect(result.errorParams).toBeUndefined();
    });

    it("エラーパラメータを持つ失敗結果を生成する", () => {
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

    it("呼び出すたびに新しいオブジェクトを返す", () => {
      // Act
      const result1 = failureValidationResult(ERROR_CODES.GAME_OVER);
      const result2 = failureValidationResult(ERROR_CODES.GAME_OVER);

      // Assert
      expect(result1).not.toBe(result2);
    });
  });

  describe("validationErrorMessage", () => {
    it("成功結果の場合は空文字を返す", () => {
      // Arrange
      const result = successValidationResult();

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("");
    });

    it("GAME_OVER のエラーメッセージを返す", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.GAME_OVER);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("ゲームは終了しています");
    });

    it("NOT_MAIN_PHASE のエラーメッセージを返す", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.NOT_MAIN_PHASE);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("メインフェイズではありません");
    });

    it("CARD_NOT_IN_HAND のエラーメッセージを返す", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.CARD_NOT_IN_HAND);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("カードが手札にありません");
    });

    it("ゾーン関連エラーのメッセージを返す", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.SPELL_TRAP_ZONE_FULL);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("魔法・罠ゾーンに空きがありません");
    });

    it("シンクロ関連エラーのメッセージを返す", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.NO_VALID_SYNCHRO_MATERIALS);

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("有効なシンクロ素材がありません");
    });

    it("エラーコードなしの失敗結果の場合は空文字を返す", () => {
      // Arrange - エッジケース: 手動で構築した失敗結果
      const result: ValidationResult = { isValid: false };

      // Act
      const message = validationErrorMessage(result);

      // Assert
      expect(message).toBe("");
    });

    it("エラーパラメータを持つ結果を処理する（テンプレートプレースホルダー）", () => {
      // Arrange
      const result = failureValidationResult(ERROR_CODES.INSUFFICIENT_DECK, {
        required: 2,
        actual: 1,
      });

      // Act
      const message = validationErrorMessage(result);

      // Assert - 現状はテンプレートをそのまま返す（パラメータ置換は未実装）
      expect(message).toBe("デッキのカードが不足しています");
    });
  });
});
