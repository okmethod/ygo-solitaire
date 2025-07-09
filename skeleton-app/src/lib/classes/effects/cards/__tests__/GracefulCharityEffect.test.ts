import { describe, it, expect, beforeEach } from "vitest";
import { DuelState } from "$lib/classes/DuelState";
import { GracefulCharityEffect } from "$lib/classes/effects/cards/GracefulCharityEffect";
import { EffectType } from "$lib/types/effect";

describe("GracefulCharityEffect", () => {
  let duelState: DuelState;
  let gracefulCharityEffect: GracefulCharityEffect;

  beforeEach(() => {
    duelState = new DuelState({
      name: "天使の施しテストデュエル",
      mainDeck: [
        { id: 1, name: "カード1", type: "monster", description: "テストカード1" },
        { id: 2, name: "カード2", type: "spell", description: "テストカード2" },
        { id: 3, name: "カード3", type: "trap", description: "テストカード3" },
        { id: 4, name: "カード4", type: "monster", description: "テストカード4" },
        { id: 5, name: "カード5", type: "spell", description: "テストカード5" },
        { id: 6, name: "カード6", type: "monster", description: "テストカード6" },
      ],
      hands: [
        { id: 10, name: "手札1", type: "monster", description: "手札のカード1" },
        { id: 11, name: "手札2", type: "spell", description: "手札のカード2" },
      ],
    });
    duelState.currentPhase = "メインフェイズ1";
    duelState.gameResult = "ongoing";

    gracefulCharityEffect = new GracefulCharityEffect();
  });

  describe("基本情報", () => {
    it("正しい効果情報を持つ", () => {
      expect(gracefulCharityEffect.id).toBe("graceful-charity");
      expect(gracefulCharityEffect.name).toBe("天使の施し");
      expect(gracefulCharityEffect.type).toBe(EffectType.ACTIVATE);
      expect(gracefulCharityEffect.cardId).toBe(79571449);
      expect(gracefulCharityEffect.description).toBe("デッキから3枚ドローし、その後手札から2枚捨てる");
    });

    it("組み込まれている効果が正しい", () => {
      // 効果の実行結果から組み込まれた効果を検証
      const result = gracefulCharityEffect.execute(duelState);
      expect(result.success).toBe(true);
      expect(result.message).toContain("3枚ドロー → 2枚捨てる");
    });
  });

  describe("発動条件", () => {
    it("正常な状態では発動可能", () => {
      expect(gracefulCharityEffect.canActivate(duelState)).toBe(true);
    });

    it("デッキが3枚未満では発動不可", () => {
      duelState.mainDeck = [
        { id: 1, name: "カード1", type: "monster", description: "テストカード1" },
        { id: 2, name: "カード2", type: "spell", description: "テストカード2" },
      ]; // 2枚のみ

      expect(gracefulCharityEffect.canActivate(duelState)).toBe(false);
    });

    it("ゲーム終了時は発動不可", () => {
      duelState.gameResult = "win";
      expect(gracefulCharityEffect.canActivate(duelState)).toBe(false);
    });

    it("不適切なフェイズでは発動不可", () => {
      duelState.currentPhase = "バトルフェイズ";
      expect(gracefulCharityEffect.canActivate(duelState)).toBe(false);
    });

    it("手札0枚でもドロー後に2枚捨てられるため発動可能", () => {
      duelState.hands = []; // 手札なし
      // 0 + 3 = 3枚 → 2枚捨てる可能
      expect(gracefulCharityEffect.canActivate(duelState)).toBe(true);
    });

    it("手札1枚でもドロー後に2枚捨てられるため発動可能", () => {
      duelState.hands = [{ id: 10, name: "手札1", type: "monster", description: "手札のカード1" }];
      // 1 + 3 = 4枚 → 2枚捨てる可能
      expect(gracefulCharityEffect.canActivate(duelState)).toBe(true);
    });
  });

  describe("効果実行", () => {
    it("正常に3枚ドロー→2枚捨てが実行される", () => {
      const initialHandSize = duelState.hands.length; // 2枚
      const initialDeckSize = duelState.mainDeck.length; // 6枚
      const initialGraveyardSize = duelState.graveyard.length; // 0枚

      const result = gracefulCharityEffect.execute(duelState);

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);
      expect(result.message).toContain("3枚ドロー → 2枚捨てる");

      // 手札: 2 + 3 - 2 = 3枚
      expect(duelState.hands.length).toBe(initialHandSize + 3 - 2);

      // デッキ: 6 - 3 = 3枚
      expect(duelState.mainDeck.length).toBe(initialDeckSize - 3);

      // 墓地: 0 + 2 = 2枚
      expect(duelState.graveyard.length).toBe(initialGraveyardSize + 2);
    });

    it("ドローしたカードが結果に含まれる", () => {
      const result = gracefulCharityEffect.execute(duelState);

      expect(result.success).toBe(true);
      expect(result.drawnCards).toBeDefined();
      expect(result.drawnCards).toHaveLength(3);

      // ドローしたカードの存在確認
      expect(result.drawnCards!.every((card) => card.id && card.name)).toBe(true);
    });

    it("発動条件を満たさない場合は失敗する", () => {
      duelState.mainDeck = []; // デッキ空

      const result = gracefulCharityEffect.execute(duelState);

      expect(result.success).toBe(false);
      expect(result.message).toContain("効果実行に失敗");
    });

    it("手札が多い場合でも正常に実行される", () => {
      // 手札を10枚に増やす
      for (let i = 20; i < 30; i++) {
        duelState.hands.push({
          id: i,
          name: `追加手札${i}`,
          type: "monster",
          description: `追加カード${i}`,
        });
      }

      const initialHandSize = duelState.hands.length; // 12枚
      const result = gracefulCharityEffect.execute(duelState);

      expect(result.success).toBe(true);

      // 手札: 12 + 3 - 2 = 13枚
      expect(duelState.hands.length).toBe(initialHandSize + 1);
    });

    it("手札0枚でも正常に実行される", () => {
      duelState.hands = []; // 手札なし
      const initialDeckSize = duelState.mainDeck.length; // 6枚
      const initialGraveyardSize = duelState.graveyard.length; // 0枚

      const result = gracefulCharityEffect.execute(duelState);

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);

      // 手札: 0 + 3 - 2 = 1枚
      expect(duelState.hands.length).toBe(1);

      // デッキ: 6 - 3 = 3枚
      expect(duelState.mainDeck.length).toBe(initialDeckSize - 3);

      // 墓地: 0 + 2 = 2枚
      expect(duelState.graveyard.length).toBe(initialGraveyardSize + 2);
    });

    it("手札1枚でも正常に実行される", () => {
      duelState.hands = [{ id: 10, name: "手札1", type: "monster", description: "手札のカード1" }];
      const initialDeckSize = duelState.mainDeck.length; // 6枚
      const initialGraveyardSize = duelState.graveyard.length; // 0枚

      const result = gracefulCharityEffect.execute(duelState);

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);

      // 手札: 1 + 3 - 2 = 2枚
      expect(duelState.hands.length).toBe(2);

      // デッキ: 6 - 3 = 3枚
      expect(duelState.mainDeck.length).toBe(initialDeckSize - 3);

      // 墓地: 0 + 2 = 2枚
      expect(duelState.graveyard.length).toBe(initialGraveyardSize + 2);
    });
  });

  describe("複合効果の動作", () => {
    it("ドロー効果が先に実行される", () => {
      const initialHandSize = duelState.hands.length;

      // ドロー効果のみ実行されるように、途中で処理を確認
      // （実際の実装では効果が順次実行される）
      const result = gracefulCharityEffect.execute(duelState);

      expect(result.success).toBe(true);

      // 最終的な手札枚数が正しいことで、順序正しく実行されたことを確認
      expect(duelState.hands.length).toBe(initialHandSize + 1); // +3 -2 = +1
    });

    it("ドロー効果が失敗した場合、全体が失敗する", () => {
      // デッキを空にしてドロー効果を失敗させる
      duelState.mainDeck = [];

      const result = gracefulCharityEffect.execute(duelState);

      expect(result.success).toBe(false);
      expect(result.message).toContain("効果実行に失敗");
    });
  });

  describe("エラーハンドリング", () => {
    it("ゲーム状態が異常な場合でも適切にエラーを返す", () => {
      duelState.gameResult = "lose";

      const result = gracefulCharityEffect.execute(duelState);

      expect(result.success).toBe(false);
    });

    it("nullまたはundefinedの状態を適切に処理する", () => {
      // 異常な状態をテスト
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      duelState.hands = null as any;

      // エラーが発生しても適切に処理される
      expect(() => {
        gracefulCharityEffect.canActivate(duelState);
      }).toThrow();
    });
  });
});
