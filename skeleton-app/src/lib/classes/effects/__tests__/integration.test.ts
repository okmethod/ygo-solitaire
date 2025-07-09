import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DuelState } from "$lib/classes/DuelState";
import { EffectRepository } from "../EffectRepository";
import { PotOfGreedEffect } from "../cards/magic/normal/PotOfGreedEffect";
import { CardEffectRegistrar } from "../CardEffectRegistrar";
import type { DeckRecipe } from "$lib/types/deck";

describe("Effects Integration", () => {
  let duelState: DuelState;

  beforeEach(() => {
    EffectRepository.clear();
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
    EffectRepository.clear();
  });

  describe("CardEffectRegistrar統合", () => {
    it("デッキレシピから効果を登録できる", () => {
      const testDeck: DeckRecipe = {
        name: "テストデッキ",
        description: "テスト用デッキ",
        category: "テスト",
        mainDeck: [
          { id: 55144522, quantity: 1, effectClass: "PotOfGreedEffect" }, // 強欲な壺
          { id: 12345, quantity: 1 }, // 効果のないカード
        ],
        extraDeck: [],
      };

      CardEffectRegistrar.registerEffectsFromDeck(testDeck);

      const stats = EffectRepository.getStats();
      expect(stats.totalRegistered).toBe(1); // 強欲な壺のみ
      expect(stats.cardIds).toContain(55144522);
    });

    it("効果のないカードは登録されない", () => {
      const testDeck: DeckRecipe = {
        name: "効果なしデッキ",
        description: "効果のないカードのみのデッキ",
        category: "テスト",
        mainDeck: [
          { id: 12345, quantity: 1 }, // 効果のないカード
          { id: 67890, quantity: 1 }, // 効果のないカード
        ],
        extraDeck: [],
      };

      CardEffectRegistrar.registerEffectsFromDeck(testDeck);

      const stats = EffectRepository.getStats();
      expect(stats.totalRegistered).toBe(0);
    });

    it("効果クラス指定で正確な効果が登録される", () => {
      const testDeck: DeckRecipe = {
        name: "効果クラステストデッキ",
        description: "効果クラス指定テスト用",
        category: "テスト",
        mainDeck: [
          { id: 55144522, quantity: 3, effectClass: "PotOfGreedEffect" }, // 強欲な壺
        ],
        extraDeck: [],
      };

      CardEffectRegistrar.registerEffectsFromDeck(testDeck);

      const effects = EffectRepository.getEffects(55144522);
      expect(effects).toHaveLength(1);
      expect(effects[0]).toBeInstanceOf(PotOfGreedEffect);
      expect(effects[0].name).toBe("強欲な壺");
    });

    it("強欲な壺の効果が正しく登録される", () => {
      const testDeck: DeckRecipe = {
        name: "強欲な壺テストデッキ",
        description: "強欲な壺テスト用",
        category: "テスト",
        mainDeck: [
          { id: 55144522, quantity: 1, effectClass: "PotOfGreedEffect" }, // 強欲な壺
        ],
        extraDeck: [],
      };

      CardEffectRegistrar.registerEffectsFromDeck(testDeck);

      const effects = EffectRepository.getEffects(55144522);
      expect(effects).toHaveLength(1);
      expect(effects[0]).toBeInstanceOf(PotOfGreedEffect);
      expect(effects[0].name).toBe("強欲な壺");
    });

    it("登録確認機能が正常に動作する", () => {
      const testDeck: DeckRecipe = {
        name: "登録確認テストデッキ",
        description: "登録確認テスト用",
        category: "テスト",
        mainDeck: [
          { id: 55144522, quantity: 1, effectClass: "PotOfGreedEffect" }, // 強欲な壺
        ],
        extraDeck: [],
      };

      CardEffectRegistrar.registerEffectsFromDeck(testDeck);

      const registration = CardEffectRegistrar.checkRegistration(55144522);
      expect(registration.isRegistered).toBe(true);
      expect(registration.effectCount).toBe(1);
      expect(registration.effectNames).toContain("強欲な壺");
    });

    it("登録サマリが正しく取得できる", () => {
      const testDeck: DeckRecipe = {
        name: "サマリテストデッキ",
        description: "サマリテスト用",
        category: "テスト",
        mainDeck: [
          { id: 55144522, quantity: 1, effectClass: "PotOfGreedEffect" }, // 強欲な壺
        ],
        extraDeck: [],
      };

      CardEffectRegistrar.registerEffectsFromDeck(testDeck);

      const summary = CardEffectRegistrar.getRegistrationSummary();
      expect(summary.totalCards).toBeGreaterThan(0);

      const potOfGreedRegistration = summary.registeredCards.find((card) => card.cardId === 55144522);
      expect(potOfGreedRegistration).toBeDefined();
      expect(potOfGreedRegistration?.effectNames).toContain("強欲な壺");
    });

    it("動的に効果クラスを登録できる", () => {
      // カスタムテスト効果クラス
      class TestCustomEffect extends PotOfGreedEffect {
        constructor() {
          super();
          // name プロパティは読み取り専用なので、テストでは既存の名前を使用
        }
      }

      // 動的に効果クラスを登録
      CardEffectRegistrar.registerEffectClass("TestCustomEffect", TestCustomEffect);

      const testDeck: DeckRecipe = {
        name: "動的効果テストデッキ",
        description: "動的効果テスト用",
        category: "テスト",
        mainDeck: [
          { id: 99999, quantity: 1, effectClass: "TestCustomEffect" }, // カスタム効果
        ],
        extraDeck: [],
      };

      CardEffectRegistrar.registerEffectsFromDeck(testDeck);

      const effects = EffectRepository.getEffects(99999);
      expect(effects).toHaveLength(1);
      expect(effects[0].name).toBe("強欲な壺"); // name プロパティは読み取り専用なので、元の名前のまま
    });
  });

  describe("DuelStateとの統合", () => {
    beforeEach(() => {
      const testDeck: DeckRecipe = {
        name: "DuelState統合テストデッキ",
        description: "DuelState統合テスト用",
        category: "テスト",
        mainDeck: [
          { id: 55144522, quantity: 1, effectClass: "PotOfGreedEffect" }, // 強欲な壺
        ],
        extraDeck: [],
      };
      CardEffectRegistrar.registerEffectsFromDeck(testDeck);
    });

    it("DuelStateから強欲な壺の効果を取得できる", () => {
      const effects = duelState.getEffectsForCard(55144522);
      expect(effects).toHaveLength(1);
      expect(effects[0].name).toBe("強欲な壺");
    });

    it("DuelStateでデッキレシピから効果を登録できる", () => {
      const testDeck: DeckRecipe = {
        name: "統合テストデッキ",
        description: "DuelState統合テスト用",
        category: "テスト",
        mainDeck: [
          { id: 55144522, quantity: 1, effectClass: "PotOfGreedEffect" }, // 強欲な壺
        ],
        extraDeck: [],
      };

      // 既存の効果をクリアして新しいデッキから登録
      duelState.registerEffectsFromDeckRecipe(testDeck);

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
      expect(EffectRepository.hasEffects(55144522)).toBe(true);

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
