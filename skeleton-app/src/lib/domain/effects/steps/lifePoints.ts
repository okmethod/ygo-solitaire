/**
 * steps/lifePoints - LP操作系ステップビルダー
 *
 * 公開ステップ:
 * - gainLpStep: LP回復
 * - damageLpStep: LP減少（ダメージ）
 * - payLpStep: LP支払い（コスト）
 * - lossLpStep: LP喪失（失う）
 *
 * @module domain/effects/steps/lifePoints
 */

import type { GameState, PlayerType } from "$lib/domain/models/GameStateOld";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdate";

type LpOperationType = "gain" | "damage" | "payment" | "loss";

// LP操作ステップの共通ヘルパー
const commonLpStep = (type: LpOperationType, amount: number, target: PlayerType): AtomicStep => {
  const isPlayer = target === "player";
  const targetJa = isPlayer ? "プレイヤー" : "相手";
  const targetEn = isPlayer ? "Player" : "Opponent";

  // 設定の抽象化（符号とラベル）
  const sign = type === "gain" ? 1 : -1;
  const labels = {
    gain: { id: "gain-lp", action: "増加", msg: "gained" },
    damage: { id: "damage", action: "ダメージ", msg: "took" },
    payment: { id: "pay-lp", action: "支払い", msg: "paid" },
    loss: { id: "loss-lp", action: "喪失", msg: "lost" },
  }[type];

  return {
    id: `${labels.id}-${target}-${amount}`,
    summary: `${targetJa}のLP${labels.action}`,
    description: `${targetJa}に${amount}の${labels.action}が発生します`,
    notificationLevel: "info",
    action: (state: GameState): GameStateUpdateResult => {
      const updatedState: GameState = {
        ...state,
        lp: { ...state.lp, [target]: state.lp[target] + amount * sign },
      };

      return {
        success: true,
        updatedState,
        message: `${targetEn} ${labels.msg} ${amount} LP`,
      };
    },
  };
};

/** ライフポイントを増加させるステップ */
export const gainLpStep = (amount: number, target: PlayerType): AtomicStep => {
  return commonLpStep("gain", amount, target);
};

/** ダメージを与えるステップ */
export const damageLpStep = (amount: number, target: PlayerType): AtomicStep => {
  return commonLpStep("damage", amount, target);
};

/** ライフポイントを支払うステップ */
export const payLpStep = (amount: number, target: PlayerType): AtomicStep => {
  return commonLpStep("payment", amount, target);
};

/** ライフポイントを喪失するステップ */
export const lossLpStep = (amount: number, target: PlayerType): AtomicStep => {
  return commonLpStep("loss", amount, target);
};
