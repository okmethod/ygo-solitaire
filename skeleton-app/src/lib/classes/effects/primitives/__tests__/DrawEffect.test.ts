import { describe, it, expect, beforeEach } from "vitest";
import { DrawEffect } from "../DrawEffect";
import { DuelState } from "../../../DuelState";
import { EffectType } from "$lib/types/effect";

describe("DrawEffect", () => {
  let duelState: DuelState;
  let drawEffect2: DrawEffect;
  let drawEffect1: DrawEffect;

  beforeEach(() => {
    duelState = new DuelState({
      name: "DrawEffectテスト",
      mainDeck: [
        { id: 1, name: "カード1", type: "monster", description: "テスト1" },
        { id: 2, name: "カード2", type: "spell", description: "テスト2" },
        { id: 3, name: "カード3", type: "trap", description: "テスト3" },
        { id: 4, name: "カード4", type: "monster", description: "テスト4" },
        { id: 5, name: "カード5", type: "spell", description: "テスト5" },
      ],
      hands: [],
    });

    drawEffect2 = new DrawEffect("test-draw-2", "2枚ドロー", "テスト用2枚ドロー効果", 12345, 2);

    drawEffect1 = new DrawEffect("test-draw-1", "1枚ドロー", "テスト用1枚ドロー効果", 12346, 1);
  });

  describe("基本プロパティ", () => {
    it("効果のプロパティが正しく設定される", () => {
      expect(drawEffect2.id).toBe("test-draw-2");
      expect(drawEffect2.name).toBe("2枚ドロー");
      expect(drawEffect2.type).toBe(EffectType.DRAW);
      expect(drawEffect2.description).toBe("テスト用2枚ドロー効果");
      expect(drawEffect2.cardId).toBe(12345);
      expect(drawEffect2.getDrawCount()).toBe(2);
    });

    it("ドロー枚数が正しく設定される", () => {
      expect(drawEffect2.getDrawCount()).toBe(2);
      expect(drawEffect1.getDrawCount()).toBe(1);
    });
  });

  describe("発動可能性判定", () => {
    it("十分なカードがある場合は発動可能", () => {
      expect(drawEffect2.canActivate(duelState)).toBe(true);
      expect(drawEffect1.canActivate(duelState)).toBe(true);
    });

    it("カードが不足している場合は発動不可", () => {
      // デッキを1枚にする
      duelState.mainDeck = [{ id: 1, name: "カード1", type: "monster", description: "テスト1" }];

      expect(drawEffect1.canActivate(duelState)).toBe(true); // 1枚なら可能
      expect(drawEffect2.canActivate(duelState)).toBe(false); // 2枚は不可
    });

    it("デッキが空の場合は発動不可", () => {
      duelState.mainDeck = [];

      expect(drawEffect1.canActivate(duelState)).toBe(false);
      expect(drawEffect2.canActivate(duelState)).toBe(false);
    });
  });

  describe("効果実行", () => {
    it("2枚ドロー効果が正常に動作する", () => {
      const initialHandSize = duelState.hands.length;
      const initialDeckSize = duelState.mainDeck.length;

      const result = drawEffect2.execute(duelState);

      expect(result.success).toBe(true);
      expect(result.message).toBe("2枚ドローしました");
      expect(result.stateChanged).toBe(true);
      expect(result.affectedCards).toHaveLength(2);

      // 手札とデッキの枚数確認
      expect(duelState.hands.length).toBe(initialHandSize + 2);
      expect(duelState.mainDeck.length).toBe(initialDeckSize - 2);
    });

    it("1枚ドロー効果が正常に動作する", () => {
      const initialHandSize = duelState.hands.length;
      const initialDeckSize = duelState.mainDeck.length;

      const result = drawEffect1.execute(duelState);

      expect(result.success).toBe(true);
      expect(result.message).toBe("1枚ドローしました");
      expect(duelState.hands.length).toBe(initialHandSize + 1);
      expect(duelState.mainDeck.length).toBe(initialDeckSize - 1);
    });

    it("ドローしたカードが手札に正しく追加される", () => {
      // デッキの上2枚を記録
      const topCards = duelState.mainDeck.slice(-2);

      const result = drawEffect2.execute(duelState);

      expect(result.success).toBe(true);
      expect(result.affectedCards).toEqual(topCards.reverse()); // drawCardは後ろから取るので逆順

      // 手札の最後の2枚が元デッキの上2枚と一致することを確認
      const lastTwoHands = duelState.hands.slice(-2);
      expect(lastTwoHands).toEqual(topCards);
    });

    it("発動不可能な状態で実行すると失敗する", () => {
      duelState.mainDeck = [{ id: 1, name: "カード1", type: "monster", description: "テスト1" }];

      const result = drawEffect2.execute(duelState);

      expect(result.success).toBe(false);
      expect(result.message).toContain("デッキに2枚のカードがありません");
      expect(result.stateChanged).toBe(false);
    });

    it("デッキが不足している場合は適切なエラーメッセージを返す", () => {
      // デッキを1枚にして2枚ドローを試行
      duelState.mainDeck = [{ id: 1, name: "カード1", type: "monster", description: "テスト1" }];

      const result = drawEffect2.execute(duelState);

      expect(result.success).toBe(false);
      expect(result.message).toContain("デッキに2枚のカードがありません");
      expect(result.message).toContain("残り1枚");
    });
  });

  describe("詳細情報", () => {
    it("効果の詳細情報を正しく取得できる", () => {
      const info = drawEffect2.getDetailInfo();

      expect(info.drawCount).toBe(2);
      expect(info.effectType).toBe("draw");
      expect(info.requiresDecking).toBe(2);
    });
  });
});
