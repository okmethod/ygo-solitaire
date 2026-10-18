/**
 * サイエンカタパ シナリオテスト
 *
 * 「魔導サイエンティスト」でEXデッキの融合モンスターを特殊召喚し、
 * 「カタパルト・タートル」で射出してバーンダメージを与えるコンボを
 * GameFacade + effectQueueStore の本物のフローで検証する。
 *
 * シナリオ:
 * 1. 魔導サイエンティスト: LP1000払い → EXから融合モンスターを特殊召喚
 * 2. カタパルト・タートル: 自分モンスター1体をリリース → 攻撃力の半分をバーン
 * 3. 1〜2を繰り返し、相手LPを0にして勝利（reason: lp0）
 *
 * Note: 融合モンスターの効果無効・直接攻撃制限・エンドフェイズ帰還は未実装のため、
 *       射出ダメージは登録値の攻撃力（紅陽鳥2300 等）から算出される。
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import {
  createSpaceState,
  createMonsterInstance,
  createMonsterOnField,
  createFilledMainDeck,
  flushEffectQueue,
  resolveCardSelection,
  hasCardSelection,
  getState,
  ACTUAL_CARD_IDS,
} from "../../__testUtils__";

/** EXデッキに融合モンスターのカードインスタンスを生成する */
function createFusionInExtra(instanceId: string, cardId: number) {
  return createMonsterInstance(instanceId, { cardId, frameType: "fusion", location: "extraDeck" });
}

describe("サイエンカタパ完走 - 実カードシナリオテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // 魔導サイエンティスト: LP1000払い → EXから融合を特殊召喚
  // ───────────────────────────────────────────────
  describe("魔導サイエンティストの起動効果", () => {
    it("LP1000払い → EXデッキの融合モンスターを特殊召喚", async () => {
      const initialState = createSpaceState({
        ...createFilledMainDeck(3),
        extraDeck: [createFusionInExtra("sunbird-1", ACTUAL_CARD_IDS.CRIMSON_SUNBIRD)],
        mainMonsterZone: [createMonsterOnField("scientist", { cardId: ACTUAL_CARD_IDS.MAGICAL_SCIENTIST })],
      });
      gameStateStore.set(initialState);

      expect(facade.canActivateIgnitionEffect("scientist")).toBe(true);

      facade.activateIgnitionEffect("scientist");
      await flushEffectQueue(); // EXデッキ選択で停止

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection(["sunbird-1"]);

      const after = getState();
      expect(after.lp.player).toBe(7000); // 8000 - 1000
      expect(after.space.mainMonsterZone.some((c) => c.instanceId === "sunbird-1")).toBe(true);
      expect(after.space.extraDeck.length).toBe(0);
    });

    it("LPが1000以下では起動効果を発動できない", () => {
      const initialState = {
        ...createSpaceState({
          extraDeck: [createFusionInExtra("sunbird-1", ACTUAL_CARD_IDS.CRIMSON_SUNBIRD)],
          mainMonsterZone: [createMonsterOnField("scientist", { cardId: ACTUAL_CARD_IDS.MAGICAL_SCIENTIST })],
        }),
        lp: { player: 1000, opponent: 8000 },
      };
      gameStateStore.set(initialState);

      expect(facade.canActivateIgnitionEffect("scientist")).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // カタパルト・タートル: リリース → 攻撃力半分バーン
  // ───────────────────────────────────────────────
  describe("カタパルト・タートルの起動効果", () => {
    it("融合モンスター1体をリリース → 攻撃力の半分を相手にバーン", async () => {
      const initialState = createSpaceState({
        ...createFilledMainDeck(3),
        mainMonsterZone: [
          createMonsterOnField("catapult", { cardId: ACTUAL_CARD_IDS.CATAPULT_TURTLE }),
          createMonsterOnField("sunbird-1", { cardId: ACTUAL_CARD_IDS.CRIMSON_SUNBIRD, slotIndex: 1 }),
        ],
      });
      gameStateStore.set(initialState);

      facade.activateIgnitionEffect("catapult");
      await flushEffectQueue(); // リリース対象選択で停止

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection(["sunbird-1"]);

      const after = getState();
      // 紅陽鳥 攻2300 → floor(2300 / 2) = 1150 バーン
      expect(after.lp.opponent).toBe(8000 - 1150);
      expect(after.space.graveyard.some((c) => c.instanceId === "sunbird-1")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────
  // 完走: サイエンティスト展開 → カタパルト射出 → 相手LP0
  // ───────────────────────────────────────────────
  describe("完走: 融合モンスターを射出し続けて相手LPを0にする", () => {
    it("LP8000から7体射出＋サイエンティスト自身射出で相手LPを0にして勝利", async () => {
      // EX: 攻撃力の高い順に7体（紅陽鳥2300×3・アクア2250×3・魔象2200×1）
      // 射出バーン合計 = 1150×3 + 1125×3 + 1100 = 7925 → 相手LP 75 残り
      // 最後にサイエンティスト自身(攻300→150)を射出して 8075 ダメージ → 相手LP0
      const fusions = [
        createFusionInExtra("fusion-0", ACTUAL_CARD_IDS.CRIMSON_SUNBIRD),
        createFusionInExtra("fusion-1", ACTUAL_CARD_IDS.CRIMSON_SUNBIRD),
        createFusionInExtra("fusion-2", ACTUAL_CARD_IDS.CRIMSON_SUNBIRD),
        createFusionInExtra("fusion-3", ACTUAL_CARD_IDS.AQUA_DRAGON),
        createFusionInExtra("fusion-4", ACTUAL_CARD_IDS.AQUA_DRAGON),
        createFusionInExtra("fusion-5", ACTUAL_CARD_IDS.AQUA_DRAGON),
        createFusionInExtra("fusion-6", ACTUAL_CARD_IDS.GREAT_MAMMOTH_OF_GOLDFINE),
      ];
      const initialState = createSpaceState({
        ...createFilledMainDeck(3),
        extraDeck: fusions,
        mainMonsterZone: [
          createMonsterOnField("scientist", { cardId: ACTUAL_CARD_IDS.MAGICAL_SCIENTIST }),
          createMonsterOnField("catapult", { cardId: ACTUAL_CARD_IDS.CATAPULT_TURTLE, slotIndex: 1 }),
        ],
      });
      gameStateStore.set(initialState);

      // 7体を順に「特殊召喚 → 射出」
      for (let i = 0; i < 7; i++) {
        facade.activateIgnitionEffect("scientist");
        await flushEffectQueue();
        await resolveCardSelection([`fusion-${i}`]); // EXから融合召喚

        facade.activateIgnitionEffect("catapult");
        await flushEffectQueue();
        await resolveCardSelection([`fusion-${i}`]); // 融合を射出
      }

      const afterSeven = getState();
      expect(afterSeven.lp.player).toBe(1000); // 8000 - 1000×7
      expect(afterSeven.lp.opponent).toBe(75); // 8000 - 7925
      expect(afterSeven.result.isGameOver).toBe(false);
      // LP1000ではサイエンティストをもう起動できない
      expect(facade.canActivateIgnitionEffect("scientist")).toBe(false);

      // とどめ: サイエンティスト自身を射出（攻300 → 150バーン）
      facade.activateIgnitionEffect("catapult");
      await flushEffectQueue();
      await resolveCardSelection(["scientist"]);

      const finalState = getState();
      expect(finalState.lp.opponent).toBeLessThanOrEqual(0);
      expect(finalState.result.isGameOver).toBe(true);
      expect(finalState.result.winner).toBe("player");
      expect(finalState.result.reason).toBe("lp0");
    });
  });
});
