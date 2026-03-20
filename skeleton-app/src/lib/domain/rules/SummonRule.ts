/**
 * SummonRule - 召喚ルール（通常召喚・特殊召喚）
 *
 * @module domain/rules/SummonRule
 */

import type { BattlePosition } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult, AtomicStep, GameEvent } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { emitMonsterSummonedEventStep } from "$lib/domain/dsl/steps/primitives/eventEmitters";
import { selectAndReleaseStep } from "$lib/domain/dsl/steps/builders/releases";

// ===========================
// 通常召喚（アドバンス召喚含む）
// ===========================

/**
 * レベルに応じたリリース必要数を返す
 *
 * - レベル1-4: 0体
 * - レベル5-6: 1体
 * - レベル7以上: 2体
 */
export function getRequiredTributes(level: number | undefined): number {
  if (!level || level <= 4) return 0;
  if (level <= 6) return 1;
  return 2;
}

/**
 * 手札のモンスターの通常召喚が可能かを判定する
 *
 * チェック項目:
 * 1. メインフェイズであること
 * 2. 召喚権が残っていること
 * 3. 指定カードが存在し、モンスターカードであり、手札にあること
 * 4. リリースが不要な場合、モンスターゾーンに空きがあること
 * 5. リリースが必要な場合、リリース可能なモンスターが不足していないこと
 */
export function canNormalSummon(state: GameSnapshot, cardInstanceId: string): ValidationResult {
  // 1. メインフェイズであること
  if (!GameState.Phase.isMain(state.phase)) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
  }

  // 2. 召喚権が残っていること
  if (state.normalSummonUsed >= state.normalSummonLimit) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.SUMMON_LIMIT_REACHED);
  }

  // 3. 指定カードが存在し、モンスターカードであり、手札にあること
  const cardInstance = GameState.Space.findCard(state.space, cardInstanceId);
  if (!cardInstance) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_FOUND);
  }
  if (!Card.isMonster(cardInstance)) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MONSTER_CARD);
  }
  if (!Card.Instance.inHand(cardInstance)) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_IN_HAND);
  }

  const tributeCount = getRequiredTributes(cardInstance.level);
  const monstersOnField = state.space.mainMonsterZone.length;
  if (tributeCount === 0) {
    // 4. リリースが不要な場合、モンスターゾーンに空きがあること
    if (GameState.Space.isMainMonsterZoneFull(state.space)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.MONSTER_ZONE_FULL);
    }
  } else {
    // 5. リリースが必要な場合、リリース可能なモンスターが不足していないこと
    if (monstersOnField < tributeCount) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_ENOUGH_TRIBUTES);
    }
  }

  return GameProcessing.Validation.success();
}

/**
 * 通常召喚の実行結果
 */
type NormalSummonResult =
  | { type: "immediate"; state: GameSnapshot; message: string; activationSteps: AtomicStep[] }
  | { type: "needsSelection"; message: string; step: AtomicStep };

/**
 * 手札のモンスターを通常召喚（召喚またはセット）する
 *
 * レベルに応じて:
 * - レベル4以下: 即座に召喚を実行
 * - レベル5以上: リリース選択ステップを返す
 */
export function performNormalSummon(
  state: GameSnapshot,
  cardInstanceId: string,
  battlePosition: BattlePosition,
): NormalSummonResult {
  const cardInstance = GameState.Space.findCard(state.space, cardInstanceId)!;
  const tributeCount = getRequiredTributes(cardInstance.level);
  const isSet = battlePosition === "defense";
  const actionName = isSet ? "セット" : "召喚";

  if (tributeCount === 0) {
    // 即座に召喚/セット（リリースなし）
    const updatedState = executeNormalSummon(state, cardInstanceId, battlePosition);
    const summonedInstance = GameState.Space.findCard(updatedState.space, cardInstanceId)!;
    const activationSteps = isSet ? [] : [emitMonsterSummonedEventStep(summonedInstance)];

    return {
      type: "immediate",
      state: updatedState,
      message: `${Card.nameWithBrackets(cardInstance)}を${actionName}します`,
      activationSteps,
    };
  } else {
    // リリース選択ステップを生成（selectAndReleaseStep を使用）
    const advancedActionName = isSet ? "アドバンスセット" : "アドバンス召喚";
    const tributeSelectionStep = selectAndReleaseStep({
      cardId: cardInstance.id,
      count: tributeCount,
      onReleased: (stateAfterRelease, _releasedCards, releaseEvents) => {
        // リリース後に召喚を実行
        const updatedState = executeNormalSummon(stateAfterRelease, cardInstanceId, battlePosition);
        const summonedInstance = GameState.Space.findCard(updatedState.space, cardInstanceId)!;

        // セットの場合は召喚イベントを発行しない（裏側なので召喚成功扱いにならない）
        // リリースイベントは常に発行する
        const emittedEvents: GameEvent[] = isSet
          ? releaseEvents
          : [
              ...releaseEvents,
              {
                type: "monsterSummoned" as const,
                sourceCardId: summonedInstance.id,
                sourceInstanceId: summonedInstance.instanceId,
              },
            ];

        return GameProcessing.Result.success(
          updatedState,
          `${Card.nameWithBrackets(cardInstance)}を${advancedActionName}しました`,
          emittedEvents,
        );
      },
    });

    return {
      type: "needsSelection",
      message: `${Card.nameWithBrackets(cardInstance)}のリリース対象を選択してください`,
      step: tributeSelectionStep,
    };
  }
}

/**
 * 通常召喚（召喚またはセット）を実行する（内部用）
 *
 * 処理:
 * 1. 召喚対象のモンスターをフィールドに配置
 * 2. 召喚権を1消費
 *
 * Note: リリース処理は selectAndReleaseStep で事前に行う
 */
function executeNormalSummon(
  state: GameSnapshot,
  cardInstanceId: string,
  battlePosition: BattlePosition,
): GameSnapshot {
  // 1. モンスター配置
  const card = GameState.Space.findCard(state.space, cardInstanceId)!;
  const updatedSpace = GameState.Space.moveCard(state.space, card, "mainMonsterZone", {
    position: battlePosition === "attack" ? "faceUp" : "faceDown",
    battlePosition,
  });

  // 2. 召喚権を1消費
  return {
    ...state,
    space: updatedSpace,
    normalSummonUsed: state.normalSummonUsed + 1,
  };
}

// ===========================
// 特殊召喚
// ===========================

/**
 * 特殊召喚が可能かをチェックする
 *
 * チェック項目:
 * 1. モンスターゾーンに空きがあること
 *
 * Note: フェイズ制限なし、召喚権不要
 */
export function canSpecialSummon(state: GameSnapshot): ValidationResult {
  if (GameState.Space.isMainMonsterZoneFull(state.space)) {
    return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.MONSTER_ZONE_FULL);
  }
  return GameProcessing.Validation.success();
}

/**
 * モンスターを特殊召喚する
 *
 * Note: 召喚権を消費しない
 */
export function executeSpecialSummon(
  state: GameSnapshot,
  cardInstanceId: string,
  battlePosition: BattlePosition,
): GameSnapshot {
  const card = GameState.Space.findCard(state.space, cardInstanceId)!;
  const updatedSpace = GameState.Space.moveCard(state.space, card, "mainMonsterZone", {
    position: "faceUp",
    battlePosition,
  });
  return { ...state, space: updatedSpace };
}
