/**
 * DSL Loader - DSL定義からカードデータと効果を登録する
 *
 * YAML定義ファイルをパースし、CardDataRegistryとChainableActionRegistryに登録する。
 * ゲーム開始時のレジストリ初期化で一度だけ呼び出される。
 *
 * @module domain/dsl/loader
 */

import type { CardDSLDefinition } from "$lib/domain/dsl/types";
import { parseCardDSL } from "$lib/domain/dsl/parsers";
import { CardDataRegistry } from "$lib/domain/cards/CardDataRegistry";
import { ChainableActionRegistry } from "$lib/domain/effects/actions/ChainableActionRegistry";
import { createGenericNormalSpellActivation } from "$lib/domain/dsl/factories";

/**
 * DSL定義をCardDataRegistryに登録する
 */
function registerCardData(definition: CardDSLDefinition): void {
  const { id, data } = definition;

  CardDataRegistry.register(id, {
    jaName: data.jaName,
    type: data.type,
    frameType: data.frameType,
    spellType: data.spellType,
    trapType: data.trapType,
  });
}

/**
 * DSL定義をChainableActionRegistryに登録する
 *
 * 現在は通常魔法のactivationsのみ対応。
 */
function registerChainableAction(definition: CardDSLDefinition): void {
  const { id } = definition;
  const chainableActions = definition["effect-chainable-actions"];

  // チェーンブロックを作る処理がない場合はスキップ
  if (!chainableActions) {
    return;
  }

  // activations セクション（カードの発動 - 通常魔法）
  if (chainableActions.activations) {
    const activation = createGenericNormalSpellActivation(id, chainableActions.activations);
    ChainableActionRegistry.registerActivation(id, activation);
  }

  // TODO: ignitions セクション（起動効果）の対応は Phase 5 で実装
}

/**
 * YAML文字列からカードを登録する
 *
 * @param yamlContent - YAMLファイルの内容
 * @throws DSLParseError, DSLValidationError - パース/バリデーションエラー時
 */
export function loadCardFromYaml(yamlContent: string): void {
  const definition = parseCardDSL(yamlContent);
  registerCardData(definition);
  registerChainableAction(definition);
}

/**
 * 複数のYAML文字列からカードを一括登録する
 *
 * @param yamlContents - YAMLファイル内容の配列
 */
export function loadCardsFromYaml(yamlContents: readonly string[]): void {
  for (const content of yamlContents) {
    loadCardFromYaml(content);
  }
}

/**
 * DSL定義オブジェクトからカードを登録する
 *
 * すでにパース済みのCardDSLDefinitionを登録する場合に使用。
 *
 * @param definition - パース済みのDSL定義
 */
export function loadCardFromDefinition(definition: CardDSLDefinition): void {
  registerCardData(definition);
  registerChainableAction(definition);
}

/**
 * 複数のDSL定義オブジェクトからカードを一括登録する
 *
 * @param definitions - パース済みのDSL定義の配列
 */
export function loadCardsFromDefinitions(definitions: readonly CardDSLDefinition[]): void {
  for (const definition of definitions) {
    loadCardFromDefinition(definition);
  }
}
