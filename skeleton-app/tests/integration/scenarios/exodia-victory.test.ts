/**
 * エクゾディア勝利 シナリオテスト
 *
 * エクゾディア5パーツが手札に揃った際の勝利判定を
 * GameFacade 経由の実フローで検証する。
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import {
  createMockGameState,
  createScenarioDeck,
  createMonsterInstance,
  createSpellInstance,
  createFilledMainDeck,
  advanceToMain1,
  flushEffectQueue,
  getState,
  DUMMY_CARD_IDS,
  ACTUAL_CARD_IDS,
} from "../../__testUtils__";

const ALL_PARTS: number[] = [
  ACTUAL_CARD_IDS.EXODIA_BODY,
  ACTUAL_CARD_IDS.EXODIA_RIGHT_ARM,
  ACTUAL_CARD_IDS.EXODIA_LEFT_ARM,
  ACTUAL_CARD_IDS.EXODIA_RIGHT_LEG,
  ACTUAL_CARD_IDS.EXODIA_LEFT_LEG,
];

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
  describe("5パーツ手札で魔法発動 → 勝利が検出される", () => {
    it("5パーツ + 成金ゴブリン → 成金発動後に勝利", async () => {
      // 直接状態を設定: 5パーツ + 成金ゴブリン 手札、ダミー1枚デッキ
      // 成金ゴブリン発動 → successUpdateResult → checkVictory → 5パーツ検出
      const handCards = [
        ...ALL_PARTS.map((id, i) => createMonsterInstance(`part-${i}`, { cardId: id })),
        createSpellInstance("goblin-1", { cardId: ACTUAL_CARD_IDS.GOLDEN_GOBLIN }),
      ];
      const deckCards = createFilledMainDeck(1).mainDeck;

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

      const handCards = [
        ...firstThreeParts.map((id, i) => createMonsterInstance(`hand-${i}`, { cardId: id })),
        createSpellInstance("hand-3", { cardId: ACTUAL_CARD_IDS.POT_OF_GREED }),
      ];

      const deckCards = lastTwoParts.map((id, i) =>
        createMonsterInstance(`deck-${i}`, { cardId: id, location: "mainDeck" }),
      );

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
      const potId = before.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.POT_OF_GREED)!.instanceId;
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
      // 4パーツ + ダミー×2
      facade.resetGame(
        createScenarioDeck([...ALL_PARTS.slice(0, 4), DUMMY_CARD_IDS.NORMAL_MONSTER, DUMMY_CARD_IDS.NORMAL_MONSTER]),
      );
      advanceToMain1(facade);

      const state = getState();
      expect(state.result.isGameOver).toBe(false);
    });
  });
});
