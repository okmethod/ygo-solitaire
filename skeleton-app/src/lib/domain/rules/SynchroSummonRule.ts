/**
 * SynchroSummonRule - シンクロ召喚ルール
 *
 * @module domain/rules/SynchroSummonRule
 */

import { Card, type CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult, AtomicStep, GameEvent } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { selectCardsStep } from "$lib/domain/dsl/steps/primitives/userInteractions";

// ===========================
// シンクロ召喚判定
// ===========================

/**
 * シンクロ召喚が可能かをチェックする
 *
 * チェック項目:
 * 1. メインフェイズであること
 * 2. 指定カードがEXデッキのシンクロモンスターであること
 * 3. シンクロ召喚可能なシンクロ素材がフィールドに揃っていること
 */
export function canSynchroSummon(state: GameSnapshot, cardInstanceId: string): ValidationResult {
  // 1. メインフェイズであること
  if (!GameState.Phase.isMain(state.phase)) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
  }

  // 2. 指定カードがEXデッキのシンクロモンスターであること
  const cardInstance = GameState.Space.findCard(state.space, cardInstanceId);
  if (!cardInstance) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_FOUND);
  }
  if (cardInstance.frameType !== "synchro") {
    return GameProcessing.Validation.failure("NOT_SYNCHRO_MONSTER");
  }
  if (cardInstance.location !== "extraDeck") {
    return GameProcessing.Validation.failure("CARD_NOT_IN_EXTRA_DECK");
  }

  // 3. シンクロ召喚可能なシンクロ素材がフィールドに揃っていること
  const synchroLevel = cardInstance.level ?? 0;
  if (!hasValidSynchroMaterials(state.space.mainMonsterZone, synchroLevel)) {
    return GameProcessing.Validation.failure("NO_VALID_SYNCHRO_MATERIALS");
  }

  return GameProcessing.Validation.success();
}

// ===========================
// シンクロ素材判定
// ===========================

/**
 * フィールドモンスターから有効なシンクロ素材の組み合わせが存在するかチェック
 */
function hasValidSynchroMaterials(monsters: readonly CardInstance[], targetLevel: number): boolean {
  const faceUpMonsters = monsters.filter((m) => Card.Instance.isFaceUp(m));
  const tuners = faceUpMonsters.filter((m) => Card.isTuner(m));
  const nonTuners = faceUpMonsters.filter((m) => Card.isNonTuner(m));

  // チューナー1体以上 + 非チューナー1体以上が必要
  if (tuners.length === 0 || nonTuners.length === 0) {
    return false;
  }

  // レベル合計が一致する組み合わせを探索
  return findValidCombination(tuners, nonTuners, targetLevel);
}

/**
 * 有効な素材組み合わせを探索（チューナー1体 + 非チューナー複数）
 */
function findValidCombination(tuners: CardInstance[], nonTuners: CardInstance[], targetLevel: number): boolean {
  for (const tuner of tuners) {
    const tunerLevel = tuner.level ?? 0;
    const remaining = targetLevel - tunerLevel;
    if (remaining > 0 && canSumToLevel(nonTuners, remaining)) {
      return true;
    }
  }
  return false;
}

/**
 * 非チューナーの組み合わせでレベル合計を達成できるかチェック（部分和問題）
 */
function canSumToLevel(cards: CardInstance[], target: number): boolean {
  // 動的計画法で解く（カード枚数は少ないので問題ない）
  const levels = cards.map((c) => c.level ?? 0);
  const dp = new Set<number>([0]);
  for (const level of levels) {
    const newSums = new Set<number>();
    for (const sum of dp) {
      newSums.add(sum + level);
    }
    for (const s of newSums) dp.add(s);
  }
  return dp.has(target);
}

/**
 * 選択中のカードがシンクロ召喚条件を満たすかチェック
 *
 * 条件:
 * - チューナー1体以上
 * - 非チューナー1体以上
 * - レベル合計がシンクロモンスターのレベルと一致
 */
function isValidSynchroMaterialSelection(selectedCards: readonly CardInstance[], targetLevel: number): boolean {
  if (selectedCards.length < 2) return false;

  const hasTuner = selectedCards.some((c) => Card.isTuner(c));
  const hasNonTuner = selectedCards.some((c) => Card.isNonTuner(c));

  if (!hasTuner || !hasNonTuner) return false;

  const totalLevel = selectedCards.reduce((sum, c) => sum + (c.level ?? 0), 0);
  return totalLevel === targetLevel;
}

// ===========================
// シンクロ召喚実行
// ===========================

/**
 * シンクロ召喚の実行結果
 */
type SynchroSummonResult = {
  type: "needsSelection";
  message: string;
  step: AtomicStep;
};

/**
 * シンクロ召喚を実行する（素材選択ステップを返す）
 *
 * 処理フロー:
 * 1. 素材選択ステップを生成（チューナー選択 → 非チューナー選択）
 * 2. 選択完了後、素材を墓地へ送りシンクロモンスターを特殊召喚
 */
export function performSynchroSummon(state: GameSnapshot, cardInstanceId: string): SynchroSummonResult {
  const synchroMonster = GameState.Space.findCard(state.space, cardInstanceId)!;
  const targetLevel = synchroMonster.level ?? 0;

  // 素材選択ステップを生成
  const materialSelectionStep = selectCardsStep({
    id: `${synchroMonster.id}-select-synchro-materials`,
    summary: "シンクロ素材を選択",
    description: `チューナー＋非チューナーを選び、レベル合計が ${targetLevel} になるようにしてください`,
    availableCards: null,
    _sourceZone: "mainMonsterZone",
    _filter: (card) => Card.Instance.isFaceUp(card),
    minCards: 2,
    maxCards: 5, // 最大5体まで選択可能
    cancelable: true,
    canConfirm: (selectedCards) => isValidSynchroMaterialSelection(selectedCards, targetLevel),
    onSelect: (currentState, selectedIds) => {
      if (selectedIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "シンクロ召喚をキャンセルしました");
      }

      // 素材を墓地へ送る
      let updatedSpace = currentState.space;
      const releaseEvents: GameEvent[] = [];

      for (const instanceId of selectedIds) {
        const card = GameState.Space.findCard(updatedSpace, instanceId);
        if (card) {
          updatedSpace = GameState.Space.moveCard(updatedSpace, card, "graveyard");
          releaseEvents.push({
            type: "sentToGraveyard",
            sourceCardId: card.id,
            sourceInstanceId: card.instanceId,
          });
        }
      }

      // シンクロモンスターを特殊召喚
      const summonedMonster = GameState.Space.findCard(updatedSpace, cardInstanceId)!;
      updatedSpace = GameState.Space.moveCard(updatedSpace, summonedMonster, "mainMonsterZone", {
        position: "faceUp",
        battlePosition: "attack",
      });

      const emittedEvents: GameEvent[] = [
        ...releaseEvents,
        {
          type: "synchroSummoned" as const,
          sourceCardId: summonedMonster.id,
          sourceInstanceId: summonedMonster.instanceId,
        },
      ];

      return GameProcessing.Result.success(
        { ...currentState, space: updatedSpace },
        `${Card.nameWithBrackets(summonedMonster)}をシンクロ召喚しました`,
        emittedEvents,
      );
    },
  });

  return {
    type: "needsSelection",
    message: `${Card.nameWithBrackets(synchroMonster)}のシンクロ素材を選択してください`,
    step: materialSelectionStep,
  };
}
