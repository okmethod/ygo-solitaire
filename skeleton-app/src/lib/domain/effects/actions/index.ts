/**
 * ChainableAction Effect Library - 発動する効果ライブラリ
 *
 * 登録方式:
 * - DSLベース: YAML定義からloaderを使って登録（優先）
 * - クラスベース: 個別のActivationクラスをインポートして登録
 *
 * @module domain/effects/actions
 */

import { ChainableActionRegistry } from "$lib/domain/effects/actions/ChainableActionRegistry";
import { loadCardFromYaml } from "$lib/domain/dsl/loader";
import { dslDefinitions } from "$lib/domain/cards/definitions";
export { ChainableActionRegistry };

// カードの発動（DSL未対応のみ）
import { FieldSpellActivation } from "$lib/domain/effects/actions/activations/FieldSpellActivation";
import { OneDayOfPeaceActivation } from "$lib/domain/effects/actions/activations/individuals/spells/OneDayOfPeaceActivation";
import { MagicalMalletActivation } from "$lib/domain/effects/actions/activations/individuals/spells/MagicalMalletActivation";
import { CardDestructionActivation } from "$lib/domain/effects/actions/activations/individuals/spells/CardDestructionActivation";
import { PotOfDualityActivation } from "$lib/domain/effects/actions/activations/individuals/spells/PotOfDualityActivation";
import { ToonTableOfContentsActivation } from "$lib/domain/effects/actions/activations/individuals/spells/ToonTableOfContentsActivation";
import { ToonWorldActivation } from "$lib/domain/effects/actions/activations/individuals/spells/ToonWorldActivation";

// 起動効果（DSL未対応のみ）
import { ChickenGameIgnitionEffect } from "$lib/domain/effects/actions/ignitions/individuals/spells/ChickenGameIgnitionEffect";

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

/** 発動効果＋起動効果のエントリを生成（フィールド魔法など） */
const fieldWithIgnition = (id: number, ignitionAction: ChainableAction): RegistrationEntry => [
  id,
  () => {
    ChainableActionRegistry.registerActivation(id, FieldSpellActivation.createNoOp(id));
    ChainableActionRegistry.registerIgnition(id, ignitionAction);
  },
];

// ===========================
// 定義マップ（DSL未対応カードのみ）
// ===========================

const chainableActionRegistrations = new Map<number, () => void>([
  fieldWithIgnition(67616300, new ChickenGameIgnitionEffect()),
  activation(33782437, new OneDayOfPeaceActivation()),
  activation(85852291, new MagicalMalletActivation()),
  activation(74519184, new CardDestructionActivation()),
  activation(98645731, new PotOfDualityActivation()),
  activation(89997728, new ToonTableOfContentsActivation()),
  activation(15259703, new ToonWorldActivation()),
]);

// ===========================
// 登録関数
// ===========================

/**
 * レジストリをクリアし、指定されたカードIDの ChainableAction を登録する
 *
 * DSL定義、またはクラス定義マップから登録する。
 */
export function registerChainableActionsByIds(cardIds: number[]): void {
  ChainableActionRegistry.clear();

  for (const cardId of cardIds) {
    // DSL定義があれば登録（優先）
    const yamlContent = dslDefinitions.get(cardId);
    if (yamlContent) {
      loadCardFromYaml(yamlContent);
      continue;
    }

    // なければクラス定義マップから登録
    const register = chainableActionRegistrations.get(cardId);
    if (register) {
      register();
    }
  }
}
