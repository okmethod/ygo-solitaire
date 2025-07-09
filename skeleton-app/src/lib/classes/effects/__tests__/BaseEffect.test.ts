import { describe, it, expect, beforeEach } from "vitest";
import { DuelState } from "../../DuelState";
import { BaseEffect } from "../bases/BaseEffect";
import { EffectType } from "$lib/types/effect";
import type { EffectResult } from "$lib/types/effect";

// テスト用の具体的な効果クラス
class TestEffect extends BaseEffect {
  private shouldSucceed: boolean;

  constructor(shouldSucceed: boolean = true) {
    super("test-effect-1", "テスト効果", EffectType.ACTIVATE, "テスト用の効果です", 12345);
    this.shouldSucceed = shouldSucceed;
  }

  canActivate(): boolean {
    return this.shouldSucceed;
  }

  execute(state: DuelState): EffectResult {
    if (!this.shouldSucceed) {
      return this.createErrorResult("テスト用の失敗");
    }

    // テスト用の成功処理（手札を1枚増やす）
    state.hands.push({
      id: 99999,
      name: "テストカード",
      type: "monster",
      description: "テスト用カード",
    });

    return this.createSuccessResult("テスト効果が成功しました", true);
  }
}

describe("BaseEffect", () => {
  let duelState: DuelState;
  let testEffect: TestEffect;

  beforeEach(() => {
    duelState = new DuelState({
      name: "テストデュエル",
      hands: [],
    });
    testEffect = new TestEffect(true);
  });

  describe("基本プロパティ", () => {
    it("効果のプロパティが正しく設定される", () => {
      expect(testEffect.id).toBe("test-effect-1");
      expect(testEffect.name).toBe("テスト効果");
      expect(testEffect.type).toBe(EffectType.ACTIVATE);
      expect(testEffect.description).toBe("テスト用の効果です");
      expect(testEffect.cardId).toBe(12345);
    });
  });

  describe("効果実行", () => {
    it("成功時に正しい結果を返す", () => {
      const result = testEffect.execute(duelState);

      expect(result.success).toBe(true);
      expect(result.message).toBe("テスト効果が成功しました");
      expect(result.stateChanged).toBe(true);
      expect(result.gameEnded).toBe(false);
      expect(duelState.hands).toHaveLength(1);
      expect(duelState.hands[0].name).toBe("テストカード");
    });

    it("失敗時に正しい結果を返す", () => {
      const failEffect = new TestEffect(false);
      const result = failEffect.execute(duelState);

      expect(result.success).toBe(false);
      expect(result.message).toBe("テスト用の失敗");
      expect(result.stateChanged).toBe(false);
      expect(result.gameEnded).toBe(false);
      expect(duelState.hands).toHaveLength(0);
    });
  });

  describe("発動可能性チェック", () => {
    it("発動可能な場合はtrueを返す", () => {
      expect(testEffect.canActivate()).toBe(true);
    });

    it("発動不可能な場合はfalseを返す", () => {
      const failEffect = new TestEffect(false);
      expect(failEffect.canActivate()).toBe(false);
    });
  });

  describe("ヘルパーメソッド", () => {
    it("createSuccessResultが正しい結果を作成する", () => {
      const result = testEffect["createSuccessResult"]("成功メッセージ", true);

      expect(result.success).toBe(true);
      expect(result.message).toBe("成功メッセージ");
      expect(result.stateChanged).toBe(true);
      expect(result.gameEnded).toBe(false);
    });

    it("createErrorResultが正しい結果を作成する", () => {
      const result = testEffect["createErrorResult"]("エラーメッセージ");

      expect(result.success).toBe(false);
      expect(result.message).toBe("エラーメッセージ");
      expect(result.stateChanged).toBe(false);
      expect(result.gameEnded).toBe(false);
    });
  });
});
