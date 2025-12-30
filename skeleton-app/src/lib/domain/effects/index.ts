/**
 * Card Effect System - Entry Point
 *
 * Exports all card effect related classes and initializes the ChainableActionRegistry
 * and AdditionalRuleRegistry.
 *
 * Architecture:
 * - ChainableAction Pattern: ChainableAction interface + ChainableActionRegistry
 * - AdditionalRule Pattern: AdditionalRule interface + AdditionalRuleRegistry
 *
 * Usage:
 * ```typescript
 * import { ChainableActionRegistry } from "$lib/domain/effects";
 *
 * // In ActivateSpellCommand
 * const cardId = parseInt(cardInstance.cardId, 10);
 * const action = ChainableActionRegistry.get(cardId);
 * if (action && action.canActivate(state)) {
 *   const activationSteps = action.createActivationSteps(state);
 *   const resolutionSteps = action.createResolutionSteps(state, instanceId);
 * }
 * ```
 *
 * @module domain/effects
 */

// ===========================
// Imports
// ===========================

// ChainableAction imports
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
import { PotOfGreedAction } from "$lib/domain/effects/chainable/PotOfGreedAction";
import { GracefulCharityAction } from "$lib/domain/effects/chainable/GracefulCharityAction";
import { ChickenGameActivation } from "$lib/domain/effects/chainable/ChickenGameActivation";
// ChickenGameIgnitionEffect is not imported here because it requires dynamic instantiation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/chainable/ChickenGameIgnitionEffect";
import { UpstartGoblinAction } from "$lib/domain/effects/chainable/UpstartGoblinAction";
import { CeasefireVariantAction } from "$lib/domain/effects/chainable/CeasefireVariantAction";
import { ReloadAction } from "$lib/domain/effects/chainable/ReloadAction";
import { CardDestructionAction } from "$lib/domain/effects/chainable/CardDestructionAction";

// AdditionalRule imports
import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
import { ChickenGameContinuousRule } from "$lib/domain/effects/additional/ChickenGameContinuousRule";

// ===========================
// Exports
// ===========================

// ChainableAction exports (Domain Layer)
export type { ChainableAction } from "$lib/domain/models/ChainableAction";
export { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
export { PotOfGreedAction } from "$lib/domain/effects/chainable/PotOfGreedAction";
export { GracefulCharityAction } from "$lib/domain/effects/chainable/GracefulCharityAction";
export { ChickenGameActivation } from "$lib/domain/effects/chainable/ChickenGameActivation";
export { ChickenGameIgnitionEffect } from "$lib/domain/effects/chainable/ChickenGameIgnitionEffect";
export { UpstartGoblinAction } from "$lib/domain/effects/chainable/UpstartGoblinAction";
export { CeasefireVariantAction } from "$lib/domain/effects/chainable/CeasefireVariantAction";
export { ReloadAction } from "$lib/domain/effects/chainable/ReloadAction";
export { CardDestructionAction } from "$lib/domain/effects/chainable/CardDestructionAction";

// AdditionalRule exports (Domain Layer)
export type { AdditionalRule, RuleCategory } from "$lib/domain/models/AdditionalRule";
export type { RuleContext } from "$lib/domain/models/RuleContext";
export { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
export { ChickenGameContinuousRule } from "$lib/domain/effects/additional/ChickenGameContinuousRule";

// ===========================
// Registry Initialization
// ===========================

/**
 * Initialize ChainableActionRegistry with all implemented chainable actions
 *
 * This function is called automatically when this module is imported.
 * It registers all chainable actions in the ChainableActionRegistry.
 *
 * Registered Cards:
 * - 55144522: Pot of Greed (強欲な壺)
 * - 79571449: Graceful Charity (天使の施し)
 * - 67616300: Chicken Game (チキンレース) - Card Activation
 * - 70368879: Upstart Goblin (成金ゴブリン)
 * - 33782437: Ceasefire Variant (一時休戦)
 * - 85852291: Reload (打ち出の小槌)
 * - 74519184: Card Destruction (手札断札) - Quick-Play
 *
 * Future Expansion:
 * When adding new cards, import the action class above and register it here:
 * ```typescript
 * import { AnotherCardAction } from "./chainable/AnotherCardAction";
 * ChainableActionRegistry.register(12345678, new AnotherCardAction());
 * ```
 */
function initializeChainableActionRegistry(): void {
  // Register all chainable actions
  // Card ID 55144522: Pot of Greed (強欲な壺)
  ChainableActionRegistry.register(55144522, new PotOfGreedAction());

  // Card ID 79571449: Graceful Charity (天使の施し)
  ChainableActionRegistry.register(79571449, new GracefulCharityAction());

  // Card ID 67616300: Chicken Game (チキンレース) - Card Activation
  ChainableActionRegistry.register(67616300, new ChickenGameActivation());

  // Card ID 70368879: Upstart Goblin (成金ゴブリン)
  ChainableActionRegistry.register(70368879, new UpstartGoblinAction());

  // Card ID 33782437: Ceasefire Variant (一時休戦)
  ChainableActionRegistry.register(33782437, new CeasefireVariantAction());

  // Card ID 85852291: Reload (打ち出の小槌)
  ChainableActionRegistry.register(85852291, new ReloadAction());

  // Card ID 74519184: Card Destruction (手札断札)
  ChainableActionRegistry.register(74519184, new CardDestructionAction());

  // Note: ChickenGameIgnitionEffect is not registered here because it requires
  // a cardInstanceId parameter. It will be instantiated dynamically when needed.

  // Future cards:
  // ChainableActionRegistry.register(12345678, new AnotherCardAction());
}

/**
 * Initialize AdditionalRuleRegistry with all implemented additional rules
 *
 * This function is called automatically when this module is imported.
 * It registers all additional rules in the AdditionalRuleRegistry.
 *
 * Registered Cards:
 * - 67616300: Chicken Game (チキンレース) - Continuous Effect (Damage Prevention)
 *
 * Future Expansion:
 * When adding new rules, import the rule class above and register it here:
 * ```typescript
 * import { AnotherCardRule } from "./additional/AnotherCardRule";
 * AdditionalRuleRegistry.register(12345678, new AnotherCardRule());
 * ```
 */
function initializeAdditionalRuleRegistry(): void {
  // Register all additional rules
  // Card ID 67616300: Chicken Game (チキンレース) - Continuous Effect
  AdditionalRuleRegistry.register(67616300, new ChickenGameContinuousRule());

  // Future cards:
  // AdditionalRuleRegistry.register(12345678, new AnotherCardRule());
}

// Auto-initialize registries on module import
initializeChainableActionRegistry();
initializeAdditionalRuleRegistry();
