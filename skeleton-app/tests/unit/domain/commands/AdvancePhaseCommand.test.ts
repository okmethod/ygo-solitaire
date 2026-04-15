/**
 * フェーズ進行コマンドのテスト
 */

import { describe, it, expect } from "vitest";
import { AdvancePhaseCommand } from "$lib/domain/commands/AdvancePhaseCommand";
import { createPhaseState, createExodiaVictoryState } from "../../../__testUtils__";

describe("AdvancePhaseCommand", () => {
  describe("canExecute", () => {
    it("ドロー → スタンバイ の場合は true を返す", () => {
      const state = createPhaseState("draw");
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(true);
    });

    it("スタンバイ → メイン1 の場合は true を返す", () => {
      const state = createPhaseState("standby");
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(true);
    });

    it("メイン1 → エンド の場合は true を返す", () => {
      const state = createPhaseState("main1");
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(true);
    });

    it("エンド → エンド（循環）の場合は true を返す", () => {
      const state = createPhaseState("end");
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(true);
    });

    it("ゲームが既に終了している場合は false を返す", () => {
      const state = createExodiaVictoryState();
      const command = new AdvancePhaseCommand();

      expect(command.canExecute(state).isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("ドローからスタンバイに進行する", () => {
      const state = createPhaseState("draw");
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.phase).toBe("standby");
      expect(result.message).toContain("スタンバイフェイズ");
    });

    it("スタンバイからメイン1に進行する", () => {
      const state = createPhaseState("standby");
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.phase).toBe("main1");
      expect(result.message).toContain("メインフェイズ");
    });

    it("メイン1からエンドに進行する", () => {
      const state = createPhaseState("main1");
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.phase).toBe("end");
      expect(result.message).toContain("エンドフェイズ");
    });

    it("エンドフェイズからはエンドフェイズに留まる", () => {
      const state = createPhaseState("end");
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(true);
      expect(result.updatedState.phase).toBe("end");
    });

    it("元の状態を変更しない（イミュータビリティ）", () => {
      const state = createPhaseState("draw");
      const originalPhase = state.phase;
      const command = new AdvancePhaseCommand();

      command.execute(state);

      // 元の状態は変化しないことを確認
      expect(state.phase).toBe(originalPhase);
    });

    it("ゲームが既に終了している場合は失敗する", () => {
      const state = createExodiaVictoryState();
      const command = new AdvancePhaseCommand();

      const result = command.execute(state);

      expect(result.success).toBe(false);
      expect(result.updatedState).toBe(state);
    });
  });

  describe("getNextPhase", () => {
    it("ドローフェイズの次はスタンバイを返す", () => {
      const state = createPhaseState("draw");
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("standby");
    });

    it("スタンバイフェイズの次はメイン1を返す", () => {
      const state = createPhaseState("standby");
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("main1");
    });

    it("メイン1フェイズの次はエンドを返す", () => {
      const state = createPhaseState("main1");
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("end");
    });

    it("エンドフェイズの次はエンドを返す", () => {
      const state = createPhaseState("end");
      const command = new AdvancePhaseCommand();

      expect(command.getNextPhase(state)).toBe("end");
    });
  });

  describe("description", () => {
    it("正しい description を持つ", () => {
      const command = new AdvancePhaseCommand();

      expect(command.description).toBe("Advance to next phase");
    });
  });
});
