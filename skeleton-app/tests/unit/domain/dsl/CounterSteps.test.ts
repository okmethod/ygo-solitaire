import { describe, it, expect } from "vitest";
import {
  buildStep,
  getRegisteredStepNames,
  isStepRegistered,
  type StepBuildContext,
} from "$lib/domain/dsl/registries/StepRegistry";

/**
 * CounterSteps Tests - カウンター関連ステップのテスト
 *
 * TEST STRATEGY:
 * - PLACE_COUNTER ステップが正しく生成されること
 * - REMOVE_COUNTER ステップが正しく生成されること
 * - 引数バリデーションが正しく行われること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

const createTestContext = (cardId: number = 70791313): StepBuildContext => ({
  cardId,
  sourceInstanceId: "test-instance-id",
});

// =============================================================================
// PLACE_COUNTER ステップのテスト
// =============================================================================

describe("StepRegistry - PLACE_COUNTER", () => {
  it("PLACE_COUNTER ステップを生成できる", () => {
    const step = buildStep(
      "PLACE_COUNTER",
      {
        counterType: "spell",
        count: 1,
        limit: 3,
      },
      createTestContext(),
    );

    expect(step.id).toContain("counter");
    expect(step.summary).toContain("カウンター");
    expect(typeof step.action).toBe("function");
  });

  it("PLACE_COUNTER ステップで counterType が無い場合エラー", () => {
    expect(() => {
      buildStep("PLACE_COUNTER", { count: 1 }, createTestContext());
    }).toThrow("PLACE_COUNTER step requires counterType argument");
  });

  it("PLACE_COUNTER ステップで count が無い場合エラー", () => {
    expect(() => {
      buildStep("PLACE_COUNTER", { counterType: "spell" }, createTestContext());
    }).toThrow("PLACE_COUNTER step requires a positive count argument");
  });

  it("PLACE_COUNTER ステップで limit なしでも生成できる", () => {
    const step = buildStep(
      "PLACE_COUNTER",
      {
        counterType: "spell",
        count: 1,
      },
      createTestContext(),
    );

    expect(step.id).toContain("counter");
    expect(typeof step.action).toBe("function");
  });

  it("isStepRegistered で PLACE_COUNTER が登録済みであることを確認できる", () => {
    expect(isStepRegistered("PLACE_COUNTER")).toBe(true);
  });

  it("getRegisteredStepNames に PLACE_COUNTER が含まれる", () => {
    const names = getRegisteredStepNames();
    expect(names).toContain("PLACE_COUNTER");
  });
});

// =============================================================================
// REMOVE_COUNTER ステップのテスト
// =============================================================================

describe("StepRegistry - REMOVE_COUNTER", () => {
  it("REMOVE_COUNTER ステップを生成できる", () => {
    const step = buildStep(
      "REMOVE_COUNTER",
      {
        counterType: "spell",
        count: 3,
      },
      createTestContext(),
    );

    expect(step.id).toContain("counter");
    expect(step.summary).toContain("カウンター");
    expect(typeof step.action).toBe("function");
  });

  it("REMOVE_COUNTER ステップで counterType が無い場合エラー", () => {
    expect(() => {
      buildStep("REMOVE_COUNTER", { count: 3 }, createTestContext());
    }).toThrow("REMOVE_COUNTER step requires counterType argument");
  });

  it("REMOVE_COUNTER ステップで count が無い場合エラー", () => {
    expect(() => {
      buildStep("REMOVE_COUNTER", { counterType: "spell" }, createTestContext());
    }).toThrow("REMOVE_COUNTER step requires a positive count argument");
  });

  it("isStepRegistered で REMOVE_COUNTER が登録済みであることを確認できる", () => {
    expect(isStepRegistered("REMOVE_COUNTER")).toBe(true);
  });

  it("getRegisteredStepNames に REMOVE_COUNTER が含まれる", () => {
    const names = getRegisteredStepNames();
    expect(names).toContain("REMOVE_COUNTER");
  });
});

// =============================================================================
// HAS_COUNTER 条件のテスト（ConditionRegistry用）
// =============================================================================

// Note: HAS_COUNTER 条件のテストは ConditionRegistry.test.ts または
// 新規 CounterConditions.test.ts で行う
