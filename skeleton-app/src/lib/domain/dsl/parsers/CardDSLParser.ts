/**
 * CardDSLParser - YAMLからCardDSLDefinitionへの変換
 *
 * js-yamlでYAML文字列をパースし、Zodスキーマでバリデーションする。
 * エラー時はカードIDとフィールドパスを含むエラーメッセージを提供する。
 */

import yaml from "js-yaml";
import type { CardDSLDefinition } from "$lib/domain/dsl/types";
import { DSLParseError, DSLValidationError } from "$lib/domain/dsl/types";
import { CardDSLDefinitionSchema } from "./schemas/CardDSLSchema";

/**
 * YAML文字列をCardDSLDefinitionにパースする
 *
 * @param yamlContent - YAMLファイルの内容
 * @returns パース・バリデーション済みのCardDSLDefinition
 * @throws DSLParseError - YAML構文エラー時
 * @throws DSLValidationError - Zodバリデーションエラー時
 */
export function parseCardDSL(yamlContent: string): CardDSLDefinition {
  // Step 1: YAML → JavaScript object
  let rawData: unknown;
  try {
    rawData = yaml.load(yamlContent);
  } catch (error) {
    throw new DSLParseError(
      error instanceof Error ? error.message : "Unknown YAML parse error",
      undefined,
      undefined,
      error instanceof Error ? error : undefined,
    );
  }

  // Step 2: 基本的な構造チェック
  if (rawData === null || rawData === undefined) {
    throw new DSLParseError("YAML content is empty or null");
  }

  if (typeof rawData !== "object") {
    throw new DSLParseError(`Expected object at root, got ${typeof rawData}`);
  }

  // Step 3: idを取得（エラーメッセージ用）
  const rawObj = rawData as Record<string, unknown>;
  const cardId = typeof rawObj.id === "number" ? rawObj.id : undefined;

  // Step 4: Zodスキーマでバリデーション
  const result = CardDSLDefinitionSchema.safeParse(rawData);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return `${path}: ${issue.message}`;
    });

    const firstPath = result.error.issues[0]?.path.join(".") ?? "unknown";

    throw new DSLValidationError(
      `Validation failed with ${result.error.issues.length} issue(s)`,
      cardId ?? 0,
      firstPath,
      issues,
    );
  }

  // Step 5: バリデーション済みデータを返却
  return result.data;
}

/**
 * 複数のYAML文字列をパースする
 *
 * @param yamlContents - YAMLファイル内容の配列
 * @returns パース済みCardDSLDefinitionの配列
 * @throws 最初のパースエラーで停止
 */
export function parseMultipleCardDSL(yamlContents: readonly string[]): CardDSLDefinition[] {
  return yamlContents.map((content) => parseCardDSL(content));
}

/**
 * パースエラーかどうかを判定する型ガード
 */
export function isDSLParseError(error: unknown): error is DSLParseError {
  return error instanceof DSLParseError;
}

/**
 * バリデーションエラーかどうかを判定する型ガード
 */
export function isDSLValidationError(error: unknown): error is DSLValidationError {
  return error instanceof DSLValidationError;
}
