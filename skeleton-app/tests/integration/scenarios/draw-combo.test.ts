/**
 * ドローコンボ シナリオテスト
 *
 * 実際のカードIDを使い、GameFacade → effectQueueStore → gameStateStore という
 * 本物のフローを通して、ドロー系魔法カードの効果を検証する。
 *
 * 対象カード:
 * - 強欲な壺: 2枚ドロー
 * - 成金ゴブリン: 1枚ドロー、相手LP+1000
 * - 天使の施し: 3枚ドロー→2枚手札捨て（カード選択あり）
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
  resolveCardSelection,
  getState,
  hasCardSelection,
  ACTUAL_CARD_IDS,
  TEST_CARD_IDS,
} from "../../__testUtils__";

describe("Draw Spell Combos - 実カードシナリオテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // 強欲な壺
  // ───────────────────────────────────────────────
  describe("強欲な壺 - デッキから2枚ドロー", () => {
    it("発動→2枚ドロー→墓地送りが完結する", async () => {
      // 7枚デッキ: 手札5 + デッキ2（2枚ドロー可能）
      facade.resetGame(
        createScenarioDeck([
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
        ]),
      );
      advanceToMain1(facade);

      const before = getState();
      expect(before.space.hand.length).toBe(5);
      expect(before.space.mainDeck.length).toBe(2);

      const potId = before.space.hand[0].instanceId;
      facade.activateSpell(potId);
      await flushEffectQueue();

      const after = getState();
      expect(after.space.hand.length).toBe(6); // 5 - 1(発動) + 2(ドロー) = 6
      expect(after.space.mainDeck.length).toBe(0); // 2 - 2 = 0
      expect(after.space.graveyard.length).toBe(1); // 強欲な壺
      expect(after.space.spellTrapZone.length).toBe(0); // 解決済みで墓地へ
    });

    it("デッキ1枚のとき発動できない", () => {
      // 6枚デッキ: 手札5 + デッキ1（2枚ドロー不可）
      facade.resetGame(
        createScenarioDeck([
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
          ACTUAL_CARD_IDS.POT_OF_GREED,
        ]),
      );
      advanceToMain1(facade);

      const state = getState();
      const potId = state.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.POT_OF_GREED)!.instanceId;
      expect(facade.canActivateSpell(potId)).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // 成金ゴブリン
  // ───────────────────────────────────────────────
  describe("成金ゴブリン - 1枚ドロー（相手LP+1000）", () => {
    it("発動→1枚ドロー→墓地送りが完結する", async () => {
      // 6枚デッキ: 手札5 + デッキ1
      facade.resetGame(
        createScenarioDeck([
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
        ]),
      );
      advanceToMain1(facade);

      const before = getState();
      expect(before.space.hand.length).toBe(5);
      expect(before.space.mainDeck.length).toBe(1);
      expect(before.lp.opponent).toBe(8000);

      const goblinId = before.space.hand[0].instanceId;
      facade.activateSpell(goblinId);
      await flushEffectQueue();

      const after = getState();
      expect(after.space.hand.length).toBe(5); // 5 - 1(発動) + 1(ドロー) = 5
      expect(after.space.mainDeck.length).toBe(0); // 1 - 1 = 0
      expect(after.space.graveyard.length).toBe(1); // 成金ゴブリン
      expect(after.lp.opponent).toBe(9000); // 相手LP+1000
    });

    it("3連発→墓地3枚・相手LP11000", async () => {
      // 8枚デッキ: 手札5 + デッキ3（3回分ドロー可）
      facade.resetGame(
        createScenarioDeck([
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
          ACTUAL_CARD_IDS.GOLDEN_GOBLIN,
        ]),
      );
      advanceToMain1(facade);

      for (let i = 0; i < 3; i++) {
        const state = getState();
        const goblinId = state.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.GOLDEN_GOBLIN)!.instanceId;
        facade.activateSpell(goblinId);
        await flushEffectQueue();
      }

      const after = getState();
      expect(after.space.graveyard.length).toBe(3);
      expect(after.lp.opponent).toBe(11000); // 8000 + 1000 × 3
    });
  });

  // ───────────────────────────────────────────────
  // 天使の施し
  // ───────────────────────────────────────────────
  describe("天使の施し - 3枚ドロー→2枚手札捨て", () => {
    it("発動→3ドロー→2枚捨て→手札±0・墓地3枚", async () => {
      // 8枚デッキ: 手札5（天使施し含む）+ デッキ3（3枚ドロー用）
      // ※全て天使の施しだとデッキ3枚が同じカードになる
      facade.resetGame(
        createScenarioDeck([
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
        ]),
      );
      advanceToMain1(facade);

      const before = getState();
      expect(before.space.hand.length).toBe(5);
      expect(before.space.mainDeck.length).toBe(3);

      const gracefulId = before.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.GRACEFUL_CHARITY)!.instanceId;
      facade.activateSpell(gracefulId);
      await flushEffectQueue(); // 3枚ドロー まで処理（捨て選択で止まる）

      if (hasCardSelection()) {
        // 手札から2枚を選んで捨てる
        const hand = getState().space.hand;
        const toDiscard = hand.slice(0, 2).map((c) => c.instanceId);
        await resolveCardSelection(toDiscard);
      }

      const after = getState();
      // 5 - 1(発動) + 3(ドロー) - 2(捨て) = 5
      expect(after.space.hand.length).toBe(5);
      // 天使の施し + 捨てた2枚 = 3
      expect(after.space.graveyard.length).toBe(3);
    });

    it("デッキ2枚のとき発動できない", () => {
      // 7枚デッキ: 手札5 + デッキ2（3枚ドロー不可）
      facade.resetGame(
        createScenarioDeck([
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          ACTUAL_CARD_IDS.GRACEFUL_CHARITY,
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
        ]),
      );
      advanceToMain1(facade);

      const state = getState();
      const gracefulId = state.space.hand.find((c) => c.id === ACTUAL_CARD_IDS.GRACEFUL_CHARITY)!.instanceId;
      expect(facade.canActivateSpell(gracefulId)).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // 複合シナリオ: 成金ゴブリン → 天使の施し
  // ───────────────────────────────────────────────
  describe("複合シナリオ: 成金ゴブリン → 天使の施し", () => {
    it("成金1発後に天使の施しを発動できる", async () => {
      // 直接状態をセットしてシャッフルを回避
      // 手札: ゴブリン×2 + 天使×3、デッキ: ダミー×5
      const handCards = [
        { id: ACTUAL_CARD_IDS.GOLDEN_GOBLIN, instanceId: "goblin-1" },
        { id: ACTUAL_CARD_IDS.GOLDEN_GOBLIN, instanceId: "goblin-2" },
        { id: ACTUAL_CARD_IDS.GRACEFUL_CHARITY, instanceId: "graceful-1" },
        { id: ACTUAL_CARD_IDS.GRACEFUL_CHARITY, instanceId: "graceful-2" },
        { id: ACTUAL_CARD_IDS.GRACEFUL_CHARITY, instanceId: "graceful-3" },
      ].map(({ id, instanceId }) => ({
        id,
        jaName: id === ACTUAL_CARD_IDS.GOLDEN_GOBLIN ? "成金ゴブリン" : "天使の施し",
        type: "spell" as const,
        frameType: "spell" as const,
        spellType: "normal" as const,
        edition: "latest" as const,
        instanceId,
        location: "hand" as const,
      }));

      const deckCards = Array.from({ length: 5 }, (_, i) => ({
        id: TEST_CARD_IDS.DUMMY,
        jaName: "Test Monster",
        type: "monster" as const,
        frameType: "normal" as const,
        edition: "latest" as const,
        instanceId: `deck-${i}`,
        location: "mainDeck" as const,
      }));

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

      // Step1: 成金ゴブリン発動
      facade.activateSpell("goblin-1");
      await flushEffectQueue();

      expect(getState().space.graveyard.length).toBe(1);
      expect(getState().lp.opponent).toBe(9000);

      // Step2: 天使の施し発動（手札3枚ドロー→2枚捨て）
      facade.activateSpell("graceful-1");
      await flushEffectQueue();

      if (hasCardSelection()) {
        const hand = getState().space.hand;
        const toDiscard = hand.slice(0, 2).map((c) => c.instanceId);
        await resolveCardSelection(toDiscard);
      }

      const after = getState();
      expect(after.space.graveyard.length).toBe(4); // ゴブリン + 天使 + 捨て2枚
      expect(after.lp.opponent).toBe(9000); // ゴブリン分のみ
    });
  });
});
