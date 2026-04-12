/**
 * 通常召喚コマンドのテスト
 */

import { describe, it, expect } from "vitest";
import { NormalSummonCommand } from "$lib/domain/commands/NormalSummonCommand";
import {
  createMockGameState,
  createMonsterInstance,
  createSpellInstance,
  createFilledMonsterZone,
  createExodiaVictoryState,
} from "../../../__testUtils__";

describe("NormalSummonCommand", () => {
  // ===========================
  // Summon Mode (Attack Position)
  // ===========================
  describe("summon mode", () => {
    describe("canExecute", () => {
      it("全条件を満たす場合は true を返す", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          space: { hand: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(true);
      });

      it("ゲームが終了している場合は false を返す", () => {
        const state = createExodiaVictoryState();

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("メインフェイズでない場合は false を返す", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          phase: "draw",
          space: { hand: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("召喚回数の上限に達している場合は false を返す", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          normalSummonUsed: 1,
          space: { hand: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("カードが見つからない場合は false を返す", () => {
        const state = createMockGameState();

        const command = new NormalSummonCommand("non-existent-id", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("カードが手札にない場合は false を返す", () => {
        const monsterCard = createMonsterInstance("monster-1", { location: "mainDeck" });
        const state = createMockGameState({
          space: { mainDeck: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("カードがモンスターでない場合は false を返す", () => {
        const spellCard = createSpellInstance("spell-1");
        const state = createMockGameState({
          space: { hand: [spellCard] },
        });

        const command = new NormalSummonCommand("spell-1", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("モンスターゾーンが満杯の場合は false を返す", () => {
        const monsterCard = createMonsterInstance("monster-new");
        const state = createMockGameState({
          space: {
            hand: [monsterCard],
            ...createFilledMonsterZone(5),
          },
        });

        const command = new NormalSummonCommand("monster-new", "summon");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });
    });

    describe("execute", () => {
      it("モンスターを攻撃表示でモンスターゾーンに正常召喚する", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          space: { hand: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.execute(state);

        expect(result.success).toBe(true);
        expect(result.updatedState.space.hand.length).toBe(0);
        expect(result.updatedState.space.mainMonsterZone.length).toBe(1);

        const summonedCard = result.updatedState.space.mainMonsterZone[0];
        expect(summonedCard.instanceId).toBe("monster-1");
        expect(summonedCard.location).toBe("mainMonsterZone");
        expect(summonedCard.stateOnField?.position).toBe("faceUp");
        expect(summonedCard.stateOnField?.battlePosition).toBe("attack");
        expect(summonedCard.stateOnField?.placedThisTurn).toBe(true);
      });

      it("normalSummonUsed をインクリメントする", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          space: { hand: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.execute(state);

        expect(result.success).toBe(true);
        expect(result.updatedState.normalSummonUsed).toBe(1);
      });

      it("メインフェイズでない場合は失敗する", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          phase: "draw",
          space: { hand: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "summon");
        const result = command.execute(state);

        expect(result.success).toBe(false);
        expect(result.error).toBe("メインフェイズではありません");
      });
    });
  });

  // ===========================
  // Set Mode (Defense Position)
  // ===========================
  describe("set mode", () => {
    describe("canExecute", () => {
      it("条件を満たす場合にモンスターをセットできる", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          space: { hand: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(true);
      });

      it("ゲームが既に終了している場合は失敗する", () => {
        const state = createExodiaVictoryState();

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });

      it("モンスターゾーンが満杯の場合（5枚）は失敗する", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          space: {
            hand: [monsterCard],
            ...createFilledMonsterZone(5),
          },
        });

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.canExecute(state);

        expect(result.isValid).toBe(false);
      });
    });

    describe("execute", () => {
      it("手札からモンスターを裏向きでモンスターゾーンにセットする", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          space: { hand: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.execute(state);

        expect(result.success).toBe(true);
        expect(result.updatedState.space.hand.length).toBe(0);
        expect(result.updatedState.space.mainMonsterZone.length).toBe(1);

        const setCard = result.updatedState.space.mainMonsterZone[0];
        expect(setCard.instanceId).toBe("monster-1");
        expect(setCard.location).toBe("mainMonsterZone");
        expect(setCard.stateOnField?.position).toBe("faceDown");
        expect(setCard.stateOnField?.battlePosition).toBe("defense");
        expect(setCard.stateOnField?.placedThisTurn).toBe(true);
      });

      it("モンスターをセットする際に normalSummonUsed をインクリメントする", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const state = createMockGameState({
          space: { hand: [monsterCard] },
        });

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.execute(state);

        expect(result.success).toBe(true);
        expect(result.updatedState.normalSummonUsed).toBe(1);
      });

      it("セット時に他のゾーンを保持する", () => {
        const monsterCard = createMonsterInstance("monster-1");
        const existingDeckCard = createMonsterInstance("deck-card", { location: "mainDeck" });
        const existingGraveyardCard = createMonsterInstance("gy-card", { location: "graveyard" });

        const state = createMockGameState({
          space: {
            mainDeck: [existingDeckCard],
            hand: [monsterCard],
            graveyard: [existingGraveyardCard],
          },
        });

        const command = new NormalSummonCommand("monster-1", "set");
        const result = command.execute(state);

        expect(result.success).toBe(true);
        expect(result.updatedState.space.mainDeck).toEqual([existingDeckCard]);
        expect(result.updatedState.space.graveyard).toEqual([existingGraveyardCard]);
      });
    });
  });

  // ===========================
  // Helper Methods
  // ===========================
  describe("getCardInstanceId", () => {
    it("カードインスタンス ID を返す", () => {
      const command = new NormalSummonCommand("monster-1", "summon");
      expect(command.getCardInstanceId()).toBe("monster-1");
    });
  });

  describe("getMode", () => {
    it("召喚モードの場合は 'summon' を返す", () => {
      const command = new NormalSummonCommand("monster-1", "summon");
      expect(command.getMode()).toBe("summon");
    });

    it("セットモードの場合は 'set' を返す", () => {
      const command = new NormalSummonCommand("monster-1", "set");
      expect(command.getMode()).toBe("set");
    });
  });
});
