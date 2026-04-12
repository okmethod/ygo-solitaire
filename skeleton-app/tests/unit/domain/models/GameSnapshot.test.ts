/**
 * GameSnapshot モデルのテスト
 */

import { describe, it, expect } from "vitest";
import type { GameSnapshot, InitialDeckCardIds } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import { CardDataRegistry } from "$lib/domain/cards";
import { DUMMY_CARD_IDS } from "../../../__testUtils__";

/** テスト用ヘルパー: カードID配列をInitialDeckCardIdsに変換 */
function createTestInitialDeck(mainDeckCardIds: number[]): InitialDeckCardIds {
  return { mainDeckCardIds, extraDeckCardIds: [] };
}

describe("GameSnapshot", () => {
  describe("createInitialGameState", () => {
    it("デッキを指定して初期状態を生成できる（数値ID）", () => {
      const deckCardIds = [DUMMY_CARD_IDS.NORMAL_SPELL, DUMMY_CARD_IDS.EQUIP_SPELL, DUMMY_CARD_IDS.QUICKPLAY_SPELL];
      const state = GameState.initialize(createTestInitialDeck(deckCardIds), CardDataRegistry.getCard, {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      expect(state.space.mainDeck.length).toBe(3);
      expect(state.space.hand.length).toBe(0);
      expect(state.space.mainMonsterZone.length).toBe(0);
      expect(state.space.spellTrapZone.length).toBe(0);
      expect(state.space.fieldZone.length).toBe(0);
      expect(state.space.graveyard.length).toBe(0);
      expect(state.space.banished.length).toBe(0);
    });

    it("正しいデフォルト値で初期化される", () => {
      const state = GameState.initialize(
        createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      expect(state.lp.player).toBe(8000);
      expect(state.lp.opponent).toBe(8000);
      expect(state.phase).toBe("draw");
      expect(state.turn).toBe(1);
      expect(state.result.isGameOver).toBe(false);
      expect(state.normalSummonLimit).toBe(1);
      expect(state.normalSummonUsed).toBe(0);
    });

    it("デッキのカードにユニークなインスタンスIDが付与される", () => {
      const state = GameState.initialize(
        createTestInitialDeck([
          DUMMY_CARD_IDS.NORMAL_SPELL,
          DUMMY_CARD_IDS.EQUIP_SPELL,
          DUMMY_CARD_IDS.QUICKPLAY_SPELL,
        ]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      const instanceIds = state.space.mainDeck.map((card) => card.instanceId);
      const uniqueIds = new Set(instanceIds);

      expect(uniqueIds.size).toBe(3);
      expect(instanceIds).toEqual(["main-0", "main-1", "main-2"]);
    });

    it("デッキのカードに正しいlocationが設定される", () => {
      const state = GameState.initialize(
        createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL, DUMMY_CARD_IDS.EQUIP_SPELL]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      state.space.mainDeck.forEach((card) => {
        expect(card.location).toBe("mainDeck");
      });
    });

    it("空のデッキを扱える", () => {
      const state = GameState.initialize(createTestInitialDeck([]), CardDataRegistry.getCard, {
        skipShuffle: true,
        skipInitialDraw: true,
      });

      expect(state.space.mainDeck.length).toBe(0);
      expect(state.result.isGameOver).toBe(false);
    });
  });

  describe("スプレッド構文による不変性", () => {
    it("更新時に新しい状態インスタンスが生成される", () => {
      const originalState = GameState.initialize(
        createTestInitialDeck([
          DUMMY_CARD_IDS.NORMAL_SPELL,
          DUMMY_CARD_IDS.EQUIP_SPELL,
          DUMMY_CARD_IDS.QUICKPLAY_SPELL,
        ]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      const newState: GameSnapshot = {
        ...originalState,
        turn: 2,
      };

      expect(newState).not.toBe(originalState);
      expect(newState.turn).toBe(2);
      expect(originalState.turn).toBe(1);
    });

    it("ゾーン更新時に元の状態が変化しない", () => {
      const originalState = GameState.initialize(
        createTestInitialDeck([
          DUMMY_CARD_IDS.NORMAL_SPELL,
          DUMMY_CARD_IDS.EQUIP_SPELL,
          DUMMY_CARD_IDS.QUICKPLAY_SPELL,
        ]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );
      const originalDeckLength = originalState.space.mainDeck.length;

      const card = originalState.space.mainDeck[originalState.space.mainDeck.length - 1];
      const newState: GameSnapshot = {
        ...originalState,
        space: {
          ...originalState.space,
          mainDeck: originalState.space.mainDeck.slice(0, -1),
          hand: [...originalState.space.hand, card],
        },
      };

      expect(originalState.space.mainDeck.length).toBe(originalDeckLength);
      expect(originalState.space.hand.length).toBe(0);
      expect(newState.space.mainDeck.length).toBe(originalDeckLength - 1);
      expect(newState.space.hand.length).toBe(1);
    });

    it("ライフポイント更新時に元の状態が変化しない", () => {
      const originalState = GameState.initialize(
        createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      const newState: GameSnapshot = {
        ...originalState,
        lp: {
          ...originalState.lp,
          player: 7000,
        },
      };

      expect(originalState.lp.player).toBe(8000);
      expect(newState.lp.player).toBe(7000);
    });

    it("フェーズ更新時に元の状態が変化しない", () => {
      const originalState = GameState.initialize(
        createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      const newState: GameSnapshot = {
        ...originalState,
        phase: "main1",
      };

      expect(originalState.phase).toBe("draw");
      expect(newState.phase).toBe("main1");
    });

    it("ゲーム結果更新時に元の状態が変化しない", () => {
      const originalState = GameState.initialize(
        createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      const newState: GameSnapshot = {
        ...originalState,
        result: {
          ...originalState.result,
          isGameOver: true,
          winner: "player",
          reason: "exodia",
        },
      };

      expect(originalState.result.isGameOver).toBe(false);
      expect(originalState.result.winner).toBeUndefined();
      expect(newState.result.isGameOver).toBe(true);
      expect(newState.result.winner).toBe("player");
    });

    it("ネストした更新でも元の状態が変化しない", () => {
      const originalState = GameState.initialize(
        createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL, DUMMY_CARD_IDS.EQUIP_SPELL]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      // デッキから手札へカードを移動
      const card = {
        ...originalState.space.mainDeck[originalState.space.mainDeck.length - 1],
        location: "hand" as const,
      };
      const newState: GameSnapshot = {
        ...originalState,
        space: {
          ...originalState.space,
          mainDeck: originalState.space.mainDeck.slice(0, -1),
          hand: [...originalState.space.hand, card],
        },
        lp: {
          ...originalState.lp,
          player: 7500,
        },
        phase: "standby",
      };

      // 元の状態が変化していないことを確認
      expect(originalState.space.mainDeck.length).toBe(2);
      expect(originalState.space.hand.length).toBe(0);
      expect(originalState.lp.player).toBe(8000);
      expect(originalState.phase).toBe("draw");

      // 新しい状態が更新されていることを確認
      expect(newState.space.mainDeck.length).toBe(1);
      expect(newState.space.hand.length).toBe(1);
      expect(newState.lp.player).toBe(7500);
      expect(newState.phase).toBe("standby");
    });
  });

  describe("ヘルパー関数", () => {
    describe("findCardInstance", () => {
      it("デッキ内のカードを検索できる", () => {
        const state = GameState.initialize(
          createTestInitialDeck([
            DUMMY_CARD_IDS.NORMAL_SPELL,
            DUMMY_CARD_IDS.EQUIP_SPELL,
            DUMMY_CARD_IDS.QUICKPLAY_SPELL,
          ]),
          CardDataRegistry.getCard,
          {
            skipShuffle: true,
            skipInitialDraw: true,
          },
        );
        const card = GameState.Space.findCard(state.space, "main-0");

        expect(card).toBeDefined();
        expect(card?.instanceId).toBe("main-0");
        expect(card?.id).toBe(DUMMY_CARD_IDS.NORMAL_SPELL); // CardInstance extends CardData
        expect(card?.location).toBe("mainDeck");
      });

      it("手札内のカードを検索できる", () => {
        const initialState = GameState.initialize(
          createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL]),
          CardDataRegistry.getCard,
          {
            skipShuffle: true,
            skipInitialDraw: true,
          },
        );
        const movedCard = { ...initialState.space.mainDeck[0], location: "hand" as const };
        const state: GameSnapshot = {
          ...initialState,
          space: {
            ...initialState.space,
            mainDeck: [],
            hand: [movedCard],
          },
        };

        const card = GameState.Space.findCard(state.space, "main-0");
        expect(card).toBeDefined();
        expect(card?.location).toBe("hand");
      });

      it("存在しないカードはundefinedを返す", () => {
        const state = GameState.initialize(
          createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL]),
          CardDataRegistry.getCard,
          {
            skipShuffle: true,
            skipInitialDraw: true,
          },
        );
        const card = GameState.Space.findCard(state.space, "non-existent-id");
        expect(card).toBeUndefined();
      });

      it("全ゾーンを横断して検索できる", () => {
        const initialState = GameState.initialize(
          createTestInitialDeck([
            DUMMY_CARD_IDS.NORMAL_SPELL,
            DUMMY_CARD_IDS.EQUIP_SPELL,
            DUMMY_CARD_IDS.QUICKPLAY_SPELL,
          ]),
          CardDataRegistry.getCard,
          {
            skipShuffle: true,
            skipInitialDraw: true,
          },
        );
        const card1 = { ...initialState.space.mainDeck[2], location: "hand" as const };
        const card2 = { ...initialState.space.mainDeck[1], location: "graveyard" as const };
        const state: GameSnapshot = {
          ...initialState,
          space: {
            ...initialState.space,
            mainDeck: [initialState.space.mainDeck[0]],
            hand: [card1],
            graveyard: [card2],
          },
        };

        expect(GameState.Space.findCard(state.space, "main-0")).toBeDefined();
        expect(GameState.Space.findCard(state.space, "main-1")).toBeDefined();
        expect(GameState.Space.findCard(state.space, "main-2")).toBeDefined();
      });
    });
  });

  describe("型安全性", () => {
    it("コンパイル時にreadonlyが強制される", () => {
      const state = GameState.initialize(
        createTestInitialDeck([DUMMY_CARD_IDS.NORMAL_SPELL]),
        CardDataRegistry.getCard,
        {
          skipShuffle: true,
          skipInitialDraw: true,
        },
      );

      // コメントを外すとTypeScriptエラーになる:
      // state.turn = 2; // Error: Cannot assign to 'turn' because it is a read-only property
      // state.space.mainDeck = []; // Error: Cannot assign to 'deck' because it is a read-only property
      // state.lp.player = 7000; // Error: Cannot assign to 'player' because it is a read-only property

      // 代わりにスプレッド構文を使う必要がある
      const newState: GameSnapshot = {
        ...state,
        turn: 2,
      };

      expect(newState.turn).toBe(2);
      expect(state.turn).toBe(1);
    });
  });
});
