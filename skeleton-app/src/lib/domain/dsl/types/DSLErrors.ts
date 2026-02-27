/**
 * DSLErrors - DSLパース・バリデーション時のエラー型
 *
 * エラーメッセージにカードIDとフィールドパスを含め、デバッグを容易にする。
 */

/**
 * DSLパースエラー
 *
 * YAML構文エラーやパース失敗時に投げる。
 */
export class DSLParseError extends Error {
  constructor(
    message: string,
    public readonly cardId?: number,
    public readonly field?: string,
    public readonly cause?: Error,
  ) {
    const prefix = cardId ? ` (Card ID: ${cardId})` : "";
    const fieldInfo = field ? ` [Field: ${field}]` : "";
    super(`DSL Parse Error${prefix}${fieldInfo}: ${message}`);
    this.name = "DSLParseError";
  }
}

/**
 * DSLバリデーションエラー
 *
 * Zodスキーマバリデーション失敗時に投げる。
 * 複数のバリデーション問題をissues配列で保持。
 */
export class DSLValidationError extends Error {
  constructor(
    message: string,
    public readonly cardId: number,
    public readonly field: string,
    public readonly issues: readonly string[],
  ) {
    super(`DSL Validation Error (Card ID: ${cardId}, Field: ${field}): ${message}`);
    this.name = "DSLValidationError";
  }
}

/**
 * DSLステップ解決エラー
 *
 * StepRegistryに存在しないステップ名が指定された場合に投げる。
 */
export class DSLStepResolutionError extends Error {
  constructor(
    public readonly stepName: string,
    public readonly cardId: number,
  ) {
    super(`DSL Step Resolution Error (Card ID: ${cardId}): Unknown step "${stepName}"`);
    this.name = "DSLStepResolutionError";
  }
}

/**
 * DSL条件解決エラー
 *
 * ConditionRegistryに存在しない条件名が指定された場合に投げる。
 */
export class DSLConditionResolutionError extends Error {
  constructor(
    public readonly conditionName: string,
    public readonly cardId: number,
  ) {
    super(`DSL Condition Resolution Error (Card ID: ${cardId}): Unknown condition "${conditionName}"`);
    this.name = "DSLConditionResolutionError";
  }
}
