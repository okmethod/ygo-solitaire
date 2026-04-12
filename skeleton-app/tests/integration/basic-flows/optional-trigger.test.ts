/**
 * 任意誘発効果 基本フローテスト
 *
 * GameFacade + effectQueueStore を通じた本物のフローで
 * 任意誘発効果のパターンを検証する。
 *
 * 任意誘発効果フロー:
 * 1. モンスター召喚 → normalSummoned イベント発生
 * 2. effectQueueStore が任意誘発効果を検出（isMandatory: false）
 * 3. optionalTriggerConfirmConfig をセット（UI表示）
 * 3a. 発動する → onActivate() → 効果解決
 * 3b. 発動しない → onPass() → 効果スキップ
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import {
  createMockGameState,
  createMonsterInstance,
  flushEffectQueue,
  getState,
  hasOptionalTrigger,
  resolveOptionalTrigger,
  DUMMY_CARD_IDS,
} from "../../__testUtils__";

describe("任意誘発効果 - 基本フローテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // 任意誘発効果なし（効果を持たないモンスターの召喚）
  // ───────────────────────────────────────────────
  describe("任意誘発効果なし - 通常モンスターの召喚", () => {
    it("通常モンスターを召喚しても optionalTriggerConfirmConfig が表示されない", async () => {
      gameStateStore.set(
        createMockGameState({
          space: {
            hand: [createMonsterInstance("normal-1")],
          },
        }),
      );

      facade.summonMonster("normal-1");
      await flushEffectQueue();

      expect(hasOptionalTrigger()).toBe(false);
      expect(getState().space.mainMonsterZone.length).toBe(1);
    });
  });

  // ───────────────────────────────────────────────
  // 任意誘発効果あり（確認モーダルの表示）
  // ───────────────────────────────────────────────
  describe("任意誘発効果あり - 確認モーダルの表示", () => {
    it("任意誘発効果を持つモンスターの召喚後に optionalTriggerConfirmConfig が表示される", async () => {
      gameStateStore.set(
        createMockGameState({
          space: {
            hand: [createMonsterInstance("effect-1", { cardId: DUMMY_CARD_IDS.OPTIONAL_TRIGGER_MONSTER })],
          },
        }),
      );

      facade.summonMonster("effect-1");
      await flushEffectQueue();

      expect(hasOptionalTrigger()).toBe(true);
    });
  });

  // ───────────────────────────────────────────────
  // 任意誘発効果 → 発動する
  // ───────────────────────────────────────────────
  describe("任意誘発効果 → 発動する", () => {
    it("発動を選択すると効果が解決されて確認モーダルが消える", async () => {
      gameStateStore.set(
        createMockGameState({
          space: {
            hand: [createMonsterInstance("effect-1", { cardId: DUMMY_CARD_IDS.OPTIONAL_TRIGGER_MONSTER })],
          },
        }),
      );

      facade.summonMonster("effect-1");
      await flushEffectQueue();

      expect(hasOptionalTrigger()).toBe(true);
      await resolveOptionalTrigger(true); // 発動する

      expect(hasOptionalTrigger()).toBe(false);
      // 召喚は成功しており、モンスターはフィールド上にいる
      expect(getState().space.mainMonsterZone.some((c) => c.instanceId === "effect-1")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────
  // 任意誘発効果 → 発動しない（パス）
  // ───────────────────────────────────────────────
  describe("任意誘発効果 → 発動しない（パス）", () => {
    it("パスを選択すると効果がスキップされて確認モーダルが消える", async () => {
      gameStateStore.set(
        createMockGameState({
          space: {
            hand: [createMonsterInstance("effect-1", { cardId: DUMMY_CARD_IDS.OPTIONAL_TRIGGER_MONSTER })],
          },
        }),
      );

      facade.summonMonster("effect-1");
      await flushEffectQueue();

      expect(hasOptionalTrigger()).toBe(true);
      await resolveOptionalTrigger(false); // 発動しない

      expect(hasOptionalTrigger()).toBe(false);
      // 召喚は成功しており、モンスターはフィールド上にいる
      expect(getState().space.mainMonsterZone.some((c) => c.instanceId === "effect-1")).toBe(true);
    });
  });
});
