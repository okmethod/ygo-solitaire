/**
 * SummonRule - 召喚ルール
 *
 * @module domain/rules/SummonRule
 */

import type { BattlePosition, CardInstance } from "$lib/domain/models/Card";
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

// ===========================
// シンクロ召喚
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

// ===========================
// シンクロ素材選択ステップ
// ===========================

import { selectCardsStep } from "$lib/domain/dsl/steps/primitives/userInteractions";

/**
 * selectSynchroMaterialsStep の設定
 */
type SelectSynchroMaterialsConfig = {
  synchroMonsterId: number;
  synchroMonsterInstanceId: string;
  synchroMonsterName: string;
  targetLevel: number;
};

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

/**
 * シンクロ素材を選択するステップ（1ステップ選択）
 *
 * 処理:
 * 1. フィールドのモンスターから素材を選択（チューナー+非チューナー）
 * 2. canConfirm で条件チェック（条件を満たすまで確定ボタン無効）
 * 3. 素材を墓地へ送る
 * 4. シンクロモンスターを特殊召喚
 */
const selectSynchroMaterialsStep = (config: SelectSynchroMaterialsConfig): AtomicStep => {
  return selectCardsStep({
    id: `${config.synchroMonsterId}-select-synchro-materials`,
    summary: "シンクロ素材を選択",
    description: `チューナー＋非チューナーを選び、レベル合計が ${config.targetLevel} になるようにしてください`,
    availableCards: null,
    _sourceZone: "mainMonsterZone",
    _filter: (card) => Card.Instance.isFaceUp(card),
    minCards: 2,
    maxCards: 5, // 最大5体まで選択可能
    cancelable: true,
    canConfirm: (selectedCards) => isValidSynchroMaterialSelection(selectedCards, config.targetLevel),
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
      const synchroMonster = GameState.Space.findCard(updatedSpace, config.synchroMonsterInstanceId)!;
      updatedSpace = GameState.Space.moveCard(updatedSpace, synchroMonster, "mainMonsterZone", {
        position: "faceUp",
        battlePosition: "attack",
      });

      const emittedEvents: GameEvent[] = [
        ...releaseEvents,
        {
          type: "monsterSummoned" as const,
          sourceCardId: synchroMonster.id,
          sourceInstanceId: synchroMonster.instanceId,
        },
      ];

      return GameProcessing.Result.success(
        { ...currentState, space: updatedSpace },
        `${Card.nameWithBrackets(synchroMonster)}をシンクロ召喚しました`,
        emittedEvents,
      );
    },
  });
};
