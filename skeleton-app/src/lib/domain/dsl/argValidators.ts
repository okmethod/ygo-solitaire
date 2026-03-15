/**
 * argValidators - ステップビルダー/条件チェッカー用の引数バリデーションユーティリティ
 *
 * 共通のバリデーションパターンを抽象化し、ボイラープレートを削減する。
 *
 * @module domain/dsl/argValidators
 */

import type { CardType, SpellSubType } from "$lib/domain/models/Card";
import type { Player } from "$lib/domain/models/GameState";

type Args = Readonly<Record<string, unknown>>;

/**
 * 引数バリデーションエラー
 */
export class ArgValidationError extends Error {
  constructor(
    public readonly argName: string,
    public readonly expected: string,
    public readonly actual: unknown,
  ) {
    super(`Argument '${argName}' must be ${expected}, got ${typeof actual}`);
    this.name = "ArgValidationError";
  }
}

/**
 * 引数バリデーションユーティリティ
 *
 * ステップビルダーや条件チェッカーで共通するバリデーションロジックを提供する。
 */
export const ArgValidators = {
  // ===========================
  // 数値バリデーション
  // ===========================

  /**
   * 正の整数を取得（必須）
   * @throws ArgValidationError - 正の整数でない場合
   */
  positiveInt(args: Args, key: string): number {
    const value = args[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
      throw new ArgValidationError(key, "a positive integer", value);
    }
    return value;
  },

  /**
   * 非負の整数を取得（必須）
   * @throws ArgValidationError - 非負の整数でない場合
   */
  nonNegativeInt(args: Args, key: string): number {
    const value = args[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      throw new ArgValidationError(key, "a non-negative integer", value);
    }
    return value;
  },

  /**
   * 正の整数を取得（オプション）
   */
  optionalPositiveInt(args: Args, key: string): number | undefined {
    const value = args[key];
    if (value === undefined) return undefined;
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
      throw new ArgValidationError(key, "a positive integer or undefined", value);
    }
    return value;
  },

  // ===========================
  // 文字列バリデーション
  // ===========================

  /**
   * 文字列を取得（必須）
   * @throws ArgValidationError - 文字列でない場合
   */
  string(args: Args, key: string): string {
    const value = args[key];
    if (typeof value !== "string") {
      throw new ArgValidationError(key, "a string", value);
    }
    return value;
  },

  /**
   * 文字列を取得（オプション）
   */
  optionalString(args: Args, key: string): string | undefined {
    const value = args[key];
    if (value === undefined) return undefined;
    if (typeof value !== "string") {
      throw new ArgValidationError(key, "a string or undefined", value);
    }
    return value;
  },

  /**
   * 非空文字列を取得（必須）
   * @throws ArgValidationError - 空文字列または文字列でない場合
   */
  nonEmptyString(args: Args, key: string): string {
    const value = args[key];
    if (typeof value !== "string" || value.length === 0) {
      throw new ArgValidationError(key, "a non-empty string", value);
    }
    return value;
  },

  // ===========================
  // ブールバリデーション
  // ===========================

  /**
   * ブール値を取得（必須）
   * @throws ArgValidationError - ブール値でない場合
   */
  boolean(args: Args, key: string): boolean {
    const value = args[key];
    if (typeof value !== "boolean") {
      throw new ArgValidationError(key, "a boolean", value);
    }
    return value;
  },

  /**
   * ブール値を取得（オプション、デフォルト値付き）
   */
  optionalBoolean(args: Args, key: string, defaultValue: boolean): boolean {
    const value = args[key];
    if (value === undefined) return defaultValue;
    if (typeof value !== "boolean") {
      throw new ArgValidationError(key, "a boolean or undefined", value);
    }
    return value;
  },

  // ===========================
  // 列挙型バリデーション
  // ===========================

  /**
   * 指定した値のいずれかを取得（必須）
   * @example
   * const filterType = ArgValidators.oneOf(args, "filterType", ["monster", "normal_monster"] as const);
   * @throws ArgValidationError - 指定した値のいずれでもない場合
   */
  oneOf<T extends readonly string[]>(args: Args, key: string, validValues: T): T[number] {
    const value = args[key];
    if (typeof value !== "string" || !validValues.includes(value)) {
      const expected = validValues.map((v) => `"${v}"`).join(" or ");
      throw new ArgValidationError(key, expected, value);
    }
    return value as T[number];
  },

  /**
   * 指定した値のいずれかを取得（オプション、デフォルト値付き）
   * @example
   * const position = ArgValidators.optionalOneOf(args, "position", ["attack", "defense"] as const, "attack");
   */
  optionalOneOf<T extends readonly string[]>(
    args: Args,
    key: string,
    validValues: T,
    defaultValue: T[number],
  ): T[number] {
    const value = args[key];
    if (value === undefined) return defaultValue;
    if (typeof value !== "string" || !validValues.includes(value)) {
      const expected = validValues.map((v) => `"${v}"`).join(" or ") + " or undefined";
      throw new ArgValidationError(key, expected, value);
    }
    return value as T[number];
  },

  /**
   * プレイヤー識別子を取得（必須）
   * @throws ArgValidationError - "player" または "opponent" でない場合
   */
  player(args: Args, key: string): Player {
    const value = args[key];
    if (value !== "player" && value !== "opponent") {
      throw new ArgValidationError(key, '"player" or "opponent"', value);
    }
    return value;
  },

  /**
   * プレイヤー識別子を取得（オプション、デフォルト値付き）
   */
  optionalPlayer(args: Args, key: string, defaultValue: Player): Player {
    const value = args[key];
    if (value === undefined) return defaultValue;
    if (value !== "player" && value !== "opponent") {
      throw new ArgValidationError(key, '"player" or "opponent" or undefined', value);
    }
    return value;
  },

  /**
   * カードタイプを取得（オプション）
   */
  optionalCardType(args: Args, key: string): CardType | undefined {
    const value = args[key];
    if (value === undefined) return undefined;
    const validTypes: CardType[] = ["monster", "spell", "trap"];
    if (typeof value !== "string" || !validTypes.includes(value as CardType)) {
      throw new ArgValidationError(key, '"monster", "spell", "trap", or undefined', value);
    }
    return value as CardType;
  },

  /**
   * 魔法カードサブタイプを取得（オプション）
   */
  optionalSpellSubType(args: Args, key: string): SpellSubType | undefined {
    const value = args[key];
    if (value === undefined) return undefined;
    const validTypes: SpellSubType[] = ["normal", "quick-play", "continuous", "field", "equip", "ritual"];
    if (typeof value !== "string" || !validTypes.includes(value as SpellSubType)) {
      throw new ArgValidationError(key, "a valid spell sub type or undefined", value);
    }
    return value as SpellSubType;
  },

  // ===========================
  // 配列バリデーション
  // ===========================

  /**
   * 文字列配列を取得（オプション）
   */
  optionalStringArray(args: Args, key: string): string[] | undefined {
    const value = args[key];
    if (value === undefined) return undefined;
    if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
      throw new ArgValidationError(key, "an array of strings or undefined", value);
    }
    return value;
  },

  /**
   * 数値配列を取得（オプション）
   */
  optionalNumberArray(args: Args, key: string): number[] | undefined {
    const value = args[key];
    if (value === undefined) return undefined;
    if (!Array.isArray(value) || !value.every((v) => typeof v === "number")) {
      throw new ArgValidationError(key, "an array of numbers or undefined", value);
    }
    return value;
  },
} as const;
