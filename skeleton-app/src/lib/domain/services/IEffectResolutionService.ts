/**
 * IEffectResolutionService - Interface for effect resolution coordination
 *
 * Domain層がApplication層のeffectResolutionStoreに依存しないようにするための抽象化インターフェース。
 * Dependency Injectionパターンにより、Domain層の独立性を保つ。
 *
 * @module domain/services/IEffectResolutionService
 */

import type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";

/**
 * Effect resolution service interface
 *
 * Application層の具象実装がこのインターフェースを実装する。
 */
export interface IEffectResolutionService {
  /**
   * Start effect resolution sequence
   *
   * @param steps - Array of effect resolution steps
   */
  startResolution(steps: EffectResolutionStep[]): void;
}
