/**
 * ChainableAction Effect Library - 発動する効果ライブラリ
 *
 * 登録方式:
 * - クラスベース: 個別のActivationクラスをインポートして登録（レガシー）
 * - DSLベース: YAML定義からloaderを使って登録（新方式）
 *
 * @module domain/effects/actions
 */

import { ChainableActionRegistry } from "$lib/domain/effects/actions/ChainableActionRegistry";
import { loadCardFromYaml } from "$lib/domain/dsl/loader";
export { ChainableActionRegistry };

// カードの発動
import { PotOfGreedActivation } from "$lib/domain/effects/actions/activations/individuals/spells/PotOfGreedActivation";
import { GracefulCharityActivation } from "$lib/domain/effects/actions/activations/individuals/spells/GracefulCharityActivation";
import { UpstartGoblinActivation } from "$lib/domain/effects/actions/activations/individuals/spells/UpstartGoblinActivation";
import { FieldSpellActivation } from "$lib/domain/effects/actions/activations/FieldSpellActivation";
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

// 起動効果
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/ignitions/individuals/spells/ChickenGameIgnitionEffect";
import { RoyalMagicalLibraryIgnitionEffect } from "$lib/domain/effects/actions/ignitions/individuals/monsters/RoyalMagicalLibraryIgnitionEffect";

// ===========================
// マップエントリ生成ヘルパー
// ===========================

import type { ChainableAction } from "$lib/domain/models/Effect";

type RegistrationEntry = [number, () => void];

/** 発動効果のエントリを生成 */
const activation = (id: number, action: ChainableAction): RegistrationEntry => [
  id,
  () => ChainableActionRegistry.registerActivation(id, action),
];

/** 起動効果のエントリを生成 */
const ignition = (id: number, action: ChainableAction): RegistrationEntry => [
  id,
  () => ChainableActionRegistry.registerIgnition(id, action),
];

/** 発動効果＋起動効果のエントリを生成（フィールド魔法など） */
const fieldWithIgnition = (id: number, ignitionAction: ChainableAction): RegistrationEntry => [
  id,
  () => {
    ChainableActionRegistry.registerActivation(id, FieldSpellActivation.createNoOp(id));
    ChainableActionRegistry.registerIgnition(id, ignitionAction);
  },
];

// ===========================
// 定義マップ
// ===========================

/** カードID → 登録関数のマッピング */
const chainableActionRegistrations = new Map<number, () => void>([
  // カードの発動
  activation(55144522, new PotOfGreedActivation()),
  activation(79571449, new GracefulCharityActivation()),
  fieldWithIgnition(67616300, new ChickenGameIgnitionEffect()),
  activation(70368879, new UpstartGoblinActivation()),
  activation(33782437, new OneDayOfPeaceActivation()),
  activation(85852291, new MagicalMalletActivation()),
  activation(74519184, new CardDestructionActivation()),
  activation(90928333, new DarkFactoryActivation()),
  activation(73628505, new TerraformingActivation()),
  activation(98494543, new MagicalStoneExcavationActivation()),
  activation(93946239, new IntoTheVoidActivation()),
  activation(98645731, new PotOfDualityActivation()),
  activation(59750328, new CardOfDemiseActivation()),
  activation(89997728, new ToonTableOfContentsActivation()),
  activation(15259703, new ToonWorldActivation()),
  // 起動効果のみのカード
  ignition(70791313, new RoyalMagicalLibraryIgnitionEffect()),
]);

// ===========================
// 登録関数
// ===========================

/** レジストリをクリアし、指定されたカードIDの ChainableAction を登録する */
export function registerChainableActionsByIds(cardIds: number[]): void {
  ChainableActionRegistry.clear();

  for (const cardId of cardIds) {
    const register = chainableActionRegistrations.get(cardId);
    if (register) {
      register();
    }
  }
}

// ===========================
// DSLベース登録
// ===========================

/**
 * YAML定義文字列からカードを登録する
 *
 * クラスベース登録と併用可能。同じカードIDの場合は後から登録した方が優先される。
 *
 * @param yamlContent - YAMLファイルの内容
 */
export function registerChainableActionFromYaml(yamlContent: string): void {
  loadCardFromYaml(yamlContent);
}

/**
 * 複数のYAML定義文字列からカードを一括登録する
 *
 * @param yamlContents - YAMLファイル内容の配列
 */
export function registerChainableActionsFromYaml(yamlContents: string[]): void {
  for (const content of yamlContents) {
    loadCardFromYaml(content);
  }
}
