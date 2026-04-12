/**
 * チェーン確認 基本フローテスト
 *
 * GameFacade + effectQueueStore を通じた本物のフローで
 * チェーン確認のパターンを検証する。
 *
 * チェーン確認フロー:
 * 1. 魔法発動 → activation steps 処理 → finishCurrentSequence
 * 2. チェーン可能なカードがあれば chainConfirmationConfig をセット（UI表示）
 * 3a. パス → onPass() → チェーン解決開始（発動済み魔法の resolution 実行）
 * 3b. チェーン発動 → onActivate(instanceId) → 追加ブロックを積む → LIFO 解決
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import {
  createScenarioDeck,
  createMockGameState,
  createSpellInstance,
  createFilledMainDeck,
  advanceToMain1,
  flushEffectQueue,
  getState,
  hasChainConfirmation,
  resolveChainConfirmation,
  TEST_CARD_IDS,
} from "../../__testUtils__";

describe("チェーン確認 - 基本フローテスト", () => {
  let facade: GameFacade;

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // チェーン確認なし（チェーン可能なカードがない）
  // ───────────────────────────────────────────────
  describe("チェーン確認なし - チェーン可能なカードが手札にない", () => {
    it("通常魔法のみの手札では chainConfirmationConfig が表示されず自動解決する", async () => {
      // 手札: 通常魔法 x5、デッキ: DUMMY x1
      facade.resetGame(
        createScenarioDeck([
          TEST_CARD_IDS.SPELL_NORMAL,
          TEST_CARD_IDS.SPELL_NORMAL,
          TEST_CARD_IDS.SPELL_NORMAL,
          TEST_CARD_IDS.SPELL_NORMAL,
          TEST_CARD_IDS.SPELL_NORMAL,
          TEST_CARD_IDS.DUMMY,
        ]),
      );
      advanceToMain1(facade);

      const before = getState();
      const goblinId = before.space.hand.find((c) => c.id === TEST_CARD_IDS.SPELL_NORMAL)!.instanceId;

      facade.activateSpell(goblinId);
      await flushEffectQueue();

      // チェーン確認は表示されず、そのまま解決される
      expect(hasChainConfirmation()).toBe(false);
      // 成金ゴブリンは墓地へ
      expect(getState().space.graveyard.length).toBe(1);
    });
  });

  // ───────────────────────────────────────────────
  // チェーン確認 → パス
  // ───────────────────────────────────────────────
  describe("チェーン確認 → パス（チェーンしない）", () => {
    it("速攻魔法が手札にある場合、通常魔法発動後に chainConfirmationConfig が表示される", async () => {
      // 手札: 通常魔法 + 速攻魔法 を直接配置（シャッフル回避）
      // デッキ: 残り1枚（通常魔法の1ドロー用）
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [
              createSpellInstance("normal-1", { spellType: "normal" }),
              createSpellInstance("quick-1", { spellType: "quick-play" }),
            ],
            ...createFilledMainDeck(1),
          },
        }),
      );

      facade.activateSpell("normal-1");
      await flushEffectQueue();

      // チェーン確認UIが表示される（速攻魔法 SS2 がチェーン可能）
      expect(hasChainConfirmation()).toBe(true);
    });

    it("パスを選択すると発動済み魔法のみが解決され、速攻魔法は手札に残る", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [
              createSpellInstance("normal-1", { spellType: "normal" }),
              createSpellInstance("quick-1", { spellType: "quick-play" }),
            ],
            ...createFilledMainDeck(1),
          },
        }),
      );

      facade.activateSpell("normal-1");
      await flushEffectQueue();

      expect(hasChainConfirmation()).toBe(true);
      await resolveChainConfirmation(true); // パス

      const after = getState();
      // 通常魔法は墓地へ
      expect(after.space.graveyard.length).toBe(1);
      // 速攻魔法は手札に残る
      expect(after.space.hand.some((c) => c.instanceId === "quick-1")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────
  // チェーン確認 → チェーン発動
  // ───────────────────────────────────────────────
  describe("チェーン確認 → チェーン発動 → LIFO 解決", () => {
    it("チェーン発動後に両方の魔法が解決されて墓地へ送られる", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [
              createSpellInstance("normal-1", { spellType: "normal" }),
              createSpellInstance("quick-1", { spellType: "quick-play" }),
            ],
            ...createFilledMainDeck(1),
          },
        }),
      );

      facade.activateSpell("normal-1");
      await flushEffectQueue();

      expect(hasChainConfirmation()).toBe(true);
      await resolveChainConfirmation(false, "quick-1"); // 速攻魔法をチェーン発動

      // LIFO 解決後: 速攻魔法（チェーン2） → 通常魔法（チェーン1）の順に解決
      // 両方とも墓地へ
      const after = getState();
      expect(after.space.graveyard.some((c) => c.instanceId === "normal-1")).toBe(true);
      expect(after.space.graveyard.some((c) => c.instanceId === "quick-1")).toBe(true);
    });

    it("チェーン発動後は chainConfirmationConfig が消える（二重チェーン確認なし）", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [
              createSpellInstance("normal-1", { spellType: "normal" }),
              createSpellInstance("quick-1", { spellType: "quick-play" }),
            ],
            ...createFilledMainDeck(1),
          },
        }),
      );

      facade.activateSpell("normal-1");
      await flushEffectQueue();

      await resolveChainConfirmation(false, "quick-1"); // 速攻魔法をチェーン発動

      // チェーン解決後、確認UIは残っていない
      expect(hasChainConfirmation()).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // チェーン3（チェーン2にさらに積む）
  // ───────────────────────────────────────────────
  describe("チェーン確認 → チェーン2 → チェーン3 → LIFO 解決", () => {
    it("チェーン2の後も chainConfirmationConfig が表示され、チェーン3を積める", async () => {
      // 手札: 通常魔法 + 速攻魔法x2
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [
              createSpellInstance("normal-1", { spellType: "normal" }),
              createSpellInstance("quick-1", { spellType: "quick-play" }),
              createSpellInstance("quick-2", { spellType: "quick-play" }),
            ],
          },
        }),
      );

      // チェーン1: 通常魔法発動
      facade.activateSpell("normal-1");
      await flushEffectQueue();
      expect(hasChainConfirmation()).toBe(true);

      // チェーン2: 速攻魔法1をチェーン
      await resolveChainConfirmation(false, "quick-1");

      // チェーン2の後も確認UIが出る（手札に速攻魔法2が残っている）
      expect(hasChainConfirmation()).toBe(true);
    });

    it("チェーン3まで積んだ後、3枚すべてが LIFO で解決されて墓地へ送られる", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [
              createSpellInstance("normal-1", { spellType: "normal" }),
              createSpellInstance("quick-1", { spellType: "quick-play" }),
              createSpellInstance("quick-2", { spellType: "quick-play" }),
            ],
          },
        }),
      );

      // チェーン1 → チェーン2 → チェーン3
      facade.activateSpell("normal-1");
      await flushEffectQueue();

      await resolveChainConfirmation(false, "quick-1"); // チェーン2
      await resolveChainConfirmation(false, "quick-2"); // チェーン3

      // チェーン3発動後はチェーン可能カードがなく自動解決
      // LIFO: quick-2 → quick-1 → normal-1 の順で解決
      const after = getState();
      expect(after.space.graveyard.some((c) => c.instanceId === "normal-1")).toBe(true);
      expect(after.space.graveyard.some((c) => c.instanceId === "quick-1")).toBe(true);
      expect(after.space.graveyard.some((c) => c.instanceId === "quick-2")).toBe(true);
      expect(after.space.graveyard.length).toBe(3);
    });

    it("チェーン3発動後は chainConfirmationConfig が消える", async () => {
      gameStateStore.set(
        createMockGameState({
          phase: "main1",
          space: {
            hand: [
              createSpellInstance("normal-1", { spellType: "normal" }),
              createSpellInstance("quick-1", { spellType: "quick-play" }),
              createSpellInstance("quick-2", { spellType: "quick-play" }),
            ],
          },
        }),
      );

      facade.activateSpell("normal-1");
      await flushEffectQueue();

      await resolveChainConfirmation(false, "quick-1"); // チェーン2
      await resolveChainConfirmation(false, "quick-2"); // チェーン3

      expect(hasChainConfirmation()).toBe(false);
    });
  });
});
