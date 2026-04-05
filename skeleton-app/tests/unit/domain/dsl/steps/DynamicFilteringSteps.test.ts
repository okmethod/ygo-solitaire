import { describe, it, expect } from "vitest";
import {
  isDynamicLevelRef,
  resolveDynamicLevelFromContext,
  resolveDynamicLevelFromState,
} from "$lib/domain/dsl/steps/primitives/dynamicFiltering";
import type { EffectId } from "$lib/domain/models/Effect";
import type { EffectActivationContext } from "$lib/domain/models/GameState/ActivationContext";
import { createMockGameState } from "../../../../__testUtils__";

/**
 * DynamicFiltering Tests - 動的フィルタリングユーティリティのテスト
 *
 * TEST STRATEGY:
 * - isDynamicLevelRef が動的参照を正しく判定すること
 * - resolveDynamicLevelFromContext がコンテキストから値を解決すること
 * - resolveDynamicLevelFromState がステートから値を解決すること
 */

// EffectId constants for testing
const EFFECT_ID_1 = "effect-1" as EffectId;
const EFFECT_ID_2 = "effect-2" as EffectId;
const EFFECT_ID_3 = "effect-3" as EffectId;
const EFFECT_ID_123 = "effect-123" as EffectId;
const EFFECT_NONEXISTENT = "nonexistent-effect" as EffectId;

// =============================================================================
// isDynamicLevelRef のテスト
// =============================================================================

describe("isDynamicLevelRef", () => {
  it('"paidCosts" は動的参照として判定される', () => {
    expect(isDynamicLevelRef("paidCosts")).toBe(true);
  });

  it("数値は動的参照ではない", () => {
    expect(isDynamicLevelRef(3)).toBe(false);
    expect(isDynamicLevelRef(0)).toBe(false);
    expect(isDynamicLevelRef(-1)).toBe(false);
  });

  it("他の文字列は動的参照ではない", () => {
    expect(isDynamicLevelRef("level")).toBe(false);
    expect(isDynamicLevelRef("cost")).toBe(false);
    expect(isDynamicLevelRef("")).toBe(false);
  });

  it("null/undefined は動的参照ではない", () => {
    expect(isDynamicLevelRef(null)).toBe(false);
    expect(isDynamicLevelRef(undefined)).toBe(false);
  });

  it("オブジェクト/配列は動的参照ではない", () => {
    expect(isDynamicLevelRef({})).toBe(false);
    expect(isDynamicLevelRef([])).toBe(false);
  });
});

// =============================================================================
// resolveDynamicLevelFromContext のテスト
// =============================================================================

describe("resolveDynamicLevelFromContext", () => {
  it("paidCosts がコンテキストにある場合、その値を返す", () => {
    const context: EffectActivationContext = {
      targets: [],
      paidCosts: 3,
    };

    const result = resolveDynamicLevelFromContext("paidCosts", context);
    expect(result).toBe(3);
  });

  it("paidCosts が 0 の場合も正しく返す", () => {
    const context: EffectActivationContext = {
      targets: [],
      paidCosts: 0,
    };

    const result = resolveDynamicLevelFromContext("paidCosts", context);
    expect(result).toBe(0);
  });

  it("paidCosts がコンテキストにない場合、undefined を返す", () => {
    const context: EffectActivationContext = {
      targets: [],
      // paidCosts is not set
    };

    const result = resolveDynamicLevelFromContext("paidCosts", context);
    expect(result).toBeUndefined();
  });

  it("コンテキストが undefined の場合、undefined を返す", () => {
    const result = resolveDynamicLevelFromContext("paidCosts", undefined);
    expect(result).toBeUndefined();
  });
});

// =============================================================================
// resolveDynamicLevelFromState のテスト
// =============================================================================

describe("resolveDynamicLevelFromState", () => {
  it("effectId でコンテキストを取得し、paidCosts の値を返す", () => {
    const contexts: Record<EffectId, EffectActivationContext> = {
      [EFFECT_ID_123]: {
        targets: [],
        paidCosts: 5,
      },
    };
    const state = createMockGameState({
      activationContexts: contexts,
    });

    const result = resolveDynamicLevelFromState("paidCosts", state, EFFECT_ID_123);
    expect(result).toBe(5);
  });

  it("effectId が undefined の場合、undefined を返す", () => {
    const contexts: Record<EffectId, EffectActivationContext> = {
      [EFFECT_ID_123]: {
        targets: [],
        paidCosts: 5,
      },
    };
    const state = createMockGameState({
      activationContexts: contexts,
    });

    const result = resolveDynamicLevelFromState("paidCosts", state, undefined);
    expect(result).toBeUndefined();
  });

  it("effectId に対応するコンテキストがない場合、undefined を返す", () => {
    const state = createMockGameState({
      activationContexts: {},
    });

    const result = resolveDynamicLevelFromState("paidCosts", state, EFFECT_NONEXISTENT);
    expect(result).toBeUndefined();
  });

  it("コンテキストに paidCosts がない場合、undefined を返す", () => {
    const contexts: Record<EffectId, EffectActivationContext> = {
      [EFFECT_ID_123]: {
        targets: [],
        // paidCosts is not set
      },
    };
    const state = createMockGameState({
      activationContexts: contexts,
    });

    const result = resolveDynamicLevelFromState("paidCosts", state, EFFECT_ID_123);
    expect(result).toBeUndefined();
  });

  it("複数のコンテキストがある場合、正しい effectId のものを取得する", () => {
    const contexts: Record<EffectId, EffectActivationContext> = {
      [EFFECT_ID_1]: {
        targets: [],
        paidCosts: 1,
      },
      [EFFECT_ID_2]: {
        targets: [],
        paidCosts: 2,
      },
      [EFFECT_ID_3]: {
        targets: [],
        paidCosts: 3,
      },
    };
    const state = createMockGameState({
      activationContexts: contexts,
    });

    expect(resolveDynamicLevelFromState("paidCosts", state, EFFECT_ID_1)).toBe(1);
    expect(resolveDynamicLevelFromState("paidCosts", state, EFFECT_ID_2)).toBe(2);
    expect(resolveDynamicLevelFromState("paidCosts", state, EFFECT_ID_3)).toBe(3);
  });
});
