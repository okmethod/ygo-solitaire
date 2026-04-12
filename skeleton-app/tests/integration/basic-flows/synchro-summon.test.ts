/**
 * シンクロ召喚 基本フローテスト
 *
 * GameFacade + effectQueueStore を通じた本物のフローで
 * シンクロ召喚（チューナー + 非チューナー → シンクロモンスター）を検証する。
 *
 * シンクロ召喚は常に素材選択ステップ（interactive）が発生する:
 * 1. facade.synchroSummon(synchroId) → 素材選択ステップをキュー
 * 2. flushEffectQueue() → 素材選択で一時停止
 * 3. resolveCardSelection([tunerInstanceId, ...nonTunerInstanceIds]) → 素材確定 → 召喚完了
 *
 * 使用カード（setup.ts で登録済みテスト用カード）:
 * - チューナー: 2001 (Lv1) / 2002 (Lv2) / 2003 (Lv3)
 * - 非チューナー: 3001 (Lv1) / 3002 (Lv2) / 3003 (Lv3) / 3004 (Lv4)
 * - シンクロ: 4005 (Lv5) / 4006 (Lv6) / 4007 (Lv7) / 4008 (Lv8)
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import {
  createSynchroSummonReadyState,
  flushEffectQueue,
  resolveCardSelection,
  hasCardSelection,
  getState,
} from "../../__testUtils__";

describe("シンクロ召喚 - 基本フローテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // シンクロ召喚成功フロー
  // ───────────────────────────────────────────────
  describe("シンクロ召喚 - 成功フロー", () => {
    it("チューナーLv2 + 非チューナーLv4 → シンクロLv6が召喚される", async () => {
      gameStateStore.set(createSynchroSummonReadyState({ tunerLevel: 2, nonTunerLevels: [4], synchroLevel: 6 }));

      const before = getState();
      const tunerInstanceId = before.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!.instanceId;
      const nonTunerInstanceId = before.space.mainMonsterZone.find((c) => c.instanceId === "nontuner-0")!.instanceId;
      const synchroId = before.space.extraDeck[0].instanceId;

      expect(facade.canSynchroSummon(synchroId)).toBe(true);

      facade.synchroSummon(synchroId);
      await flushEffectQueue(); // 素材選択ステップで停止

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection([tunerInstanceId, nonTunerInstanceId]);

      const after = getState();
      expect(after.space.mainMonsterZone.some((c) => c.instanceId === synchroId)).toBe(true);
      expect(after.space.mainMonsterZone[0].stateOnField?.position).toBe("faceUp");
    });

    it("シンクロ召喚後、素材モンスターが墓地へ送られる", async () => {
      gameStateStore.set(createSynchroSummonReadyState({ tunerLevel: 2, nonTunerLevels: [4], synchroLevel: 6 }));

      const before = getState();
      const materialIds = before.space.mainMonsterZone.map((c) => c.instanceId);
      const synchroId = before.space.extraDeck[0].instanceId;

      facade.synchroSummon(synchroId);
      await flushEffectQueue();

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection(materialIds);

      const after = getState();
      expect(after.space.graveyard.length).toBe(2); // 素材2体が墓地へ
      materialIds.forEach((id) => {
        expect(after.space.graveyard.some((c) => c.instanceId === id)).toBe(true);
      });
    });

    it("チューナーLv1 + 非チューナーLv4 → シンクロLv5", async () => {
      gameStateStore.set(createSynchroSummonReadyState({ tunerLevel: 1, nonTunerLevels: [4], synchroLevel: 5 }));

      const before = getState();
      const materialIds = before.space.mainMonsterZone.map((c) => c.instanceId);
      const synchroId = before.space.extraDeck[0].instanceId;

      facade.synchroSummon(synchroId);
      await flushEffectQueue();

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection(materialIds);

      const after = getState();
      expect(after.space.mainMonsterZone.some((c) => c.instanceId === synchroId)).toBe(true);
    });

    it("チューナーLv2 + 非チューナーLv3+Lv3 → シンクロLv8（複数素材）", async () => {
      gameStateStore.set(createSynchroSummonReadyState({ tunerLevel: 2, nonTunerLevels: [3, 3], synchroLevel: 8 }));

      const before = getState();
      expect(before.space.mainMonsterZone.length).toBe(3); // チューナー + 非チューナー2体
      const materialIds = before.space.mainMonsterZone.map((c) => c.instanceId);
      const synchroId = before.space.extraDeck[0].instanceId;

      facade.synchroSummon(synchroId);
      await flushEffectQueue();

      expect(hasCardSelection()).toBe(true);
      await resolveCardSelection(materialIds);

      const after = getState();
      expect(after.space.mainMonsterZone.some((c) => c.instanceId === synchroId)).toBe(true);
      expect(after.space.graveyard.length).toBe(3); // 素材3体が墓地へ
    });
  });

  // ───────────────────────────────────────────────
  // シンクロ召喚失敗フロー
  // ───────────────────────────────────────────────
  describe("シンクロ召喚 - 失敗フロー", () => {
    it("チューナーなしでは canSynchroSummon が false", () => {
      gameStateStore.set(createSynchroSummonReadyState({ tunerLevel: null }));

      const state = getState();
      const synchroId = state.space.extraDeck[0].instanceId;

      expect(facade.canSynchroSummon(synchroId)).toBe(false);
    });

    it("チューナーなしでは synchroSummon が失敗する", () => {
      gameStateStore.set(createSynchroSummonReadyState({ tunerLevel: null }));

      const state = getState();
      const synchroId = state.space.extraDeck[0].instanceId;

      const result = facade.synchroSummon(synchroId);
      expect(result.success).toBe(false);
    });

    it("レベル合計不一致では召喚できない", () => {
      // Lv1チューナー + Lv4非チューナー = Lv5 ≠ Lv8シンクロ
      gameStateStore.set(createSynchroSummonReadyState({ tunerLevel: 1, nonTunerLevels: [4], synchroLevel: 8 }));

      const state = getState();
      const synchroId = state.space.extraDeck[0].instanceId;

      expect(facade.canSynchroSummon(synchroId)).toBe(false);
    });

    it("ドローフェイズはシンクロ召喚不可", () => {
      const state = createSynchroSummonReadyState();
      gameStateStore.set({ ...state, phase: "draw" }); // ドローフェイズに変更

      const currentState = getState();
      const synchroId = currentState.space.extraDeck[0].instanceId;

      expect(facade.canSynchroSummon(synchroId)).toBe(false);
    });
  });
});
