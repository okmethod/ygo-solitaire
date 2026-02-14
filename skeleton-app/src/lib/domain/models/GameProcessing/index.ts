/**
 * GameProcessing モデル
 *
 * ゲーム状態更新処理の共通基盤。
 * Effect も Command も、この仕組みを通してゲーム状態を更新する。
 *
 * @module domain/models/GameProcessing
 * @see {@link docs/domain/overview.md}
 */

export type { EventType, EventContext, GameEvent, TriggerEvent } from "./GameEvent";
export type { TimeSnapshot, EventTimeline } from "./EventTimeline";
export type { ValidationErrorCode, ValidationResult } from "./UpdateValidation";
export type { GameStateUpdateResult } from "./GameStateUpdate";
export type { NotificationLevel, InteractionConfig, CardSelectionConfig, AtomicStep } from "./AtomicStep";

export {
  createEmptyTimeline,
  createEmptySnapshot,
  recordEvent,
  advanceTime,
  hasCurrentEvents,
  getCurrentEvents,
  hasEventOfType,
  clearHistory,
} from "./EventTimeline";

import * as ValidationResultFuncs from "./UpdateValidation";
import * as GameStateUpdateFuncs from "./GameStateUpdate";

export const GameProcessing = {
  Validation: {
    ERROR_CODES: ValidationResultFuncs.ERROR_CODES,
    success: ValidationResultFuncs.successValidationResult,
    failure: ValidationResultFuncs.failureValidationResult,
    errorMessage: ValidationResultFuncs.validationErrorMessage,
  },

  Result: {
    success: GameStateUpdateFuncs.successUpdateResult,
    failure: GameStateUpdateFuncs.failureUpdateResult,
  },
};
