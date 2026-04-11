/**
 * 魔法発動 基本フローテスト
 *
 * GameFacade + effectQueueStore を通じた本物のフローで
 * 魔法カードの発動パターン（手札から・セットから）を検証する。
 *
 * テスト対象:
 * - 通常魔法を手札から発動（成金ゴブリン: 70368879）
 * - 通常魔法をセットしてからフィールドで発動
 * - フィールド魔法を手札から発動（チキンゲーム: 67616300）
 * - フィールド魔法をセットしてからフィールドで発動
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import {
  createMockGameState,
  createSpellInstance,
  createFilledSpellZone,
  createScenarioDeck,
  advanceToMain1,
  flushEffectQueue,
  getState,
} from "../../__testUtils__";

describe("魔法カード発動 - 基本フローテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // 通常魔法：手札から直接発動
  // ───────────────────────────────────────────────
  describe("通常魔法 - 手札から発動（成金ゴブリン: 70368879）", () => {
    it("発動 → 処理解決 → 墓地へ（effectQueueStore通し）", async () => {
      // 6枚デッキ: 成金ゴブリン×5（手札）+ ダミー×1（ドロー用）
      facade.resetGame(createScenarioDeck([70368879, 70368879, 70368879, 70368879, 70368879, 12345678]));
      advanceToMain1(facade);

      const before = getState();
      const spellId = before.space.hand.find((c) => c.id === 70368879)!.instanceId;

      expect(facade.canActivateSpell(spellId)).toBe(true);
      facade.activateSpell(spellId);
      await flushEffectQueue();

      const after = getState();
      expect(after.space.graveyard.length).toBe(1); // 成金ゴブリンが墓地へ
      expect(after.space.hand.length).toBe(5); // 5 - 1(発動) + 1(ドロー) = 5
    });

    it("ドローフェイズは手札発動不可", () => {
      facade.resetGame(createScenarioDeck([70368879, 70368879, 70368879, 70368879, 70368879, 12345678]));
      // advanceToMain1 しない（ドローフェイズのまま）

      const state = getState();
      const spellId = state.space.hand[0].instanceId;

      expect(facade.canActivateSpell(spellId)).toBe(false);
    });

    it("発動条件不足（デッキ0枚）は発動不可", () => {
      // 強欲な壺は2枚ドロー必要 → デッキ1枚では発動不可
      facade.resetGame(createScenarioDeck([55144522, 55144522, 55144522, 55144522, 55144522, 55144522]));
      advanceToMain1(facade);

      const state = getState();
      const potId = state.space.hand.find((c) => c.id === 55144522)!.instanceId;
      // デッキ残り1枚 → 2枚引けないため発動不可
      expect(state.space.mainDeck.length).toBe(1);
      expect(facade.canActivateSpell(potId)).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // 通常魔法：セットしてからフィールドで発動
  // ───────────────────────────────────────────────
  describe("通常魔法 - セット → フィールドから発動", () => {
    it("手札からセット → 裏側表示でフィールドに配置", () => {
      // テスト用通常魔法（1001: NoOp効果、発動条件なし）
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: { hand: [createSpellInstance("s1", { spellType: "normal" })], spellTrapZone: [], mainDeck: [] },
        }),
      );

      facade.setSpellTrap("s1");

      const state = getState();
      expect(state.space.spellTrapZone.length).toBe(1);
      expect(state.space.spellTrapZone[0].stateOnField?.position).toBe("faceDown");
    });

    it("魔法・罠ゾーン5枚満杯では6枚目をセットできない", () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [createSpellInstance("s-extra")],
            mainMonsterZone: [],
            ...createFilledSpellZone(5),
            mainDeck: [],
          },
        }),
      );

      expect(facade.canSetSpellTrap("s-extra")).toBe(false);
    });

    it("セットした魔法をフィールドから発動できる", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: { hand: [createSpellInstance("s1", { spellType: "normal" })], spellTrapZone: [], mainDeck: [] },
        }),
      );

      facade.setSpellTrap("s1");

      expect(facade.canActivateSpell("s1")).toBe(true);

      facade.activateSpell("s1");
      await flushEffectQueue();

      const after = getState();
      expect(after.space.graveyard.length).toBe(1); // 墓地へ送られる
      expect(after.space.spellTrapZone.length).toBe(0);
    });
  });

  // ───────────────────────────────────────────────
  // フィールド魔法：手札から発動
  // ───────────────────────────────────────────────
  describe("フィールド魔法 - 手札から発動（チキンゲーム: 67616300）", () => {
    it("発動 → フィールドゾーンに表側表示で配置", async () => {
      facade.resetGame(createScenarioDeck([67616300, 67616300, 67616300, 67616300, 67616300, 12345678, 12345678]));
      advanceToMain1(facade);

      const before = getState();
      const fieldSpellId = before.space.hand.find((c) => c.id === 67616300)!.instanceId;

      facade.activateSpell(fieldSpellId);
      await flushEffectQueue();

      const after = getState();
      expect(after.space.fieldZone.length).toBe(1);
      expect(after.space.fieldZone[0].stateOnField?.position).toBe("faceUp");
      expect(after.space.spellTrapZone.length).toBe(0); // 魔法・罠ゾーンには置かれない
    });
  });

  // ───────────────────────────────────────────────
  // フィールド魔法：セットしてからフィールドで発動
  // ───────────────────────────────────────────────
  describe("フィールド魔法 - セット → フィールドから発動", () => {
    it("フィールド魔法をセット → フィールドゾーンに裏側で配置", () => {
      // テスト用フィールド魔法（1006: NoOp効果）
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: { hand: [createSpellInstance("fs1", { spellType: "field" })], fieldZone: [], mainDeck: [] },
        }),
      );

      facade.setSpellTrap("fs1");

      const state = getState();
      expect(state.space.fieldZone.length).toBe(1);
      expect(state.space.fieldZone[0].stateOnField?.position).toBe("faceDown");
      expect(state.space.spellTrapZone.length).toBe(0); // 魔法・罠ゾーンではなくフィールドゾーン
    });

    it("フィールドゾーンにセットした魔法を発動できる", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: { hand: [createSpellInstance("fs1", { spellType: "field" })], fieldZone: [], mainDeck: [] },
        }),
      );

      facade.setSpellTrap("fs1");

      expect(facade.canActivateSpell("fs1")).toBe(true);

      facade.activateSpell("fs1");
      await flushEffectQueue();

      const after = getState();
      expect(after.space.fieldZone.length).toBe(1);
      expect(after.space.fieldZone[0].stateOnField?.position).toBe("faceUp"); // 発動後は表側
    });
  });
});
