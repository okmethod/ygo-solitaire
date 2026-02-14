/**
 * RoyalMagicalLibraryContinuousEffect - 《王立魔法図書館》(Royal Magical Library)
 *
 * Card ID: 70791313 | Type: Monster | Subtype: Continuous
 *
 * 永続効果:
 * - 魔法カードが発動する度に、このカードに魔力カウンターを1つ置く（最大3つまで）
 *
 * カテゴリ: TriggerRule (イベント駆動)
 *
 * @module domain/effects/rules/monsters/RoyalMagicalLibraryContinuousEffect
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { TriggerEvent } from "$lib/domain/models/GameProcessing";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/Effect";
import type { CardInstance } from "$lib/domain/models/CardOld";
import { isFaceUp } from "$lib/domain/models/CardOld";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { addCounterStep } from "$lib/domain/effects/steps/counters";

/** 王立魔法図書館のカードID */
const ROYAL_MAGICAL_LIBRARY_ID = 70791313;

/** 魔力カウンターの最大数 */
const LIMIT_SPELL_COUNTERS = 3;

/**
 * RoyalMagicalLibraryContinuousEffect クラス
 *
 * 王立魔法図書館の永続効果（魔力カウンター蓄積）を実装。
 * 魔法カード発動時に魔力カウンターを1つ置く。
 */
export class RoyalMagicalLibraryContinuousEffect implements AdditionalRule {
  /**
   * 効果である（無効化される可能性がある）
   */
  readonly isEffect = true;

  /**
   * カテゴリ: イベント駆動（トリガールール）
   */
  readonly category: RuleCategory = "TriggerRule";

  /**
   * トリガーイベント: 魔法カード発動時
   */
  readonly triggers: readonly TriggerEvent[] = ["spellActivated"];

  /**
   * 適用条件チェック
   *
   * 王立魔法図書館がフィールドに表側表示で存在し、
   * 魔力カウンターが3個未満の場合に適用可能。
   *
   * @param state - 現在のゲーム状態
   * @returns 適用可能ならtrue
   */
  canApply(state: GameState): boolean {
    // モンスターゾーンに王立魔法図書館が表側表示で存在するか
    const libraryOnField = state.zones.mainMonsterZone.some(
      (card) => card.id === ROYAL_MAGICAL_LIBRARY_ID && isFaceUp(card),
    );

    return libraryOnField;
  }

  /**
   * トリガー発動時のステップを生成
   *
   * 魔法カードが発動された際に、王立魔法図書館に魔力カウンターを1つ置くステップを生成する。
   * ChainableActionと同様に、このルールが自身の処理ステップを生成する責務を持つ。
   *
   * @param _state - 現在のゲーム状態
   * @param sourceInstance - このルールの発生源となるカードインスタンス（王立魔法図書館）
   * @returns 実行するAtomicStep配列
   */
  createTriggerSteps(_state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    return [addCounterStep(sourceInstance.instanceId, "spell", 1, LIMIT_SPELL_COUNTERS)];
  }
}
