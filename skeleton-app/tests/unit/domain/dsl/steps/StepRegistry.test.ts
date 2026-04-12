/**
 * ステップレジストリのテスト
 */

import { describe, it, expect } from "vitest";
import { buildStep, AtomicStepRegistry } from "$lib/domain/dsl/steps";
import { createStepBuildContext } from "../../../../__testUtils__";

// =============================================================================
// 登録済みステップのテスト
// =============================================================================

describe("StepRegistry - 登録済みステップ", () => {
  it("DRAW ステップを生成できる", () => {
    const step = buildStep("DRAW", { count: 3 }, createStepBuildContext());

    expect(step.id).toBe("draw-3");
    expect(step.summary).toContain("ドロー");
    expect(typeof step.action).toBe("function");
  });

  it("SELECT_AND_DISCARD ステップを生成できる", () => {
    const step = buildStep("SELECT_AND_DISCARD", { count: 2 }, createStepBuildContext());

    expect(step.id).toBe("select-and-discard-2-any-cards");
    expect(step.summary).toContain("捨てる");
    expect(typeof step.action).toBe("function");
  });

  it("FILL_HANDS ステップを生成できる", () => {
    const step = buildStep("FILL_HANDS", { count: 5 }, createStepBuildContext());

    expect(step.id).toBe("fill-hands-5");
    expect(typeof step.action).toBe("function");
  });

  it("THEN ステップを生成できる", () => {
    const step = buildStep("THEN", {}, createStepBuildContext());

    expect(step.id).toBe("then-marker");
    expect(step.notificationLevel).toBe("silent");
  });

  it("GAIN_LP ステップを生成できる", () => {
    const step = buildStep("GAIN_LP", { amount: 1000, target: "opponent" }, createStepBuildContext());

    expect(step.id).toContain("gain-lp");
    expect(typeof step.action).toBe("function");
  });
});

// =============================================================================
// エラーケースのテスト
// =============================================================================

describe("StepRegistry - エラーケース", () => {
  it("未登録ステップでエラーをスローする", () => {
    expect(() => {
      // @ts-expect-error - 意図的に未知のステップ名を使用
      buildStep("UNKNOWN_STEP", {}, createStepBuildContext());
    }).toThrow('Unknown step "UNKNOWN_STEP"');
  });

  it("DRAW ステップで count が無い場合エラー", () => {
    expect(() => {
      buildStep("DRAW", {}, createStepBuildContext());
    }).toThrow("Argument 'count' must be a positive integer");
  });

  it("DRAW ステップで count が0以下の場合エラー", () => {
    expect(() => {
      buildStep("DRAW", { count: 0 }, createStepBuildContext());
    }).toThrow("Argument 'count' must be a positive integer");
  });

  it("SELECT_AND_DISCARD ステップで count が無い場合エラー", () => {
    expect(() => {
      buildStep("SELECT_AND_DISCARD", {}, createStepBuildContext());
    }).toThrow("Argument 'count' must be a positive integer");
  });

  it("GAIN_LP ステップで amount が無い場合エラー", () => {
    expect(() => {
      buildStep("GAIN_LP", { target: "player" }, createStepBuildContext());
    }).toThrow("Argument 'amount' must be a positive integer");
  });

  it("GAIN_LP ステップで target が無効な場合エラー", () => {
    expect(() => {
      buildStep("GAIN_LP", { amount: 1000, target: "invalid" }, createStepBuildContext());
    }).toThrow('Argument \'target\' must be "player" or "opponent"');
  });
});

// =============================================================================
// ユーティリティのテスト
// =============================================================================

describe("StepRegistry - ユーティリティ", () => {
  it("getRegisteredNames で登録済みステップ名一覧を取得できる", () => {
    const names = AtomicStepRegistry.getRegisteredNames();

    expect(names).toContain("DRAW");
    expect(names).toContain("SELECT_AND_DISCARD");
    expect(names).toContain("FILL_HANDS");
    expect(names).toContain("THEN");
    expect(names).toContain("GAIN_LP");
  });

  it("isRegistered で登録状態をチェックできる", () => {
    expect(AtomicStepRegistry.isRegistered("DRAW")).toBe(true);
    // @ts-expect-error - 意図的に未知のステップ名を使用
    expect(AtomicStepRegistry.isRegistered("UNKNOWN")).toBe(false);
  });
});
