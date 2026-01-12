import type { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameStateUpdate";

/**
 * 魔法カードが発動可能かをチェックする
 *
 * チェック項目:
 * 1. メインフェイズであること
 * TODO: 要調整
 *
 * Note: GameStateのみによる判定を責務とし、カードインスタンスが必要な判定はコマンドに委ねる
 * TODO: canNormalSummon は↑のように役割分担を決めたが、現状の canActivateSpell とは噛み合わない
 */
export function canActivateSpell(state: GameState, cardInstanceId: string): ValidationResult {
  // 1. メインフェイズであること
  if (state.phase !== "Main1") {
    return {
      canExecute: false,
      reason: "メインフェイズではありません",
    };
  }

  // Find card in hand, spellTrapZone, or fieldZone (T030-2)
  const cardInHand = state.zones.hand.find((card) => card.instanceId === cardInstanceId);
  const cardInSpellTrapZone = state.zones.spellTrapZone.find((card) => card.instanceId === cardInstanceId);
  const cardInFieldZone = state.zones.fieldZone.find((card) => card.instanceId === cardInstanceId);

  const card = cardInHand || cardInSpellTrapZone || cardInFieldZone;

  if (!card) {
    return {
      canExecute: false,
      reason: `指定されたカードが発動可能な位置（手札、魔法・罠ゾーン、フィールドゾーン）に見つかりません`,
    };
  }

  // If activating from field zones, additional checks apply
  if (cardInSpellTrapZone || cardInFieldZone) {
    // Field spells (continuous spells) can only be activated from fieldZone
    if (card.spellType === "field" && cardInSpellTrapZone) {
      return {
        canExecute: false,
        reason: `フィールド魔法は魔法・罠ゾーンから発動できません`,
      };
    }

    // Quick-play spells cannot be activated the turn they were set (FR-012-2)
    if (card.spellType === "quick-play" && card.placedThisTurn) {
      return {
        canExecute: false,
        reason: `速攻魔法はセットしたターンに発動できません`,
      };
    }
  }

  // All checks passed
  return {
    canExecute: true,
  };
}
