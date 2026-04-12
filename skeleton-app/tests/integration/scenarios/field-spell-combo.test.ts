/**
 * フィールド魔法コンボ シナリオテスト
 *
 * テラ・フォーミングでチキンゲームをサーチし、
 * 発動後に起動効果（LP-1000→1ドロー）を使うフローを検証する。
 *
 * 対象カード:
 * - テラ・フォーミング: デッキからフィールド魔法1枚サーチ
 * - チキンゲーム: フィールド魔法、起動効果でLP-1000→1ドロー
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { GameState } from "$lib/domain/models/GameState";
import { CardDataRegistry } from "$lib/domain/cards";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import {
  createScenarioDeck,
  advanceToMain1,
  flushEffectQueue,
  resolveCardSelection,
  getState,
  hasCardSelection,
  TEST_CARD_IDS,
  ACTUAL_CARD_IDS,
} from "../../__testUtils__";

describe("フィールド魔法コンボ - 実カードシナリオテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // チキンゲーム単体
  // ───────────────────────────────────────────────
  describe("チキンゲーム - フィールド発動 + 起動効果", () => {
    it("フィールドゾーンに配置され、起動効果でLP-1000・1ドロー", async () => {
      // 7枚デッキ: 手札5(チキンゲーム含む) + デッキ2
      facade.resetGame(
        createScenarioDeck([
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
        ]),
      );
      advanceToMain1(facade);

      const before = getState();
      expect(before.lp.player).toBe(8000);

      // チキンゲームをフィールドに発動（IDで検索してシャッフル対策）
      const chickenId = before.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.CHICKEN_GAME)!.instanceId;
      const result = facade.activateSpell(chickenId);
      expect(result.success).toBe(true);
      await flushEffectQueue();

      const afterActivate = getState();
      expect(afterActivate.space.fieldZone.length).toBe(1); // フィールドゾーンに配置
      expect(afterActivate.space.spellTrapZone.length).toBe(0);

      // 起動効果: LP-1000 → 1ドロー
      const fieldCardId = afterActivate.space.fieldZone[0].instanceId;
      expect(facade.canActivateIgnitionEffect(fieldCardId)).toBe(true);

      facade.activateIgnitionEffect(fieldCardId);
      await flushEffectQueue();

      const after = getState();
      expect(after.lp.player).toBe(7000); // LP -1000
      expect(after.space.hand.length).toBe(5); // 5 - 1(発動) + 1(ドロー) = 5
      expect(after.space.mainDeck.length).toBe(1); // 2 - 1 = 1
    });

    it("起動効果はメインフェイズのみ発動可（ドローフェイズでは不可）", () => {
      facade.resetGame(
        createScenarioDeck([
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          TEST_CARD_IDS.DUMMY,
        ]),
      );
      // ドローフェイズのまま（advanceToMain1しない）

      const state = getState();
      const chickenId = state.space.hand[0].instanceId;
      expect(facade.canActivateSpell(chickenId)).toBe(false); // ドローフェイズは発動不可
    });
  });

  // ───────────────────────────────────────────────
  // テラ・フォーミング → チキンゲーム
  // ───────────────────────────────────────────────
  describe("テラ・フォーミング → チキンゲーム", () => {
    it("テラフォでサーチ→チキンゲームを手札に加える", async () => {
      // skipShuffle:true でデッキを決定論的に構築
      // deck配列の末尾5枚=テラフォ → 初期手札、先頭2枚=チキンゲーム → デッキ残り
      const deckIds = {
        mainDeckCardIds: [
          ACTUAL_CARD_IDS.CHICKEN_GAME, // チキンゲーム（デッキ底）
          ACTUAL_CARD_IDS.CHICKEN_GAME, // チキンゲーム
          ACTUAL_CARD_IDS.TERRAFORMING,
          ACTUAL_CARD_IDS.TERRAFORMING,
          ACTUAL_CARD_IDS.TERRAFORMING,
          ACTUAL_CARD_IDS.TERRAFORMING,
          ACTUAL_CARD_IDS.TERRAFORMING, // テラフォ×5（上から引く）
        ],
        extraDeckCardIds: [],
      };
      const initialState = GameState.initialize(deckIds, CardDataRegistry.getCard, {
        skipShuffle: true,
        skipInitialDraw: false,
      });
      // Main1フェイズに設定
      gameStateStore.set({ ...initialState, phase: "main1" });

      const before = getState();
      expect(before.space.hand.some((c) => c.id === ACTUAL_CARD_IDS.CHICKEN_GAME)).toBe(false); // 手札にチキンゲームなし

      // テラ・フォーミング発動
      const terraId = before.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.TERRAFORMING)!.instanceId;
      facade.activateSpell(terraId);
      await flushEffectQueue(); // カード選択（サーチ）で止まる可能性あり

      if (hasCardSelection()) {
        // デッキからチキンゲームを選択
        const deck = getState().space.mainDeck;
        const chickenInDeck = deck.find((c) => c.id === ACTUAL_CARD_IDS.CHICKEN_GAME);
        if (chickenInDeck) {
          await resolveCardSelection([chickenInDeck.instanceId]);
        }
      }

      const after = getState();
      expect(after.space.hand.some((c) => c.id === ACTUAL_CARD_IDS.CHICKEN_GAME)).toBe(true); // チキンゲームが手札に
      expect(after.space.graveyard.length).toBe(1); // テラフォ
    });

    it("テラフォ→チキンゲームサーチ→チキンゲーム発動→起動効果の完全コンボ", async () => {
      // skipShuffle:true でデッキを決定論的に構築
      // 末尾5枚=テラフォ → 初期手札、先頭3枚=チキン×2+ダミー → デッキ残り
      const deckIds = {
        mainDeckCardIds: [
          TEST_CARD_IDS.DUMMY, // ダミー（デッキ底）
          ACTUAL_CARD_IDS.CHICKEN_GAME, // チキンゲーム
          ACTUAL_CARD_IDS.CHICKEN_GAME, // チキンゲーム
          ACTUAL_CARD_IDS.TERRAFORMING,
          ACTUAL_CARD_IDS.TERRAFORMING,
          ACTUAL_CARD_IDS.TERRAFORMING,
          ACTUAL_CARD_IDS.TERRAFORMING,
          ACTUAL_CARD_IDS.TERRAFORMING, // テラフォ×5
        ],
        extraDeckCardIds: [],
      };
      const initialState = GameState.initialize(deckIds, CardDataRegistry.getCard, {
        skipShuffle: true,
        skipInitialDraw: false,
      });
      gameStateStore.set({ ...initialState, phase: "main1" });

      const before = getState();
      expect(before.lp.player).toBe(8000);

      // Step1: テラ・フォーミング発動→チキンゲームサーチ
      const terraId = before.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.TERRAFORMING)!.instanceId;
      facade.activateSpell(terraId);
      await flushEffectQueue();

      if (hasCardSelection()) {
        const deck = getState().space.mainDeck;
        const chickenInDeck = deck.find((c) => c.id === ACTUAL_CARD_IDS.CHICKEN_GAME);
        if (chickenInDeck) {
          await resolveCardSelection([chickenInDeck.instanceId]);
        }
      }

      const afterTerra = getState();
      expect(afterTerra.space.hand.some((c) => c.id === ACTUAL_CARD_IDS.CHICKEN_GAME)).toBe(true);

      // Step2: チキンゲームをフィールドへ発動
      const chickenId = afterTerra.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.CHICKEN_GAME)!.instanceId;
      facade.activateSpell(chickenId);
      await flushEffectQueue();

      const afterChicken = getState();
      expect(afterChicken.space.fieldZone.length).toBe(1);

      // Step3: チキンゲームの起動効果（LP-1000→1ドロー）
      const fieldId = afterChicken.space.fieldZone[0].instanceId;
      facade.activateIgnitionEffect(fieldId);
      await flushEffectQueue();

      const finalState = getState();
      expect(finalState.lp.player).toBe(7000); // LP -1000
      expect(finalState.space.graveyard.length).toBe(1); // テラフォのみ（チキンゲームはフィールドに残る）
      expect(finalState.space.fieldZone.length).toBe(1);
    });
  });

  // ───────────────────────────────────────────────
  // フィールド魔法の置換ルール
  // ───────────────────────────────────────────────
  describe("フィールド魔法の置換ルール", () => {
    it("2枚目のチキンゲームを発動すると1枚目が墓地へ", async () => {
      // 手札: チキンゲーム×5、デッキ: ダミー×2
      facade.resetGame(
        createScenarioDeck([
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          ACTUAL_CARD_IDS.CHICKEN_GAME,
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
        ]),
      );
      advanceToMain1(facade);

      const before = getState();

      // 1枚目発動（IDで検索してシャッフル対策）
      const first = before.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.CHICKEN_GAME)!.instanceId;
      facade.activateSpell(first);
      await flushEffectQueue();

      expect(getState().space.fieldZone.length).toBe(1);
      expect(getState().space.graveyard.length).toBe(0); // まだ墓地なし

      // 2枚目発動（1枚目を置換）
      const second = getState().space.hand.find((c) => c.id === ACTUAL_CARD_IDS.CHICKEN_GAME)!.instanceId;
      facade.activateSpell(second);
      await flushEffectQueue();

      const after = getState();
      expect(after.space.fieldZone.length).toBe(1); // フィールドは常に1枚
      expect(after.space.graveyard.length).toBe(1); // 1枚目が墓地へ
    });
  });
});
