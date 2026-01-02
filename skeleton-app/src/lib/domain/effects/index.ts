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
import { PotOfGreedActivation } from "$lib/domain/effects/actions/spell/PotOfGreedActivation";
import { GracefulCharityActivation } from "$lib/domain/effects/actions/spell/GracefulCharityActivation";
import { ChickenGameActivation } from "$lib/domain/effects/actions/spell/ChickenGameActivation";
// ChickenGameIgnitionEffect is not imported here because it requires dynamic instantiation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/spell/ChickenGameIgnitionEffect";
import { UpstartGoblinActivation } from "$lib/domain/effects/actions/spell/UpstartGoblinActivation";
import { OneDayOfPeaceActivation } from "$lib/domain/effects/actions/spell/OneDayOfPeaceActivation";
import { MagicalMalletActivation } from "$lib/domain/effects/actions/spell/MagicalMalletActivation";
import { CardDestructionActivation } from "$lib/domain/effects/actions/spell/CardDestructionActivation";
import { DarkFactoryActivation } from "$lib/domain/effects/actions/spell/DarkFactoryActivation";
import { TerraformingActivation } from "$lib/domain/effects/actions/spell/TerraformingActivation";

// AdditionalRule imports
import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
import { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/spell/ChickenGameContinuousEffect";

// ===========================
// Exports
// ===========================

// ChainableAction exports (Domain Layer)
export type { ChainableAction } from "$lib/domain/models/ChainableAction";
export { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
export { PotOfGreedActivation } from "$lib/domain/effects/actions/spell/PotOfGreedActivation";
export { GracefulCharityActivation } from "$lib/domain/effects/actions/spell/GracefulCharityActivation";
export { ChickenGameActivation } from "$lib/domain/effects/actions/spell/ChickenGameActivation";
export { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/spell/ChickenGameIgnitionEffect";
export { UpstartGoblinActivation } from "$lib/domain/effects/actions/spell/UpstartGoblinActivation";
export { OneDayOfPeaceActivation } from "$lib/domain/effects/actions/spell/OneDayOfPeaceActivation";
export { MagicalMalletActivation } from "$lib/domain/effects/actions/spell/MagicalMalletActivation";
export { CardDestructionActivation } from "$lib/domain/effects/actions/spell/CardDestructionActivation";
export { DarkFactoryActivation } from "$lib/domain/effects/actions/spell/DarkFactoryActivation";
export { TerraformingActivation } from "$lib/domain/effects/actions/spell/TerraformingActivation";

// AdditionalRule exports (Domain Layer)
export type { AdditionalRule, RuleCategory } from "$lib/domain/models/AdditionalRule";
export type { RuleContext } from "$lib/domain/models/RuleContext";
export { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
export { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/spell/ChickenGameContinuousEffect";

// Base Classes exports (Abstract classes for spell card implementations)
export { BaseSpellAction } from "$lib/domain/effects/base/spell/BaseSpellAction";
export { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
export { QuickPlaySpellAction } from "$lib/domain/effects/base/spell/QuickPlaySpellAction";
export { FieldSpellAction } from "$lib/domain/effects/base/spell/FieldSpellAction";

// Step Builders exports (Helper functions for creating EffectResolutionSteps)
export {
  createDrawStep,
  createSendToGraveyardStep,
  createCardSelectionStep,
  createGainLifeStep,
  createDamageStep,
  createShuffleStep,
  createReturnToDeckStep,
} from "$lib/domain/effects/builders";

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
 * - 33782437: One Day of Peace (一時休戦)
 * - 85852291: Magical Mallet (打ち出の小槌)
 * - 74519184: Card Destruction (手札断札) - Quick-Play
 * - 90928333: Dark Factory (闇の量産工場)
 * - 73628505: Terraforming (テラ・フォーミング)
 *
 * Future Expansion:
 * When adding new cards, import the action class above and register it here:
 * ```typescript
 * import { AnotherCardAction } from "./actions/spell/AnotherCardAction";
 * ChainableActionRegistry.register(12345678, new AnotherCardAction());
 * ```
 */
function initializeChainableActionRegistry(): void {
  // Register all chainable actions
  // Card ID 55144522: Pot of Greed (強欲な壺)
  ChainableActionRegistry.register(55144522, new PotOfGreedActivation());

  // Card ID 79571449: Graceful Charity (天使の施し)
  ChainableActionRegistry.register(79571449, new GracefulCharityActivation());

  // Card ID 67616300: Chicken Game (チキンレース) - Card Activation
  ChainableActionRegistry.register(67616300, new ChickenGameActivation());

  // Card ID 70368879: Upstart Goblin (成金ゴブリン)
  ChainableActionRegistry.register(70368879, new UpstartGoblinActivation());

  // Card ID 33782437: One Day of Peace (一時休戦)
  ChainableActionRegistry.register(33782437, new OneDayOfPeaceActivation());

  // Card ID 85852291: Magical Mallet (打ち出の小槌)
  ChainableActionRegistry.register(85852291, new MagicalMalletActivation());

  // Card ID 74519184: Card Destruction (手札断札)
  ChainableActionRegistry.register(74519184, new CardDestructionActivation());

  // Card ID 90928333: Dark Factory (闇の量産工場)
  ChainableActionRegistry.register(90928333, new DarkFactoryActivation());

  // Card ID 73628505: Terraforming (テラ・フォーミング)
  ChainableActionRegistry.register(73628505, new TerraformingActivation());

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
 * import { AnotherCardRule } from "./rules/spell/AnotherCardRule";
 * AdditionalRuleRegistry.register(12345678, new AnotherCardRule());
 * ```
 */
function initializeAdditionalRuleRegistry(): void {
  // Register all additional rules
  // Card ID 67616300: Chicken Game (チキンレース) - Continuous Effect
  AdditionalRuleRegistry.register(67616300, new ChickenGameContinuousEffect());

  // Future cards:
  // AdditionalRuleRegistry.register(12345678, new AnotherCardRule());
}

// Auto-initialize registries on module import
initializeChainableActionRegistry();
initializeAdditionalRuleRegistry();
