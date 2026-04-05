/**
 * 王立魔法図書館コンボ シナリオテスト
 *
 * 王立魔法図書館 (70791313) の魔力カウンター蓄積と起動効果（ドロー）を
 * GameFacade + effectQueueStore の本物のフローで検証する。
 *
 * シナリオ:
 * 1. 王立魔法図書館フィールド + 魔法3枚 → カウンター3個蓄積
 * 2. 起動効果 → カウンター3消費→1枚ドロー
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { Card } from "$lib/domain/models/Card";
import type { CardInstance } from "$lib/domain/models/Card";
import { createMockGameState, flushEffectQueue, getState } from "../../__testUtils__";

/** 王立魔法図書館のフィールドインスタンスを生成する */
function createLibraryOnField(instanceId: string): CardInstance {
  return {
    id: 70791313,
    jaName: "王立魔法図書館",
    type: "monster",
    frameType: "effect",
    edition: "latest",
    instanceId,
    location: "mainMonsterZone",
    stateOnField: {
      position: "faceUp",
      placedThisTurn: false,
      counters: [],
      activatedEffects: new Set(),
    },
  };
}

/** 手札カードインスタンスを生成する（登録済みカードID使用） */
function createHandCard(id: number, instanceId: string): CardInstance {
  return {
    id,
    jaName: id === 70368879 ? "成金ゴブリン" : `Card-${id}`,
    type: "spell",
    frameType: "spell",
    spellType: "normal",
    edition: "latest",
    instanceId,
    location: "hand",
  };
}

/** デッキカードインスタンスを生成する */
function createFilledMainDeckCard(instanceId: string): CardInstance {
  return {
    id: 12345678,
    jaName: "Test Monster",
    type: "monster",
    frameType: "normal",
    edition: "latest",
    instanceId,
    location: "mainDeck",
  };
}

