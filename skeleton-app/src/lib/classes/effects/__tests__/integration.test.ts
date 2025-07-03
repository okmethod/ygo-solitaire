import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DuelState } from "../../DuelState";
import { EffectRegistry } from "../EffectRegistry";
import { PotOfGreedEffect } from "../cards/PotOfGreedEffect";
import { CardEffectRegistrar } from "../registry/CardEffectRegistrar";

describe("Effects Integration", () => {
  let duelState: DuelState;

  beforeEach(() => {
    EffectRegistry.clear();
    duelState = new DuelState({
      name: "統合テスト",
      mainDeck: [
        { id: 1, name: "カード1", type: "monster", description: "テスト1" },
        { id: 2, name: "カード2", type: "spell", description: "テスト2" },
        { id: 3, name: "カード3", type: "trap", description: "テスト3" },
        { id: 4, name: "カード4", type: "monster", description: "テスト4" },
        { id: 5, name: "カード5", type: "spell", description: "テスト5" },
      ],
      hands: [],
    });
    duelState.currentPhase = "メインフェイズ1";
    duelState.gameResult = "ongoing";
  });

  afterEach(() => {
    EffectRegistry.clear();
  });

  describe("CardEffectRegistrar統合", () => {
    it("全てのカード効果を一括登録できる", () => {
      CardEffectRegistrar.registerAllEffects();

      const stats = EffectRegistry.getStats();
      expect(stats.totalRegistered).toBeGreaterThan(0);
      expect(stats.cardIds).toContain(55144522); // 強欲な壺
    });

    it("強欲な壺の効果が正しく登録される", () => {
      CardEffectRegistrar.registerAllEffects();

      const effects = EffectRegistry.getEffects(55144522);
      expect(effects).toHaveLength(1);
      expect(effects[0]).toBeInstanceOf(PotOfGreedEffect);
      expect(effects[0].name).toBe("強欲な壺");
    });

    it("登録確認機能が正常に動作する", () => {
      CardEffectRegistrar.registerAllEffects();

      const registration = CardEffectRegistrar.checkRegistration(55144522);
      expect(registration.isRegistered).toBe(true);
      expect(registration.effectCount).toBe(1);
      expect(registration.effectNames).toContain("強欲な壺");
    });

    it("登録サマリが正しく取得できる", () => {
      CardEffectRegistrar.registerAllEffects();

      const summary = CardEffectRegistrar.getRegistrationSummary();
      expect(summary.totalCards).toBeGreaterThan(0);

      const potOfGreedRegistration = summary.registeredCards.find((card) => card.cardId === 55144522);
      expect(potOfGreedRegistration).toBeDefined();
      expect(potOfGreedRegistration?.effectNames).toContain("強欲な壺");
    });
  });

  describe("DuelStateとの統合", () => {
    beforeEach(() => {
      CardEffectRegistrar.registerAllEffects();
    });

    it("DuelStateから強欲な壺の効果を取得できる", () => {
      const effects = duelState.getEffectsForCard(55144522);
      expect(effects).toHaveLength(1);
      expect(effects[0].name).toBe("強欲な壺");
    });

    it("DuelStateから強欲な壺の効果を実行できる", () => {
      const initialHandSize = duelState.hands.length;
      const result = duelState.executeCardEffect(55144522);

      expect(result.success).toBe(true);
      expect(result.message).toBe("2枚ドローしました");
      expect(duelState.hands.length).toBe(initialHandSize + 2);
    });

    it("存在しないカードの効果実行は失敗する", () => {
      const result = duelState.executeCardEffect(99999);

      expect(result.success).toBe(false);
      expect(result.message).toBe("このカードには効果がありません");
    });

    it("フルワークフロー: 登録→取得→実行", () => {
      // 1. 効果が登録されていることを確認
      expect(EffectRegistry.hasEffects(55144522)).toBe(true);

      // 2. DuelStateから効果を取得
      const effects = duelState.getEffectsForCard(55144522);
      expect(effects).toHaveLength(1);

      // 3. 効果を実行
      const initialHandSize = duelState.hands.length;
      const initialDeckSize = duelState.mainDeck.length;

      const result = duelState.executeEffect(effects[0]);

      expect(result.success).toBe(true);
      expect(duelState.hands.length).toBe(initialHandSize + 2);
      expect(duelState.mainDeck.length).toBe(initialDeckSize - 2);
    });
  });
});
