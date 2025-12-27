/**
 * EffectResolutionServiceImpl - Concrete implementation of IEffectResolutionService
 *
 * Application層の具象実装。effectResolutionStoreへのアダプター。
 *
 * @module application/services/EffectResolutionServiceImpl
 */

import type { IEffectResolutionService } from "$lib/domain/services/IEffectResolutionService";
import type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";
import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";

/**
 * Effect resolution service implementation
 *
 * Delegates to effectResolutionStore.
 */
export class EffectResolutionServiceImpl implements IEffectResolutionService {
  /**
   * Start effect resolution sequence
   *
   * @param steps - Array of effect resolution steps
   */
  startResolution(steps: EffectResolutionStep[]): void {
    effectResolutionStore.startResolution(steps);
  }
}
