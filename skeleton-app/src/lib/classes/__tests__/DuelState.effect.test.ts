import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DuelState } from "$lib/classes/DuelState";
import { BaseEffect } from "../effects/BaseEffect";
import { EffectRepository } from "../effects/EffectRepository";
import { EffectType } from "$lib/types/effect";
import type { EffectResult } from "$lib/types/effect";

// テスト用効果クラス
class SimpleDrawEffect extends BaseEffect {
  constructor() {
    super("simple-draw", "シンプルドロー", EffectType.DRAW, "1枚ドローする", 55144522);
  }

  canActivate(state: DuelState): boolean {
    return state.mainDeck.length > 0;
  }

  execute(state: DuelState): EffectResult {
    if (state.mainDeck.length === 0) {
      return this.createErrorResult("デッキにカードがありません");
    }

    const drawnCards = state.drawCard(1);
    return this.createSuccessResult(`${drawnCards.length}枚ドローしました`, true, drawnCards);
  }
}

describe("DuelState Effect Integration", () => {
  let duelState: DuelState;
  let drawEffect: SimpleDrawEffect;

  beforeEach(() => {
    // EffectRepositoryをクリア
    EffectRepository.clear();

    duelState = new DuelState({
      name: "効果テストデュエル",
      mainDeck: [
        { id: 1, name: "カード1", type: "monster", description: "テストカード1" },
        { id: 2, name: "カード2", type: "spell", description: "テストカード2" },
        { id: 3, name: "カード3", type: "trap", description: "テストカード3" },
      ],
      hands: [],
    });
    drawEffect = new SimpleDrawEffect();
  });

  afterEach(() => {
    // テスト後にEffectRepositoryをクリア
    EffectRepository.clear();
  });

  describe("効果登録と取得", () => {
    it("EffectRepositoryを通してカードに効果を登録できる", () => {
      EffectRepository.register(55144522, () => [drawEffect]);

      const effects = duelState.getEffectsForCard(55144522);
      expect(effects).toHaveLength(1);
      expect(effects[0].id).toBe("simple-draw");
    });

    it("存在しないカードの効果は空配列を返す", () => {
      const effects = duelState.getEffectsForCard(99999);
      expect(effects).toHaveLength(0);
    });

    it("複数の効果を同じカードに登録できる", () => {
      const secondEffect = new (class extends BaseEffect {
        constructor() {
          super("simple-draw-2", "シンプルドロー2", EffectType.DRAW, "2枚目のドロー効果", 55144522);
        }
        canActivate(): boolean {
          return true;
        }
        execute(): EffectResult {
          return this.createSuccessResult("テスト用効果", true);
        }
      })();

      EffectRepository.register(55144522, () => [drawEffect, secondEffect]);

      const effects = duelState.getEffectsForCard(55144522);
      expect(effects).toHaveLength(2);
    });
  });

  describe("効果実行", () => {
    beforeEach(() => {
      EffectRepository.register(55144522, () => [drawEffect]);
    });

    it("効果を直接実行できる", () => {
      const initialHandSize = duelState.hands.length;
      const result = duelState.executeEffect(drawEffect);

      expect(result.success).toBe(true);
      expect(result.message).toBe("1枚ドローしました");
      expect(duelState.hands.length).toBe(initialHandSize + 1);
    });

    it("カードIDから効果を実行できる", () => {
      const initialHandSize = duelState.hands.length;
      const result = duelState.executeCardEffect(55144522);

      expect(result.success).toBe(true);
      expect(duelState.hands.length).toBe(initialHandSize + 1);
    });

    it("発動不可能な効果は実行されない", () => {
      // デッキを空にする
      duelState.mainDeck = [];

      const result = duelState.executeEffect(drawEffect);

      expect(result.success).toBe(false);
      expect(result.message).toBe("シンプルドローは発動できません");
    });

    it("存在しないカードの効果実行は失敗する", () => {
      const result = duelState.executeCardEffect(99999);

      expect(result.success).toBe(false);
      expect(result.message).toBe("このカードには効果がありません");
    });
  });

  describe("ゲーム状態管理", () => {
    it("初期状態はongoing", () => {
      expect(duelState.gameResult).toBe("ongoing");
    });

    it("勝利条件満了時にゲーム結果が更新される", () => {
      // 勝利効果をモック
      const winEffect = new (class extends BaseEffect {
        constructor() {
          super("win-test", "勝利テスト", EffectType.WIN_CONDITION, "勝利する", 12345);
        }

        canActivate(): boolean {
          return true;
        }

        execute(): EffectResult {
          return {
            success: true,
            message: "勝利しました！",
            stateChanged: true,
            gameEnded: true,
          };
        }
      })();

      const result = duelState.executeEffect(winEffect);

      expect(result.gameEnded).toBe(true);
      expect(duelState.gameResult).toBe("win");
    });
  });
});
