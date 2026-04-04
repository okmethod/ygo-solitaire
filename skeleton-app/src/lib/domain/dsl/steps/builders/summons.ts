/**
 * summons.ts - 特殊召喚系ステップビルダー
 *
 * StepBuilder:
 * - specialSummonFromDeckStepBuilder: デッキからモンスターを特殊召喚
 * - specialSummonFromExtraDeckStepBuilder: EXデッキからモンスターを特殊召喚
 * - specialSummonFromContextStepBuilder: コンテキストから対象を特殊召喚
 */

import type { DeckLocationName } from "$lib/domain/models/Location";
import type { CardInstance, BattlePosition } from "$lib/domain/models/Card";
import type { GameSnapshot, EffectActivationContext } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { EffectId } from "$lib/domain/models/Effect";
import { canSpecialSummon, executeSpecialSummon } from "$lib/domain/rules/SummonRule";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import {
  type DynamicLevelRef,
  type FilterLevelArg,
  isDynamicLevelRef,
  resolveDynamicLevelFromContext,
  resolveDynamicLevelFromState,
} from "../primitives/dynamicFiltering";

/** フィルタータイプ（monster または normal_monster） */
type MonsterFilterType = "monster" | "normal_monster";

/** 静的フィルター（action で使用） */
type StaticCardFilter = (card: CardInstance) => boolean;

/** 動的フィルター（cardSelectionConfig で使用、EffectActivationContext を参照可能） */
type DynamicCardFilter = (card: CardInstance, index?: number, context?: EffectActivationContext) => boolean;

// ===========================
// 内部ヘルパー
// ===========================

type SpecialSummonStepConfig = {
  id: string;
  sourceCardId?: number;
  summary: string;
  description: string;
  /** 静的フィルター（action で使用）。動的フィルター使用時は createFilter を指定 */
  filter?: StaticCardFilter;
  /** 動的フィルター（cardSelectionConfig._filter で使用） */
  dynamicFilter?: DynamicCardFilter;
  /** action 実行時に state から動的にフィルターを生成する関数 */
  createFilter?: (state: GameSnapshot) => StaticCardFilter;
  effectId?: EffectId;
};

/**
 * 特殊召喚ステップを生成する内部ヘルパー
 *
 * searches.ts の internalSearchStep パターンに準拠。
 *
 * TODO: 攻撃表示or守備表示を選択できるようにする（現状は攻撃表示固定）
 */
const internalSpecialSummonStep = (
  config: SpecialSummonStepConfig,
  sourceZone: DeckLocationName,
  battlePosition: BattlePosition,
  shuffleAfter: boolean,
): AtomicStep => {
  return {
    id: config.id,
    sourceCardId: config.sourceCardId,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null,
      minCards: 1,
      maxCards: 1,
      summary: config.summary,
      description: config.description,
      cancelable: false,
      _sourceZone: sourceZone,
      _effectId: config.effectId,
      _filter: config.dynamicFilter ?? config.filter,
    },
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // フィルターを解決（動的 or 静的）
      const filter = config.createFilter?.(currentState) ?? config.filter!;

      // ソースゾーンからフィルター条件に合うカードを取得
      const source = currentState.space[sourceZone] as CardInstance[];
      const availableCards = source.filter(filter);
      if (availableCards.length === 0) {
        return GameProcessing.Result.failure(currentState, `No cards available in ${sourceZone} matching the criteria`);
      }

      // 特殊召喚可能かチェック
      const validation = canSpecialSummon(currentState);
      if (!validation.isValid) {
        return GameProcessing.Result.failure(currentState, GameProcessing.Validation.errorMessage(validation));
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards selected");
      }

      // 特殊召喚を実行
      const instanceId = selectedInstanceIds[0];
      const card = GameState.Space.findCard(currentState.space, instanceId)!;
      const { state: summonedState, event: summonEvent } = executeSpecialSummon(
        currentState,
        instanceId,
        battlePosition,
      );

      // 必要ならシャッフル
      const updatedState = shuffleAfter
        ? { ...summonedState, space: GameState.Space.shuffleMainDeck(summonedState.space) }
        : summonedState;

      return GameProcessing.Result.success(
        updatedState,
        `Special summoned ${card.jaName} in ${battlePosition} position`,
        [summonEvent],
      );
    },
  };
};

// ===========================
// AtomicStep 生成関数
// ===========================

