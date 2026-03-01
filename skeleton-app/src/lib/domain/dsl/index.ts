/**
 * DSL Module - カード定義DSL関連のエクスポート
 *
 * DSL（Domain Specific Language）を使ってカードを宣言的に定義するための機能を提供する。
 *
 * @module domain/dsl
 */

// Types & Schemas
export type { StepDSL, ChainableActionDSL, AdditionalRuleDSL, CardDataDSL, CardDSLDefinition } from "./types";

export {
  CardDSLDefinitionSchema,
  DSLParseError,
  DSLValidationError,
  DSLStepResolutionError,
  DSLConditionResolutionError,
} from "./types";

// Parsers
export { parseCardDSL, parseMultipleCardDSL, isDSLParseError, isDSLValidationError } from "./parsers";

// Factories
export { GenericNormalSpellActivation, createGenericNormalSpellActivation } from "./factories";

// Loader
export {
  loadCardDataWithEffectsFromYaml,
  loadCardsFromYaml,
  loadCardFromDefinition,
  loadCardsFromDefinitions,
} from "./loader";
