/**
 * 適用する効果レジストリのテスト
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AdditionalRuleRegistry } from "$lib/domain/effects/rules";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, EventType, GameEvent } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { AdditionalRule, RuleCategory } from "$lib/domain/models/Effect";
import {
  createMonsterOnField,
  createSpellOnField,
  createSpaceState,
  DUMMY_CARD_IDS,
  ACTUAL_CARD_IDS,
} from "../../../../__testUtils__";

const CHICKEN_GAME_ID = ACTUAL_CARD_IDS.CHICKEN_GAME;
const NORMAL_MONSTER_ID = DUMMY_CARD_IDS.NORMAL_MONSTER;

/**
 * テスト用のモック AdditionalRule
 *
 * 実際のカードロジックなしでレジストリ機能をテストするシンプルな実装。
 */
class MockAdditionalRule implements AdditionalRule {
  constructor(
    _ruleName: string,
    public readonly isEffect: boolean = true,
    public readonly category: RuleCategory = "ActionPermission",
    private applyCondition: boolean = true,
  ) {}

  canApply(_state: GameSnapshot): boolean {
    return this.applyCondition;
  }

  checkPermission(_state: GameSnapshot): boolean {
    return false; // モック: パーミッションを拒否
  }

  apply(_state: GameSnapshot): GameSnapshot {
    return _state; // モック: 状態変更なし
  }
}