/**
 * デッキからモンスターを選択し、フィールドに特殊召喚するステップ
 *
 * 処理:
 * 1. デッキから条件に合うカードを選択（UI表示）
 * 2. 選択したカードをメインモンスターゾーンに特殊召喚
 * 3. デッキをシャッフル
 *
 * @param filterLevelArg - レベルフィルター（数値 or "paidCosts" で動的参照）
 * @param filterType - "monster" or "normal_monster"
 */
export const specialSummonFromDeckStep = (
  cardId: number,
  filterType: MonsterFilterType = "monster",
  filterLevelArg?: FilterLevelArg,
  battlePosition: BattlePosition = "attack",
  effectId?: EffectId,
): AtomicStep => {
  const isDynamic = filterLevelArg !== undefined && isDynamicLevelRef(filterLevelArg);
  const typeDesc = filterType === "normal_monster" ? "通常" : "";
  const levelDesc = filterLevelArg === undefined ? "" : isDynamic ? "（動的レベル）" : `レベル${filterLevelArg}`;
  const summary = `${levelDesc}${typeDesc}モンスターを特殊召喚`;
  const description = `デッキから${levelDesc}の${typeDesc}モンスター1体を特殊召喚します`;

  // 動的フィルター: EffectActivationContext を参照してレベルを解決
  const dynamicFilter: DynamicCardFilter = (card, _index, context) => {
    if (card.type !== "monster") return false;
    if (filterType === "normal_monster" && card.frameType !== "normal") return false;
    if (filterLevelArg !== undefined) {
      const level = isDynamic
        ? resolveDynamicLevelFromContext(filterLevelArg as DynamicLevelRef, context)
        : (filterLevelArg as number);
      if (level !== undefined && card.level !== level) return false;
    }
    return true;
  };

  // action 用の静的フィルター生成関数
  const createFilter = (state: GameSnapshot): StaticCardFilter => {
    return (card) => {
      if (card.type !== "monster") return false;
      if (filterType === "normal_monster" && card.frameType !== "normal") return false;
      if (filterLevelArg !== undefined) {
        const level = isDynamic
          ? resolveDynamicLevelFromState(filterLevelArg as DynamicLevelRef, state, effectId)
          : (filterLevelArg as number);
        if (level !== undefined && card.level !== level) return false;
      }
      return true;
    };
  };

  return internalSpecialSummonStep(
    {
      id: `${cardId}-special-summon-from-deck-level${filterLevelArg ?? "any"}`,
      sourceCardId: cardId,
      summary,
      description,
      dynamicFilter,
      createFilter,
      effectId,
    },
    "mainDeck",
    battlePosition,
    true,
  );
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

  return internalSpecialSummonStep(
    {
      id: `${cardId}-special-summon-from-extra-deck-level${filterMaxLevel ?? "any"}-${filterFrameType ?? "any"}`,
      sourceCardId: cardId,
      summary,
      description,
      filter,
    },
    "extraDeck",
    battlePosition,
    false,
  );
};

/**
 * コンテキストから対象を取得し、特殊召喚するステップ（解決時に使用）
 *
 * @param cardId - カードID
 * @param effectId - 効果ID（コンテキストのキー）
 * @param battlePosition - 表示形式（デフォルト: 攻撃表示）
 * @param clearContext - 処理後にコンテキストをクリアするか（デフォルト: true）
 *                       装備魔法など後続処理でコンテキストを使う場合は false を指定
 */
