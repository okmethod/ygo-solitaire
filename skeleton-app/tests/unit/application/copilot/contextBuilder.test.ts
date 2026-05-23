/**
 * contextBuilder のユニットテスト
 */

import { describe, it, expect } from "vitest";
import { buildDuelCopilotPrompt, buildStateUpdatePrefix } from "$lib/application/copilot/contextBuilder";
import type { DeckData } from "$lib/application/types/deck";
import { createMockGameState } from "../../../__testUtils__/gameStateFactory";

/** テスト用の最小限の DeckData（手札・フィールドなし想定のため mainDeck/extraDeck は空でよい） */
function createMockDeckData(overrides?: Partial<DeckData>): DeckData {
  return {
    name: "テストデッキ",
    description: "テスト用デッキ",
    guide: undefined,
    mainDeck: { monsters: [], spells: [], traps: [] },
    extraDeck: { fusion: [], synchro: [], xyz: [], link: [] },
    stats: {
      mainDeckCount: 0,
      monsterCount: 0,
      spellCount: 0,
      trapCount: 0,
      extraDeckCount: 0,
      fusionCount: 0,
      synchroCount: 0,
      xyzCount: 0,
      linkCount: 0,
      uniqueCards: 0,
    },
    ...overrides,
  };
}

describe("buildStateUpdatePrefix", () => {
  it("返り値に move: N が含まれる（moveCount が反映される）", () => {
    const snapshot = createMockGameState({ moveCount: 5 });
    const result = buildStateUpdatePrefix(snapshot);
    expect(result).toContain("move: 5");
  });

  it("moveCount が 0 の場合も move: 0 が含まれる", () => {
    const snapshot = createMockGameState({ moveCount: 0 });
    const result = buildStateUpdatePrefix(snapshot);
    expect(result).toContain("move: 0");
  });

  it("返り値に phase が含まれる", () => {
    const snapshot = createMockGameState({ phase: "main1" });
    const result = buildStateUpdatePrefix(snapshot);
    expect(result).toContain("phase");
  });

  it("返り値に hand が含まれる（空配列でも）", () => {
    const snapshot = createMockGameState();
    const result = buildStateUpdatePrefix(snapshot);
    expect(result).toContain("hand");
  });

  it("返り値が JSON ブロックを含む文字列である", () => {
    const snapshot = createMockGameState({ moveCount: 3 });
    const result = buildStateUpdatePrefix(snapshot);
    // コードブロック記法が含まれること
    expect(result).toContain("```json");
    expect(result).toContain("```");
  });
});

describe("buildDuelCopilotPrompt", () => {
  it("systemPrompt は空でない文字列を返す", () => {
    const deckData = createMockDeckData();
    const snapshot = createMockGameState();
    const { systemPrompt } = buildDuelCopilotPrompt(deckData, snapshot);
    expect(typeof systemPrompt).toBe("string");
    expect(systemPrompt.length).toBeGreaterThan(0);
  });

  it("guide が設定されている場合、message に ## デッキの回し方 が含まれる", () => {
    const deckData = createMockDeckData({ guide: "このデッキはエクゾディアを揃えて勝利する。" });
    const snapshot = createMockGameState();
    const { message } = buildDuelCopilotPrompt(deckData, snapshot);
    expect(message).toContain("## デッキの回し方");
  });

  it("guide が undefined の場合、message に ## デッキの回し方 が含まれない", () => {
    const deckData = createMockDeckData({ guide: undefined });
    const snapshot = createMockGameState();
    const { message } = buildDuelCopilotPrompt(deckData, snapshot);
    expect(message).not.toContain("## デッキの回し方");
  });

  it("message に ## 現在のゲーム状態 (move: N) が含まれる", () => {
    const deckData = createMockDeckData();
    const snapshot = createMockGameState({ moveCount: 7 });
    const { message } = buildDuelCopilotPrompt(deckData, snapshot);
    expect(message).toContain("## 現在のゲーム状態 (move: 7)");
  });

  it("message に ## 質問 が含まれる", () => {
    const deckData = createMockDeckData();
    const snapshot = createMockGameState();
    const { message } = buildDuelCopilotPrompt(deckData, snapshot);
    expect(message).toContain("## 質問");
  });

  it("手札・フィールドが空の場合、message に ## 手札・フィールドのカード定義 が含まれない", () => {
    const deckData = createMockDeckData();
    // createMockGameState はデフォルトで hand/mainMonsterZone/spellTrapZone/fieldZone がすべて空
    const snapshot = createMockGameState();
    const { message } = buildDuelCopilotPrompt(deckData, snapshot);
    expect(message).not.toContain("## 手札・フィールドのカード定義");
  });

  it("moveCount が message の状態セクションに正しく反映される", () => {
    const deckData = createMockDeckData();
    const snapshot = createMockGameState({ moveCount: 12 });
    const { message } = buildDuelCopilotPrompt(deckData, snapshot);
    expect(message).toContain("move: 12");
  });
});
