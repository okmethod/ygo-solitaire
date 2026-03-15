/**
 * searches.ts - サーチ・サルベージ系ステップビルダー
 *
 * StepBuilder:
 * - searchFromDeckStepBuilder: デッキからカードタイプでサーチ
 * - searchFromDeckByNameStepBuilder: デッキからカード名でサーチ
 * - searchFromDeckTopStepBuilder: デッキトップから選んでサーチ
 * - salvageFromGraveyardStepBuilder: 墓地からサルベージ
 */

import type { CardInstance, CardType, FrameSubType, SpellSubType } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";

// カードを検索して手札に加える処理の共通ステップ
const internalSearchStep = (
  config: {
    id: string;
    summary: string;
    description: string;
    filter: (card: CardInstance, index?: number) => boolean;
    minCards: number;
    maxCards: number;
    cancelable?: boolean;
  },
  sourceZone: "graveyard" | "mainDeck",
  shouldShuffle: boolean,
): AtomicStep => {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
      _sourceZone: sourceZone,
      _filter: config.filter,
    },
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // ソースゾーンのカードをフィルタリング
      const availableCards =
        sourceZone === "graveyard"
          ? currentState.space.graveyard.filter(config.filter)
          : currentState.space.mainDeck.filter((card, index) => config.filter(card, index));

      // 条件に合うカードが存在しない場合はエラー
      if (availableCards.length === 0) {
        return GameProcessing.Result.failure(currentState, `No cards available in ${sourceZone} matching the criteria`);
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards selected");
      }

      // 選択されたカードをソースゾーンから手札に移動
      let updatedSpace = currentState.space;
      for (const instanceId of selectedInstanceIds) {
        const card = GameState.Space.findCard(updatedSpace, instanceId)!;
        updatedSpace = GameState.Space.moveCard(updatedSpace, card, "hand");
      }

      // フラグで指示されている場合はシャッフル
      if (shouldShuffle) {
        updatedSpace = GameState.Space.shuffleMainDeck(updatedSpace);
      }

      const updatedState: GameSnapshot = { ...currentState, space: updatedSpace };
      const shuffleMessage = shouldShuffle ? " and shuffled" : "";
      return GameProcessing.Result.success(
        updatedState,
        `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from ${sourceZone} to hand${shuffleMessage}`,
      );
    },
  };
};

/** デッキからカードタイプでサーチするステップ */
export const searchFromDeckByTypeStep = (
  cardId: number,
  filterType: CardType,
  count: number,
  filterSpellType?: SpellSubType,
): AtomicStep => {
  const filter = (card: CardInstance): boolean => {
    if (card.type !== filterType) return false;
    if (filterSpellType && card.spellType !== filterSpellType) return false;
    return true;
  };
  const filterDescEn = filterSpellType ? `${filterSpellType}${filterType}` : filterType;
  const filterDescJa = Card.TypeJaName(filterType, undefined, filterSpellType, undefined);
  const summary = `${filterDescJa}カード${count}枚をサーチ`;
  const description = `デッキから${filterDescJa}カード${count}枚を選択し、手札に加えます`;

  return internalSearchStep(
    {
      id: `${cardId}-search-from-deck-${filterDescEn}`,
      summary,
      description,
      filter,
      minCards: count,
      maxCards: count,
      cancelable: false,
    },
    "mainDeck",
    true,
  );
};

/** デッキからカード名でサーチするステップ */
export const searchFromDeckByNameStep = (cardId: number, namePattern: string, count: number): AtomicStep => {
  const filter = (card: CardInstance): boolean => card.jaName.includes(namePattern);
  const summary = `「${namePattern}」カード${count}枚をサーチ`;
  const description = `デッキから「${namePattern}」を含むカード${count}枚を選択し、手札に加えます`;

  return internalSearchStep(
    {
      id: `${cardId}-search-by-name-${namePattern}`,
      summary,
      description,
      filter,
      minCards: count,
      maxCards: count,
      cancelable: false,
    },
    "mainDeck",
    true,
  );
};

/** デッキトップから選んでサーチするステップ */
export const searchFromDeckTopStep = (cardId: number, count: number, selectCount: number): AtomicStep => {
  const summary = `デッキトップ${count}枚から${selectCount}枚をサーチ`;
  const description = `デッキトップ${count}枚から${selectCount}枚を選択し、手札に加えます`;
  const filter = (_card: CardInstance, index?: number): boolean => index !== undefined && index < count;

  return {
    id: `${cardId}-search-from-deck-top-${count}`,
    summary,
    description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null,
      minCards: selectCount,
      maxCards: selectCount,
      summary,
      description,
      cancelable: false,
      _sourceZone: "mainDeck",
      _filter: filter,
    },
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      const topCards = currentState.space.mainDeck.slice(0, count);

      if (topCards.length < count) {
        return GameProcessing.Result.failure(
          currentState,
          `Cannot excavate ${count} cards. Deck has only ${topCards.length} cards.`,
        );
      }

      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards selected");
      }

      let updatedSpace = currentState.space;
      for (const instanceId of selectedInstanceIds) {
        const card = GameState.Space.findCard(updatedSpace, instanceId)!;
        updatedSpace = GameState.Space.moveCard(updatedSpace, card, "hand");
      }

      const updatedState: GameSnapshot = { ...currentState, space: updatedSpace };
      return GameProcessing.Result.success(
        updatedState,
        `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from deck to hand`,
      );
    },
  };
};

