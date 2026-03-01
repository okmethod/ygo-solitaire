/**
 * ChainableAction Effect Library - 発動する効果ライブラリ
 *
 * 登録方式:
 * - DSLベース: YAML定義からloaderを使って登録（優先）
 * - クラスベース: 個別のActivationクラスをインポートして登録（フォールバック）
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
// 定義マップ
// ===========================

/**
 * カードID → 登録関数のマッピング（DSL未対応カードのみ）
 *
 * DSL定義済みカードは dslDefinitions から登録されるため、
 * ここにはDSL未対応のカードのみを登録する。
 */
const chainableActionRegistrations = new Map<number, () => void>([
  // カードの発動（DSL未対応）
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
 * DSL定義が存在するカードはDSLから登録し、
 * 存在しないカードは従来のクラスベース登録を使用する。
 */
export function registerChainableActionsByIds(cardIds: number[]): void {
  ChainableActionRegistry.clear();

  for (const cardId of cardIds) {
    // DSL定義があればDSLから登録（優先）
    const yamlContent = dslDefinitions.get(cardId);
    if (yamlContent) {
      loadCardFromYaml(yamlContent);
      continue;
    }

    // なければ従来クラスから登録（フォールバック）
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
