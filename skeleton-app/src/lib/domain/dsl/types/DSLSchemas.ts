/**
 * CardDSLSchema - YAML形式カード定義のZodスキーマと型定義
 *
 * YAMLからパースされた生データをバリデーションし、型安全なオブジェクトに変換する。
 */

import { z } from "zod";
import {
  CARD_TYPES,
  FRAME_SUB_TYPES,
  SPELL_SUB_TYPES,
  TRAP_SUB_TYPES,
  EDITIONS,
} from "$lib/domain/models/Card/CardData";
import { EVENT_TYPES } from "$lib/domain/models/GameProcessing/GameEvent";
import { RULE_CATEGORIES, TRIGGER_TIMINGS } from "$lib/domain/models/Effect/AdditionalRule";
import { CONDITION_NAMES, type ConditionName } from "$lib/domain/dsl/conditions/ConditionNames";
import { STEP_NAMES, type StepName } from "$lib/domain/dsl/steps/StepNames";

const conditionValues = Object.values(CONDITION_NAMES) as [ConditionName, ...ConditionName[]];
const stepValues = Object.values(STEP_NAMES) as [StepName, ...StepName[]];

// =============================================================================
// CardData スキーマ
// =============================================================================

/** CardType スキーマ */
const CardTypeSchema = z.enum(CARD_TYPES);

/** FrameSubType スキーマ */
const FrameSubTypeSchema = z.enum(FRAME_SUB_TYPES);

/** SpellSubType スキーマ */
const SpellSubTypeSchema = z.enum(SPELL_SUB_TYPES);

/** TrapSubType スキーマ */
const TrapSubTypeSchema = z.enum(TRAP_SUB_TYPES);

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
  /** エディション */
  edition: z.enum(EDITIONS).optional(),
  /** 魔法カードサブタイプ */
  spellType: SpellSubTypeSchema.optional(),
  /** 罠カードサブタイプ */
  trapType: TrapSubTypeSchema.optional(),
  // モンスター用
  /** モンスター種族 */
  race: z.string().optional(),
  /** モンスター属性 */
  attribute: z.string().optional(),
  /** モンスターレベル */
  level: z.number().int().min(0).max(12).optional(),
  /** モンスター攻撃力 */
  attack: z.number().int().min(0).optional(),
  /** モンスター守備力 */
  defense: z.number().int().min(0).optional(),
});

/** カードデータのDSL表現 */
export type CardDataDSL = z.infer<typeof CardDataDSLSchema>;

// =============================================================================
// ChainableAction + AdditionalRule 共通スキーマ
// =============================================================================

/** EventType スキーマ */
const EventTypeSchema = z.enum(EVENT_TYPES);

/**
 * トリガー情報のスキーマ（PSCT「:」の前のトリガー部分）
 *
 * イベント駆動の発火点を定義する。
 */
const TriggerDSLSchema = z.object({
  /** トリガーイベント */
  events: z.array(EventTypeSchema),
  /** トリガータイミング種別 */
  timing: z.enum(TRIGGER_TIMINGS).optional(),
  /** 強制効果かどうか（デフォルト: true） */
  isMandatory: z.boolean().optional(),
  /**
   * 自身が発生源のイベントのみに反応するか
   * - true: イベントの sourceInstanceId がこのカード自身の場合のみ反応
   * - false: すべての該当イベントに反応（デフォルト）
   */
  selfOnly: z.boolean().optional(),
});

/** トリガー情報のDSL表現 */
export type TriggerDSL = z.infer<typeof TriggerDSLSchema>;

/**
 * 発動要件のDSL表現スキーマ
 *
 * ConditionRegistryのキーと引数をマッピングする。
 * 状態ベースの条件チェック（手札枚数、LP残量、ターン1制限、等）を定義する。
 *
 * 例: { step: "CAN_DRAW", args: { count: 3 } }
 */
const RequirementDSLSchema = z.object({
  /** ConditionRegistryのキー */
  step: z.enum(conditionValues),
  /** ステップに渡す引数（オプション） */
  args: z.record(z.string(), z.any()).optional(),
});

/** 発動要件のDSL表現 */
export type RequirementDSL = z.infer<typeof RequirementDSLSchema>;

