/**
 * DSL Loader - DSL定義からカードデータと効果を登録する
 *
 * YAML定義ファイルをパースし、CardDataRegistryとChainableActionRegistryに登録する。
 * ゲーム開始時のレジストリ初期化で一度だけ呼び出される。
 *
 * @module domain/dsl/loader
 */

import { CardDataRegistry } from "$lib/domain/cards/CardDataRegistry";
import { ChainableActionRegistry } from "$lib/domain/effects/actions/ChainableActionRegistry";
import { FieldSpellActivation } from "$lib/domain/effects/actions/activations/FieldSpellActivation";
import { EquipSpellActivation } from "$lib/domain/effects/actions/activations/EquipSpellActivation";
import { ContinuousSpellActivation } from "$lib/domain/effects/actions/activations/ContinuousSpellActivation";
import { AdditionalRuleRegistry } from "$lib/domain/effects/rules/AdditionalRuleRegistry";
import type { CardDSLDefinition } from "$lib/domain/dsl/types";
import {
  createGenericNormalSpellActivation,
  createGenericQuickPlaySpellActivation,
  createGenericContinuousSpellActivation,
  createGenericIgnitionEffect,
  createGenericTriggerEffect,
  GenericContinuousTriggerRule,
} from "$lib/domain/dsl/factories";
import { parseCardDSL } from "./parsers";

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
    edition: data.edition ?? "latest",
    level: data.level,
    attack: data.attack,
    defense: data.defense,
  });
}

/**
 * DSL定義をChainableActionRegistryに登録する
 */
function registerChainableAction(definition: CardDSLDefinition): void {
  const { id, data } = definition;
  const chainableActions = definition["effectChainableActions"];
  const spellType = data.spellType;

  // activations セクション（カードの発動）
  if (chainableActions?.activations) {
    // spellTypeに応じて適切なファクトリを使用
    if (spellType === "normal") {
      const activation = createGenericNormalSpellActivation(id, chainableActions.activations);
      ChainableActionRegistry.registerActivation(id, activation);
    } else if (spellType === "quick-play") {
      const activation = createGenericQuickPlaySpellActivation(id, chainableActions.activations);
      ChainableActionRegistry.registerActivation(id, activation);
    } else if (spellType === "continuous") {
      const activation = createGenericContinuousSpellActivation(id, chainableActions.activations);
      ChainableActionRegistry.registerActivation(id, activation);
    } else if (spellType === "equip") {
      // 装備魔法: activations指定がある場合はcreateWithConfigを使用
      // TODO: DSLでtargetConfig, resolutionStepsを指定できるようにする
      const activation = EquipSpellActivation.createNoOp(id);
      ChainableActionRegistry.registerActivation(id, activation);
    } else {
      throw new Error(`Unsupported spell type "${spellType}" for card ID ${id}`);
    }
  } else if (spellType === "continuous") {
    // 永続魔法はactivationsがなくてもNoOpで発動可能
    const activation = ContinuousSpellActivation.createNoOp(id);
    ChainableActionRegistry.registerActivation(id, activation);
  } else if (spellType === "field") {
    // フィールド魔法はactivationsがなくてもNoOpで発動可能
    const activation = FieldSpellActivation.createNoOp(id);
    ChainableActionRegistry.registerActivation(id, activation);
  } else if (spellType === "equip") {
    // 装備魔法はactivationsがなくてもNoOpで発動可能（対象選択と装備関係確立のみ）
    const activation = EquipSpellActivation.createNoOp(id);
    ChainableActionRegistry.registerActivation(id, activation);
  }

  // ignitions セクション（起動効果）
  if (chainableActions?.ignitions) {
    chainableActions.ignitions.forEach((ignitionDef, index) => {
      const ignition = createGenericIgnitionEffect(id, index + 1, ignitionDef);
      ChainableActionRegistry.registerIgnition(id, ignition);
    });
  }

  // triggers セクション（誘発効果）
  if (chainableActions?.triggers) {
    chainableActions.triggers.forEach((triggerDef, index) => {
      const trigger = createGenericTriggerEffect(id, index + 1, triggerDef);
      ChainableActionRegistry.registerTrigger(id, trigger);
    });
  }
}

/**
 * DSL定義をAdditionalRuleRegistryに登録する
 */
function registerAdditionalRules(definition: CardDSLDefinition): void {
  const { id } = definition;
  const additionalRules = definition["effectAdditionalRules"];

  // 追加適用するルールがない場合はスキップ
  if (!additionalRules) {
    return;
  }

  // continuous セクション（永続効果）
  if (additionalRules.continuous) {
    for (const ruleDef of additionalRules.continuous) {
      const rule = new GenericContinuousTriggerRule(id, ruleDef);
      AdditionalRuleRegistry.register(id, rule);
    }
  }
}

/**
 * YAML文字列からカードデータのみを登録する
 *
 * 効果は登録しない。レシピ表示など、ゲームを開始しない用途向け。
 *
 * @param yamlContent - YAMLファイルの内容
 * @throws DSLParseError, DSLValidationError - パース/バリデーションエラー時
 */
export function loadCardDataFromYaml(yamlContent: string): void {
  const definition = parseCardDSL(yamlContent);
  registerCardData(definition);
}

/**
 * YAML文字列からカードデータと効果を登録する
 *
 * CardData, ChainableAction, AdditionalRules を一括登録する。
 * ゲーム開始時のレジストリ初期化で使用。
 *
 * @param yamlContent - YAMLファイルの内容
 * @throws DSLParseError, DSLValidationError - パース/バリデーションエラー時
 */
export function loadCardDataWithEffectsFromYaml(yamlContent: string): void {
  const definition = parseCardDSL(yamlContent);
  registerCardData(definition);
  registerChainableAction(definition);
  registerAdditionalRules(definition);
}
