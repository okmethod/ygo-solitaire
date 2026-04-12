/**
 * SynchroSummonRule Tests
 *
 * シンクロ召喚ルールのテスト。
 * canSynchroSummonとperformSynchroSummonの動作を検証する。
 *
 * @module tests/unit/domain/rules/SynchroSummonRule
 */

import { describe, it, expect } from "vitest";
import { canSynchroSummon, performSynchroSummon } from "$lib/domain/rules/SynchroSummonRule";
import {
  createMockGameState,
  createSynchroSummonReadyState,
  createMonsterInstance,
  createMonsterOnField,
  createFilledMainDeck,
} from "../../../__testUtils__";

describe("SynchroSummonRule", () => {
  describe("canSynchroSummon", () => {
    describe("フェーズ検証", () => {
      it("ドローフェーズ中は NOT_MAIN_PHASE を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState();
        const drawState = { ...state, phase: "draw" as const };

        // Act
        const result = canSynchroSummon(drawState, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NOT_MAIN_PHASE");
      });

      it("メインフェーズ1では検証を通過する", () => {
        // Arrange
        const state = createSynchroSummonReadyState();

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(true);
      });
    });

    describe("カード検証", () => {
      it("カードが存在しない場合は CARD_NOT_FOUND を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState();

        // Act
        const result = canSynchroSummon(state, "non-existent");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("CARD_NOT_FOUND");
      });

      it("シンクロモンスター以外は NOT_SYNCHRO_MONSTER を返す", () => {
        // Arrange
        const state = createMockGameState({
          space: {
            extraDeck: [
              {
                instanceId: "fusion-0",
                id: 99999999,
                jaName: "Test Fusion",
                type: "monster",
                frameType: "fusion", // Not synchro
                edition: "latest",
                location: "extraDeck",
              },
            ],
            mainMonsterZone: [createMonsterOnField("tuner-0", { isTuner: true, level: 2 })],
          },
          phase: "main1",
        });

        // Act
        const result = canSynchroSummon(state, "fusion-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NOT_SYNCHRO_MONSTER");
      });

      it("シンクロモンスターがエクストラデッキにない場合は CARD_NOT_IN_EXTRA_DECK を返す", () => {
        // Arrange
        const state = createMockGameState({
          space: {
            mainMonsterZone: [createMonsterOnField("tuner-0", { isTuner: true, level: 2 })],
            graveyard: [createMonsterInstance("synchro-0", { frameType: "synchro", level: 6, location: "hand" })],
          },
          phase: "main1",
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("CARD_NOT_IN_EXTRA_DECK");
      });
    });

    describe("素材検証", () => {
      it("チューナーがいない場合は NO_VALID_SYNCHRO_MATERIALS を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState({ tunerLevel: null });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
      });

      it("非チューナーがいない場合は NO_VALID_SYNCHRO_MATERIALS を返す", () => {
        // Arrange: Only tuner on field, no non-tuner
        const state = createMockGameState({
          space: {
            extraDeck: [createMonsterInstance("synchro-0", { frameType: "synchro", level: 6, location: "extraDeck" })],
            mainMonsterZone: [createMonsterOnField("tuner-0", { isTuner: true, level: 2 })],
            ...createFilledMainDeck(30),
          },
          phase: "main1",
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
      });

      it("レベルが一致しない場合は NO_VALID_SYNCHRO_MATERIALS を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState({ tunerLevel: 1, nonTunerLevels: [4], synchroLevel: 8 });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
      });

      it("有効な素材がある場合は成功する（チューナーLv2 + 非チューナーLv4 = Lv6）", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(true);
      });

      it("複数の非チューナーでも成功する（チューナーLv1 + 非チューナーLv2 + 非チューナーLv2 = Lv5）", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 1,
          nonTunerLevels: [2, 2],
          synchroLevel: 5,
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(true);
      });

      it("チューナーLv3 + 非チューナーLv4 = Lv7 で成功する", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 3,
          nonTunerLevels: [4],
          synchroLevel: 7,
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(true);
      });
    });

    describe("裏側モンスターの扱い", () => {
      it("裏側のモンスターを素材として無視する", () => {
        // Arrange: Tuner is face-down
        const state = createMockGameState({
          space: {
            extraDeck: [createMonsterInstance("synchro-0", { frameType: "synchro", level: 6, location: "extraDeck" })],
            mainMonsterZone: [
              createMonsterOnField("tuner-0", { isTuner: true, level: 2, position: "faceDown" }), // Face-down
              createMonsterOnField("nontuner-", { level: 4, position: "faceDown" }),
            ],
            ...createFilledMainDeck(30),
          },
          phase: "main1",
        });

        // Act
        const result = canSynchroSummon(state, "synchro-0");

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("NO_VALID_SYNCHRO_MATERIALS");
      });
    });
  });

  describe("performSynchroSummon", () => {
    it("素材選択ステップを返す", () => {
      // Arrange
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });

      // Act
      const result = performSynchroSummon(state, "synchro-0");

      // Assert
      expect(result.type).toBe("needsSelection");
      expect(result.step).toBeDefined();
      expect(result.step.summary).toContain("シンクロ素材");
    });

    it("メッセージにシンクロモンスター名が含まれる", () => {
      // Arrange
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });

      // Act
      const result = performSynchroSummon(state, "synchro-0");

      // Assert: メッセージにシンクロモンスターの jaName が含まれることを確認
      const synchroCard = state.space.extraDeck.find((c) => c.instanceId === "synchro-0");
      expect(result.message).toContain(synchroCard?.jaName);
    });

    it("キャンセル可能な選択ステップを作成する", () => {
      // Arrange
      const state = createSynchroSummonReadyState({
        tunerLevel: 2,
        nonTunerLevels: [4],
        synchroLevel: 6,
      });

      // Act
      const result = performSynchroSummon(state, "synchro-0");

      // Assert - the step should have properties for selection
      expect(result.step.id).toContain("select-synchro-materials");
    });

    describe("素材選択コールバック", () => {
      it("選択がキャンセルされた場合（空の選択）は失敗を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");

        // Act - call the action with empty selection (cancel)
        const updateResult = result.step.action(state, []);

        // Assert
        expect(updateResult.success).toBe(false);
        expect(updateResult.error).toContain("キャンセル");
      });

      it("有効な選択で素材を墓地に送りシンクロモンスターを召喚する", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");

        // Act - select the tuner and non-tuner
        const updateResult = result.step.action(state, ["tuner-0", "nontuner-0"]);

        // Assert
        expect(updateResult.success).toBe(true);
        expect(updateResult.message).toContain("シンクロ召喚");

        // Verify materials are sent to graveyard
        const graveyardCards = updateResult.updatedState.space.graveyard;
        expect(graveyardCards.some((c) => c.instanceId === "tuner-0")).toBe(true);
        expect(graveyardCards.some((c) => c.instanceId === "nontuner-0")).toBe(true);

        // Verify synchro monster is on the field
        const fieldMonsters = updateResult.updatedState.space.mainMonsterZone;
        const synchro = fieldMonsters.find((c) => c.instanceId === "synchro-0");
        expect(synchro).toBeDefined();
        expect(synchro?.stateOnField?.position).toBe("faceUp");
        expect(synchro?.stateOnField?.battlePosition).toBe("attack");
      });

      it("sentToGraveyard と synchroSummoned イベントを発行する", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");

        // Act
        const updateResult = result.step.action(state, ["tuner-0", "nontuner-0"]);

        // Assert
        expect(updateResult.emittedEvents).toBeDefined();
        expect(updateResult.emittedEvents?.some((e) => e.type === "sentToGraveyard")).toBe(true);
        expect(updateResult.emittedEvents?.some((e) => e.type === "synchroSummoned")).toBe(true);
      });
    });

    describe("canConfirm 検証", () => {
      it("素材選択を検証する canConfirm 関数を持つ", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");

        // Assert - step should have cardSelectionConfig with canConfirm
        expect(result.step.cardSelectionConfig).toBeDefined();
        expect(result.step.cardSelectionConfig!(state)?.canConfirm).toBeDefined();
      });

      it("1枚だけ選択した場合は canConfirm が false を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;
        const tuner = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;

        // Act & Assert
        expect(canConfirm([tuner])).toBe(false);
      });

      it("チューナーのみ選択した場合は canConfirm が false を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        // Add another tuner for this test
        const tuner1 = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;
        const tuner2 = { ...tuner1, instanceId: "tuner-1" };

        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;

        // Act & Assert - two tuners, no non-tuner
        expect(canConfirm([tuner1, tuner2])).toBe(false);
      });

      it("レベル合計が合わない場合は canConfirm が false を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [3], // 2+3=5, but synchro is Lv6
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;
        const tuner = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;
        const nonTuner = state.space.mainMonsterZone.find((c) => c.instanceId === "nontuner-0")!;

        // Act & Assert
        expect(canConfirm([tuner, nonTuner])).toBe(false);
      });

      it("有効な素材選択では canConfirm が true を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 2,
          nonTunerLevels: [4],
          synchroLevel: 6,
        });
        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;
        const tuner = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;
        const nonTuner = state.space.mainMonsterZone.find((c) => c.instanceId === "nontuner-0")!;

        // Act & Assert
        expect(canConfirm([tuner, nonTuner])).toBe(true);
      });

      it("複数の非チューナーで正しいレベルの場合は canConfirm が true を返す", () => {
        // Arrange
        const state = createSynchroSummonReadyState({
          tunerLevel: 1,
          nonTunerLevels: [2, 2], // 1+2+2=5
          synchroLevel: 5,
        });
        const result = performSynchroSummon(state, "synchro-0");
        const config = result.step.cardSelectionConfig!(state);
        expect(config).toBeDefined();
        const canConfirm = config!.canConfirm!;
        const tuner = state.space.mainMonsterZone.find((c) => c.instanceId === "tuner-0")!;
        const nonTuner0 = state.space.mainMonsterZone.find((c) => c.instanceId === "nontuner-0")!;
        const nonTuner1 = state.space.mainMonsterZone.find((c) => c.instanceId === "nontuner-1")!;

        // Act & Assert
        expect(canConfirm([tuner, nonTuner0, nonTuner1])).toBe(true);
      });
    });
  });
});
