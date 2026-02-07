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

import type { GameState } from "$lib/domain/models/GameState";
import type { RuleContext, TriggerEvent } from "$lib/domain/models/RuleContext";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/AdditionalRule";
import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { addCounter, getCounterCount } from "$lib/domain/models/Counter";
import { findCardInstance } from "$lib/domain/models/Zone";
import { successUpdateResult } from "$lib/domain/models/GameStateUpdate";

/** 王立魔法図書館のカードID */
const ROYAL_MAGICAL_LIBRARY_ID = 70791313;

/** 魔力カウンターの最大数 */
const MAX_SPELL_COUNTERS = 3;

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
   * @param _context - ルール適用コンテキスト
   * TODO: context が現状 TooMuchなので、削除検討
   * @returns 適用可能ならtrue
   */
  canApply(state: GameState, _context: RuleContext): boolean {
    // モンスターゾーンに王立魔法図書館が表側表示で存在するか
    const libraryOnField = state.zones.mainMonsterZone.some(
      (card) => card.id === ROYAL_MAGICAL_LIBRARY_ID && card.position === "faceUp",
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
   * @param _context - ルール適用コンテキスト
   * @param sourceInstance - このルールの発生源となるカードインスタンス（王立魔法図書館）
   * @returns 実行するAtomicStep配列
   */
  createTriggerSteps(_state: GameState, _context: RuleContext, sourceInstance: CardInstance): AtomicStep[] {
    // sourceInstanceのinstanceIdをキャプチャ（ステップ実行時に最新の状態を取得するため）
    const instanceId = sourceInstance.instanceId;

    return [
      {
        id: `royal-magical-library-counter-${instanceId}`,
        summary: "魔力カウンター蓄積",
        description: "王立魔法図書館に魔力カウンターを1つ置く",
        notificationLevel: "silent",
        action: (currentState: GameState) => {
          // 実行時に最新のカードインスタンスを取得
          const latestInstance = findCardInstance(currentState.zones, instanceId);
          if (!latestInstance) {
            return successUpdateResult(currentState, "カードが見つかりません");
          }

          // 既に3個以上ある場合は何もしない
          const currentCount = getCounterCount(latestInstance.counters, "spell");
          if (currentCount >= MAX_SPELL_COUNTERS) {
            return successUpdateResult(currentState, "魔力カウンターは既に最大数です");
          }

          // 魔力カウンターを1つ追加
          const newCounters = addCounter(latestInstance.counters, "spell", 1, MAX_SPELL_COUNTERS);

          // mainMonsterZone内の該当インスタンスを更新（手動の不変更新）
          const index = currentState.zones.mainMonsterZone.findIndex((card) => card.instanceId === instanceId);
          if (index < 0) {
            return successUpdateResult(currentState, "カードが見つかりません");
          }

          const updatedCard: CardInstance = {
            ...currentState.zones.mainMonsterZone[index],
            counters: newCounters,
          };

          const updatedMainMonsterZone = [
            ...currentState.zones.mainMonsterZone.slice(0, index),
            updatedCard,
            ...currentState.zones.mainMonsterZone.slice(index + 1),
          ];

          const updatedState: GameState = {
            ...currentState,
            zones: {
              ...currentState.zones,
              mainMonsterZone: updatedMainMonsterZone,
            },
          };

          return successUpdateResult(updatedState, "魔力カウンターを1つ置きました");
        },
      },
    ];
  }
}
