/**
 * eventEmitters - ドメインイベントを発行する AtomicStep 群
 *
 * effectQueueStore がイベントを検出し、トリガールールを自動挿入するための
 * イベント発行ステップを定義する。
 *
 * 公開関数:
 * - emitSpellActivatedEventStep: 魔法カード発動イベントを発行
 * - emitNormalSummonedEventStep: モンスター召喚イベントを発行
 * - emitSentToGraveyardEventStep: 墓地送りイベントを発行
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
export function emitNormalSummonedEventStep(summonedInstance: CardInstance): AtomicStep {
  return {
    id: `emit-monster-summoned-${summonedInstance.instanceId}`,
    summary: "モンスター召喚イベント",
    description: "モンスター召喚をトリガーシステムに通知",
    notificationLevel: "silent",
    action: (state) =>
      GameProcessing.Result.success(state, undefined, [
        {
          type: "normalSummoned",
          sourceCardId: summonedInstance.id,
          sourceInstanceId: summonedInstance.instanceId,
        },
      ]),
  };
}

/**
 * 墓地送りイベントを発行するステップ
 *
 * effectQueueStore がこのステップの実行結果から emittedEvents を検出し、
 * ChainableActionRegistry.collectTriggerSteps() を呼び出して
 * 誘発効果（例: クリッター、黒き森のウィッチのサーチ効果）を自動挿入する。
 *
 * @param sentInstance - 墓地に送られたカードのインスタンス
 * @returns AtomicStep
 */
export function emitSentToGraveyardEventStep(sentInstance: CardInstance): AtomicStep {
  return {
    id: `emit-sent-to-graveyard-${sentInstance.instanceId}`,
    summary: "墓地送りイベント",
    description: "墓地送りをトリガーシステムに通知",
    notificationLevel: "silent",
    action: (state) =>
      GameProcessing.Result.success(state, undefined, [
        {
          type: "sentToGraveyard",
          sourceCardId: sentInstance.id,
          sourceInstanceId: sentInstance.instanceId,
        },
      ]),
  };
}
