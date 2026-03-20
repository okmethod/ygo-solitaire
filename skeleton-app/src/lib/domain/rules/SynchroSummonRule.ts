/**
 * SynchroSummonRule - シンクロ召喚ルール
 *
 * @module domain/rules/SynchroSummonRule
 */

import { Card, type CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult, AtomicStep } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { selectSynchroMaterialsStep } from "$lib/domain/dsl/steps/builders/synchroMaterials";

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
  const materialSelectionStep = selectSynchroMaterialsStep({
    synchroMonsterId: synchroMonster.id,
    synchroMonsterInstanceId: cardInstanceId,
    synchroMonsterName: synchroMonster.jaName,
    targetLevel,
  });

  return {
    type: "needsSelection",
    message: `${Card.nameWithBrackets(synchroMonster)}のシンクロ素材を選択してください`,
    step: materialSelectionStep,
  };
}
