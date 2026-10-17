/**
 * DeckRecipeParser - YAMLからDeckRecipeDefinitionへの変換
 *
 * js-yamlでYAML文字列をパースし、Zodスキーマでバリデーションする。
 */

import { load } from "js-yaml";
import { z } from "zod";
import type { DeckRecipe } from "$lib/application/types/deck";

const RecipeCardEntrySchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(3),
});

const DeckRecipeDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  category: z.string().optional(),
  guide: z.string().min(1),
  mainDeck: z.array(RecipeCardEntrySchema),
  extraDeck: z.array(RecipeCardEntrySchema),
});

/** YAMLから読み込んだデッキレシピ定義（idフィールド付き） */
export type DeckRecipeDefinition = z.infer<typeof DeckRecipeDefinitionSchema>;

/**
 * YAML文字列をDeckRecipeDefinitionにパースする
 *
 * @param yamlContent - YAMLファイルの内容
 * @returns パース・バリデーション済みのDeckRecipeDefinition
 * @throws エラー - YAML構文エラーまたはZodバリデーションエラー時
 */
export function parseDeckRecipeYaml(yamlContent: string): DeckRecipeDefinition {
  let rawData: unknown;
  try {
    rawData = load(yamlContent);
  } catch (error) {
    throw new Error(`Deck recipe YAML parse error: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }

  const result = DeckRecipeDefinitionSchema.safeParse(rawData);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new Error(`Deck recipe validation failed: ${issues}`);
  }

  return result.data;
}

/**
 * DeckRecipeDefinitionからDeckRecipeへ変換する（idフィールドを除去）
 */
export function toDeckRecipe(definition: DeckRecipeDefinition): DeckRecipe {
  const { id: _id, ...recipe } = definition;
  return recipe;
}
