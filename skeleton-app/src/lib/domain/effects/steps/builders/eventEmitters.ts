/**
 * eventEmitters - ドメインイベントを発行する AtomicStep 群
 *
 * effectQueueStore がイベントを検出し、トリガールールを自動挿入するための
 * イベント発行ステップを定義する。
 *
 * 純粋関数:
 * - emitSpellActivatedEventStep: 魔法カード発動イベントを発行
 * - emitMonsterSummonedEventStep: モンスター召喚イベントを発行
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { AtomicStep } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/**
 * 魔法カード発動イベントを発行するステップ
 *
 * effectQueueStore がこのステップの実行結果から emittedEvents を検出し、
 * AdditionalRuleRegistry.collectTriggerSteps() を呼び出して
 * トリガールール（例: 王立魔法図書館の魔力カウンター蓄積）を自動挿入する。
 *
 * @param sourceInstance - 発動された魔法カードのインスタンス
 * @returns AtomicStep
 */
export function emitSpellActivatedEventStep(sourceInstance: CardInstance): AtomicStep {
  return {
    id: `emit-spell-activated-${sourceInstance.instanceId}`,
    summary: "魔法発動イベント",
    description: "魔法カード発動をトリガーシステムに通知",
    notificationLevel: "silent",
    action: (state) =>
      GameProcessing.Result.success(state, undefined, [
        {
          type: "spellActivated",
          sourceCardId: sourceInstance.id,
          sourceInstanceId: sourceInstance.instanceId,
        },
      ]),
  };
}

/**
 * モンスター召喚イベントを発行するステップ
 *
 * effectQueueStore がこのステップの実行結果から emittedEvents を検出し、
 * AdditionalRuleRegistry.collectTriggerSteps() を呼び出して
 * トリガールール（例: 召喚僧サモンプリーストの守備表示変更）を自動挿入する。
 *
 * @param summonedInstance - 召喚されたモンスターカードのインスタンス
 * @returns AtomicStep
 */
export function emitMonsterSummonedEventStep(summonedInstance: CardInstance): AtomicStep {
  return {
    id: `emit-monster-summoned-${summonedInstance.instanceId}`,
    summary: "モンスター召喚イベント",
    description: "モンスター召喚をトリガーシステムに通知",
    notificationLevel: "silent",
    action: (state) =>
      GameProcessing.Result.success(state, undefined, [
        {
          type: "monsterSummoned",
          sourceCardId: summonedInstance.id,
          sourceInstanceId: summonedInstance.instanceId,
        },
      ]),
  };
}
