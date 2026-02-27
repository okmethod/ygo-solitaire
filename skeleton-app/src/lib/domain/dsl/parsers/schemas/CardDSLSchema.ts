/**
 * CardDSLSchema - YAML形式カード定義のZodスキーマ
 *
 * YAMLからパースされた生データをバリデーションし、型安全なオブジェクトに変換する。
 */

import { z } from "zod";

// =============================================================================
// 基本型のスキーマ
// =============================================================================

/** CardType スキーマ */
const CardTypeSchema = z.enum(["monster", "spell", "trap"]);

/** FrameSubType スキーマ */
const FrameSubTypeSchema = z.enum([
  // MainMonsterSubType
  "normal",
  "effect",
  "ritual",
  "pendulum",
  // ExtraMonsterSubType
  "fusion",
  "synchro",
  "xyz",
  "link",
  // Spell/Trap
  "spell",
  "trap",
]);

/** SpellSubType スキーマ */
const SpellSubTypeSchema = z.enum(["normal", "quick-play", "continuous", "field", "equip", "ritual"]);

/** TrapSubType スキーマ */
const TrapSubTypeSchema = z.enum(["normal", "continuous", "counter"]);

/** RuleCategory スキーマ */
const RuleCategorySchema = z.enum([
  "NameOverride",
  "StatusModifier",
  "SummonCondition",
  "SummonPermission",
  "ActionPermission",
  "VictoryCondition",
  "ActionReplacement",
  "SelfDestruction",
  "TriggerRule",
]);

/** EventType スキーマ */
const EventTypeSchema = z.enum(["spellActivated", "monsterSummoned", "cardDestroyed"]);

// =============================================================================
// DSL構造のスキーマ
// =============================================================================

/** StepDSL スキーマ */
const StepDSLSchema = z.object({
  step: z.string().min(1),
  args: z.record(z.string(), z.any()).optional(),
});

/** ChainableActionDSL スキーマ */
const ChainableActionDSLSchema = z.object({
  conditions: z.array(StepDSLSchema).optional(),
  activations: z.array(StepDSLSchema).optional(),
  resolutions: z.array(StepDSLSchema).optional(),
});

/** AdditionalRuleDSL スキーマ */
const AdditionalRuleDSLSchema = z.object({
  category: RuleCategorySchema,
  triggers: z.array(EventTypeSchema).optional(),
  triggerTiming: z.enum(["when", "if"]).optional(),
  isMandatory: z.boolean().optional(),
  resolutions: z.array(StepDSLSchema).optional(),
});

/** CardDataDSL スキーマ */
const CardDataDSLSchema = z.object({
  jaName: z.string().min(1),
  type: CardTypeSchema,
  frameType: FrameSubTypeSchema,
  edition: z.enum(["latest", "legacy"]).optional(),
  spellType: SpellSubTypeSchema.optional(),
  trapType: TrapSubTypeSchema.optional(),
  // モンスター用
  race: z.string().optional(),
  attribute: z.string().optional(),
  level: z.number().int().min(0).max(12).optional(),
});

// =============================================================================
// メインスキーマ
// =============================================================================

/**
 * CardDSLDefinition のZodスキーマ
 *
 * YAMLパース結果をバリデーションし、型安全なCardDSLDefinitionに変換する。
 */
export const CardDSLDefinitionSchema = z.object({
  id: z.number().int().positive(),
  data: CardDataDSLSchema,
  "effect-chainable-actions": z
    .object({
      activations: ChainableActionDSLSchema.optional(),
      ignitions: z.array(ChainableActionDSLSchema).optional(),
    })
    .optional(),
  "effect-additional-rules": z
    .object({
      continuous: z.array(AdditionalRuleDSLSchema).optional(),
    })
    .optional(),
});

/**
 * Zodスキーマから推論される型
 */
export type CardDSLDefinitionParsed = z.infer<typeof CardDSLDefinitionSchema>;

// =============================================================================
// エクスポート（サブスキーマも必要に応じて公開）
// =============================================================================

export {
  StepDSLSchema,
  ChainableActionDSLSchema,
  AdditionalRuleDSLSchema,
  CardDataDSLSchema,
  CardTypeSchema,
  FrameSubTypeSchema,
  SpellSubTypeSchema,
  TrapSubTypeSchema,
  RuleCategorySchema,
  EventTypeSchema,
};
