/**
 * ActivationRule - カード発動ルール
 *
 * 発動時のカード配置等のルールを定義する。
 *
 * @module domain/rules/ActivationRule
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";

/**
 * 発動したカードを適切なゾーンに表向きで配置する
 *
 * - 手札から発動: 適切なゾーンに表向きで配置
 *   - 通常魔法/速攻魔法/罠 → 魔法・罠ゾーン
 *   - フィールド魔法 → フィールドゾーン（既存のフィールド魔法は墓地へ）
 * - セットから発動: 同じゾーンで表向きにする
 *
 * @throws Error 未実装のカードタイプの場合
 */
export function placeCardForActivation(space: CardSpace, instance: CardInstance): CardSpace {
  // 手札から発動
  if (Card.Instance.inHand(instance)) {
    if (Card.isFieldSpell(instance)) {
      // フィールド魔法: 既存を墓地へ送り、フィールドゾーンに配置
      const sweptSpace = GameState.Space.sendExistingFieldSpellToGraveyard(space);
      return GameState.Space.moveCard(sweptSpace, instance, "fieldZone", { position: "faceUp" });
    }
    // 通常魔法/速攻魔法/罠: 魔法・罠ゾーンに配置
    if (Card.isSpell(instance) || Card.isTrap(instance)) {
      return GameState.Space.moveCard(space, instance, "spellTrapZone", { position: "faceUp" });
    }
    // それ以外
    throw new Error("Invalid card type for activation");
  }

  // セットから発動: 同じゾーンで表向きにする
  return GameState.Space.updateCardStateInPlace(space, instance, { position: "faceUp" });
}
