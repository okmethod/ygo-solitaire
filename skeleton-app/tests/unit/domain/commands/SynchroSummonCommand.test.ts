/**
 * シンクロ召喚コマンドのテスト
 */

import { describe, it, expect } from "vitest";
import { SynchroSummonCommand } from "$lib/domain/commands/SynchroSummonCommand";
import { createSynchroSummonReadyState, createExodiaVictoryState } from "../../../__testUtils__";

describe("SynchroSummonCommand", () => {
  describe("constructor", () => {
    it("カードインスタンスIDでコマンドを生成する", () => {
      // Arrange & Act
      const command = new SynchroSummonCommand("synchro-0");

      // Assert
      expect(command.getCardInstanceId()).toBe("synchro-0");
      expect(command.description).toContain("synchro-0");
    });
  });

  describe("canExecute", () => {
    it("ゲームが終了している場合は false を返す", () => {
      // Arrange
      const gameOverState = createExodiaVictoryState();
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(gameOverState);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("GAME_OVER");
    });

    it("メインフェーズでない場合は false を返す", () => {
      // Arrange
      const state = createSynchroSummonReadyState();
      const drawPhaseState = { ...state, phase: "draw" as const };
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(drawPhaseState);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NOT_MAIN_PHASE");
    });

    it("カードが見つからない場合は false を返す", () => {
      // Arrange
      const state = createSynchroSummonReadyState();
      const command = new SynchroSummonCommand("non-existent");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("CARD_NOT_FOUND");
    });

    it("フィールドにチューナーがいない場合は false を返す", () => {
      // Arrange
      const state = createSynchroSummonReadyState({ tunerLevel: null });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
    });

    it("レベル合計が合わない場合は false を返す（レベル不一致）", () => {
      // Arrange: Lv1チューナー + Lv4非チューナー = Lv8シンクロ
      const state = createSynchroSummonReadyState({ tunerLevel: 1, nonTunerLevels: [4], synchroLevel: 8 });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
    });

    it("シンクロ素材が有効な場合は true を返す", () => {
      // Arrange: Lv2チューナー + Lv4非チューナー = Lv6シンクロ
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("複数の非チューナーで合計レベルが正しい場合は true を返す", () => {
      // Arrange: Lv2チューナー + Lv2非チューナー + Lv3非チューナー = Lv7シンクロ
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [2, 3],
        synchroLevel: 7,
      });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.canExecute(state);

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  describe("execute", () => {
    it("canExecute が失敗する場合は失敗を返す", () => {
      // Arrange: チューナーなし
      const state = createSynchroSummonReadyState({ tunerLevel: null });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(false);
    });

    it("有効な場合は素材選択ステップ付きで成功を返す", () => {
      // Arrange: Lv2チューナー + Lv4非チューナー = Lv6シンクロ
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.execute(state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.activationSteps).toBeDefined();
      expect(result.activationSteps?.length).toBe(1);
      expect(result.activationSteps?.[0].summary).toContain("シンクロ素材");
    });

    it("選択完了まで状態は変更されない（現在の状態を返す）", () => {
      // Arrange: Lv2チューナー + Lv4非チューナー = Lv6シンクロ
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });
      const command = new SynchroSummonCommand("synchro-0");

      // Act
      const result = command.execute(state);

      // Assert - updatedState is a new object from checkVictory, so use toStrictEqual
      expect(result.updatedState).toStrictEqual(state);
    });
  });
});
