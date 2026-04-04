/**
 * lifePoints.ts - LP操作系ステップビルダー
 *
 * StepBuilder:
 * - gainLpStepBuilder: ライフポイント回復
 * - payLpStepBuilder: ライフポイント支払い（コスト）
 */

import type { GameSnapshot, Player } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";

type LpOperationType = "gain" | "damage" | "payment" | "loss";

const clampLp = (lp: number): number => Math.min(99999, Math.max(0, lp));

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
    notificationLevel: "static",
    action: (state: GameSnapshot): GameStateUpdateResult => {
      const newLp = clampLp(state.lp[target] + amount * sign);
      const updatedState: GameSnapshot = {
        ...state,
        lp: { ...state.lp, [target]: newLp },
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
export const gainLpStepBuilder: StepBuilderFn = (args) => {
  const amount = ArgValidators.positiveInt(args, "amount");
  const target = ArgValidators.optionalPlayer(args, "target", "player");
  return gainLpStep(amount, target);
};

/**
 * PAY_LP - ライフポイント支払い（コスト）
 * args: { amount: number, target?: "player" | "opponent" }
 */
export const payLpStepBuilder: StepBuilderFn = (args) => {
  const amount = ArgValidators.positiveInt(args, "amount");
  const target = ArgValidators.optionalPlayer(args, "target", "player");
  return payLpStep(amount, target);
};

/**
 * BURN_DAMAGE - 相手にダメージを与える（効果ダメージ）
 * args: { amount: number, target?: "player" | "opponent" }
 */
export const burnDamageStepBuilder: StepBuilderFn = (args) => {
  const amount = ArgValidators.positiveInt(args, "amount");
  const target = ArgValidators.optionalPlayer(args, "target", "opponent");
  return damageLpStep(amount, target);
};

/**
 * BURN_FROM_CONTEXT - resolutions用: コンテキストからダメージを取得して適用
 * args: { damageTarget?: "player" | "opponent" }
 *
 * activationsでRELEASE_FOR_BURNと組み合わせて使用。
 * ActivationContextに保存されたダメージを取得して適用し、コンテキストをクリア。
 */
export const burnFromContextStepBuilder: StepBuilderFn = (args, context) => {
  const damageTarget = ArgValidators.optionalPlayer(args, "damageTarget", "opponent");

  if (!context.effectId) {
    throw new Error("BURN_FROM_CONTEXT step requires effectId in context");
  }

  const effectId = context.effectId;
  const targetJa = damageTarget === "player" ? "プレイヤー" : "相手";

  return {
    id: `${context.cardId}-burn-from-context`,
    summary: `${targetJa}にダメージ`,
    description: `リリースしたモンスターの攻撃力に基づくダメージを${targetJa}に与えます`,
    notificationLevel: "static",
    action: (state: GameSnapshot): GameStateUpdateResult => {
      const damage = GameState.ActivationContext.getDamage(state.activationContexts, effectId);

      if (damage === undefined) {
        return GameProcessing.Result.failure(state, "No damage value in activation context");
      }

      const updatedLp = {
        ...state.lp,
        [damageTarget]: clampLp(state.lp[damageTarget] - damage),
      };

      // コンテキストをクリア
      const updatedState: GameSnapshot = {
        ...state,
        lp: updatedLp,
        activationContexts: GameState.ActivationContext.clear(state.activationContexts, effectId),
      };

      return GameProcessing.Result.success(updatedState, `Dealt ${damage} damage to ${damageTarget}`);
    },
  };
};