export const specialSummonFromContextStep = (
  cardId: number,
  effectId: EffectId,
  battlePosition: BattlePosition = "attack",
  clearContext: boolean = true,
): AtomicStep => {
  return {
    id: `${cardId}-special-summon-from-context`,
    summary: "モンスターを特殊召喚",
    description: "対象のモンスターを特殊召喚します",
    notificationLevel: "silent",
    action: (state: GameSnapshot): GameStateUpdateResult => {
      // 1. コンテキストから対象を取得
      const targets = GameState.ActivationContext.getTargets(state.activationContexts, effectId);
      if (targets.length === 0) {
        return GameProcessing.Result.failure(state, "No target found in context");
      }
      const targetInstanceId = targets[0];

      // 2. 対象がまだ墓地にいるか確認
      const targetCard = state.space.graveyard.find((c) => c.instanceId === targetInstanceId);
      if (!targetCard) {
        // 対象が墓地にいない場合は処理失敗（不発）
        // コンテキストをクリアして終了
        const clearedState: GameSnapshot = {
          ...state,
          activationContexts: GameState.ActivationContext.clear(state.activationContexts, effectId),
        };
        return GameProcessing.Result.success(clearedState, "Target no longer in graveyard - effect fizzles");
      }

      // 3. 特殊召喚可能かチェック
      const validation = canSpecialSummon(state);
      if (!validation.isValid) {
        return GameProcessing.Result.failure(state, GameProcessing.Validation.errorMessage(validation));
      }

      // 4. 特殊召喚を実行
      const { state: summonedState, event: summonEvent } = executeSpecialSummon(
        state,
        targetInstanceId,
        battlePosition,
      );

      // 5. コンテキストをクリア（オプション）
      const updatedState = clearContext
        ? {
            ...summonedState,
            activationContexts: GameState.ActivationContext.clear(summonedState.activationContexts, effectId),
          }
        : summonedState;

      // 6. 特殊召喚成功イベントを発行
      return GameProcessing.Result.success(updatedState, `Special summoned ${targetCard.jaName} from graveyard`, [
        summonEvent,
      ]);
    },
  };
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SPECIAL_SUMMON_FROM_DECK - デッキからモンスターを特殊召喚
 * args: {
 *   filterType: "monster" | "normal_monster",
 *   filterLevel?: number | "paidCosts",
 *   battlePosition?: BattlePosition
 * }
 */
export const specialSummonFromDeckStepBuilder: StepBuilderFn = (args, context) => {
  const filterType = ArgValidators.oneOf(args, "filterType", ["monster", "normal_monster"] as const);
  const filterLevel = args.filterLevel as FilterLevelArg | undefined;
  const battlePosition = ArgValidators.optionalOneOf(args, "battlePosition", ["attack", "defense"] as const, "attack");
  return specialSummonFromDeckStep(context.cardId, filterType, filterLevel, battlePosition, context.effectId);
};

/**
 * SPECIAL_SUMMON_FROM_EXTRA_DECK - EXデッキからモンスターを特殊召喚
 * args: {
 *   filterMaxLevel?: number,
 *   filterFrameType?: string,
 *   battlePosition?: BattlePosition
 * }
 */
export const specialSummonFromExtraDeckStepBuilder: StepBuilderFn = (args, context) => {
  const filterMaxLevel = ArgValidators.optionalPositiveInt(args, "filterMaxLevel");
  const filterFrameType = ArgValidators.optionalString(args, "filterFrameType");
  const battlePosition = ArgValidators.optionalOneOf(args, "battlePosition", ["attack", "defense"] as const, "attack");
  return specialSummonFromExtraDeckStep(context.cardId, filterMaxLevel, filterFrameType, battlePosition);
};

/**
 * SPECIAL_SUMMON_FROM_DECK_BY_ATK - デッキから攻撃力フィルタでモンスターを特殊召喚
 * args: {
 *   maxAtk: number,
 *   battlePosition?: BattlePosition
 * }
 */
export const specialSummonFromDeckByAtkStepBuilder: StepBuilderFn = (args, context) => {
  const maxAtk = ArgValidators.positiveInt(args, "maxAtk");
  const battlePosition = ArgValidators.optionalOneOf(args, "battlePosition", ["attack", "defense"] as const, "attack");

  const summary = `攻撃力${maxAtk}以下のモンスターを特殊召喚`;
  const description = `デッキから攻撃力${maxAtk}以下のモンスター1体を特殊召喚します`;

  const filter = (card: CardInstance): boolean => {
    if (card.type !== "monster") return false;
    if (card.attack === undefined || card.attack === null) return false;
    return card.attack <= maxAtk;
  };

  return internalSpecialSummonStep(
    {
      id: `${context.cardId}-special-summon-from-deck-by-atk${maxAtk}`,
      sourceCardId: context.cardId,
      summary,
      description,
      filter,
    },
    "mainDeck",
    battlePosition,
    true,
  );
};

/**
 * SPECIAL_SUMMON_FROM_CONTEXT - コンテキストから対象を特殊召喚
 * args: {
 *   battlePosition?: BattlePosition,
 *   clearContext?: boolean
 * }
 */
export const specialSummonFromContextStepBuilder: StepBuilderFn = (args, context) => {
  if (!context.effectId) {
    throw new Error("SPECIAL_SUMMON_FROM_CONTEXT step requires effectId in context");
  }
  const battlePosition = ArgValidators.optionalOneOf(args, "battlePosition", ["attack", "defense"] as const, "attack");
  const clearContext = ArgValidators.optionalBoolean(args, "clearContext", true);
  return specialSummonFromContextStep(context.cardId, context.effectId, battlePosition, clearContext);
};