/**
 * 発動条件のスキーマ（PSCT「:」の前の全要素）
 *
 * トリガー、要件、使用制限を統合した発動条件全体を定義する。
 */
const ConditionsDSLSchema = z.object({
  /** トリガー情報（いつ発動するか）- 誘発効果・誘発即時効果のみ */
  trigger: TriggerDSLSchema.optional(),
  /** 発動要件（状態ベースの条件チェック） */
  requirements: z.array(RequirementDSLSchema).optional(),
});

/** 発動条件のDSL表現 */
export type ConditionsDSL = z.infer<typeof ConditionsDSLSchema>;

/**
 * Step のDSL表現スキーマ
 *
 * StepRegistryのキーと引数をマッピングする。
 * 例: { step: "DRAW", args: { count: 3 } }
 */
const StepDSLSchema = z.object({
  /** StepRegistryのキー */
  step: z.enum(stepValues),
  /** ステップに渡す引数（オプション） */
  args: z.record(z.string(), z.any()).optional(),
});

/** ステップのDSL表現 */
export type StepDSL = z.infer<typeof StepDSLSchema>;

// =============================================================================
// ChainableAction スキーマ
// =============================================================================

/**
 * チェーンブロックを作る処理のDSL表現スキーマ
 *
 * PSCT構造に準拠した誘発効果の定義:
 * - conditions: 「:」の前（トリガー + 要件 + 使用制限）
 * - activations: 「;」の前（コスト・対象選択）
 * - resolutions: 「.」で終わる効果処理
 */
const ChainableActionDSLSchema = z.object({
  /** 発動条件（PSCT「:」の前の全要素） */
  conditions: ConditionsDSLSchema.optional(),
  /** スペルスピード（通常1、一部のカードで2） */
  spellSpeed: z.literal(1).or(z.literal(2)).optional(),
  /** 発動時処理（コスト支払い等）のステップリスト */
  activations: z.array(StepDSLSchema).optional(),
  /** 効果処理のステップリスト */
  resolutions: z.array(StepDSLSchema).optional(),
});

/** チェーンブロックを作る処理のDSL表現 */
export type ChainableActionDSL = z.infer<typeof ChainableActionDSLSchema>;

// =============================================================================
// AdditionalRule スキーマ
// =============================================================================

/** RuleCategory スキーマ */
const RuleCategorySchema = z.enum(RULE_CATEGORIES);

/**
 * 追加適用するルールのDSL表現スキーマ（PSCT準拠）
 */
const AdditionalRuleDSLSchema = z.object({
  /** ルールのカテゴリ */
  category: RuleCategorySchema,
  /** 発動条件 */
  conditions: ConditionsDSLSchema.optional(),
  /** 効果処理のステップリスト */
  resolutions: z.array(StepDSLSchema).optional(),
});

/** 追加適用するルールのDSL表現 */
export type AdditionalRuleDSL = z.infer<typeof AdditionalRuleDSLSchema>;

// =============================================================================
// メインスキーマ
// =============================================================================

/**
 * YAMLカード定義のZodスキーマ
 *
 * 1枚のカードのカードデータと効果定義を一元管理する。
 */
export const CardDSLDefinitionSchema = z.object({
  /** カードID */
  id: z.number().int().positive(),
  /** カードデータ */
  data: CardDataDSLSchema,
  /**
   * チェーンブロックを作る処理
   * - activations: カードの発動（魔法・罠）
   * - ignitions: 起動効果（モンスター・魔法）
   * - triggers: 誘発効果（モンスター）
   */
  effectChainableActions: z
    .object({
      activations: ChainableActionDSLSchema.optional(),
      ignitions: z.array(ChainableActionDSLSchema).optional(),
      triggers: z.array(ChainableActionDSLSchema).optional(),
    })
    .optional(),
  /**
   * 追加適用するルール
   * - continuous: 永続効果（モンスター・魔法・罠）
   */
  effectAdditionalRules: z
    .object({
      continuous: z.array(AdditionalRuleDSLSchema).optional(),
    })
    .optional(),
});

/** YAMLカード定義のDSL表現 */
export type CardDSLDefinition = z.infer<typeof CardDSLDefinitionSchema>;