/** モンスターをATK/DEFでフィルタしてサーチするステップ */
export const searchMonsterByStatStep = (
  cardId: number,
  statType: "attack" | "defense",
  maxValue: number,
  count: number,
): AtomicStep => {
  const statJa = statType === "attack" ? "攻撃力" : "守備力";
  const filter = (card: CardInstance): boolean => {
    if (card.type !== "monster") return false;
    const statValue = card[statType];
    if (statValue === undefined) return false;
    return statValue <= maxValue;
  };
  const summary = `${statJa}${maxValue}以下のモンスター${count}体をサーチ`;
  const description = `デッキから${statJa}${maxValue}以下のモンスター${count}体を選択し、手札に加えます`;

  return internalSearchStep(
    {
      id: `${cardId}-search-monster-by-${statType}-${maxValue}`,
      summary,
      description,
      filter,
      minCards: count,
      maxCards: count,
      cancelable: false,
    },
    "mainDeck",
    true,
  );
};

/** 墓地からサルベージするステップ */
export const salvageFromGraveyardStep = (
  cardId: number,
  filterType: CardType,
  count: number,
  filterSpellType?: SpellSubType,
  filterFrameType?: FrameSubType,
): AtomicStep => {
  const filter = (card: CardInstance): boolean => {
    if (card.type !== filterType) return false;
    if (filterSpellType && card.spellType !== filterSpellType) return false;
    if (filterFrameType && card.frameType !== filterFrameType) return false;
    return true;
  };
  const filterDescPartsEn: string[] = [];
  if (filterFrameType) filterDescPartsEn.push(filterFrameType);
  if (filterSpellType) filterDescPartsEn.push(filterSpellType);
  filterDescPartsEn.push(filterType);
  const filterDescEn = filterDescPartsEn.join("");
  const filterDescJa = Card.TypeJaName(filterType, filterFrameType, filterSpellType, undefined);
  const summary = `${filterDescJa}カード${count}枚をサルベージ`;
  const description = `墓地から${filterDescJa}カード${count}枚を選択し、手札に加えます`;

  return internalSearchStep(
    {
      id: `${cardId}-salvage-from-graveyard-${filterDescEn}`,
      summary,
      description,
      filter,
      minCards: count,
      maxCards: count,
      cancelable: false,
    },
    "graveyard",
    false,
  );
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SEARCH_FROM_DECK - デッキからカードタイプでサーチ
 * args: { filterType: CardType, count: number, filterSpellType?: SpellSubType }
 */
export const searchFromDeckStepBuilder: StepBuilderFn = (args, context) => {
  const filterType = ArgValidators.nonEmptyString(args, "filterType") as CardType;
  const filterSpellType = ArgValidators.optionalSpellSubType(args, "filterSpellType");
  const count = ArgValidators.positiveInt(args, "count");
  return searchFromDeckByTypeStep(context.cardId, filterType, count, filterSpellType);
};

/**
 * SEARCH_FROM_DECK_BY_NAME - デッキからカード名でサーチ
 * args: { namePattern: string, count: number }
 */
export const searchFromDeckByNameStepBuilder: StepBuilderFn = (args, context) => {
  const namePattern = ArgValidators.nonEmptyString(args, "namePattern");
  const count = ArgValidators.positiveInt(args, "count");
  return searchFromDeckByNameStep(context.cardId, namePattern, count);
};

/**
 * SEARCH_FROM_DECK_TOP - デッキトップから選んでサーチ
 * args: { count: number, selectCount: number }
 */
export const searchFromDeckTopStepBuilder: StepBuilderFn = (args, context) => {
  const count = ArgValidators.positiveInt(args, "count");
  const selectCount = ArgValidators.positiveInt(args, "selectCount");
  return searchFromDeckTopStep(context.cardId, count, selectCount);
};

/**
 * SEARCH_MONSTER_BY_STAT - モンスターをATK/DEFでサーチ
 * args: { statType: "attack" | "defense", maxValue: number, count: number }
 */
export const searchMonsterByStatStepBuilder: StepBuilderFn = (args, context) => {
  const statType = ArgValidators.oneOf(args, "statType", ["attack", "defense"] as const);
  const maxValue = ArgValidators.nonNegativeInt(args, "maxValue");
  const count = ArgValidators.positiveInt(args, "count");
  return searchMonsterByStatStep(context.cardId, statType, maxValue, count);
};

/**
 * SALVAGE_FROM_GRAVEYARD - 墓地からサルベージ
 * args: { filterType: CardType, count: number, filterSpellType?: SpellSubType, filterFrameType?: FrameSubType }
 */
export const salvageFromGraveyardStepBuilder: StepBuilderFn = (args, context) => {
  const filterType = ArgValidators.nonEmptyString(args, "filterType") as CardType;
  const filterSpellType = ArgValidators.optionalSpellSubType(args, "filterSpellType");
  const filterFrameType = ArgValidators.optionalString(args, "filterFrameType") as FrameSubType | undefined;
  const count = ArgValidators.positiveInt(args, "count");
  return salvageFromGraveyardStep(context.cardId, filterType, count, filterSpellType, filterFrameType);
};
