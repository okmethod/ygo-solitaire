import { describe, it, expect, beforeEach } from "vitest";
import { PotOfGreedEffect } from "../PotOfGreedEffect";
import { DuelState } from "../../../DuelState";
import { EffectType } from "$lib/types/effect";

describe("PotOfGreedEffect", () => {
  let duelState: DuelState;
  let potOfGreed: PotOfGreedEffect;

  beforeEach(() => {
    duelState = new DuelState({
      name: "強欲な壺テスト",
      mainDeck: [
        { id: 1, name: "青眼の白龍", type: "monster", description: "攻撃力3000の竜族" },
        { id: 2, name: "ブラックマジシャン", type: "monster", description: "攻撃力2500の魔法使い族" },
        { id: 3, name: "死者蘇生", type: "spell", description: "モンスター蘇生" },
        { id: 4, name: "聖なるバリア", type: "trap", description: "攻撃無効化" },
        { id: 5, name: "サンダーボルト", type: "spell", description: "全体除去" },
      ],
      hands: [],
    });

    // 現在のフェイズとゲーム結果を設定
    duelState.currentPhase = "メインフェイズ1";
    duelState.gameResult = "ongoing";

    potOfGreed = new PotOfGreedEffect();
  });

  describe("基本プロパティ", () => {
    it("強欲な壺のプロパティが正しく設定される", () => {
      expect(potOfGreed.id).toBe("pot-of-greed-55144522");
      expect(potOfGreed.name).toBe("強欲な壺");
      expect(potOfGreed.type).toBe(EffectType.DRAW);
      expect(potOfGreed.description).toBe("自分はデッキから２枚ドローする");
      expect(potOfGreed.cardId).toBe(55144522);
      expect(potOfGreed.getDrawCount()).toBe(2);
    });
  });

  describe("発動条件", () => {
    it("メインフェイズ1で発動可能", () => {
      duelState.currentPhase = "メインフェイズ1";
      expect(potOfGreed.canActivate(duelState)).toBe(true);
    });

    it("メインフェイズ2で発動可能", () => {
      duelState.currentPhase = "メインフェイズ2";
      expect(potOfGreed.canActivate(duelState)).toBe(true);
    });

    it("バトルフェイズでは発動不可", () => {
      duelState.currentPhase = "バトルフェイズ";
      expect(potOfGreed.canActivate(duelState)).toBe(false);
    });

    it("エンドフェイズでは発動不可", () => {
      duelState.currentPhase = "エンドフェイズ";
      expect(potOfGreed.canActivate(duelState)).toBe(false);
    });

    it("ドローフェイズでは発動不可", () => {
      duelState.currentPhase = "ドローフェイズ";
      expect(potOfGreed.canActivate(duelState)).toBe(false);
    });

    it("ゲーム終了時は発動不可", () => {
      duelState.gameResult = "win";
      expect(potOfGreed.canActivate(duelState)).toBe(false);
    });

    it("デッキが2枚未満の場合は発動不可", () => {
      duelState.mainDeck = [{ id: 1, name: "カード1", type: "monster", description: "テスト" }];
      expect(potOfGreed.canActivate(duelState)).toBe(false);
    });

    it("デッキが空の場合は発動不可", () => {
      duelState.mainDeck = [];
      expect(potOfGreed.canActivate(duelState)).toBe(false);
    });
  });

  describe("効果実行", () => {
    it("2枚ドロー効果が正常に動作する", () => {
      const initialHandSize = duelState.hands.length;
      const initialDeckSize = duelState.mainDeck.length;

      // デッキの上2枚を記録
      const topTwoCards = duelState.mainDeck.slice(-2);

      const result = potOfGreed.execute(duelState);

      expect(result.success).toBe(true);
      expect(result.message).toBe("2枚ドローしました");
      expect(result.stateChanged).toBe(true);
      expect(result.drawnCards).toHaveLength(2);

      // 手札とデッキの枚数確認
      expect(duelState.hands.length).toBe(initialHandSize + 2);
      expect(duelState.mainDeck.length).toBe(initialDeckSize - 2);

      // ドローしたカードが正しく手札に追加されているか確認
      const lastTwoHands = duelState.hands.slice(-2);
      expect(lastTwoHands).toEqual(topTwoCards.reverse());
    });

    it("発動条件を満たさない場合は失敗する", () => {
      duelState.currentPhase = "バトルフェイズ";

      const result = duelState.executeEffect(potOfGreed);

      expect(result.success).toBe(false);
      expect(result.message).toContain("強欲な壺は発動できません");
      expect(result.stateChanged).toBe(false);
    });

    it("デッキ不足の場合は適切なエラーメッセージを返す", () => {
      duelState.mainDeck = [{ id: 1, name: "カード1", type: "monster", description: "テスト" }];

      const result = potOfGreed.execute(duelState);

      expect(result.success).toBe(false);
      expect(result.message).toContain("デッキに2枚のカードがありません");
      expect(result.message).toContain("残り1枚");
    });

    it("効果実行後にゲーム状態が正常に保たれる", () => {
      const result = potOfGreed.execute(duelState);

      expect(result.success).toBe(true);
      expect(duelState.gameResult).toBe("ongoing");
      expect(duelState.currentPhase).toBe("メインフェイズ1");

      // ドローしたカードがすべて有効なカードオブジェクトであることを確認
      const drawnCards = result.affectedCards || [];
      drawnCards.forEach((card) => {
        expect(card).toHaveProperty("id");
        expect(card).toHaveProperty("name");
        expect(card).toHaveProperty("type");
        expect(card).toHaveProperty("description");
      });
    });
  });

  describe("複数回実行", () => {
    it("複数回実行しても正常に動作する", () => {
      // 1回目
      const result1 = potOfGreed.execute(duelState);
      expect(result1.success).toBe(true);
      expect(duelState.hands.length).toBe(2);
      expect(duelState.mainDeck.length).toBe(3);

      // 2回目（まだ3枚残っているので実行可能）
      const result2 = potOfGreed.execute(duelState);
      expect(result2.success).toBe(true);
      expect(duelState.hands.length).toBe(4);
      expect(duelState.mainDeck.length).toBe(1);

      // 3回目（1枚しか残っていないので失敗）
      const result3 = potOfGreed.execute(duelState);
      expect(result3.success).toBe(false);
      expect(duelState.hands.length).toBe(4); // 変化なし
      expect(duelState.mainDeck.length).toBe(1); // 変化なし
    });
  });
});
