/**
 * 起動効果発動コマンドのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ActivateIgnitionEffectCommand } from "$lib/domain/commands/ActivateIgnitionEffectCommand";
import { BaseIgnitionEffect } from "$lib/domain/effects/actions/ignitions/BaseIgnitionEffect";
import { ChainableActionRegistry } from "$lib/domain/effects/actions/ChainableActionRegistry";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import {
  createSpaceState,
  createExodiaVictoryState,
  createSpellInstance,
  createSpellOnField,
  createMonsterOnField,
  DUMMY_CARD_IDS,
} from "../../../__testUtils__";

/**
 * テスト用の起動効果（シンプルなno-op実装）
 *
 * activation: 1ステップ（no-op）
 * resolution: 1ステップ（no-op）
 * → createActivationSteps が加える notifyActivationStep と合わせて計2ステップになる
 */
class TestIgnitionEffect extends BaseIgnitionEffect {
  constructor(cardId: number) {
    super(cardId, 1);
  }

  protected individualConditions(_state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    return GameProcessing.Validation.success();
  }

  protected individualActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: "test-activation-step",
        summary: "テスト発動処理",
        description: "テスト用の発動処理ステップ",
        notificationLevel: "silent",
        action: (s) => ({ success: true, updatedState: s }),
      },
    ];
  }

  protected individualResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [
      {
        id: "test-resolution-step",
        summary: "テスト解決処理",
        description: "テスト用の解決処理ステップ",
        notificationLevel: "silent",
        action: (s) => ({ success: true, updatedState: s }),
      },
    ];
  }
}

