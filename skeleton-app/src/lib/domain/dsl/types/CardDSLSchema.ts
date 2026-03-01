/**
 * CardDSLSchema - YAML形式カード定義のZodスキーマと型定義
 *
 * YAMLからパースされた生データをバリデーションし、型安全なオブジェクトに変換する。
 * 型はZodスキーマから導出される（Single Source of Truth）。
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

/**
 * ステップのDSL表現スキーマ
 *
 * StepRegistryのキーと引数をマッピングする。
 * 例: { step: "DRAW", args: { count: 3 } }
 */
const StepDSLSchema = z.object({
  /** StepRegistryのキー */
  step: z.string().min(1),
  /** ステップに渡す引数（オプション） */
  args: z.record(z.string(), z.any()).optional(),
});

/** ステップのDSL表現 */
export type StepDSL = z.infer<typeof StepDSLSchema>;

/**
 * チェーンブロックを作る処理のDSL表現スキーマ
 *
 * 発動条件、発動時処理（コスト）、効果処理を定義する。
 */
const ChainableActionDSLSchema = z.object({
  /** 発動条件のステップリスト */
  conditions: z.array(StepDSLSchema).optional(),
  /** 発動時処理（コスト支払い等）のステップリスト */
  activations: z.array(StepDSLSchema).optional(),
  /** 効果処理のステップリスト */
  resolutions: z.array(StepDSLSchema).optional(),
});

/** チェーンブロックを作る処理のDSL表現 */
export type ChainableActionDSL = z.infer<typeof ChainableActionDSLSchema>;

/**
 * 追加適用するルールのDSL表現スキーマ
 *
 * 永続効果などのAdditionalRuleをDSLで定義する。
 */
const AdditionalRuleDSLSchema = z.object({
  /** ルールのカテゴリ */
  category: RuleCategorySchema,
  /** トリガーイベント（TriggerRuleの場合） */
  triggers: z.array(EventTypeSchema).optional(),
  /**
   * トリガータイミング種別
   * - "when": タイミングを逃す可能性あり
   * - "if": タイミングを逃さない（デフォルト）
   */
  triggerTiming: z.enum(["when", "if"]).optional(),
  /** 強制効果かどうか（デフォルト: true） */
  isMandatory: z.boolean().optional(),
  /** 効果処理のステップリスト */
  resolutions: z.array(StepDSLSchema).optional(),
});

/** 追加適用するルールのDSL表現 */
export type AdditionalRuleDSL = z.infer<typeof AdditionalRuleDSLSchema>;

/**
 * カードデータのDSL表現スキーマ
 */
const CardDataDSLSchema = z.object({
  /** 日本語カード名 */
  jaName: z.string().min(1),
  /** カードタイプ */
  type: CardTypeSchema,
  /** カードフレームタイプ */
  frameType: FrameSubTypeSchema,
  /** エディション（latest: 最新, legacy: エラッタ前） */
  edition: z.enum(["latest", "legacy"]).optional(),
  /** 魔法カードサブタイプ */
  spellType: SpellSubTypeSchema.optional(),
  /** 罠カードサブタイプ */
  trapType: TrapSubTypeSchema.optional(),
  // モンスター用（将来拡張）
  /** モンスター種族 */
  race: z.string().optional(),
  /** モンスター属性 */
  attribute: z.string().optional(),
  /** モンスターレベル */
  level: z.number().int().min(0).max(12).optional(),
});

/** カードデータのDSL表現 */
export type CardDataDSL = z.infer<typeof CardDataDSLSchema>;

// =============================================================================
// メインスキーマ
// =============================================================================

/**
 * YAMLカード定義のZodスキーマ
 *
 * カードデータと効果定義を一元管理する。
 * 1枚のカードの全情報を1箇所で管理（SSOT原則）。
 */
export const CardDSLDefinitionSchema = z.object({
  /** カードID（YGOProDeck APIと同じ値） */
  id: z.number().int().positive(),
  /** カードデータ */
  data: CardDataDSLSchema,
  /**
   * チェーンブロックを作る処理
   * - activations: カードの発動（魔法・罠）
   * - ignitions: 起動効果（モンスター）
   */
  "effect-chainable-actions": z
    .object({
      activations: ChainableActionDSLSchema.optional(),
      ignitions: z.array(ChainableActionDSLSchema).optional(),
    })
    .optional(),
  /**
   * 追加適用するルール
   * - continuous: 永続効果
   */
  "effect-additional-rules": z
    .object({
      continuous: z.array(AdditionalRuleDSLSchema).optional(),
    })
    .optional(),
});

/**
 * YAMLカード定義の型
 *
 * カードデータと効果定義を一元管理する。
 * 1枚のカードの全情報を1箇所で管理（SSOT原則）。
 */
export type CardDSLDefinition = z.infer<typeof CardDSLDefinitionSchema>;

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
