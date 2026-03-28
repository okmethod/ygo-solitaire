/**
 * fieldDepartureDestination.ts - フィールド離脱時の移動先オーバーライド
 *
 * Override関数:
 * - moveCardFromFieldOverride: フィールドを離れるカードを適切なロケーションに移動
 *
 * OverrideHandler:
 * - createFieldDepartureDestinationHandler: フィールド離脱時の移動先オーバーライド
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot, CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { LocationName } from "$lib/domain/models/Location";
import type { ActionOverrideHandler, DSLArgs } from "$lib/domain/dsl/types";
import { Card } from "$lib/domain/models/Card";
import { AdditionalRuleRegistry } from "$lib/domain/effects/rules/AdditionalRuleRegistry";
import type { GenericUnclassifiedActionOverride } from "$lib/domain/dsl/factories/GenericUnclassifiedActionOverride";

/** フィールド離脱時の移動先 */
export type FieldDepartureDestination = "banished";

// ===========================
// 内部ヘルパー
// ===========================

/**
 * フィールドを離れるカードの移動先を取得する
 *
 * ActionOverrideルールをチェックし、該当するルールがあれば
 * 置換先のロケーションを返す。なければ元の移動先を返す。
 */
const getFieldDepartureDestination = (
  state: GameSnapshot,
  card: CardInstance,
  originalDestination: LocationName,
): LocationName => {
  // フィールドから離れる移動でない場合はそのまま返す
  const isLeavingField =
    (card.location === "mainMonsterZone" || card.location === "spellTrapZone" || card.location === "fieldZone") &&
    originalDestination !== "mainMonsterZone" &&
    originalDestination !== "spellTrapZone" &&
    originalDestination !== "fieldZone";

  if (!isLeavingField) {
    return originalDestination;
  }

  // ActionOverrideルールをチェック
  const rules = AdditionalRuleRegistry.getByCategory(card.id, "ActionOverride");

  for (const rule of rules) {
    // GenericUnclassifiedActionOverride の場合のみ処理
    if ("shouldApplyOverride" in rule) {
      const overrideRule = rule as GenericUnclassifiedActionOverride;
      if (overrideRule.shouldApplyOverride(state, card)) {
        return overrideRule.getOverrideValue<LocationName>();
      }
    }
  }

  return originalDestination;
};

// ===========================
// Override関数
// ===========================

/**
 * フィールドを離れるカードを適切なロケーションに移動する
 *
 * ActionOverrideルールを適用した上でmoveCardを実行する。
 *
 * @param state - 現在のゲーム状態
 * @param card - 移動対象のカード
 * @param intendedDestination - 意図された移動先（墓地等）
 * @returns 更新されたCardSpace
 */
export function moveCardFromFieldOverride(
  state: GameSnapshot,
  card: CardInstance,
  intendedDestination: LocationName,
): CardSpace {
  const actualDestination = getFieldDepartureDestination(state, card, intendedDestination);
  return GameState.Space.moveCard(state.space, card, actualDestination);
}

// ===========================
// OverrideHandler（DSL用ファクトリ）
// ===========================

/**
 * FIELD_DEPARTURE_DESTINATION - フィールド離脱時の移動先オーバーライド
 *
 * @param cardId - 対象カードID
 * @returns ActionOverrideHandler
 */
export function createFieldDepartureDestinationHandler(cardId: number): ActionOverrideHandler {
  return {
    /**
     * このオーバーライドが適用されるべきか判定
     *
     * チェック項目:
     * 1. カードIDが一致
     * 2. 表側表示である
     */
    shouldApply(_state: GameSnapshot, card: CardInstance, _args: DSLArgs): boolean {
      // カードIDが一致し、表側表示であること
      if (card.id !== cardId) return false;
      if (!Card.Instance.isFaceUp(card)) return false;
      return true;
    },

    /**
     * オーバーライド値（移動先）を取得
     */
    getOverrideValue(args: DSLArgs): LocationName {
      return (args.destination as FieldDepartureDestination) ?? "banished";
    },
  };
}
