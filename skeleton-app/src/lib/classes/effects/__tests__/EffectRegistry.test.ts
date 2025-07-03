import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { EffectRegistry } from "../EffectRegistry";
import { BaseEffect } from "../BaseEffect";
import { EffectType } from "$lib/types/effect";
import type { EffectResult, Effect } from "$lib/types/effect";
import type { DuelState } from "../../DuelState";

// テスト用効果クラス
class TestEffect extends BaseEffect {
  constructor(id: string = "test-effect", cardId: number = 12345) {
    super(id, "テスト効果", EffectType.ACTIVATE, "テスト用の効果", cardId);
  }

  canActivate(): boolean {
    return true;
  }

  execute(): EffectResult {
    return this.createSuccessResult("テスト効果が実行されました");
  }
}

class SecondTestEffect extends BaseEffect {
  constructor() {
    super("second-test", "セカンドテスト効果", EffectType.DRAW, "2番目のテスト効果", 12345);
  }

  canActivate(): boolean {
    return true;
  }

  execute(): EffectResult {
    return this.createSuccessResult("セカンド効果が実行されました");
  }
}

describe("EffectRegistry", () => {
  beforeEach(() => {
    // 各テスト前にレジストリをクリア
    EffectRegistry.clear();
  });

  afterEach(() => {
    // 各テスト後にレジストリをクリア
    EffectRegistry.clear();
  });

  describe("効果の登録と取得", () => {
    it("効果ファクトリを登録できる", () => {
      const factory = () => [new TestEffect()];
      EffectRegistry.register(12345, factory);

      expect(EffectRegistry.hasEffects(12345)).toBe(true);
      expect(EffectRegistry.getRegisteredCardIds()).toContain(12345);
    });

    it("登録した効果を取得できる", () => {
      const factory = () => [new TestEffect("unique-test", 12345)];
      EffectRegistry.register(12345, factory);

      const effects = EffectRegistry.getEffects(12345);
      expect(effects).toHaveLength(1);
      expect(effects[0].id).toBe("unique-test");
      expect(effects[0].name).toBe("テスト効果");
    });

    it("複数の効果を返すファクトリが正常に動作する", () => {
      const factory = () => [new TestEffect("first", 12345), new SecondTestEffect()];
      EffectRegistry.register(12345, factory);

      const effects = EffectRegistry.getEffects(12345);
      expect(effects).toHaveLength(2);
      expect(effects[0].id).toBe("first");
      expect(effects[1].id).toBe("second-test");
    });

    it("存在しないカードIDは空配列を返す", () => {
      const effects = EffectRegistry.getEffects(99999);
      expect(effects).toHaveLength(0);
    });

    it("ファクトリは呼び出し毎に新しいインスタンスを生成する", () => {
      const factory = () => [new TestEffect()];
      EffectRegistry.register(12345, factory);

      const effects1 = EffectRegistry.getEffects(12345);
      const effects2 = EffectRegistry.getEffects(12345);

      expect(effects1[0]).not.toBe(effects2[0]); // 異なるインスタンス
      expect(effects1[0].id).toBe(effects2[0].id); // 同じ設定
    });
  });

  describe("効果の削除と管理", () => {
    it("効果の登録を削除できる", () => {
      const factory = () => [new TestEffect()];
      EffectRegistry.register(12345, factory);

      expect(EffectRegistry.hasEffects(12345)).toBe(true);

      const result = EffectRegistry.unregister(12345);
      expect(result).toBe(true);
      expect(EffectRegistry.hasEffects(12345)).toBe(false);
    });

    it("存在しない効果の削除はfalseを返す", () => {
      const result = EffectRegistry.unregister(99999);
      expect(result).toBe(false);
    });

    it("全ての効果をクリアできる", () => {
      EffectRegistry.register(11111, () => [new TestEffect()]);
      EffectRegistry.register(22222, () => [new TestEffect()]);

      expect(EffectRegistry.getRegisteredCardIds()).toHaveLength(2);

      EffectRegistry.clear();
      expect(EffectRegistry.getRegisteredCardIds()).toHaveLength(0);
    });
  });

  describe("統計とユーティリティ", () => {
    it("統計情報を正しく取得できる", () => {
      EffectRegistry.register(11111, () => [new TestEffect()]);
      EffectRegistry.register(22222, () => [new TestEffect()]);

      const stats = EffectRegistry.getStats();
      expect(stats.totalRegistered).toBe(2);
      expect(stats.cardIds).toEqual(expect.arrayContaining([11111, 22222]));
    });

    it("空の状態で統計を取得できる", () => {
      const stats = EffectRegistry.getStats();
      expect(stats.totalRegistered).toBe(0);
      expect(stats.cardIds).toHaveLength(0);
    });
  });

  describe("エラーハンドリング", () => {
    it("ファクトリがエラーを投げた場合は空配列を返す", () => {
      const errorFactory = () => {
        throw new Error("ファクトリエラー");
      };
      EffectRegistry.register(12345, errorFactory);

      const effects = EffectRegistry.getEffects(12345);
      expect(effects).toHaveLength(0);
    });
  });
});
