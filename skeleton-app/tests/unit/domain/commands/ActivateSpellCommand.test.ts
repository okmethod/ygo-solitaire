/**
 * ActivateSpellCommand のユニットテスト
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import {
  createMockGameState,
  createSpellInstance,
  createSpellOnField,
  createExodiaVictoryState,
  DUMMY_CARD_IDS,
} from "../../../__testUtils__";
import type { GameSnapshot } from "$lib/domain/models/GameState";

describe("ActivateSpellCommand", () => {
  let initialState: GameSnapshot;
  const spellCardId = "hand-spell-1";

  beforeEach(() => {
    // メイン1フェイズに手札に魔法カードがある状態を作成
    initialState = createMockGameState({
      phase: "main1",
      space: {
        mainDeck: [
          createSpellInstance("mainDeck-0", {
            spellType: "normal",
            location: "mainDeck",
          }),
          createSpellInstance("mainDeck-1", {
            spellType: "equip",
            location: "mainDeck",
          }),
        ],
        extraDeck: [],
        hand: [
          createSpellInstance(spellCardId, {
            spellType: "normal",
          }),
          createSpellInstance("hand-2", {
            spellType: "quick-play",
          }),
        ],
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [],
        graveyard: [],
        banished: [],
      },
    });
  });

  describe("canExecute", () => {
    it("発動可能な場合（メイン1フェイズ、手札にカードあり）はtrueを返す", () => {
      const command = new ActivateSpellCommand(spellCardId);

      expect(command.canExecute(initialState).isValid).toBe(true);
    });

    it("手札にカードがない場合はfalseを返す", () => {
      const command = new ActivateSpellCommand("non-existent-card");

      expect(command.canExecute(initialState).isValid).toBe(false);
    });

    it("メイン1フェイズ以外はfalseを返す", () => {
      const drawPhaseState = createMockGameState({
        phase: "draw",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [
            createSpellInstance(spellCardId, {
              spellType: "normal",
            }),
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateSpellCommand(spellCardId);

      expect(command.canExecute(drawPhaseState).isValid).toBe(false);
    });

    it("ゲーム終了時はfalseを返す", () => {
      const gameOverState = createExodiaVictoryState();

      const command = new ActivateSpellCommand(spellCardId);

      expect(command.canExecute(gameOverState).isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("魔法カードを発動しactivationStepsを返す", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);

      // 手札からカードが移動したことを確認
      expect(result.updatedState.space.hand.length).toBe(1);
      expect(result.updatedState.space.hand.some((c) => c.instanceId === spellCardId)).toBe(false);

      // 強欲な壺はChainableActionRegistryにエフェクトが登録されている（新システム）
      // カードはspellTrapZoneに残る（エフェクト解決後に墓地へ送られる）
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone.some((c) => c.instanceId === spellCardId)).toBe(true);
      expect(result.updatedState.space.graveyard.length).toBe(0);

      // activationStepsが返されることを確認
      expect(result.activationSteps).toBeDefined();
      expect(result.activationSteps!.length).toBeGreaterThan(0);
    });

    it("手札にカードがない場合は失敗する", () => {
      const command = new ActivateSpellCommand("non-existent-card");

      const result = command.execute(initialState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");

      // 状態は変化しないことを確認
      expect(result.updatedState).toEqual(initialState);
    });

    it("メイン1フェイズ以外は失敗する", () => {
      const drawPhaseState = createMockGameState({
        phase: "draw",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [
            createSpellInstance(spellCardId, {
              spellType: "continuous",
            }),
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(drawPhaseState);

      expect(result.success).toBe(false);
      // Note: メインフェイズチェックは ChainableAction 側で行われ、詳細なエラーメッセージが返る
      expect(result.error).toBe("メインフェイズではありません");

      // 状態は変化しないことを確認
      expect(result.updatedState).toEqual(drawPhaseState);
    });

    it("発動中に他のゾーンが変化しない", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);

      // 他のゾーンは変化しないことを確認
      expect(result.updatedState.space.mainDeck).toEqual(initialState.space.mainDeck);
      expect(result.updatedState.space.banished).toEqual(initialState.space.banished);

      // 手札とspellTrapZoneのみ変化する（強欲な壺はエフェクトがあるためspellTrapZoneに残る）
      expect(result.updatedState.space.hand.length).toBe(initialState.space.hand.length - 1);
      expect(result.updatedState.space.spellTrapZone.length).toBe(initialState.space.spellTrapZone.length + 1);
      expect(result.updatedState.space.graveyard.length).toBe(initialState.space.graveyard.length);
    });

    it("イミュータビリティを維持する（元の状態が変化しない）", () => {
      const command = new ActivateSpellCommand(spellCardId);

      const originalHandLength = initialState.space.hand.length;
      const originalGraveyardLength = initialState.space.graveyard.length;

      command.execute(initialState);

      // 元の状態が変化しないことを確認
      expect(initialState.space.hand.length).toBe(originalHandLength);
      expect(initialState.space.graveyard.length).toBe(originalGraveyardLength);
    });
  });

  describe("getCardInstanceId", () => {
    it("発動中のカードインスタンスIDを返す", () => {
      const command = new ActivateSpellCommand(spellCardId);

      expect(command.getCardInstanceId()).toBe(spellCardId);
    });
  });

  describe("description", () => {
    it("コマンドの説明文を持つ", () => {
      const command = new ActivateSpellCommand(spellCardId);

      expect(command.description).toContain("Activate spell card");
      expect(command.description).toContain(spellCardId);
    });
  });

  describe("ゾーン分離 (US1)", () => {
    it("フィールド魔法をfieldZoneに配置する", () => {
      // Arrange: 手札にフィールド魔法（ダミー）
      const fieldSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [
            createSpellInstance("field-spell-1", {
              spellType: "field",
            }),
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("field-spell-1");
      const result = command.execute(fieldSpellState);

      // Assert: フィールド魔法はspellTrapZoneではなくfieldZoneに配置される
      expect(result.success).toBe(true);
      expect(result.updatedState.space.fieldZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone.length).toBe(0);
      expect(result.updatedState.space.fieldZone[0].id).toBe(DUMMY_CARD_IDS.FIELD_SPELL);
    });

    it("通常魔法をspellTrapZoneに配置する", () => {
      // Arrange: 手札に通常魔法
      const normalSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [
            createSpellInstance("mainDeck-0", {
              spellType: "normal",
              location: "mainDeck",
            }),
            createSpellInstance("mainDeck-1", {
              spellType: "equip",
              location: "mainDeck",
            }),
          ],
          extraDeck: [],
          hand: [
            createSpellInstance("normal-spell-1", {
              spellType: "normal",
            }),
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("normal-spell-1");
      const result = command.execute(normalSpellState);

      // Assert: 通常魔法はfieldZoneではなくspellTrapZoneに配置される
      // アプリ層でエフェクト解決されるまでspellTrapZoneに残る
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.fieldZone.length).toBe(0);
      expect(result.updatedState.space.spellTrapZone[0].id).toBe(DUMMY_CARD_IDS.NORMAL_SPELL);
    });

    it("永続魔法をspellTrapZoneに配置しフィールドに維持する", () => {
      // Arrange: 手札に永続魔法（NoOp登録済み）
      const continuousSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [
            createSpellInstance("continuous-spell-1", {
              spellType: "continuous",
            }),
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("continuous-spell-1");
      const result = command.execute(continuousSpellState);

      // Assert: 永続魔法はフィールドに残る（墓地に送られない）
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.graveyard.length).toBe(0);
      expect(result.updatedState.space.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
    });
  });

  describe("セットカードの発動", () => {
    it("spellTrapZoneにセットされた通常魔法を発動できる", () => {
      // Arrange: spellTrapZoneにセットされた通常魔法
      const setSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [
            createSpellInstance("mainDeck-0", {
              spellType: "normal",
              location: "mainDeck",
            }),
            createSpellInstance("mainDeck-1", {
              spellType: "equip",
              location: "mainDeck",
            }),
          ],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [createSpellOnField("set-spell-1", { position: "faceDown" })],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("set-spell-1");
      const result = command.execute(setSpellState);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
    });

    it("fieldZoneにセットされたフィールド魔法を発動できる", () => {
      // Arrange: fieldZoneにセットされたフィールド魔法（ダミー）
      const setFieldSpellState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [createSpellOnField("set-field-spell-1", { spellType: "field", position: "faceDown" })],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("set-field-spell-1");
      const result = command.execute(setFieldSpellState);

      // Assert: フィールド魔法は表向きになりfieldZoneに残る
      expect(result.success).toBe(true);
      expect(result.updatedState.space.fieldZone.length).toBe(1);
      expect(result.updatedState.space.fieldZone[0].stateOnField?.position).toBe("faceUp");
      expect(result.updatedState.space.fieldZone[0].instanceId).toBe("set-field-spell-1");
      expect(result.activationSteps).toBeDefined();
    });

    it("同一ターンにセットされた速攻魔法は発動を拒否する", () => {
      // Arrange: 同一ターンにセットされた速攻魔法
      const setQuickPlayState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [
            createSpellOnField("set-quick-play-1", {
              spellType: "quick-play",
              position: "faceDown",
              placedThisTurn: true,
            }),
          ],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("set-quick-play-1");
      const result = command.execute(setQuickPlayState);

      // Assert
      expect(result.success).toBe(false);
      // Note: 速攻魔法のセットターン制限は ChainableAction 側で行われ、詳細なエラーメッセージが返る
      expect(result.error).toBe("速攻魔法はセットしたターンに発動できません");
    });

    it("前のターンにセットされた速攻魔法は発動できる", () => {
      // Arrange: 前のターンにセットされた速攻魔法
      const setQuickPlayState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [createSpellOnField("set-quick-play-2", { spellType: "quick-play", position: "faceDown" })], // placedThisTurn: false by default
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("set-quick-play-2");
      const result = command.execute(setQuickPlayState);

      // Assert: セットしたターンでなければ発動可能
      expect(result.success).toBe(true);
      // カードが表向きになることを確認
      expect(result.updatedState.space.spellTrapZone.length).toBe(1);
      expect(result.updatedState.space.spellTrapZone[0].stateOnField?.position).toBe("faceUp");
    });
  });
});
