/**
 * Phase モデルのテスト
 */

import { describe, it, expect } from "vitest";
import {
  getPhaseDisplayName,
  validatePhaseTransition,
  isMainPhase,
  isEndPhase,
} from "$lib/domain/models/GameState/Phase";

describe("PhaseRule", () => {
  describe("getPhaseDisplayName", () => {
    it("ドローフェイズの日本語名を返すこと", () => {
      expect(getPhaseDisplayName("draw")).toBe("ドローフェイズ");
    });

    it("スタンバイフェイズの日本語名を返すこと", () => {
      expect(getPhaseDisplayName("standby")).toBe("スタンバイフェイズ");
    });

    it("メインフェイズの日本語名を返すこと", () => {
      expect(getPhaseDisplayName("main1")).toBe("メインフェイズ");
    });

    it("エンドフェイズの日本語名を返すこと", () => {
      expect(getPhaseDisplayName("end")).toBe("エンドフェイズ");
    });
  });

  describe("validatePhaseTransition", () => {
    it("ドロー → スタンバイ の遷移は有効であること", () => {
      const result = validatePhaseTransition("draw", "standby");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("ドロー → メイン1 の遷移は無効でエラーを返すこと", () => {
      const result = validatePhaseTransition("draw", "main1");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid phase transition");
      expect(result.error).toContain("draw");
      expect(result.error).toContain("main1");
    });

    it("スタンバイ → エンド の遷移は無効でエラーを返すこと", () => {
      const result = validatePhaseTransition("standby", "end");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Expected: main1");
    });
  });

  describe("canActivateSpellsInPhase", () => {
    it("メインフェイズでは true を返すこと", () => {
      expect(isMainPhase("main1")).toBe(true);
    });

    it("ドローフェイズでは false を返すこと", () => {
      expect(isMainPhase("draw")).toBe(false);
    });

    it("スタンバイフェイズでは false を返すこと", () => {
      expect(isMainPhase("standby")).toBe(false);
    });

    it("エンドフェイズでは false を返すこと", () => {
      expect(isMainPhase("end")).toBe(false);
    });
  });

  describe("isEndPhase", () => {
    it("エンドフェイズでは true を返すこと", () => {
      expect(isEndPhase("end")).toBe(true);
    });

    it("ドローフェイズでは false を返すこと", () => {
      expect(isEndPhase("draw")).toBe(false);
    });

    it("メインフェイズでは false を返すこと", () => {
      expect(isEndPhase("main1")).toBe(false);
    });
  });
});
