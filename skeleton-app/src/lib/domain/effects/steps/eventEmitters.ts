/**
 * eventEmitters - ドメインイベントを発行する AtomicStep 群
 *
 * effectQueueStore がイベントを検出し、トリガールールを自動挿入するための
 * イベント発行ステップを定義する。
 *
 * @module domain/effects/steps/eventEmitters
 */

import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { CardInstance } from "$lib/domain/models/CardOld";
import { successUpdateResult } from "$lib/domain/models/GameStateUpdate";

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
      successUpdateResult(state, undefined, undefined, [
        {
          type: "spellActivated",
          sourceCardId: sourceInstance.id,
          sourceInstanceId: sourceInstance.instanceId,
        },
      ]),
  };
}
