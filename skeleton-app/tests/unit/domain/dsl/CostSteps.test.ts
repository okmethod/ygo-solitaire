import { describe, it, expect } from "vitest";
import { buildStep, AtomicStepRegistry, type StepBuildContext } from "$lib/domain/effects/steps";

/**
 * CostSteps Tests - コスト関連ステップのテスト
 *
 * TEST STRATEGY:
 * - SEARCH_FROM_DECK ステップが正しく生成されること
 * - SALVAGE_FROM_GRAVEYARD ステップが正しく生成されること
 * - フィルター条件が正しく適用されること
 */

// =============================================================================
// テストヘルパー
// =============================================================================

const createTestContext = (cardId: number = 12345): StepBuildContext => ({
  cardId,
  sourceInstanceId: "test-instance-id",
});

// =============================================================================
// SEARCH_FROM_DECK ステップのテスト
// =============================================================================

describe("StepRegistry - SEARCH_FROM_DECK", () => {
  it("SEARCH_FROM_DECK ステップを生成できる", () => {
    const step = buildStep(
      "SEARCH_FROM_DECK",
      {
        filterType: "spell",
        filterSpellType: "field",
        count: 1,
      },
      createTestContext(),
    );

    expect(step.id).toContain("search-from-deck");
    expect(step.summary).toContain("サーチ");
    expect(typeof step.action).toBe("function");
  });

  it("SEARCH_FROM_DECK ステップで filterType が無い場合エラー", () => {
    expect(() => {
      buildStep("SEARCH_FROM_DECK", { count: 1 }, createTestContext());
    }).toThrow("Argument 'filterType' must be a non-empty string");
  });

  it("SEARCH_FROM_DECK ステップで count が無い場合エラー", () => {
    expect(() => {
      buildStep("SEARCH_FROM_DECK", { filterType: "spell" }, createTestContext());
    }).toThrow("Argument 'count' must be a positive integer");
  });

  it("isRegistered で SEARCH_FROM_DECK が登録済みであることを確認できる", () => {
    expect(AtomicStepRegistry.isRegistered("SEARCH_FROM_DECK")).toBe(true);
  });

  it("getRegisteredNames に SEARCH_FROM_DECK が含まれる", () => {
    const names = AtomicStepRegistry.getRegisteredNames();
    expect(names).toContain("SEARCH_FROM_DECK");
  });
});

// =============================================================================
// SALVAGE_FROM_GRAVEYARD ステップのテスト
// =============================================================================

describe("StepRegistry - SALVAGE_FROM_GRAVEYARD", () => {
  it("SALVAGE_FROM_GRAVEYARD ステップを生成できる", () => {
    const step = buildStep(
      "SALVAGE_FROM_GRAVEYARD",
      {
        filterType: "spell",
        count: 1,
      },
      createTestContext(),
    );

    expect(step.id).toContain("salvage-from-graveyard");
    expect(step.summary).toContain("サルベージ");
    expect(typeof step.action).toBe("function");
  });

  it("SALVAGE_FROM_GRAVEYARD ステップで filterType が無い場合エラー", () => {
    expect(() => {
      buildStep("SALVAGE_FROM_GRAVEYARD", { count: 1 }, createTestContext());
    }).toThrow("Argument 'filterType' must be a non-empty string");
  });

  it("SALVAGE_FROM_GRAVEYARD ステップで count が無い場合エラー", () => {
    expect(() => {
      buildStep("SALVAGE_FROM_GRAVEYARD", { filterType: "spell" }, createTestContext());
    }).toThrow("Argument 'count' must be a positive integer");
  });

  it("isRegistered で SALVAGE_FROM_GRAVEYARD が登録済みであることを確認できる", () => {
    expect(AtomicStepRegistry.isRegistered("SALVAGE_FROM_GRAVEYARD")).toBe(true);
  });

  it("getRegisteredNames に SALVAGE_FROM_GRAVEYARD が含まれる", () => {
    const names = AtomicStepRegistry.getRegisteredNames();
    expect(names).toContain("SALVAGE_FROM_GRAVEYARD");
  });
});