describe("AdditionalRuleRegistry", () => {
  // テスト間の独立性を確保するため、各テスト前にクリア
  beforeEach(() => {
    AdditionalRuleRegistry.clear();
  });

  describe("register()", () => {
    it("追加ルールを登録できる", () => {
      // 準備
      const cardId = ACTUAL_CARD_IDS.CHICKEN_GAME;
      const rule = new MockAdditionalRule("Chicken Game Continuous");

      // 実行
      AdditionalRuleRegistry.register(cardId, rule);

      // 検証
      const retrieved = AdditionalRuleRegistry.get(cardId);
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toBe(rule);
    });

    it("同一カードに複数のルールを登録できる", () => {
      // 準備
      const cardId = ACTUAL_CARD_IDS.CHICKEN_GAME;
      const rule1 = new MockAdditionalRule("Rule 1", true, "ActionPermission");
      const rule2 = new MockAdditionalRule("Rule 2", false, "StatusModifier");

      // 実行
      AdditionalRuleRegistry.register(cardId, rule1);
      AdditionalRuleRegistry.register(cardId, rule2);

      // 検証
      const retrieved = AdditionalRuleRegistry.get(cardId);
      expect(retrieved).toHaveLength(2);
      expect(retrieved).toContain(rule1);
      expect(retrieved).toContain(rule2);
    });

    it("複数のカードにルールを登録できる", () => {
      // 準備
      const rule1 = new MockAdditionalRule("Rule 1");
      const rule2 = new MockAdditionalRule("Rule 2");

      // 実行
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, rule1);
      AdditionalRuleRegistry.register(NORMAL_MONSTER_ID, rule2);

      // 検証
      expect(AdditionalRuleRegistry.get(CHICKEN_GAME_ID)).toContain(rule1);
      expect(AdditionalRuleRegistry.get(NORMAL_MONSTER_ID)).toContain(rule2);
      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toHaveLength(2);
    });
  });

  describe("get()", () => {
    it("登録済みルールを返す", () => {
      // 準備
      const rule = new MockAdditionalRule("Chicken Game Continuous");
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, rule);

      // 実行
      const retrieved = AdditionalRuleRegistry.get(CHICKEN_GAME_ID);

      // 検証
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toBe(rule);
      expect(retrieved[0]).toBeInstanceOf(MockAdditionalRule);
    });

    it("未知のカードIDに対して空配列を返す", () => {
      // 準備
      const unknownCardId = 99999999;

      // 実行
      const retrieved = AdditionalRuleRegistry.get(unknownCardId);

      // 検証
      expect(retrieved).toEqual([]);
    });

    it("複数ルールが登録されたカードの全ルールを返す", () => {
      // 準備
      const rule1 = new MockAdditionalRule("Rule 1");
      const rule2 = new MockAdditionalRule("Rule 2");
      const rule3 = new MockAdditionalRule("Rule 3");

      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, rule1);
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, rule2);
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, rule3);

      // 実行
      const retrieved = AdditionalRuleRegistry.get(CHICKEN_GAME_ID);

      // 検証
      expect(retrieved).toHaveLength(3);
      expect(retrieved).toEqual([rule1, rule2, rule3]);
    });
  });

  describe("getByCategory()", () => {
    it("カテゴリでフィルタリングしたルールを返す", () => {
      // 準備
      const permissionRule = new MockAdditionalRule("Permission", true, "ActionPermission");
      const modifierRule = new MockAdditionalRule("Modifier", true, "StatusModifier");
      const replacementRule = new MockAdditionalRule("Replacement", true, "ActionOverride");

      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, permissionRule);
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, modifierRule);
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, replacementRule);

      // 実行
      const permissionRules = AdditionalRuleRegistry.getByCategory(CHICKEN_GAME_ID, "ActionPermission");
      const modifierRules = AdditionalRuleRegistry.getByCategory(CHICKEN_GAME_ID, "StatusModifier");

      // 検証
      expect(permissionRules).toHaveLength(1);
      expect(permissionRules[0]).toBe(permissionRule);
      expect(modifierRules).toHaveLength(1);
      expect(modifierRules[0]).toBe(modifierRule);
    });

    it("カテゴリに一致するルールがない場合は空配列を返す", () => {
      // 準備
      const permissionRule = new MockAdditionalRule("Permission", true, "ActionPermission");

      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, permissionRule);

      // 実行
      const modifierRules = AdditionalRuleRegistry.getByCategory(CHICKEN_GAME_ID, "StatusModifier");

      // 検証
      expect(modifierRules).toEqual([]);
    });

    it("未知のカードIDに対して空配列を返す", () => {
      // 準備
      const unknownCardId = 99999999;

      // 実行
      const rules = AdditionalRuleRegistry.getByCategory(unknownCardId, "ActionPermission");

      // 検証
      expect(rules).toEqual([]);
    });
  });

  describe("collectActiveRules()", () => {
    it("フィールドのアクティブなルールを収集する", () => {
      // 準備
      const chickenGameId = ACTUAL_CARD_IDS.CHICKEN_GAME;
      const chickenGameRule = new MockAdditionalRule(
        "Chicken Game",
        true,
        "ActionPermission",
        true, // canApply が true を返す
      );

      AdditionalRuleRegistry.register(chickenGameId, chickenGameRule);

      const chickenGameCard = createSpellOnField("fieldZone-0", { cardId: chickenGameId, spellType: "field" });
      const state = createSpaceState({ fieldZone: [chickenGameCard] });

      // 実行
      const activeRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");

      // 検証
      expect(activeRules).toHaveLength(1);
      expect(activeRules[0]).toBe(chickenGameRule);
    });

    it("裏側表示のカードのルールは収集しない", () => {
      // 準備
      const cardId = ACTUAL_CARD_IDS.CHICKEN_GAME;
      const rule = new MockAdditionalRule("Rule", true, "ActionPermission", true);

      AdditionalRuleRegistry.register(cardId, rule);

      const state = createSpaceState({
        fieldZone: [createSpellOnField("fieldZone-0", { cardId, spellType: "field", position: "faceDown" })],
      });

      // 実行
      const activeRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");

      // 検証
      expect(activeRules).toHaveLength(0);
    });

    it("canApplyがfalseの場合はルールを収集しない", () => {
      // 準備
      const cardId = ACTUAL_CARD_IDS.CHICKEN_GAME;
      const rule = new MockAdditionalRule(
        "Rule",
        true,
        "ActionPermission",
        false, // canApply が false を返す
      );

      AdditionalRuleRegistry.register(cardId, rule);

      const state = createSpaceState({
        fieldZone: [createSpellOnField("fieldZone-0", { cardId, spellType: "field" })],
      });

      // 実行
      const activeRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");

      // 検証
      expect(activeRules).toHaveLength(0);
    });

    it("指定カテゴリに一致するルールのみ収集する", () => {
      // 準備
      const permissionRule = new MockAdditionalRule("Permission", true, "ActionPermission", true);
      const modifierRule = new MockAdditionalRule("Modifier", true, "StatusModifier", true);

      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, permissionRule);
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, modifierRule);

      const state = createSpaceState({
        fieldZone: [createSpellOnField("fieldZone-0", { cardId: CHICKEN_GAME_ID, spellType: "field" })],
      });

      // 実行
      const permissionRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");
      const modifierRules = AdditionalRuleRegistry.collectActiveRules(state, "StatusModifier");

      // 検証
      expect(permissionRules).toHaveLength(1);
      expect(permissionRules[0]).toBe(permissionRule);
      expect(modifierRules).toHaveLength(1);
      expect(modifierRules[0]).toBe(modifierRule);
    });

    it("複数カードのルールを収集する", () => {
      // 準備
      const rule1 = new MockAdditionalRule("Rule 1", true, "ActionPermission", true);
      const rule2 = new MockAdditionalRule("Rule 2", true, "ActionPermission", true);

      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, rule1);
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, rule2);

      const state = createSpaceState({
        fieldZone: [
          createSpellOnField("fieldZone-0", { cardId: CHICKEN_GAME_ID, spellType: "field" }),
          createSpellOnField("fieldZone-1", { cardId: CHICKEN_GAME_ID, spellType: "field" }),
        ],
      });

      // 実行
      const activeRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission");

      // 検証
      expect(activeRules).toHaveLength(4);
      expect(activeRules).toContain(rule1);
      expect(activeRules).toContain(rule2);
    });
  });

  describe("clear()", () => {
    it("全登録済みルールをクリアする", () => {
      // 準備
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, new MockAdditionalRule("Rule 1"));
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, new MockAdditionalRule("Rule 2"));

      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toHaveLength(1);

      // 実行
      AdditionalRuleRegistry.clear();

      // 検証
      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toHaveLength(0);
      expect(AdditionalRuleRegistry.get(CHICKEN_GAME_ID)).toEqual([]);
    });

    it("クリア後に再登録できる", () => {
      // 準備
      const firstRule = new MockAdditionalRule("First Rule");
      const secondRule = new MockAdditionalRule("Second Rule");

      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, firstRule);
      AdditionalRuleRegistry.clear();

      // 実行
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, secondRule);

      // 検証
      const retrieved = AdditionalRuleRegistry.get(CHICKEN_GAME_ID);
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toBe(secondRule);
      expect(retrieved[0]).not.toBe(firstRule);
    });
  });

  describe("getRegisteredCardIds()", () => {
    it("ルールが登録されていない場合は空配列を返す", () => {
      // 実行 & 検証
      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toEqual([]);
    });

    it("登録後に正しいカードIDを返す", () => {
      // 実行
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, new MockAdditionalRule("Rule 1"));
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, new MockAdditionalRule("Rule 2"));

      // 検証
      const registeredIds = AdditionalRuleRegistry.getRegisteredCardIds();
      expect(registeredIds).toHaveLength(1);
      expect(registeredIds).toContain(CHICKEN_GAME_ID);
    });

    it("クリア後に正しいカードIDを返す", () => {
      // 準備
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, new MockAdditionalRule("Rule 1"));
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, new MockAdditionalRule("Rule 2"));

      // 実行
      AdditionalRuleRegistry.clear();

      // 検証
      expect(AdditionalRuleRegistry.getRegisteredCardIds()).toEqual([]);
    });

    it("同一カードに複数登録してもカードIDが重複しない", () => {
      // 実行
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, new MockAdditionalRule("Rule 1"));
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, new MockAdditionalRule("Rule 2"));
      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, new MockAdditionalRule("Rule 3"));

      // 検証
      const registeredIds = AdditionalRuleRegistry.getRegisteredCardIds();
      expect(registeredIds).toHaveLength(1);
      expect(registeredIds[0]).toBe(CHICKEN_GAME_ID);
    });
  });

  describe("collectTriggerRules()", () => {
    /**
     * テスト用のモック TriggerRule
     */
    class MockTriggerRule implements AdditionalRule {
      constructor(
        public readonly triggers: readonly EventType[] = ["spellActivated"],
        private applyCondition: boolean = true,
      ) {}

      readonly isEffect = true;
      readonly category: RuleCategory = "TriggerRule";

      canApply(_state: GameSnapshot): boolean {
        return this.applyCondition;
      }

      createTriggerSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
        return [];
      }
    }

    it("モンスターゾーンから指定イベントのトリガールールを収集する", () => {
      // 準備
      const triggerRule = new MockTriggerRule(["spellActivated"]);

      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, triggerRule);

      const monsterCard = createMonsterOnField("mainMonsterZone-0", { cardId: CHICKEN_GAME_ID });
      const state = createSpaceState({ mainMonsterZone: [monsterCard] });

      // 実行
      const results = AdditionalRuleRegistry.collectTriggerRules(state, "spellActivated");

      // 検証
      expect(results).toHaveLength(1);
      expect(results[0].rule).toBe(triggerRule);
      expect(results[0].sourceInstance).toBe(monsterCard);
    });

    it("異なるイベントのトリガールールは収集しない", () => {
      // 準備
      const triggerRule = new MockTriggerRule(["spellActivated"]);

      AdditionalRuleRegistry.register(CHICKEN_GAME_ID, triggerRule);

      const state = createSpaceState({
        mainMonsterZone: [createMonsterOnField("mainMonsterZone-0", { cardId: CHICKEN_GAME_ID })],
      });

      // 実行
      const results = AdditionalRuleRegistry.collectTriggerRules(state, "normalSummoned");

      // 検証
      expect(results).toHaveLength(0);
    });

    it("裏側表示のカードのトリガールールは収集しない", () => {
      // 準備
      const cardId = ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY;
      const triggerRule = new MockTriggerRule(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const state = createSpaceState({
        mainMonsterZone: [createMonsterOnField("mainMonsterZone-0", { cardId, position: "faceDown" })],
      });

      // 実行
      const results = AdditionalRuleRegistry.collectTriggerRules(state, "spellActivated");

      // 検証
      expect(results).toHaveLength(0);
    });

    it("複数カードのトリガールールを収集する", () => {
      // 準備
      const cardId = ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY;
      const triggerRule = new MockTriggerRule(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const monsterCard1 = createMonsterOnField("mainMonsterZone-0", { cardId });
      const monsterCard2 = createMonsterOnField("mainMonsterZone-1", { cardId });
      const state = createSpaceState({ mainMonsterZone: [monsterCard1, monsterCard2] });

      // 実行
      const results = AdditionalRuleRegistry.collectTriggerRules(state, "spellActivated");

      // 検証
      expect(results).toHaveLength(2);
      expect(results[0].sourceInstance).toBe(monsterCard1);
      expect(results[1].sourceInstance).toBe(monsterCard2);
    });
  });

  describe("collectTriggerSteps()", () => {
    /**
     * テスト用のモック TriggerRule（ステップ生成あり）
     */
    class MockTriggerRuleWithEffect implements AdditionalRule {
      public executionCount = 0;

      constructor(
        public readonly triggers: readonly EventType[] = ["spellActivated"],
        private applyCondition: boolean = true,
      ) {}

      readonly isEffect = true;
      readonly category: RuleCategory = "TriggerRule";

      canApply(_state: GameSnapshot): boolean {
        return this.applyCondition;
      }

      createTriggerSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
        // クロージャで実行回数のインクリメントをキャプチャ
        const incrementExecution = () => {
          this.executionCount++;
        };
        return [
          {
            id: `mock-trigger-${sourceInstance.instanceId}`,
            summary: "Mock trigger effect",
            description: "Test effect",
            notificationLevel: "silent",
            action: (currentState: GameSnapshot) => {
              incrementExecution();
              // マーカーとして LP を変更したステートを返す
              return GameProcessing.Result.success(
                {
                  ...currentState,
                  lp: {
                    ...currentState.lp,
                    player: currentState.lp.player - 100,
                  },
                },
                "Mock trigger executed",
              );
            },
          },
        ];
      }
    }

    /**
     * 収集したステップを順に実行するヘルパー
     */
    function executeSteps(steps: AtomicStep[], state: GameSnapshot): GameSnapshot {
      let currentState = state;
      for (const step of steps) {
        const result = step.action(currentState);
        currentState = result.updatedState;
      }
      return currentState;
    }

    it("トリガーステップを収集し実行してステートを更新する", () => {
      // 準備
      const cardId = ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY;
      const triggerRule = new MockTriggerRuleWithEffect(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const state = createSpaceState({ mainMonsterZone: [createMonsterOnField("mainMonsterZone-0", { cardId })] });

      // 実行
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345, sourceInstanceId: "test-instance" };
      const { mandatorySteps } = AdditionalRuleRegistry.collectTriggerSteps(state, event);
      const newState = executeSteps(mandatorySteps, state);

      // 検証
      expect(mandatorySteps).toHaveLength(1);
      expect(triggerRule.executionCount).toBe(1);
      expect(newState.lp.player).toBe(7900);
    });

    it("canApplyがfalseの場合はトリガーステップを収集しない", () => {
      // 準備
      const cardId = ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY;
      const triggerRule = new MockTriggerRuleWithEffect(["spellActivated"], false);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const state = createSpaceState({ mainMonsterZone: [createMonsterOnField("mainMonsterZone-0", { cardId })] });

      // 実行
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345, sourceInstanceId: "test-instance" };
      const { mandatorySteps } = AdditionalRuleRegistry.collectTriggerSteps(state, event);
      const newState = executeSteps(mandatorySteps, state);

      // 検証
      expect(mandatorySteps).toHaveLength(0);
      expect(triggerRule.executionCount).toBe(0);
      expect(newState.lp.player).toBe(8000);
    });

    it("複数トリガールールのステップを収集する", () => {
      // 準備
      const cardId = ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY;
      const triggerRule = new MockTriggerRuleWithEffect(["spellActivated"]);

      AdditionalRuleRegistry.register(cardId, triggerRule);

      const monsterCard1 = createMonsterOnField("mainMonsterZone-0", { cardId });
      const monsterCard2 = createMonsterOnField("mainMonsterZone-1", { cardId });
      const state = createSpaceState({ mainMonsterZone: [monsterCard1, monsterCard2] });

      // 実行
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345, sourceInstanceId: "test-instance" };
      const { mandatorySteps } = AdditionalRuleRegistry.collectTriggerSteps(state, event);
      const newState = executeSteps(mandatorySteps, state);

      // 検証
      expect(mandatorySteps).toHaveLength(2);
      expect(triggerRule.executionCount).toBe(2);
      expect(newState.lp.player).toBe(7800); // 8000 - 100 - 100
    });
  });
});
