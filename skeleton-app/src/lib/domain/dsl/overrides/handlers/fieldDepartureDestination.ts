/**
 * fieldDepartureDestination.ts - フィールド離脱時の移動先オーバーライド
 *
 * OverrideHandler:
 * - createFieldDepartureDestinationHandler: フィールド離脱時の移動先オーバーライド
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { LocationName } from "$lib/domain/models/Location";
import type { ActionOverrideHandler, DSLArgs } from "$lib/domain/dsl/types";
import { Card } from "$lib/domain/models/Card";

/** フィールド離脱時の移動先 */
export type FieldDepartureDestination = "banished";

// ===========================
// OverrideHandler（export）
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