describe("ActivateIgnitionEffectCommand", () => {
  let initialState: GameSnapshot;
  // cardId 未指定の createSpellOnField({ spellType: "field" }) は DUMMY_CARD_IDS.FIELD_SPELL を使用する
  const fieldSpellInstanceId = "field-spell-1";

  beforeEach(() => {
    ChainableActionRegistry.registerIgnition(
      DUMMY_CARD_IDS.FIELD_SPELL,
      new TestIgnitionEffect(DUMMY_CARD_IDS.FIELD_SPELL),
    );
    // メイン1フェイズにダミーフィールド魔法が表側でフィールドゾーンにある状態
    initialState = createSpaceState({
      mainDeck: [createSpellInstance("main-0", { location: "mainDeck" })],
      fieldZone: [createSpellOnField(fieldSpellInstanceId, { spellType: "field" })],
    });
  });

  afterEach(() => {
    ChainableActionRegistry.clear();
  });

  describe("canExecute", () => {
    it("起動効果を発動できる場合（メイン1フェイズ、表向きフィールド上）は true を返す", () => {
      const command = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);

      expect(command.canExecute(initialState).isValid).toBe(true);
    });

    it("カードが存在しない場合は false を返す", () => {
      const command = new ActivateIgnitionEffectCommand("non-existent-card");

      expect(command.canExecute(initialState).isValid).toBe(false);
    });

    it("カードが裏向きの場合は false を返す", () => {
      const faceDownState = createSpaceState({
        fieldZone: [createSpellOnField(fieldSpellInstanceId, { spellType: "field", position: "faceDown" })],
      });

      const command = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);

      expect(command.canExecute(faceDownState).isValid).toBe(false);
    });

    it("カードがフィールド上にない場合は false を返す", () => {
      const handState = createSpaceState({
        hand: [createSpellInstance(fieldSpellInstanceId, { spellType: "field" })],
      });

      const command = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);

      expect(command.canExecute(handState).isValid).toBe(false);
    });

    it("ゲームが終了している場合は false を返す", () => {
      const gameOverState = createExodiaVictoryState();

      const command = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);

      expect(command.canExecute(gameOverState).isValid).toBe(false);
    });

    it("起動効果が登録されていないカードの場合は false を返す", () => {
      const noEffectState = createSpaceState({
        fieldZone: [createSpellOnField("field-no-effect", { cardId: 9999999, spellType: "field" })],
      });

      const command = new ActivateIgnitionEffectCommand("field-no-effect");

      expect(command.canExecute(noEffectState).isValid).toBe(false);
    });
  });

  describe("execute", () => {
    it("起動効果を正常に発動し activationSteps を返す", () => {
      const command = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);

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
      const noEffectState = createSpaceState({
        fieldZone: [createSpellOnField("field-no-effect", { cardId: 9999999, spellType: "field" })],
      });

      const command = new ActivateIgnitionEffectCommand("field-no-effect");

      const result = command.execute(noEffectState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("このカードには起動効果がありません");
    });

    it("イミュータビリティを維持する（元の状態が変化しない）", () => {
      const command = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);

      const originalState = { ...initialState };
      command.execute(initialState);

      expect(initialState).toEqual(originalState);
    });

    it("activationSteps に発動ステップと解決ステップを含む", () => {
      const command = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      expect(result.activationSteps).toBeDefined();
      expect(result.chainBlock).toBeDefined();
      // TestIgnitionEffect: activationSteps = 発動通知 + individualActivationStep の2ステップ
      expect(result.activationSteps!.length).toBe(2);
      // chainBlock.resolutionSteps = individualResolutionStep の1ステップ
      expect(result.chainBlock!.resolutionSteps.length).toBe(1);
    });

    it("stateOnField.activatedEffects に発動記録が行われる", () => {
      const command = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);

      const result = command.execute(initialState);

      expect(result.success).toBe(true);
      const fieldCard = result.updatedState.space.fieldZone[0];
      expect(fieldCard.stateOnField?.activatedEffects.includes(`ignition-${DUMMY_CARD_IDS.FIELD_SPELL}-1`)).toBe(true);
    });
  });

  describe("getCardInstanceId", () => {
    it("カードインスタンス ID を返す", () => {
      const command = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);

      expect(command.getCardInstanceId()).toBe(fieldSpellInstanceId);
    });
  });

  // ===========================
  // モンスターカードの起動効果テスト
  // ===========================
  describe("モンスターカードの起動効果", () => {
    const monsterInstanceId = "monster-effect-1";
    let monsterState: GameSnapshot;

    beforeEach(() => {
      ChainableActionRegistry.registerIgnition(
        DUMMY_CARD_IDS.EFFECT_MONSTER,
        new TestIgnitionEffect(DUMMY_CARD_IDS.EFFECT_MONSTER),
      );
      monsterState = createSpaceState({
        mainDeck: [createSpellInstance("main-0", { location: "mainDeck" })],
        mainMonsterZone: [createMonsterOnField(monsterInstanceId, { cardId: DUMMY_CARD_IDS.EFFECT_MONSTER })],
      });
    });

    describe("canExecute", () => {
      it("モンスターの起動効果を発動できる場合は true を返す", () => {
        const command = new ActivateIgnitionEffectCommand(monsterInstanceId);

        expect(command.canExecute(monsterState).isValid).toBe(true);
      });

      it("守備表示の場合も true を返す（起動効果はどの表示形式でも発動可能）", () => {
        const defenseState = createSpaceState({
          mainDeck: monsterState.space.mainDeck,
          mainMonsterZone: [
            createMonsterOnField(monsterInstanceId, {
              cardId: DUMMY_CARD_IDS.EFFECT_MONSTER,
              battlePosition: "defense",
            }),
          ],
        });

        const command = new ActivateIgnitionEffectCommand(monsterInstanceId);

        // 起動効果はどの表示形式でも（表側表示であれば）発動可能
        expect(command.canExecute(defenseState).isValid).toBe(true);
      });
    });

    describe("execute", () => {
      it("モンスターの起動効果を正常に発動し activationSteps を返す", () => {
        const command = new ActivateIgnitionEffectCommand(monsterInstanceId);

        const result = command.execute(monsterState);

        expect(result.success).toBe(true);
        expect(result.updatedState).toBeDefined();
        expect(result.activationSteps).toBeDefined();
        expect(result.activationSteps!.length).toBeGreaterThan(0);
      });

      it("発動通知ステップと解決ステップを含む", () => {
        const command = new ActivateIgnitionEffectCommand(monsterInstanceId);

        const result = command.execute(monsterState);

        expect(result.success).toBe(true);
        expect(result.activationSteps).toBeDefined();
        expect(result.chainBlock).toBeDefined();
        // TestIgnitionEffect: activationSteps = 発動通知 + individualActivationStep の2ステップ
        expect(result.activationSteps!.length).toBe(2);
        // chainBlock.resolutionSteps = individualResolutionStep の1ステップ
        expect(result.chainBlock!.resolutionSteps.length).toBe(1);
      });

      it("全ステップを正常に実行できる", () => {
        const command = new ActivateIgnitionEffectCommand(monsterInstanceId);

        const result = command.execute(monsterState);

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
      });
    });
  });

  // ===========================
  // 複数カードの起動効果テスト
  // ===========================
  describe("複数カードの起動効果", () => {
    it("フィールド魔法とモンスターそれぞれ独立して処理できる", () => {
      ChainableActionRegistry.registerIgnition(
        DUMMY_CARD_IDS.EFFECT_MONSTER,
        new TestIgnitionEffect(DUMMY_CARD_IDS.EFFECT_MONSTER),
      );

      const monsterInstanceId = "monster-effect-1";
      const mixedState = createSpaceState({
        mainDeck: [createSpellInstance("main-0", { location: "mainDeck" })],
        mainMonsterZone: [createMonsterOnField(monsterInstanceId, { cardId: DUMMY_CARD_IDS.EFFECT_MONSTER })],
        fieldZone: [createSpellOnField(fieldSpellInstanceId, { spellType: "field" })],
      });

      const fieldCommand = new ActivateIgnitionEffectCommand(fieldSpellInstanceId);
      const monsterCommand = new ActivateIgnitionEffectCommand(monsterInstanceId);

      // 両方のカードが起動効果を発動できるはず
      expect(fieldCommand.canExecute(mixedState).isValid).toBe(true);
      expect(monsterCommand.canExecute(mixedState).isValid).toBe(true);

      // フィールド魔法の起動効果を発動
      const fieldResult = fieldCommand.execute(mixedState);
      expect(fieldResult.success).toBe(true);

      // フィールド魔法の起動効果の発動ステップを実行して発動記録を行う
      let stateAfterField = fieldResult.updatedState;
      for (const step of fieldResult.activationSteps!) {
        const stepResult = step.action(stateAfterField);
        if (stepResult.success) {
          stateAfterField = stepResult.updatedState;
        }
      }

      // モンスターの起動効果は未使用のため使用可能
      expect(monsterCommand.canExecute(stateAfterField).isValid).toBe(true);
    });
  });
});
