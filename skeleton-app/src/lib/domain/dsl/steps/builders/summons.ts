/**
 * summons.ts - 特殊召喚系ステップビルダー
 *
 * StepBuilder:
 * - specialSummonFromDeckStepBuilder: デッキからモンスターを特殊召喚
 */

import type { DeckLocationName } from "$lib/domain/models/Location";
import type { CardInstance, BattlePosition } from "$lib/domain/models/Card";
import type { GameSnapshot, EffectActivationContext } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { EffectId } from "$lib/domain/models/Effect";
import { canSpecialSummon, executeSpecialSummon } from "$lib/domain/rules/SummonRule";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import type { StepBuilder } from "../AtomicStepRegistry";

/** フィルタータイプ（monster または normal_monster） */
type MonsterFilterType = "monster" | "normal_monster";

/** filterLevel の動的参照キー */
type DynamicLevelRef = "paidCosts";

/** filterLevel の型（数値または動的参照） */
type FilterLevelArg = number | DynamicLevelRef;

/** 動的参照かどうかを判定 */
const isDynamicLevelRef = (value: unknown): value is DynamicLevelRef => {
  return value === "paidCosts";
};

/** 動的参照からレベル値を解決（EffectActivationContext から直接取得） */
const resolveDynamicLevelFromContext = (
  ref: DynamicLevelRef,
  context?: EffectActivationContext,
): number | undefined => {
  switch (ref) {
    case "paidCosts":
      return context?.paidCosts;
    default:
      return undefined;
  }
};

/** 動的参照からレベル値を解決（GameSnapshot + effectId から取得、action 用） */
const resolveDynamicLevelFromState = (
  ref: DynamicLevelRef,
  state: GameSnapshot,
  effectId?: EffectId,
): number | undefined => {
  if (!effectId) return undefined;
  const context = state.activationContexts[effectId];
  return resolveDynamicLevelFromContext(ref, context);
};

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
      return GameProcessing.Result.failure(currentState, GameProcessing.Validation.errorMessage(validation));
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
 * デッキから動的レベル指定でモンスターを選択し、フィールドに特殊召喚するステップ
 *
 * filterLevel が "paidCosts" の場合、EffectActivationContext.paidCosts を参照する。
 * filterType が "normal_monster" の場合、通常モンスターのみをフィルターする。
 */
export const specialSummonFromDeckWithDynamicLevelStep = (
  cardId: number,
  filterType: MonsterFilterType,
  filterLevelArg: FilterLevelArg,
  battlePosition: BattlePosition = "attack",
  effectId?: EffectId,
): AtomicStep => {
  const isDynamic = isDynamicLevelRef(filterLevelArg);
  const typeDesc = filterType === "normal_monster" ? "通常" : "";
  const levelDesc = isDynamic ? "（動的レベル）" : `レベル${filterLevelArg}`;
  const summary = `${typeDesc}モンスターを特殊召喚`;
  const description = `デッキから${levelDesc}の${typeDesc}モンスター1体を特殊召喚します`;

  // 動的フィルター: EffectActivationContext を参照してレベルを解決
  const dynamicFilter = (card: CardInstance, _index?: number, context?: EffectActivationContext): boolean => {
    if (card.type !== "monster") return false;
    if (filterType === "normal_monster" && card.frameType !== "normal") return false;

    // レベルフィルター
    const level = isDynamic ? resolveDynamicLevelFromContext(filterLevelArg, context) : (filterLevelArg as number);
    if (level !== undefined && card.level !== level) return false;

    return true;
  };

  // action 用の静的フィルター（動的レベルは action 実行時の state から解決）
  const createActionFilter =
    (state: GameSnapshot) =>
    (card: CardInstance): boolean => {
      if (card.type !== "monster") return false;
      if (filterType === "normal_monster" && card.frameType !== "normal") return false;

      const level = isDynamic
        ? resolveDynamicLevelFromState(filterLevelArg, state, effectId)
        : (filterLevelArg as number);
      if (level !== undefined && card.level !== level) return false;

      return true;
    };

  return {
    id: `${cardId}-special-summon-from-deck-dynamic-level`,
    summary,
    description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null,
      minCards: 1,
      maxCards: 1,
      summary,
      description,
      cancelable: false,
      _sourceZone: "mainDeck",
      _effectId: effectId,
      _filter: dynamicFilter,
    },
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      const filter = createActionFilter(currentState);
      const source = currentState.space.mainDeck;
      const availableCards = source.filter(filter);

      if (availableCards.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards available in mainDeck matching the criteria");
      }

      const validation = canSpecialSummon(currentState);
      if (!validation.isValid) {
        return GameProcessing.Result.failure(currentState, GameProcessing.Validation.errorMessage(validation));
      }

      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards selected");
      }

      const instanceId = selectedInstanceIds[0];
      const card = GameState.Space.findCard(currentState.space, instanceId)!;
      let updatedState = executeSpecialSummon(currentState, instanceId, battlePosition);

      updatedState = {
        ...updatedState,
        space: GameState.Space.shuffleMainDeck(updatedState.space),
      };

      return GameProcessing.Result.success(
        updatedState,
        `Special summoned ${card.jaName} in ${battlePosition} position`,
      );
    },
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
 * args: {
 *   filterType: "monster" | "normal_monster",
 *   filterLevel?: number | "paidCosts",
 *   battlePosition?: BattlePosition
 * }
 */
export const specialSummonFromDeckStepBuilder: StepBuilder = (args, context) => {
  const filterType = ArgValidators.oneOf(args, "filterType", ["monster", "normal_monster"] as const);
  const filterLevel = args.filterLevel as FilterLevelArg | undefined;
  const battlePosition = ArgValidators.optionalOneOf(args, "battlePosition", ["attack", "defense"] as const, "attack");

  // 動的レベル参照または normal_monster の場合は動的対応版を使用
  if (filterLevel !== undefined && (isDynamicLevelRef(filterLevel) || filterType === "normal_monster")) {
    return specialSummonFromDeckWithDynamicLevelStep(
      context.cardId,
      filterType,
      filterLevel,
      battlePosition,
      context.effectId,
    );
  }

  // 従来の静的レベル指定
  return specialSummonFromDeckStep(context.cardId, filterLevel as number | undefined, battlePosition);
};

/**
 * SPECIAL_SUMMON_FROM_EXTRA_DECK - EXデッキからモンスターを特殊召喚
 * args: { filterMaxLevel?: number, filterFrameType?: string, battlePosition?: BattlePosition }
 */
export const specialSummonFromExtraDeckStepBuilder: StepBuilder = (args, context) => {
  const filterMaxLevel = ArgValidators.optionalPositiveInt(args, "filterMaxLevel");
  const filterFrameType = ArgValidators.optionalString(args, "filterFrameType");
  const battlePosition = ArgValidators.optionalOneOf(args, "battlePosition", ["attack", "defense"] as const, "attack");
  return specialSummonFromExtraDeckStep(context.cardId, filterMaxLevel, filterFrameType, battlePosition);
};
