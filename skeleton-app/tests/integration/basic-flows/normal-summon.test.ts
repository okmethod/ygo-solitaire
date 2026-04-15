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
  createSummonReadyState,
  createSpaceState,
  createFilledMonsterZone,
  createMonsterInstance,
  flushEffectQueue,
  resolveCardSelection,
  hasCardSelection,
  getState,
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
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 4,
        fieldCount: 0,
      });
      const handMonsterId = state.space.hand[0].instanceId;
      gameStateStore.set(state);

      const result = facade.summonMonster(handMonsterId);
      expect(result.success).toBe(true);

      const updatedState = getState();
      expect(updatedState.space.hand.length).toBe(0);
      expect(updatedState.space.mainMonsterZone.length).toBe(1);
      expect(updatedState.space.mainMonsterZone[0].instanceId).toBe(handMonsterId);
      expect(updatedState.space.mainMonsterZone[0].stateOnField?.position).toBe("faceUp");
      expect(updatedState.space.mainMonsterZone[0].stateOnField?.battlePosition).toBe("attack");
    });

    it("召喚後に normalSummonUsed が 1 になる", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 4,
        fieldCount: 0,
      });
      const handMonsterId = state.space.hand[0].instanceId;
      gameStateStore.set(state);

      expect(state.normalSummonUsed).toBe(0);

      const result = facade.summonMonster(handMonsterId);
      expect(result.success).toBe(true);

      const updatedState = getState();
      expect(updatedState.normalSummonUsed).toBe(1);
    });
  });

  // ───────────────────────────────────────────────
  // レベル5（1体リリース）
  // ───────────────────────────────────────────────
  describe("レベル5モンスター（1体リリース）", () => {
    it("フィールドに1体→リリース選択→レベル5召喚成功", async () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 5,
        fieldCount: 1,
      });
      const handMonsterId = state.space.hand[0].instanceId;
      const fieldMonsterId = state.space.mainMonsterZone[0].instanceId;
      gameStateStore.set(state);

      expect(facade.canSummonMonster(handMonsterId)).toBe(true);

      facade.summonMonster(handMonsterId);
      await flushEffectQueue(); // リリース選択ステップで止まる

      expect(hasCardSelection()).toBe(true);

      await resolveCardSelection([fieldMonsterId]); // フィールドのモンスターをリリース

      const updatedState = getState();
      // レベル5モンスターがフィールドに
      expect(updatedState.space.mainMonsterZone.some((c) => c.instanceId === handMonsterId)).toBe(true);
      // リリースしたモンスターが墓地に
      expect(updatedState.space.graveyard.some((c) => c.instanceId === fieldMonsterId)).toBe(true);
      // 召喚権消費
      expect(updatedState.normalSummonUsed).toBe(1);
    });

    it("フィールドにモンスターなし → レベル5召喚不可", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 5,
        fieldCount: 0,
      });
      const handMonsterId = state.space.hand[0].instanceId;
      gameStateStore.set(state);

      expect(facade.canSummonMonster(handMonsterId)).toBe(false);

      const result = facade.summonMonster(handMonsterId);
      expect(result.success).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // レベル6（1体リリース）
  // ───────────────────────────────────────────────
  describe("レベル6モンスター（1体リリース）", () => {
    it("フィールドに1体→リリース選択→レベル6召喚成功", async () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 6,
        fieldCount: 1,
      });
      const handMonsterId = state.space.hand[0].instanceId;
      const fieldMonsterId = state.space.mainMonsterZone[0].instanceId;
      gameStateStore.set(state);

      facade.summonMonster(handMonsterId);
      await flushEffectQueue();

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection([fieldMonsterId]);

      const updatedState = getState();
      expect(updatedState.space.mainMonsterZone.some((c) => c.instanceId === handMonsterId)).toBe(true);
      expect(updatedState.space.graveyard.some((c) => c.instanceId === fieldMonsterId)).toBe(true);
    });
  });

  // ───────────────────────────────────────────────
  // レベル7以上（2体リリース）
  // ───────────────────────────────────────────────
  describe("レベル7モンスター（2体リリース）", () => {
    it("フィールドに2体→2体リリース→レベル7召喚成功", async () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 7,
        fieldCount: 2,
      });
      const handMonsterId = state.space.hand[0].instanceId;
      const fieldMonsterId1 = state.space.mainMonsterZone[0].instanceId;
      const fieldMonsterId2 = state.space.mainMonsterZone[1].instanceId;
      gameStateStore.set(state);

      expect(facade.canSummonMonster(handMonsterId)).toBe(true);

      facade.summonMonster(handMonsterId);
      await flushEffectQueue();

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection([fieldMonsterId1, fieldMonsterId2]);

      const updatedState = getState();
      expect(updatedState.space.mainMonsterZone.some((c) => c.instanceId === handMonsterId)).toBe(true);
      expect(updatedState.space.graveyard.length).toBe(2); // 2体リリース
      expect(updatedState.normalSummonUsed).toBe(1);
    });

    it("フィールドに1体しかいない → レベル7召喚不可", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 7,
        fieldCount: 1,
      });
      const handMonsterId = state.space.hand[0].instanceId;

      gameStateStore.set(state);

      expect(facade.canSummonMonster(handMonsterId)).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // セット（裏側守備表示）
  // ───────────────────────────────────────────────
  describe("セット（裏側守備表示）", () => {
    it("手札のモンスターをセット → フィールドに裏側守備表示で配置", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 4,
        fieldCount: 0,
      });
      const handMonsterId = state.space.hand[0].instanceId;
      gameStateStore.set(state);

      const result = facade.setMonster(handMonsterId);

      expect(result.success).toBe(true);
      const updatedState = getState();
      expect(updatedState.space.mainMonsterZone.length).toBe(1);
      expect(updatedState.space.mainMonsterZone[0].stateOnField?.position).toBe("faceDown");
      expect(updatedState.space.mainMonsterZone[0].stateOnField?.battlePosition).toBe("defense");
    });

    it("セット後も normalSummonUsed が 1 になる", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 4,
        fieldCount: 0,
      });
      const handMonsterId = state.space.hand[0].instanceId;
      gameStateStore.set(state);

      facade.setMonster(handMonsterId);
      expect(getState().normalSummonUsed).toBe(1);
    });
  });

  // ───────────────────────────────────────────────
  // アドバンスセット（裏側守備表示）
  // ───────────────────────────────────────────────
  describe("アドバンスセット（裏側守備表示）", () => {
    it("フィールドに1体→リリース選択→レベル5セット成功（裏側守備表示）", async () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 5,
        fieldCount: 1,
      });
      const handMonsterId = state.space.hand[0].instanceId;
      const fieldMonsterId = state.space.mainMonsterZone[0].instanceId;
      gameStateStore.set(state);

      facade.setMonster(handMonsterId);
      await flushEffectQueue();

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection([fieldMonsterId]);

      const updatedState = getState();
      expect(updatedState.space.mainMonsterZone.some((c) => c.instanceId === handMonsterId)).toBe(true);

      const setMonster = updatedState.space.mainMonsterZone.find((c) => c.instanceId === handMonsterId);
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
        createSpaceState({
          hand: [createMonsterInstance("m1", { level: 4 }), createMonsterInstance("m2", { level: 4 })],
          mainMonsterZone: [],
          mainDeck: [],
        }),
      );

      facade.summonMonster("m1");
      const result = facade.summonMonster("m2");

      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("セット後の召喚も失敗する", () => {
      gameStateStore.set(
        createSpaceState({
          hand: [createMonsterInstance("m1", { level: 4 }), createMonsterInstance("m2", { level: 4 })],
          mainMonsterZone: [],
          mainDeck: [],
        }),
      );

      facade.setMonster("m1");
      const result = facade.summonMonster("m2");

      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("ドローフェイズは召喚できない", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 4,
        fieldCount: 0,
        phase: "draw",
      });
      const monsterId = state.space.hand[0].instanceId;

      expect(facade.canSummonMonster(monsterId)).toBe(false);
      const result = facade.summonMonster(monsterId);
      expect(result.success).toBe(false);
    });

    it("モンスターゾーン5枚満杯では召喚できない（canSummonMonster = false）", () => {
      gameStateStore.set(
        createSpaceState({
          hand: [createMonsterInstance("m-extra", { level: 4 })],
          ...createFilledMonsterZone(5),
        }),
      );

      expect(facade.canSummonMonster("m-extra")).toBe(false);
    });
  });
});
