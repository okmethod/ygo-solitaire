/**
 * Card Effect Library - カード効果ライブラリ
 *
 * すべてのカード効果関連クラスをインポートし、効果レジストリを初期化するモジュール。
 *
 * TODO: 選んだデッキレシピに含まれるカードの効果のみ登録するように最適化したい
 *
 * @remarks
 * - ChainableAction Pattern:
 *   - 発動する効果: チェーンブロックを作る処理
 *   - ChainableAction interface + ChainableActionRegistry により管理
 * - AdditionalRule Pattern:
 *   - 適用する効果: 追加適用されるルール
 *   - AdditionalRule interface + AdditionalRuleRegistry により管理
 *
 * @architecture  レイヤー間依存ルール - Domain Layer
 * - ROLE: 純粋なドメインロジック（カードゲームの基本ルール、モデル定義）
 * - ALLOWED: Domain Layer 内部での依存のみ
 * - FORBIDDEN: Domain Layer 以外への依存
 *
 * @module domain/effects
 */

import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";

// Individual ChainableAction : カードの発動
import { PotOfGreedActivation } from "$lib/domain/effects/actions/activations/individuals/spells/PotOfGreedActivation";
import { GracefulCharityActivation } from "$lib/domain/effects/actions/activations/individuals/spells/GracefulCharityActivation";
import { ChickenGameActivation } from "$lib/domain/effects/actions/activations/individuals/spells/ChickenGameActivation";
import { UpstartGoblinActivation } from "$lib/domain/effects/actions/activations/individuals/spells/UpstartGoblinActivation";
import { OneDayOfPeaceActivation } from "$lib/domain/effects/actions/activations/individuals/spells/OneDayOfPeaceActivation";
import { MagicalMalletActivation } from "$lib/domain/effects/actions/activations/individuals/spells/MagicalMalletActivation";
import { CardDestructionActivation } from "$lib/domain/effects/actions/activations/individuals/spells/CardDestructionActivation";
import { DarkFactoryActivation } from "$lib/domain/effects/actions/activations/individuals/spells/DarkFactoryActivation";
import { TerraformingActivation } from "$lib/domain/effects/actions/activations/individuals/spells/TerraformingActivation";
import { MagicalStoneExcavationActivation } from "$lib/domain/effects/actions/activations/individuals/spells/MagicalStoneExcavationActivation";
import { IntoTheVoidActivation } from "$lib/domain/effects/actions/activations/individuals/spells/IntoTheVoidActivation";
import { PotOfDualityActivation } from "$lib/domain/effects/actions/activations/individuals/spells/PotOfDualityActivation";
import { CardOfDemiseActivation } from "$lib/domain/effects/actions/activations/individuals/spells/CardOfDemiseActivation";
import { ToonTableOfContentsActivation } from "$lib/domain/effects/actions/activations/individuals/spells/ToonTableOfContentsActivation";
import { ToonWorldActivation } from "$lib/domain/effects/actions/activations/individuals/spells/ToonWorldActivation";

// Individual ChainableAction : 起動効果
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/Ignitions/individuals/spells/ChickenGameIgnitionEffect";
import { RoyalMagicalLibraryIgnitionEffect } from "$lib/domain/effects/actions/Ignitions/individuals/monsters/RoyalMagicalLibraryIgnitionEffect";

// Individual AdditionalRule : 永続効果
import { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/spells/ChickenGameContinuousEffect";

/** 発動する効果:チェーンブロックを作る処理 のレジストリ */
function initializeChainableActionRegistry(): void {
  // カードの発動
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

  // 起動効果
  ChainableActionRegistry.registerIgnition(67616300, new ChickenGameIgnitionEffect());
  ChainableActionRegistry.registerIgnition(70791313, new RoyalMagicalLibraryIgnitionEffect());
}

/** 適用する効果:追加適用されるルール のレジストリ */
function initializeAdditionalRuleRegistry(): void {
  // 永続効果
  AdditionalRuleRegistry.register(67616300, new ChickenGameContinuousEffect());

  // 分類されない効果（ルール効果）
}

// Auto-initialize registries on module import
initializeChainableActionRegistry();
initializeAdditionalRuleRegistry();
