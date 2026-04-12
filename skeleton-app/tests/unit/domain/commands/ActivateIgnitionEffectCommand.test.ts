/**
 * 起動効果発動コマンドのテスト
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ActivateIgnitionEffectCommand } from "$lib/domain/commands/ActivateIgnitionEffectCommand";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import {
  createMockGameState,
  createExodiaVictoryState,
  createSpellInstance,
  createSpellOnField,
  createMonsterOnField,
  ACTUAL_CARD_IDS,
} from "../../../__testUtils__";

describe("ActivateIgnitionEffectCommand", () => {
  let initialState: GameSnapshot;
  const chickenGameInstanceId = "field-chickengame-1";

  beforeEach(() => {
    // Create state with Chicken Game face-up on field during Main1 phase
    initialState = createMockGameState({
      phase: "main1",
      lp: { player: 5000, opponent: 5000 },
      space: {
        mainDeck: [createSpellInstance("main-0", { location: "mainDeck" })],
        extraDeck: [],
        hand: [],
        mainMonsterZone: [],
        spellTrapZone: [],
        fieldZone: [
          createSpellOnField(chickenGameInstanceId, { cardId: ACTUAL_CARD_IDS.CHICKEN_GAME, spellType: "field" }),
        ],
        graveyard: [],
        banished: [],
      },
    });
  });

  describe("canExecute", () => {
    it("起動効果を発動できる場合（メイン1フェイズ、表向きフィールド上、LP >= 1000）は true を返す", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(initialState).isValid).toBe(true);
    });

    it("カードが存在しない場合は false を返す", () => {
      const command = new ActivateIgnitionEffectCommand("non-existent-card");

      expect(command.canExecute(initialState).isValid).toBe(false);
    });

    it("カードが裏向きの場合は false を返す", () => {
      const faceDownState = createMockGameState({
        phase: "main1",
        lp: { player: 5000, opponent: 5000 },
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [
            createSpellOnField(chickenGameInstanceId, {
              cardId: ACTUAL_CARD_IDS.CHICKEN_GAME,
              spellType: "field",
              position: "faceDown",
            }),
          ],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(faceDownState).isValid).toBe(false);
    });

    it("カードがフィールド上にない場合は false を返す", () => {
      const handState = createMockGameState({
        phase: "main1",
        lp: { player: 5000, opponent: 5000 },
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [
            createSpellInstance(chickenGameInstanceId, { cardId: ACTUAL_CARD_IDS.CHICKEN_GAME, spellType: "field" }),
          ],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(handState).isValid).toBe(false);
    });

    it("ゲームが終了している場合は false を返す", () => {
      const gameOverState = createExodiaVictoryState();

      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.canExecute(gameOverState).isValid).toBe(false);
    });

    it("起動効果が登録されていないカードの場合は false を返す", () => {
      const noEffectState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [createSpellOnField("field-spell-1", { cardId: 9999999, spellType: "field" })],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand("field-spell-1");

      expect(command.canExecute(noEffectState).isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("起動効果を正常に発動し activationSteps を返す", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      expect(result.updatedState).toBeDefined();
      expect(result.activationSteps).toBeDefined();
      expect(result.activationSteps!.length).toBeGreaterThan(0);
    });

    it("カードが存在しない場合は失敗を返す", () => {
      const command = new ActivateIgnitionEffectCommand("non-existent-card");

      const result = command.execute(initialState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");
    });

    it("起動効果がないカードの場合は失敗を返す", () => {
      const noEffectState = createMockGameState({
        phase: "main1",
        space: {
          mainDeck: [],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [createSpellOnField("field-spell-1", { cardId: 9999999, spellType: "field" })],
          graveyard: [],
          banished: [],
        },
      });

      const command = new ActivateIgnitionEffectCommand("field-spell-1");

      const result = command.execute(noEffectState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("このカードには起動効果がありません");
    });

    it("イミュータビリティを維持する（元の状態が変化しない）", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      const originalState = { ...initialState };
      command.execute(initialState);

      expect(initialState).toEqual(originalState);
    });

    it("activationSteps に発動ステップと解決ステップを含む", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      expect(result.activationSteps).toBeDefined();
      expect(result.chainBlock).toBeDefined();
      // Chicken Game: activationSteps = activation steps only (発動通知 + LP payment)
      expect(result.activationSteps!.length).toBe(2);
      // chainBlock.resolutionSteps = resolution steps (draw)
      expect(result.chainBlock!.resolutionSteps.length).toBe(1);
    });

    it("stateOnField.activatedEffects に発動記録が行われる", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      // コマンド実行時に発動記録が stateOnField.activatedEffects に行われる
      const chickenGameCard = result.updatedState.space.fieldZone[0];
      expect(
        chickenGameCard.stateOnField?.activatedEffects.includes(`ignition-${ACTUAL_CARD_IDS.CHICKEN_GAME}-1`),
      ).toBe(true);
    });
  });

  describe("getCardInstanceId", () => {
    it("カードインスタンス ID を返す", () => {
      const command = new ActivateIgnitionEffectCommand(chickenGameInstanceId);

      expect(command.getCardInstanceId()).toBe(chickenGameInstanceId);
    });
  });

  // ===========================
  // 統合テスト: 王立魔法図書館
  // ===========================
  describe("王立魔法図書館 統合テスト", () => {
    const royalLibraryInstanceId = "monster-royal-library-1";

    let libraryState: GameSnapshot;

    beforeEach(() => {
      // 魔法カウンターが3個乗った王立魔法図書館が攻撃表示でモンスターゾーンにいる状態を作成
      libraryState = createMockGameState({
        phase: "main1",
        lp: { player: 8000, opponent: 8000 },
        space: {
          mainDeck: [
            createSpellInstance("main-0", { location: "mainDeck" }),
            createSpellInstance("deck-1", { spellType: "equip", location: "mainDeck" }),
          ],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [
            createMonsterOnField(royalLibraryInstanceId, {
              cardId: ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY,
              battlePosition: "attack",
              counters: [{ type: "spell", count: 3 }],
            }),
          ],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });
    });

    describe("canExecute", () => {
      it("王立魔法図書館が起動効果を発動できる場合は true を返す", () => {
        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        expect(command.canExecute(libraryState).isValid).toBe(true);
      });

      it("守備表示の場合も true を返す（起動効果はどの表示形式でも発動可能）", () => {
        const defenseState = createMockGameState({
          phase: "main1",
          lp: { player: 8000, opponent: 8000 },
          space: {
            mainDeck: libraryState.space.mainDeck,
            extraDeck: [],
            hand: [],
            mainMonsterZone: [
              createMonsterOnField(royalLibraryInstanceId, {
                cardId: ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY,
                battlePosition: "defense",
                counters: [{ type: "spell", count: 3 }],
              }),
            ],
            spellTrapZone: [],
            fieldZone: [],
            graveyard: [],
            banished: [],
          },
        });

        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        // Ignition effects can be activated in any battle position as long as the card is face-up
        expect(command.canExecute(defenseState).isValid).toBe(true);
      });

      it("前回発動後も true を返す（1ターン1回制限なし）", () => {
        // 王立魔法図書館には1ターン1回制限がない
        // 実際のゲームではコスト（魔法カウンター3個）が発動回数を制限する
        const activatedState = createMockGameState({
          phase: "main1",
          lp: { player: 8000, opponent: 8000 },
          space: libraryState.space,
        });

        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        // まだ発動できるはず
        expect(command.canExecute(activatedState).isValid).toBe(true);
      });
    });

    describe("execute", () => {
      it("王立魔法図書館の起動効果を正常に発動し activationSteps を返す", () => {
        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        const result = command.execute(libraryState);

        expect(result.success).toBe(true);
        expect(result.updatedState).toBeDefined();
        expect(result.activationSteps).toBeDefined();
        expect(result.activationSteps!.length).toBeGreaterThan(0);
      });

      it("発動通知・カウンター消費・解決ステップを含む", () => {
        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        const result = command.execute(libraryState);

        expect(result.success).toBe(true);
        expect(result.activationSteps).toBeDefined();
        expect(result.chainBlock).toBeDefined();
        // Royal Magical Library: activationSteps = activation steps only (発動通知 + カウンター消費)
        expect(result.activationSteps!.length).toBe(2);
        // chainBlock.resolutionSteps = resolution steps (draw)
        expect(result.chainBlock!.resolutionSteps.length).toBe(1);
      });

      it("全ステップ実行後に1枚ドローする", () => {
        const command = new ActivateIgnitionEffectCommand(royalLibraryInstanceId);

        const result = command.execute(libraryState);

        expect(result.success).toBe(true);
        expect(result.activationSteps).toBeDefined();
        expect(result.chainBlock).toBeDefined();

        // 全ステップを実行: activationSteps（発動）+ chainBlock.resolutionSteps（解決）
        let currentState = result.updatedState;
        for (const step of result.activationSteps!) {
          const stepResult = step.action(currentState);
          expect(stepResult.success).toBe(true);
          currentState = stepResult.updatedState;
        }
        for (const step of result.chainBlock!.resolutionSteps) {
          const stepResult = step.action(currentState);
          expect(stepResult.success).toBe(true);
          currentState = stepResult.updatedState;
        }

        // ドローが行われたことを確認
        expect(currentState.space.hand).toHaveLength(1);
        expect(currentState.space.mainDeck).toHaveLength(1); // Started with 2
      });
    });
  });

  // ===========================
  // 統合テスト: 複数カードの起動効果
  // ===========================
  describe("汎用的な起動効果処理", () => {
    it("チキンゲームと王立魔法図書館それぞれ独立して処理できる", () => {
      const chickenGameId = "field-chickengame-1";
      const royalLibraryId = "monster-royal-library-1";

      const mixedState = createMockGameState({
        phase: "main1",
        lp: { player: 5000, opponent: 5000 },
        space: {
          mainDeck: [createSpellInstance("main-0", { location: "mainDeck" })],
          extraDeck: [],
          hand: [],
          mainMonsterZone: [
            createMonsterOnField(royalLibraryId, {
              cardId: ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY,
              battlePosition: "attack",
              counters: [{ type: "spell", count: 3 }],
            }),
          ],
          spellTrapZone: [],
          fieldZone: [createSpellOnField(chickenGameId, { cardId: ACTUAL_CARD_IDS.CHICKEN_GAME, spellType: "field" })],
          graveyard: [],
          banished: [],
        },
      });

      // 両方のカードが起動効果を発動できるはず
      const chickenCommand = new ActivateIgnitionEffectCommand(chickenGameId);
      const libraryCommand = new ActivateIgnitionEffectCommand(royalLibraryId);

      expect(chickenCommand.canExecute(mixedState).isValid).toBe(true);
      expect(libraryCommand.canExecute(mixedState).isValid).toBe(true);

      // 一方を発動しても、もう一方の発動可否に影響しない
      const chickenResult = chickenCommand.execute(mixedState);
      expect(chickenResult.success).toBe(true);

      // チキンゲームの発動ステップを実行して発動記録を行う
      let stateAfterChicken = chickenResult.updatedState;
      for (const step of chickenResult.activationSteps!) {
        const stepResult = step.action(stateAfterChicken);
        if (stepResult.success) {
          stateAfterChicken = stepResult.updatedState;
        }
      }

      // 王立魔法図書館はまだ発動できるはず
      expect(libraryCommand.canExecute(stateAfterChicken).isValid).toBe(true);
    });
  });
});