describe("王立魔法図書館コンボ - 実カードシナリオテスト", () => {
  let facade: GameFacade;
  const libraryInstanceId = "library-1";

  beforeEach(() => {
    vi.useFakeTimers();
    facade = new GameFacade();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ───────────────────────────────────────────────
  // カウンター蓄積シナリオ
  // ───────────────────────────────────────────────
  describe("魔法発動によるカウンター蓄積", () => {
    it("魔法1枚発動→カウンター1個", async () => {
      // 王立魔法図書館フィールド、成金ゴブリン×1 手札、デッキ2枚
      const initialState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [createFilledMainDeckCard("deck-1"), createFilledMainDeckCard("deck-2")],
          hand: [createHandCard(70368879, "goblin-1")],
          mainMonsterZone: [createLibraryOnField(libraryInstanceId)],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(initialState);

      facade.activateSpell("goblin-1");
      await flushEffectQueue();

      const after = getState();
      const library = after.space.mainMonsterZone[0];
      expect(Card.Counter.get(library.stateOnField?.counters ?? [], "spell")).toBe(1);
    });

    it("魔法3枚発動→カウンター3個（上限）", async () => {
      // 成金ゴブリン×3 手札、デッキ4枚（3回ドロー可）
      const initialState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [
            createFilledMainDeckCard("deck-1"),
            createFilledMainDeckCard("deck-2"),
            createFilledMainDeckCard("deck-3"),
            createFilledMainDeckCard("deck-4"),
          ],
          hand: [
            createHandCard(70368879, "goblin-1"),
            createHandCard(70368879, "goblin-2"),
            createHandCard(70368879, "goblin-3"),
          ],
          mainMonsterZone: [createLibraryOnField(libraryInstanceId)],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(initialState);

      // 3枚順次発動
      for (let i = 1; i <= 3; i++) {
        facade.activateSpell(`goblin-${i}`);
        await flushEffectQueue();
      }

      const after = getState();
      const library = after.space.mainMonsterZone[0];
      expect(Card.Counter.get(library.stateOnField?.counters ?? [], "spell")).toBe(3);
      expect(after.space.graveyard.length).toBe(3); // ゴブリン3枚
    });

    it("カウンター3個の状態でさらに魔法発動→カウンターは3のまま（上限超えない）", async () => {
      const libraryWithMaxCounters: CardInstance = {
        ...createLibraryOnField(libraryInstanceId),
        stateOnField: {
          position: "faceUp",
          placedThisTurn: false,
          counters: [{ type: "spell", count: 3 }],
          activatedEffects: new Set(),
        },
      };
      const initialState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [createFilledMainDeckCard("deck-1"), createFilledMainDeckCard("deck-2")],
          hand: [createHandCard(70368879, "goblin-1")],
          mainMonsterZone: [libraryWithMaxCounters],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(initialState);

      facade.activateSpell("goblin-1");
      await flushEffectQueue();

      const after = getState();
      const library = after.space.mainMonsterZone[0];
      expect(Card.Counter.get(library.stateOnField?.counters ?? [], "spell")).toBe(3); // 上限のまま
    });
  });

  // ───────────────────────────────────────────────
  // 起動効果（カウンター3消費→1ドロー）
  // ───────────────────────────────────────────────
  describe("起動効果: カウンター3消費→1ドロー", () => {
    it("カウンター3個→起動効果→カウンター0・手札+1", async () => {
      const libraryWithCounters: CardInstance = {
        ...createLibraryOnField(libraryInstanceId),
        stateOnField: {
          position: "faceUp",
          placedThisTurn: false,
          counters: [{ type: "spell", count: 3 }],
          activatedEffects: new Set(),
        },
      };
      const initialState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [createFilledMainDeckCard("deck-1"), createFilledMainDeckCard("deck-2")],
          hand: [],
          mainMonsterZone: [libraryWithCounters],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(initialState);

      expect(facade.canActivateIgnitionEffect(libraryInstanceId)).toBe(true);

      facade.activateIgnitionEffect(libraryInstanceId);
      await flushEffectQueue();

      const after = getState();
      const library = after.space.mainMonsterZone[0];
      expect(Card.Counter.get(library.stateOnField?.counters ?? [], "spell")).toBe(0); // カウンター消費
      expect(after.space.hand.length).toBe(1); // 1枚ドロー
      expect(after.space.mainDeck.length).toBe(1); // デッキ -1
    });

    it("カウンター2個のとき起動効果を発動できない", () => {
      const libraryWithTwoCounters: CardInstance = {
        ...createLibraryOnField(libraryInstanceId),
        stateOnField: {
          position: "faceUp",
          placedThisTurn: false,
          counters: [{ type: "spell", count: 2 }],
          activatedEffects: new Set(),
        },
      };
      const initialState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [createFilledMainDeckCard("deck-1")],
          hand: [],
          mainMonsterZone: [libraryWithTwoCounters],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(initialState);

      expect(facade.canActivateIgnitionEffect(libraryInstanceId)).toBe(false);
    });
  });

  // ───────────────────────────────────────────────
  // 完全コンボシナリオ
  // ───────────────────────────────────────────────
  describe("完全コンボ: 魔法3枚→カウンター蓄積→起動効果ドロー", () => {
    it("成金ゴブリン3枚→カウンター3→起動効果→最終手札+1", async () => {
      // 初期: 図書館フィールド、ゴブリン×3手札、デッキ5枚
      const initialState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [
            createFilledMainDeckCard("deck-1"),
            createFilledMainDeckCard("deck-2"),
            createFilledMainDeckCard("deck-3"),
            createFilledMainDeckCard("deck-4"),
            createFilledMainDeckCard("deck-5"),
          ],
          hand: [
            createHandCard(70368879, "goblin-1"),
            createHandCard(70368879, "goblin-2"),
            createHandCard(70368879, "goblin-3"),
          ],
          mainMonsterZone: [createLibraryOnField(libraryInstanceId)],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
      gameStateStore.set(initialState);

      // Phase1: 魔法3枚発動（各+1カウンター）
      for (let i = 1; i <= 3; i++) {
        facade.activateSpell(`goblin-${i}`);
        await flushEffectQueue();
      }

      // Phase2: 王立魔法図書館の起動効果
      const stateBeforeIgnition = getState();
      const library = stateBeforeIgnition.space.mainMonsterZone[0];
      expect(Card.Counter.get(library.stateOnField?.counters ?? [], "spell")).toBe(3);

      facade.activateIgnitionEffect(libraryInstanceId);
      await flushEffectQueue();

      // 検証: カウンター消費 + 1ドロー
      const finalState = getState();
      const finalLibrary = finalState.space.mainMonsterZone[0];
      expect(Card.Counter.get(finalLibrary.stateOnField?.counters ?? [], "spell")).toBe(0);
      expect(finalState.space.graveyard.length).toBe(3); // ゴブリン3枚
      expect(finalState.lp.opponent).toBe(11000); // ゴブリン分 +3000
      // 手札: ゴブリン3枚 → 発動で手札0 + ドロー3(ゴブリン効果) + ドロー1(起動効果) = 4
      expect(finalState.space.hand.length).toBe(4);
    });
  });
});
