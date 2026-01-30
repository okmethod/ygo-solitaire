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
 * // In ActivateSpellCommand (for card activation effects)
 * const activation = ChainableActionRegistry.getActivation(cardInstance.id);
 * if (activation && activation.canActivate(state, cardInstance).isValid) {
 *   const activationSteps = activation.createActivationSteps(state, cardInstance);
 *   const resolutionSteps = activation.createResolutionSteps(state, cardInstance);
 * }
 *
 * // In ActivateIgnitionEffectCommand (for ignition effects)
 * const ignitionEffects = ChainableActionRegistry.getIgnitionEffects(cardInstance.id);
 * const activatableEffect = ignitionEffects.find(e => e.canActivate(state, cardInstance).isValid);
 * ```
 *
 * @module domain/effects
 */

// ===========================
// Imports
// ===========================

// ChainableAction imports
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
import { PotOfGreedActivation } from "$lib/domain/effects/actions/spells/individuals/PotOfGreedActivation";
import { GracefulCharityActivation } from "$lib/domain/effects/actions/spells/individuals/GracefulCharityActivation";
import { ChickenGameActivation } from "$lib/domain/effects/actions/spells/individuals/ChickenGameActivation";
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/spells/individuals/ChickenGameIgnitionEffect";
import { UpstartGoblinActivation } from "$lib/domain/effects/actions/spells/individuals/UpstartGoblinActivation";
import { OneDayOfPeaceActivation } from "$lib/domain/effects/actions/spells/individuals/OneDayOfPeaceActivation";
import { MagicalMalletActivation } from "$lib/domain/effects/actions/spells/individuals/MagicalMalletActivation";
import { CardDestructionActivation } from "$lib/domain/effects/actions/spells/individuals/CardDestructionActivation";
import { DarkFactoryActivation } from "$lib/domain/effects/actions/spells/individuals/DarkFactoryActivation";
import { TerraformingActivation } from "$lib/domain/effects/actions/spells/individuals/TerraformingActivation";
import { MagicalStoneExcavationActivation } from "$lib/domain/effects/actions/spells/individuals/MagicalStoneExcavationActivation";
import { IntoTheVoidActivation } from "$lib/domain/effects/actions/spells/individuals/IntoTheVoidActivation";
import { PotOfDualityActivation } from "$lib/domain/effects/actions/spells/individuals/PotOfDualityActivation";
import { CardOfDemiseActivation } from "$lib/domain/effects/actions/spells/individuals/CardOfDemiseActivation";
import { ToonTableOfContentsActivation } from "$lib/domain/effects/actions/spells/individuals/ToonTableOfContentsActivation";
import { ToonWorldActivation } from "$lib/domain/effects/actions/spells/individuals/ToonWorldActivation";

// Monster ChainableAction imports
import { RoyalMagicalLibraryIgnitionEffect } from "$lib/domain/effects/actions/monsters/individuals/RoyalMagicalLibraryIgnitionEffect";

// AdditionalRule imports
import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
import { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/spells/ChickenGameContinuousEffect";

// ===========================
// Exports
// ===========================

// ChainableAction exports (Domain Layer)
export type { ChainableAction } from "$lib/domain/models/ChainableAction";
export { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
export { PotOfGreedActivation } from "$lib/domain/effects/actions/spells/individuals/PotOfGreedActivation";
export { GracefulCharityActivation } from "$lib/domain/effects/actions/spells/individuals/GracefulCharityActivation";
export { ChickenGameActivation } from "$lib/domain/effects/actions/spells/individuals/ChickenGameActivation";
export { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/spells/individuals/ChickenGameIgnitionEffect";
export { UpstartGoblinActivation } from "$lib/domain/effects/actions/spells/individuals/UpstartGoblinActivation";
export { OneDayOfPeaceActivation } from "$lib/domain/effects/actions/spells/individuals/OneDayOfPeaceActivation";
export { MagicalMalletActivation } from "$lib/domain/effects/actions/spells/individuals/MagicalMalletActivation";
export { CardDestructionActivation } from "$lib/domain/effects/actions/spells/individuals/CardDestructionActivation";
export { DarkFactoryActivation } from "$lib/domain/effects/actions/spells/individuals/DarkFactoryActivation";
export { TerraformingActivation } from "$lib/domain/effects/actions/spells/individuals/TerraformingActivation";
export { MagicalStoneExcavationActivation } from "$lib/domain/effects/actions/spells/individuals/MagicalStoneExcavationActivation";
export { IntoTheVoidActivation } from "$lib/domain/effects/actions/spells/individuals/IntoTheVoidActivation";
export { PotOfDualityActivation } from "$lib/domain/effects/actions/spells/individuals/PotOfDualityActivation";
export { CardOfDemiseActivation } from "$lib/domain/effects/actions/spells/individuals/CardOfDemiseActivation";
export { ToonTableOfContentsActivation } from "$lib/domain/effects/actions/spells/individuals/ToonTableOfContentsActivation";
export { ToonWorldActivation } from "$lib/domain/effects/actions/spells/individuals/ToonWorldActivation";

// Monster ChainableAction exports
export { RoyalMagicalLibraryIgnitionEffect } from "$lib/domain/effects/actions/monsters/individuals/RoyalMagicalLibraryIgnitionEffect";

// AdditionalRule exports (Domain Layer)
export type { AdditionalRule, RuleCategory } from "$lib/domain/models/AdditionalRule";
export type { RuleContext } from "$lib/domain/models/RuleContext";
export { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
export { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/spells/ChickenGameContinuousEffect";

// Base Classes exports (Abstract classes for spell card implementations)
export { BaseSpellAction } from "$lib/domain/effects/actions/spells/BaseSpellAction";
export { NormalSpellAction } from "$lib/domain/effects/actions/spells/NormalSpellAction";
export { QuickPlaySpellAction } from "$lib/domain/effects/actions/spells/QuickPlaySpellAction";
export { FieldSpellAction } from "$lib/domain/effects/actions/spells/FieldSpellAction";
export { ContinuousSpellAction } from "$lib/domain/effects/actions/spells/ContinuousSpellAction";

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
  // ===========================
  // Activation Effects (カードの発動時効果)
  // ===========================
  ChainableActionRegistry.registerActivation(55144522, new PotOfGreedActivation());
  ChainableActionRegistry.registerActivation(79571449, new GracefulCharityActivation());
  ChainableActionRegistry.registerActivation(67616300, new ChickenGameActivation());
  ChainableActionRegistry.registerActivation(70368879, new UpstartGoblinActivation());
  ChainableActionRegistry.registerActivation(33782437, new OneDayOfPeaceActivation());
  ChainableActionRegistry.registerActivation(85852291, new MagicalMalletActivation());
  ChainableActionRegistry.registerActivation(74519184, new CardDestructionActivation());
  ChainableActionRegistry.registerActivation(90928333, new DarkFactoryActivation());
  ChainableActionRegistry.registerActivation(73628505, new TerraformingActivation());
  ChainableActionRegistry.registerActivation(98494543, new MagicalStoneExcavationActivation());
  ChainableActionRegistry.registerActivation(93946239, new IntoTheVoidActivation());
  ChainableActionRegistry.registerActivation(98645731, new PotOfDualityActivation());
  ChainableActionRegistry.registerActivation(59750328, new CardOfDemiseActivation());
  ChainableActionRegistry.registerActivation(89997728, new ToonTableOfContentsActivation());
  ChainableActionRegistry.registerActivation(15259703, new ToonWorldActivation());

  // ===========================
  // Ignition Effects (起動効果)
  // ===========================
  ChainableActionRegistry.registerIgnition(67616300, new ChickenGameIgnitionEffect());
  ChainableActionRegistry.registerIgnition(70791313, new RoyalMagicalLibraryIgnitionEffect());

  // Future cards:
  // ChainableActionRegistry.registerActivation(12345678, new AnotherCardActivation());
  // ChainableActionRegistry.registerIgnition(12345678, new AnotherCardIgnitionEffect(""));
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
