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
 * ARCH: Domain Layer - レイヤー依存ルール
 * - このモジュールは Domain Layer の一部であり、他の層に依存してはいけない
 * - Application Layer（GameFacade等）と Infrastructure Layer のみが Domain Layer を import できる
 * - Presentation Layer は Domain Layer に直接依存してはいけない（GameFacade 経由）
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
import { UpstartGoblinActivation } from "$lib/domain/effects/actions/spell/UpstartGoblinActivation";
import { OneDayOfPeaceActivation } from "$lib/domain/effects/actions/spell/OneDayOfPeaceActivation";
import { MagicalMalletActivation } from "$lib/domain/effects/actions/spell/MagicalMalletActivation";
import { CardDestructionActivation } from "$lib/domain/effects/actions/spell/CardDestructionActivation";
import { DarkFactoryActivation } from "$lib/domain/effects/actions/spell/DarkFactoryActivation";
import { TerraformingActivation } from "$lib/domain/effects/actions/spell/TerraformingActivation";
import { MagicalStoneExcavationActivation } from "$lib/domain/effects/actions/spell/MagicalStoneExcavationActivation";
import { IntoTheVoidActivation } from "$lib/domain/effects/actions/spell/IntoTheVoidActivation";
import { PotOfDualityActivation } from "$lib/domain/effects/actions/spell/PotOfDualityActivation";
import { CardOfDemiseActivation } from "$lib/domain/effects/actions/spell/CardOfDemiseActivation";
import { ToonTableOfContentsActivation } from "$lib/domain/effects/actions/spell/ToonTableOfContentsActivation";
import { ToonWorldActivation } from "$lib/domain/effects/actions/spell/ToonWorldActivation";

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
export { MagicalStoneExcavationActivation } from "$lib/domain/effects/actions/spell/MagicalStoneExcavationActivation";
export { IntoTheVoidActivation } from "$lib/domain/effects/actions/spell/IntoTheVoidActivation";
export { PotOfDualityActivation } from "$lib/domain/effects/actions/spell/PotOfDualityActivation";
export { CardOfDemiseActivation } from "$lib/domain/effects/actions/spell/CardOfDemiseActivation";
export { ToonTableOfContentsActivation } from "$lib/domain/effects/actions/spell/ToonTableOfContentsActivation";
export { ToonWorldActivation } from "$lib/domain/effects/actions/spell/ToonWorldActivation";

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
export { ContinuousSpellAction } from "$lib/domain/effects/base/spell/ContinuousSpellAction";

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
 * - 98494543: Magical Stone Excavation (魔法石の採掘)
 * - 93946239: Into the Void (無の煉獄)
 * - 98645731: Pot of Duality (強欲で謙虚な壺)
 * - 59750328: Card of Demise (命削りの宝札)
 * - 89997728: Toon Table of Contents (トゥーンのもくじ)
 * - 15259703: Toon World (トゥーン・ワールド)
 *
 * Future Expansion:
 * When adding new cards, import the action class above and register it here:
 * ```typescript
 * import { AnotherCardAction } from "./actions/spell/AnotherCardAction";
 * ChainableActionRegistry.register(12345678, new AnotherCardAction());
 * ```
 */
function initializeChainableActionRegistry(): void {
  ChainableActionRegistry.register(55144522, new PotOfGreedActivation());
  ChainableActionRegistry.register(79571449, new GracefulCharityActivation());
  ChainableActionRegistry.register(67616300, new ChickenGameActivation());
  ChainableActionRegistry.register(70368879, new UpstartGoblinActivation());
  ChainableActionRegistry.register(33782437, new OneDayOfPeaceActivation());
  ChainableActionRegistry.register(85852291, new MagicalMalletActivation());
  ChainableActionRegistry.register(74519184, new CardDestructionActivation());
  ChainableActionRegistry.register(90928333, new DarkFactoryActivation());
  ChainableActionRegistry.register(73628505, new TerraformingActivation());
  ChainableActionRegistry.register(98494543, new MagicalStoneExcavationActivation());
  ChainableActionRegistry.register(93946239, new IntoTheVoidActivation());
  ChainableActionRegistry.register(98645731, new PotOfDualityActivation());
  ChainableActionRegistry.register(59750328, new CardOfDemiseActivation());
  ChainableActionRegistry.register(89997728, new ToonTableOfContentsActivation());
  ChainableActionRegistry.register(15259703, new ToonWorldActivation());

  // Note: IgnitionEffect is not registered here because it requires
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
  AdditionalRuleRegistry.register(67616300, new ChickenGameContinuousEffect());

  // Future cards:
  // AdditionalRuleRegistry.register(12345678, new AnotherCardRule());
}

// Auto-initialize registries on module import
initializeChainableActionRegistry();
initializeAdditionalRuleRegistry();
