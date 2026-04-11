/**
 * エクゾディア勝利 シナリオテスト
 *
 * エクゾディア5パーツが手札に揃った際の勝利判定を
 * GameFacade 経由の実フローで検証する。
 *
 * エクゾディアパーツ:
 * - 封印されしエクゾディア (33396948) ← 本体
 * - 封印されし者の右腕 (70903634)
 * - 封印されし者の左腕 (7902349)
 * - 封印されし者の右足 (8124921)
 * - 封印されし者の左足 (44519536)
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import {
  createMockGameState,
  createScenarioDeck,
  advanceToMain1,
  flushEffectQueue,
  getState,
} from "../../__testUtils__";

const EXODIA_PARTS = {
  MAIN: 33396948,
  RIGHT_ARM: 70903634,
  LEFT_ARM: 7902349,
  RIGHT_LEG: 8124921,
  LEFT_LEG: 44519536,
};
const ALL_PARTS = Object.values(EXODIA_PARTS);

describe("エクゾディア勝利 - 実カードシナリオテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // 初期手札でのエクゾディア判定
  // ───────────────────────────────────────────────
  // ───────────────────────────────────────────────
  // 魔法発動でエクゾディア判定
  // ───────────────────────────────────────────────
  describe("5パーツ手札で魔法発動 → 勝利が検出される", () => {
    it("5パーツ + 成金ゴブリン → 成金発動後に勝利", async () => {
      // 直接状態を設定: 5パーツ + 成金ゴブリン 手札、ダミー1枚デッキ
      // 成金ゴブリン発動 → successUpdateResult → checkVictory → 5パーツ検出
      const handCards = [
        ...ALL_PARTS.map((id, i) => ({
          id,
          jaName: `Exodia Part ${i}`,
          type: "monster" as const,
          frameType: "normal" as const,
          edition: "latest" as const,
          instanceId: `part-${i}`,
          location: "hand" as const,
        })),
        {
          id: 70368879,
          jaName: "成金ゴブリン",
          type: "spell" as const,
          frameType: "spell" as const,
          spellType: "normal" as const,
          edition: "latest" as const,
          instanceId: "goblin-1",
          location: "hand" as const,
        },
      ];
      const deckCards = [
        {
          id: 12345678,
          jaName: "Test Monster",
          type: "monster" as const,
          frameType: "normal" as const,
          edition: "latest" as const,
          instanceId: "deck-1",
          location: "mainDeck" as const,
        },
      ];

      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            mainDeck: deckCards,
            hand: handCards,
            mainMonsterZone: [],
            spellTrapZone: [],
            fieldZone: [],
            graveyard: [],
            banished: [],
          },
        }),
      );

      const before = getState();
      expect(before.result.isGameOver).toBe(false); // まだ checkVictory 未実行
      expect(before.space.hand.filter((c) => ALL_PARTS.includes(c.id)).length).toBe(5);

      // 成金ゴブリン発動 → successUpdateResult → checkVictory が呼ばれる
      facade.activateSpell("goblin-1");
      await flushEffectQueue();

      const after = getState();
      expect(after.result.isGameOver).toBe(true);
      expect(after.result.winner).toBe("player");
      expect(after.result.reason).toBe("exodia");
    });
  });

  // ───────────────────────────────────────────────
  // 魔法効果ドローによるエクゾディア完成
  // ───────────────────────────────────────────────
  describe("強欲な壺のドロー効果でエクゾディア完成", () => {
    it("手札3パーツ+壺 → 壺発動→2枚ドロー → 5パーツ揃い勝利", async () => {
      // 直接状態を設定してシャッフルを回避:
      // 手札: 本体・右腕・左腕・強欲な壺、デッキ末尾2枚: 右足・左足（壺のドローで引く）
      const firstThreeParts = ALL_PARTS.slice(0, 3); // 本体・右腕・左腕
      const lastTwoParts = ALL_PARTS.slice(3); // 右足・左足

      const handCards = [...firstThreeParts, 55144522].map((id, i) => ({
        id,
        jaName: `Card-${id}`,
        type: (id === 55144522 ? "spell" : "monster") as "spell" | "monster",
        frameType: (id === 55144522 ? "spell" : "normal") as "spell" | "normal",
        spellType: id === 55144522 ? ("normal" as const) : undefined,
        edition: "latest" as const,
        instanceId: `hand-${i}`,
        location: "hand" as const,
      }));

      const deckCards = lastTwoParts.map((id, i) => ({
        id,
        jaName: `Card-${id}`,
        type: "monster" as const,
        frameType: "normal" as const,
        edition: "latest" as const,
        instanceId: `deck-${i}`,
        location: "mainDeck" as const,
      }));

      const initialState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: deckCards,
          hand: handCards,
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(initialState);

      const before = getState();
      expect(before.result.isGameOver).toBe(false);

      // 強欲な壺を発動（2枚ドロー → エクゾディア5パーツ揃い）
      const potId = before.space.hand.find((c) => c.id === 55144522)!.instanceId;
      facade.activateSpell(potId);
      await flushEffectQueue();

      const after = getState();
      // 5パーツ揃い → 勝利
      expect(after.result.isGameOver).toBe(true);
      expect(after.result.winner).toBe("player");
      expect(after.result.reason).toBe("exodia");
    });
  });

  // ───────────────────────────────────────────────
  // 4パーツでは勝利しない
  // ───────────────────────────────────────────────
  describe("4パーツでは勝利しない", () => {
    it("4パーツが手札にある状態ではゲーム続行", () => {
      const partsMinus1 = ALL_PARTS.slice(0, 4);
      // 4パーツ + ダミー×2
      facade.resetGame(createScenarioDeck([...partsMinus1, 12345678, 12345678]));
      advanceToMain1(facade);

      const state = getState();
      expect(state.result.isGameOver).toBe(false);
    });
  });
});
