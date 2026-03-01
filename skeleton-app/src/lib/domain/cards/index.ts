/**
 * Card Data Library - カードデータライブラリ
 *
 * 登録方式:
 * - DSLベース: YAML定義から登録（優先）
 * - マップベース: 個別のカードデータをマップから登録
 *
 * @module domain/cards
 */

import { CardDataRegistry } from "$lib/domain/cards/CardDataRegistry";
import { dslDefinitions } from "$lib/domain/cards/definitions";
import { loadCardDataFromYaml, loadCardDataWithEffectsFromYaml } from "$lib/domain/dsl/loader";
import { ChainableActionRegistry, registerChainableActionFromMap } from "$lib/domain/effects/actions";
import { AdditionalRuleRegistry, registerAdditionalRuleFromMap } from "$lib/domain/effects/rules";
export { CardDataRegistry };

// ===========================
// DSL未対応カードのフォールバック
// ===========================

import type { FrameSubType, TrapSubType } from "$lib/domain/models/Card";

type RegistrationEntry = [number, () => void];

/** モンスターカードのエントリを生成 */
const monster = (frameType: FrameSubType, id: number, jaName: string): RegistrationEntry => [
  id,
  () => CardDataRegistry.register(id, { jaName, type: "monster", frameType }),
];

/** 罠カードのエントリを生成 */
const trap = (trapType: TrapSubType, id: number, jaName: string): RegistrationEntry => [
  id,
  () => CardDataRegistry.register(id, { jaName, type: "trap", frameType: "trap", trapType }),
];

/** DSL未対応カードの定義マップ */
const cardDataRegistrations = new Map<number, () => void>([
  // モンスターカード
  monster("effect", 33396948, "封印されしエクゾディア"),
  monster("normal", 7902349, "封印されし者の右腕"),
  monster("normal", 70903634, "封印されし者の左腕"),
  monster("normal", 44519536, "封印されし者の左足"),
  monster("normal", 8124921, "封印されし者の右足"),

  // 罠カード
  trap("normal", 83968380, "強欲な瓶"),
]);

/** DSL未対応カード定義マップから CardData を登録する */
function registerCardDataFromMap(cardId: number): void {
  const register = cardDataRegistrations.get(cardId);
  if (register) {
    register();
  }
}

// ===========================
// 登録関数
// ===========================

/**
 * レジストリをクリアし、指定されたカードIDの CardData のみを登録する
 *
 * DSL定義を優先し、なければマップから登録する。
 */
export function registerCardDataByIds(cardIds: number[]): void {
  CardDataRegistry.clear();

  for (const cardId of cardIds) {
    // DSL定義があれば優先
    const yamlContent = dslDefinitions.get(cardId);
    if (yamlContent) {
      loadCardDataFromYaml(yamlContent);
      continue;
    }

    // なければマップから登録
    registerCardDataFromMap(cardId);
  }
}

/**
 * レジストリをクリアし、指定されたカードIDの CardData と効果を登録する
 *
 * DSL定義を優先し、なければマップから登録する。
 */
export function registerCardDataWithEffectsByIds(cardIds: number[]): void {
  CardDataRegistry.clear();
  ChainableActionRegistry.clear();
  AdditionalRuleRegistry.clear();

  for (const cardId of cardIds) {
    // DSL定義があれば優先（CardData + 効果を一括登録）
    const yamlContent = dslDefinitions.get(cardId);
    if (yamlContent) {
      loadCardDataWithEffectsFromYaml(yamlContent);
      continue;
    }

    // なければマップから登録
    registerCardDataFromMap(cardId);
    registerChainableActionFromMap(cardId);
    registerAdditionalRuleFromMap(cardId);
  }
}
