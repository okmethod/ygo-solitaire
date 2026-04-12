/**
 * 通常召喚 基本フローテスト
 *
 * GameFacade + effectQueueStore を通じた本物のフローで
 * モンスターの召喚・アドバンス召喚・セットの基本操作を検証する。
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import {
  createMockGameState,
  createMonsterInstance,
  createFilledMonsterZone,
  createScenarioDeck,
  flushEffectQueue,
  resolveCardSelection,
  hasCardSelection,
  getState,
  TEST_CARD_IDS,
} from "../../__testUtils__";

describe("通常召喚 - 基本フローテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // 通常召喚（表側攻撃表示）
  // ───────────────────────────────────────────────
  describe("通常召喚（表側攻撃表示）", () => {
    it("手札のモンスターを召喚 → フィールドに表側攻撃表示で配置", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: { hand: [createMonsterInstance("m1", { level: 4 })], mainMonsterZone: [], mainDeck: [] },
        }),
      );

      const result = facade.summonMonster("m1");

      expect(result.success).toBe(true);
      const state = getState();
      expect(state.space.hand.length).toBe(0);
      expect(state.space.mainMonsterZone.length).toBe(1);
      expect(state.space.mainMonsterZone[0].instanceId).toBe("m1");
      expect(state.space.mainMonsterZone[0].stateOnField?.position).toBe("faceUp");
      expect(state.space.mainMonsterZone[0].stateOnField?.battlePosition).toBe("attack");
    });

    it("召喚後に normalSummonUsed が 1 になる", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: { hand: [createMonsterInstance("m1", { level: 4 })], mainMonsterZone: [], mainDeck: [] },
        }),
      );

      expect(getState().normalSummonUsed).toBe(0);
      facade.summonMonster("m1");
      expect(getState().normalSummonUsed).toBe(1);
    });
  });

  // ───────────────────────────────────────────────
  // レベル5（1体リリース）
  // ───────────────────────────────────────────────
  describe("レベル5モンスター（1体リリース）", () => {
    it("フィールドに1体→リリース選択→レベル5召喚成功", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createMonsterInstance("lv5", { level: 5 })],
            ...createFilledMonsterZone(1), // "monster-0"
            mainDeck: [],
          },
        }),
      );

      expect(facade.canSummonMonster("lv5")).toBe(true);

      facade.summonMonster("lv5");
      await flushEffectQueue(); // リリース選択ステップで止まる

      expect(hasCardSelection()).toBe(true);

      await resolveCardSelection(["monster-0"]); // フィールドのモンスターをリリース

      const after = getState();
      // レベル5モンスターがフィールドに
      expect(after.space.mainMonsterZone.some((c) => c.instanceId === "lv5")).toBe(true);
      // リリースしたモンスターが墓地に
      expect(after.space.graveyard.some((c) => c.instanceId === "monster-0")).toBe(true);
      // 召喚権消費
      expect(after.normalSummonUsed).toBe(1);
    });

    it("フィールドにモンスターなし → レベル5召喚不可", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createMonsterInstance("lv5", { level: 5 })],
            mainMonsterZone: [], // リリース対象なし
            mainDeck: [],
          },
        }),
      );

      expect(facade.canSummonMonster("lv5")).toBe(false);
      const result = facade.summonMonster("lv5");
      expect(result.success).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // レベル6（1体リリース）
  // ───────────────────────────────────────────────
  describe("レベル6モンスター（1体リリース）", () => {
    it("フィールドに1体→リリース選択→レベル6召喚成功", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createMonsterInstance("lv6", { level: 6 })],
            ...createFilledMonsterZone(1), // "monster-0"
            mainDeck: [],
          },
        }),
      );

      facade.summonMonster("lv6");
      await flushEffectQueue();

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection(["monster-0"]);

      const after = getState();
      expect(after.space.mainMonsterZone.some((c) => c.instanceId === "lv6")).toBe(true);
      expect(after.space.graveyard.some((c) => c.instanceId === "monster-0")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────
  // レベル7以上（2体リリース）
  // ───────────────────────────────────────────────
  describe("レベル7モンスター（2体リリース）", () => {
    it("フィールドに2体→2体リリース→レベル7召喚成功", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createMonsterInstance("lv7", { level: 7 })],
            ...createFilledMonsterZone(2), // "monster-0", "monster-1"
            mainDeck: [],
          },
        }),
      );

      expect(facade.canSummonMonster("lv7")).toBe(true);

      facade.summonMonster("lv7");
      await flushEffectQueue();

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection(["monster-0", "monster-1"]);

      const after = getState();
      expect(after.space.mainMonsterZone.some((c) => c.instanceId === "lv7")).toBe(true);
      expect(after.space.graveyard.length).toBe(2); // 2体リリース
      expect(after.normalSummonUsed).toBe(1);
    });

    it("フィールドに1体しかいない → レベル7召喚不可", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createMonsterInstance("lv7", { level: 7 })],
            ...createFilledMonsterZone(1), // 1体しかいない
            mainDeck: [],
          },
        }),
      );

      expect(facade.canSummonMonster("lv7")).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // セット（裏側守備表示）
  // ───────────────────────────────────────────────
  describe("セット（裏側守備表示）", () => {
    it("手札のモンスターをセット → フィールドに裏側守備表示で配置", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: { hand: [createMonsterInstance("m1", { level: 4 })], mainMonsterZone: [], mainDeck: [] },
        }),
      );

      const result = facade.setMonster("m1");

      expect(result.success).toBe(true);
      const state = getState();
      expect(state.space.mainMonsterZone.length).toBe(1);
      expect(state.space.mainMonsterZone[0].stateOnField?.position).toBe("faceDown");
      expect(state.space.mainMonsterZone[0].stateOnField?.battlePosition).toBe("defense");
    });

    it("セット後も normalSummonUsed が 1 になる", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: { hand: [createMonsterInstance("m1", { level: 4 })], mainMonsterZone: [], mainDeck: [] },
        }),
      );

      facade.setMonster("m1");
      expect(getState().normalSummonUsed).toBe(1);
    });
  });

  // ───────────────────────────────────────────────
  // アドバンスセット（裏側守備表示）
  // ───────────────────────────────────────────────
  describe("アドバンスセット（裏側守備表示）", () => {
    it("フィールドに1体→リリース選択→レベル5セット成功（裏側守備表示）", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createMonsterInstance("lv5", { level: 5 })],
            ...createFilledMonsterZone(1), // "monster-0"
            mainDeck: [],
          },
        }),
      );

      facade.setMonster("lv5");
      await flushEffectQueue();

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection(["monster-0"]);

      const after = getState();
      expect(after.space.mainMonsterZone.some((c) => c.instanceId === "lv5")).toBe(true);
      const setMonster = after.space.mainMonsterZone.find((c) => c.instanceId === "lv5");
      expect(setMonster?.stateOnField?.position).toBe("faceDown");
      expect(setMonster?.stateOnField?.battlePosition).toBe("defense");
    });
  });

  // ───────────────────────────────────────────────
  // 通常召喚失敗フロー
  // ───────────────────────────────────────────────
  describe("通常召喚失敗フロー", () => {
    it("2体目の召喚は失敗する", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createMonsterInstance("m1", { level: 4 }), createMonsterInstance("m2", { level: 4 })],
            mainMonsterZone: [],
            mainDeck: [],
          },
        }),
      );

      facade.summonMonster("m1");
      const result = facade.summonMonster("m2");

      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("セット後の召喚も失敗する", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createMonsterInstance("m1", { level: 4 }), createMonsterInstance("m2", { level: 4 })],
            mainMonsterZone: [],
            mainDeck: [],
          },
        }),
      );

      facade.setMonster("m1");
      const result = facade.summonMonster("m2");

      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("ドローフェイズは召喚できない", () => {
      facade.resetGame(
        createScenarioDeck([
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
          TEST_CARD_IDS.DUMMY,
        ]),
      );
      // advanceToMain1 しない（ドローフェイズのまま）

      const state = getState();
      const monsterId = state.space.hand[0].instanceId;

      expect(facade.canSummonMonster(monsterId)).toBe(false);
      const result = facade.summonMonster(monsterId);
      expect(result.success).toBe(false);
    });

    it("モンスターゾーン5枚満杯では召喚できない（canSummonMonster = false）", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createMonsterInstance("m-extra", { level: 4 })],
            ...createFilledMonsterZone(5),
            mainDeck: [],
          },
        }),
      );

      expect(facade.canSummonMonster("m-extra")).toBe(false);
    });
  });
});
