/**
 * summons.ts - 特殊召喚系ステップビルダー
 *
 * StepBuilder:
 * - specialSummonFromDeckStepBuilder: デッキからモンスターを特殊召喚
 */

import type { CardInstance, BattlePosition } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilder } from "../AtomicStepRegistry";
import { canSpecialSummon, executeSpecialSummon } from "$lib/domain/rules/SummonRule";
import { validationErrorMessage } from "$lib/domain/models/GameProcessing/UpdateValidation";
import type { DeckLocationName } from "$lib/domain/models/Location";

// ===========================
// 内部ヘルパー
// ===========================

type SpecialSummonActionConfig = {
  sourceZone: DeckLocationName;
  filter: (card: CardInstance) => boolean;
  battlePosition: BattlePosition;
  shuffleAfter?: boolean;
};

/**
 * 特殊召喚アクションを生成する内部ヘルパー
 */
const createSpecialSummonAction = (config: SpecialSummonActionConfig) => {
  return (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
    // ソースゾーンからフィルター条件に合うカードを取得
    const source = currentState.space[config.sourceZone] as CardInstance[];
    const availableCards = source.filter(config.filter);
    if (availableCards.length === 0) {
      return GameProcessing.Result.failure(
        currentState,
        `No cards available in ${config.sourceZone} matching the criteria`,
      );
    }

    // 特殊召喚可能かチェック
    const validation = canSpecialSummon(currentState);
    if (!validation.isValid) {
      return GameProcessing.Result.failure(currentState, validationErrorMessage(validation));
    }

    // まだ選択が行われていない場合（UIが選択モーダルを表示する）
    if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
      return GameProcessing.Result.failure(currentState, "No cards selected");
    }

    // 特殊召喚を実行
    const instanceId = selectedInstanceIds[0];
    const card = GameState.Space.findCard(currentState.space, instanceId)!;
    let updatedState = executeSpecialSummon(currentState, instanceId, config.battlePosition);

    // 必要ならシャッフル
    if (config.shuffleAfter) {
      updatedState = {
        ...updatedState,
        space: GameState.Space.shuffleMainDeck(updatedState.space),
      };
    }

    return GameProcessing.Result.success(
      updatedState,
      `Special summoned ${card.jaName} in ${config.battlePosition} position`,
    );
  };
};

// ===========================
// AtomicStep 生成関数
// ===========================

/**
 * デッキから指定レベルのモンスターを選択し、フィールドに特殊召喚するステップ
 *
 * 処理:
 * 1. デッキから条件に合うカードを選択（UI表示）
 * 2. 選択したカードをメインモンスターゾーンに特殊召喚
 * 3. デッキをシャッフル
 *
 * TODO: 攻撃表示or守備表示を選択できるようにする
 */
export const specialSummonFromDeckStep = (
  cardId: number,
  filterLevel?: number,
  battlePosition: BattlePosition = "attack",
): AtomicStep => {
  const levelDesc = filterLevel !== undefined ? `レベル${filterLevel}` : "";
  const summary = `${levelDesc}モンスターを特殊召喚`;
  const description = `デッキから${levelDesc}モンスター1体を特殊召喚します`;
  const filter = (card: CardInstance): boolean => {
    if (card.type !== "monster") return false;
    if (filterLevel !== undefined && card.level !== filterLevel) return false;
    return true;
  };

  return {
    id: `${cardId}-special-summon-from-deck-level${filterLevel ?? "any"}`,
    summary,
    description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
      minCards: 1,
      maxCards: 1,
      summary,
      description,
      cancelable: false,
      _sourceZone: "mainDeck",
      _filter: filter,
    },
    action: createSpecialSummonAction({
      sourceZone: "mainDeck",
      filter,
      battlePosition,
      shuffleAfter: true,
    }),
  };
};

/**
 * EXデッキから指定条件のモンスターを選択し、フィールドに特殊召喚するステップ
 *
 * 処理:
 * 1. EXデッキから条件に合うカードを選択（UI表示）
 * 2. 選択したカードをメインモンスターゾーンに特殊召喚
 */
export const specialSummonFromExtraDeckStep = (
  cardId: number,
  filterMaxLevel?: number,
  filterFrameType?: string,
  battlePosition: BattlePosition = "attack",
): AtomicStep => {
  const levelDesc = filterMaxLevel !== undefined ? `レベル${filterMaxLevel}以下の` : "";
  const frameDesc = filterFrameType === "fusion" ? "融合" : "";
  const summary = `${levelDesc}${frameDesc}モンスターを特殊召喚`;
  const description = `EXデッキから${levelDesc}${frameDesc}モンスター1体を特殊召喚します`;

  const filter = (card: CardInstance): boolean => {
    if (card.type !== "monster") return false;
    if (filterMaxLevel !== undefined && (card.level ?? 0) > filterMaxLevel) return false;
    if (filterFrameType !== undefined && card.frameType !== filterFrameType) return false;
    return true;
  };

  return {
    id: `${cardId}-special-summon-from-extra-deck-level${filterMaxLevel ?? "any"}-${filterFrameType ?? "any"}`,
    summary,
    description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
      minCards: 1,
      maxCards: 1,
      summary,
      description,
      cancelable: false,
      _sourceZone: "extraDeck",
      _filter: filter,
    },
    action: createSpecialSummonAction({
      sourceZone: "extraDeck",
      filter,
      battlePosition,
    }),
  };
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SPECIAL_SUMMON_FROM_DECK - デッキからモンスターを特殊召喚
 * args: { filterType: "monster", filterLevel?: number, battlePosition?: BattlePosition }
 */
export const specialSummonFromDeckStepBuilder: StepBuilder = (args, context) => {
  const filterType = args.filterType as string;
  const filterLevel = args.filterLevel as number | undefined;
  const battlePosition = (args.battlePosition as BattlePosition) ?? "attack";
  if (filterType !== "monster") {
    throw new Error('SPECIAL_SUMMON_FROM_DECK step requires filterType to be "monster"');
  }
  return specialSummonFromDeckStep(context.cardId, filterLevel, battlePosition);
};

/**
 * SPECIAL_SUMMON_FROM_EXTRA_DECK - EXデッキからモンスターを特殊召喚
 * args: { filterMaxLevel?: number, filterFrameType?: string, battlePosition?: BattlePosition }
 */
export const specialSummonFromExtraDeckStepBuilder: StepBuilder = (args, context) => {
  const filterMaxLevel = args.filterMaxLevel as number | undefined;
  const filterFrameType = args.filterFrameType as string | undefined;
  const battlePosition = (args.battlePosition as BattlePosition) ?? "attack";
  return specialSummonFromExtraDeckStep(context.cardId, filterMaxLevel, filterFrameType, battlePosition);
};
