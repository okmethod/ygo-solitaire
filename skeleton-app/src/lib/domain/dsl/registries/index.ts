/**
 * DSL Registries - レジストリ関連のエクスポート
 *
 * NOTE: StepRegistry は effects/steps/AtomicStepRegistry に移動しました。
 * 直接 $lib/domain/effects/steps/AtomicStepRegistry からインポートしてください。
 */

export {
  checkCondition,
  getRegisteredConditionNames,
  isConditionRegistered,
  registerCondition,
  type ConditionChecker,
} from "./ConditionRegistry";
