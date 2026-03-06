/**
 * lifePoints.ts - LP操作系ステップビルダー
 *
 * StepBuilder:
 * - gainLpStepBuilder: ライフポイント回復
 * - payLpStepBuilder: ライフポイント支払い（コスト）
 */

import type { GameSnapshot, Player } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilder } from "../AtomicStepRegistry";

type LpOperationType = "gain" | "damage" | "payment" | "loss";

// LP操作ステップの共通ヘルパー
const commonLpStep = (type: LpOperationType, amount: number, target: Player): AtomicStep => {
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
    action: (state: GameSnapshot): GameStateUpdateResult => {
      const updatedState: GameSnapshot = {
        ...state,
        lp: { ...state.lp, [target]: state.lp[target] + amount * sign },
      };
      return GameProcessing.Result.success(updatedState, `${targetEn} ${labels.msg} ${amount} LP`);
    },
  };
};

/** ライフポイントを増加させるステップ */
export const gainLpStep = (amount: number, target: Player): AtomicStep => {
  return commonLpStep("gain", amount, target);
};

/** ダメージを与えるステップ */
export const damageLpStep = (amount: number, target: Player): AtomicStep => {
  return commonLpStep("damage", amount, target);
};

/** ライフポイントを支払うステップ */
export const payLpStep = (amount: number, target: Player): AtomicStep => {
  return commonLpStep("payment", amount, target);
};

/** ライフポイントを喪失するステップ */
export const lossLpStep = (amount: number, target: Player): AtomicStep => {
  return commonLpStep("loss", amount, target);
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * GAIN_LP - ライフポイント回復
 * args: { amount: number, target?: "player" | "opponent" }
 */
export const gainLpStepBuilder: StepBuilder = (args) => {
  const amount = args.amount as number;
  const target = (args.target as Player) ?? "player";
  if (typeof amount !== "number" || amount < 1) {
    throw new Error("GAIN_LP step requires a positive amount argument");
  }
  if (target !== "player" && target !== "opponent") {
    throw new Error('GAIN_LP step requires target to be "player" or "opponent"');
  }
  return gainLpStep(amount, target);
};

/**
 * PAY_LP - ライフポイント支払い（コスト）
 * args: { amount: number, target?: "player" | "opponent" }
 */
export const payLpStepBuilder: StepBuilder = (args) => {
  const amount = args.amount as number;
  const target = (args.target as Player) ?? "player";
  if (typeof amount !== "number" || amount < 1) {
    throw new Error("PAY_LP step requires a positive amount argument");
  }
  if (target !== "player" && target !== "opponent") {
    throw new Error('PAY_LP step requires target to be "player" or "opponent"');
  }
  return payLpStep(amount, target);
};
