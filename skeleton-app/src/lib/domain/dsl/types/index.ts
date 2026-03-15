/**
 * DSL Types - DSL関連の型定義とスキーマをエクスポート
 *
 * 型はZodスキーマから導出される（Single Source of Truth）。
 */

// 型定義
export type {
  StepDSL,
  RequirementDSL,
  ChainableActionDSL,
  AdditionalRuleDSL,
  CardDataDSL,
  CardDSLDefinition,
} from "./CardDSLSchema";

// Zodスキーマ
export { CardDSLDefinitionSchema } from "./CardDSLSchema";

// エラークラス
export {
  DSLParseError,
  DSLConditionResolutionError,
  DSLValidationError,
  DSLStepResolutionError,
  ArgValidationError,
} from "./DSLErrors";
