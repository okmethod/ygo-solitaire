/**
 * AtomicStep Effect Library - ステップライブラリ
 *
 * ステップの登録とエクスポートを行う。
 * 各ステップ実装ファイルから具体的なビルダーをインポートし、
 * レジストリに登録する。
 *
 * @module domain/effects/steps
 */

import type { CardInstance, CardType, FrameSubType, SpellSubType, CounterType } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { Player } from "$lib/domain/models/GameState";

// レジストリAPI
import { AtomicStepRegistry, type StepBuilder, type StepBuildContext } from "./AtomicStepRegistry";
import { STEP_NAMES, type StepName } from "./StepNames";

// 具体実装
import { drawStep, fillHandsStep } from "./builders/draws";
import { sendToGraveyardStep, selectAndDiscardStep, discardAllHandEndPhaseStep } from "./builders/discards";
import { markThenStep } from "./builders/timing";
import { gainLpStep, payLpStep } from "./builders/lifePoints";
import { searchFromDeckByConditionStep, searchFromDeckTopStep, salvageFromGraveyardStep } from "./builders/searches";
import { addCounterStep, removeCounterStep } from "./builders/counters";
import { shuffleDeckStep } from "./builders/deckOperations";
import { selectReturnShuffleDrawStep } from "./builders/compositeOperations";
import { changeBattlePositionStep } from "./builders/battlePosition";
import { specialSummonFromDeckStep } from "./builders/summons";
import { notifyActivationStep } from "./builders/userInteractions";
import { emitSpellActivatedEventStep, emitMonsterSummonedEventStep } from "./builders/eventEmitters";

// ===========================
// エクスポート
// ===========================

export { AtomicStepRegistry, type StepBuilder, type StepBuildContext };
export { STEP_NAMES, type StepName };
export {
  drawStep,
  fillHandsStep,
  sendToGraveyardStep,
  selectAndDiscardStep,
  discardAllHandEndPhaseStep,
  markThenStep,
  gainLpStep,
  payLpStep,
  searchFromDeckByConditionStep,
  searchFromDeckTopStep,
  salvageFromGraveyardStep,
  shuffleDeckStep,
  addCounterStep,
  removeCounterStep,
  selectReturnShuffleDrawStep,
  changeBattlePositionStep,
  specialSummonFromDeckStep,
  notifyActivationStep,
  emitSpellActivatedEventStep,
  emitMonsterSummonedEventStep,
};

export const buildStep = AtomicStepRegistry.build.bind(AtomicStepRegistry);

// ===========================
// ステップ登録
// ===========================

/**
 * DRAW - 指定枚数ドロー
 * args: { count: number }
 */
AtomicStepRegistry.register("DRAW", (args) => {
  const count = args.count as number;
  if (typeof count !== "number" || count < 1) {
    throw new Error("DRAW step requires a positive count argument");
  }
  return drawStep(count);
});

/**
 * SELECT_AND_DISCARD - 手札から指定枚数を選択して捨てる
 * args: { count: number, cancelable?: boolean, filterType?: CardType }
 */
AtomicStepRegistry.register("SELECT_AND_DISCARD", (args) => {
  const count = args.count as number;
  const cancelable = args.cancelable as boolean | undefined;
  const filterType = args.filterType as CardType | undefined;
  if (typeof count !== "number" || count < 1) {
    throw new Error("SELECT_AND_DISCARD step requires a positive count argument");
  }
  return selectAndDiscardStep(count, cancelable, filterType);
});

/**
 * FILL_HANDS - 手札が指定枚数になるまでドロー
 * args: { count: number }
 */
AtomicStepRegistry.register("FILL_HANDS", (args) => {
  const count = args.count as number;
  if (typeof count !== "number" || count < 1) {
    throw new Error("FILL_HANDS step requires a positive count argument");
  }
  return fillHandsStep(count);
});

/**
 * THEN - タイミング進行マーカー（「その後」）
 * args: なし
 */
AtomicStepRegistry.register("THEN", () => markThenStep());

/**
 * GAIN_LP - LP回復
 * args: { amount: number, target: "player" | "opponent" }
 */
AtomicStepRegistry.register("GAIN_LP", (args) => {
  const amount = args.amount as number;
  const target = (args.target as Player) ?? "player";
  if (typeof amount !== "number" || amount < 1) {
    throw new Error("GAIN_LP step requires a positive amount argument");
  }
  if (target !== "player" && target !== "opponent") {
    throw new Error('GAIN_LP step requires target to be "player" or "opponent"');
  }
  return gainLpStep(amount, target);
});

/**
 * SEARCH_FROM_DECK - デッキからカードをサーチ
 * args: { filterType: CardType, filterSpellType?: SpellSubType, count: number }
 */
AtomicStepRegistry.register("SEARCH_FROM_DECK", (args, context) => {
  const filterType = args.filterType as CardType;
  const filterSpellType = args.filterSpellType as SpellSubType | undefined;
  const count = args.count as number;

  if (!filterType) {
    throw new Error("SEARCH_FROM_DECK step requires filterType argument");
  }
  if (typeof count !== "number" || count < 1) {
    throw new Error("SEARCH_FROM_DECK step requires a positive count argument");
  }

  // フィルター関数を生成
  const filter = (card: CardInstance): boolean => {
    if (card.type !== filterType) return false;
    if (filterSpellType && card.spellType !== filterSpellType) return false;
    return true;
  };

  // ID用（英語）
  const filterDescEn = filterSpellType ? `${filterSpellType}${filterType}` : filterType;
  // 表示用（日本語）
  const filterDescJa = Card.TypeJaName(filterType, undefined, filterSpellType, undefined);

  return searchFromDeckByConditionStep({
    id: `${context.cardId}-search-from-deck-${filterDescEn}`,
    summary: `${filterDescJa}カード${count}枚をサーチ`,
    description: `デッキから${filterDescJa}カード${count}枚を選択し、手札に加えます`,
    filter,
    minCards: count,
    maxCards: count,
    cancelable: false,
  });
});

/**
 * SALVAGE_FROM_GRAVEYARD - 墓地からカードをサルベージ
 * args: { filterType: CardType, filterSpellType?: SpellSubType, filterFrameType?: FrameSubType, count: number }
 */
AtomicStepRegistry.register("SALVAGE_FROM_GRAVEYARD", (args, context) => {
  const filterType = args.filterType as CardType;
  const filterSpellType = args.filterSpellType as SpellSubType | undefined;
  const filterFrameType = args.filterFrameType as FrameSubType | undefined;
  const count = args.count as number;

  if (!filterType) {
    throw new Error("SALVAGE_FROM_GRAVEYARD step requires filterType argument");
  }
  if (typeof count !== "number" || count < 1) {
    throw new Error("SALVAGE_FROM_GRAVEYARD step requires a positive count argument");
  }

  // フィルター関数を生成
  const filter = (card: CardInstance): boolean => {
    if (card.type !== filterType) return false;
    if (filterSpellType && card.spellType !== filterSpellType) return false;
    if (filterFrameType && card.frameType !== filterFrameType) return false;
    return true;
  };

  // ID用（英語）
  const filterDescPartsEn: string[] = [];
  if (filterFrameType) filterDescPartsEn.push(filterFrameType);
  if (filterSpellType) filterDescPartsEn.push(filterSpellType);
  filterDescPartsEn.push(filterType);
  const filterDescEn = filterDescPartsEn.join("");

  // 表示用（日本語）
  const filterDescJa = Card.TypeJaName(filterType, filterFrameType, filterSpellType, undefined);

  return salvageFromGraveyardStep({
    id: `${context.cardId}-salvage-from-graveyard-${filterDescEn}`,
    summary: `${filterDescJa}カード${count}枚をサルベージ`,
    description: `墓地から${filterDescJa}カード${count}枚を選択し、手札に加えます`,
    filter,
    minCards: count,
    maxCards: count,
    cancelable: false,
  });
});

/**
 * DISCARD_ALL_HAND_END_PHASE - エンドフェイズに手札を全て捨てる効果を登録
 * args: なし
 */
AtomicStepRegistry.register("DISCARD_ALL_HAND_END_PHASE", () => {
  return discardAllHandEndPhaseStep();
});

/**
 * PLACE_COUNTER - カードにカウンターを置く
 * args: { counterType: CounterType, count: number, limit?: number }
 */
AtomicStepRegistry.register("PLACE_COUNTER", (args, context) => {
  const counterType = args.counterType as CounterType;
  const count = args.count as number;
  const limit = args.limit as number | undefined;

  if (!counterType) {
    throw new Error("PLACE_COUNTER step requires counterType argument");
  }
  if (typeof count !== "number" || count < 1) {
    throw new Error("PLACE_COUNTER step requires a positive count argument");
  }

  // sourceInstanceId が必要（カウンターを置く対象）
  const targetInstanceId = context.sourceInstanceId ?? `instance-${context.cardId}`;

  return addCounterStep(targetInstanceId, counterType, count, limit);
});

/**
 * REMOVE_COUNTER - カードからカウンターを取り除く
 * args: { counterType: CounterType, count: number }
 */
AtomicStepRegistry.register("REMOVE_COUNTER", (args, context) => {
  const counterType = args.counterType as CounterType;
  const count = args.count as number;

  if (!counterType) {
    throw new Error("REMOVE_COUNTER step requires counterType argument");
  }
  if (typeof count !== "number" || count < 1) {
    throw new Error("REMOVE_COUNTER step requires a positive count argument");
  }

  // sourceInstanceId が必要（カウンターを取り除く対象）
  const targetInstanceId = context.sourceInstanceId ?? `instance-${context.cardId}`;

  return removeCounterStep(targetInstanceId, counterType, count);
});

/**
 * PAY_LP - LP支払い（コスト）
 * args: { amount: number, target?: "player" | "opponent" }
 */
AtomicStepRegistry.register("PAY_LP", (args) => {
  const amount = args.amount as number;
  const target = (args.target as Player) ?? "player";
  if (typeof amount !== "number" || amount < 1) {
    throw new Error("PAY_LP step requires a positive amount argument");
  }
  if (target !== "player" && target !== "opponent") {
    throw new Error('PAY_LP step requires target to be "player" or "opponent"');
  }
  return payLpStep(amount, target);
});

/**
 * SEARCH_FROM_DECK_BY_NAME - デッキから名前パターンでカードをサーチ
 * args: { namePattern: string, count: number }
 */
AtomicStepRegistry.register("SEARCH_FROM_DECK_BY_NAME", (args, context) => {
  const namePattern = args.namePattern as string;
  const count = args.count as number;

  if (!namePattern) {
    throw new Error("SEARCH_FROM_DECK_BY_NAME step requires namePattern argument");
  }
  if (typeof count !== "number" || count < 1) {
    throw new Error("SEARCH_FROM_DECK_BY_NAME step requires a positive count argument");
  }

  // 名前パターンでフィルタリング
  const filter = (card: CardInstance): boolean => card.jaName.includes(namePattern);

  return searchFromDeckByConditionStep({
    id: `${context.cardId}-search-by-name-${namePattern}`,
    summary: `「${namePattern}」カード${count}枚をサーチ`,
    description: `デッキから「${namePattern}」を含むカード${count}枚を選択し、手札に加えます`,
    filter,
    minCards: count,
    maxCards: count,
    cancelable: false,
  });
});

/**
 * SEARCH_FROM_DECK_TOP - デッキトップから指定枚数を確認して選択
 * args: { count: number, selectCount: number }
 */
AtomicStepRegistry.register("SEARCH_FROM_DECK_TOP", (args, context) => {
  const count = args.count as number;
  const selectCount = args.selectCount as number;

  if (typeof count !== "number" || count < 1) {
    throw new Error("SEARCH_FROM_DECK_TOP step requires a positive count argument");
  }
  if (typeof selectCount !== "number" || selectCount < 1) {
    throw new Error("SEARCH_FROM_DECK_TOP step requires a positive selectCount argument");
  }

  return searchFromDeckTopStep({
    id: `${context.cardId}-search-from-deck-top-${count}`,
    summary: `デッキトップ${count}枚から${selectCount}枚をサーチ`,
    description: `デッキトップ${count}枚から${selectCount}枚を選択し、手札に加えます`,
    count,
    minCards: selectCount,
    maxCards: selectCount,
    cancelable: false,
  });
});

/**
 * SHUFFLE_DECK - デッキをシャッフル
 * args: なし
 */
AtomicStepRegistry.register("SHUFFLE_DECK", () => {
  return shuffleDeckStep();
});

/**
 * SELECT_RETURN_SHUFFLE_DRAW - 手札から選択してデッキに戻し、シャッフルして同じ枚数ドロー
 * args: { min: number, max?: number }
 */
AtomicStepRegistry.register("SELECT_RETURN_SHUFFLE_DRAW", (args) => {
  const min = (args.min as number) ?? 0;
  const max = args.max as number | undefined;

  if (typeof min !== "number" || min < 0) {
    throw new Error("SELECT_RETURN_SHUFFLE_DRAW step requires a non-negative min argument");
  }

  return selectReturnShuffleDrawStep({ min, max });
});

/**
 * CHANGE_BATTLE_POSITION - モンスターの表示形式を変更
 * args: { position: "attack" | "defense" }
 *
 * sourceInstanceの表示形式を変更する。誘発効果で自身を守備表示にする場合などに使用。
 */
AtomicStepRegistry.register("CHANGE_BATTLE_POSITION", (args, context) => {
  const position = args.position as "attack" | "defense";

  if (position !== "attack" && position !== "defense") {
    throw new Error('CHANGE_BATTLE_POSITION step requires position to be "attack" or "defense"');
  }

  const instanceId = context.sourceInstanceId;
  if (!instanceId) {
    throw new Error("CHANGE_BATTLE_POSITION step requires sourceInstanceId in context");
  }

  return changeBattlePositionStep(instanceId, position);
});

/**
 * SPECIAL_SUMMON_FROM_DECK - デッキからモンスターを特殊召喚
 * args: { filterType: "monster", filterLevel?: number, count: number, battlePosition?: "attack" | "defense" }
 */
AtomicStepRegistry.register("SPECIAL_SUMMON_FROM_DECK", (args, context) => {
  const filterType = args.filterType as string;
  const filterLevel = args.filterLevel as number | undefined;
  const battlePosition = args.battlePosition as "attack" | "defense" | undefined;

  if (filterType !== "monster") {
    throw new Error('SPECIAL_SUMMON_FROM_DECK step requires filterType to be "monster"');
  }

  // フィルター関数を生成
  const filter = (card: CardInstance): boolean => {
    if (card.type !== "monster") return false;
    if (filterLevel !== undefined && card.level !== filterLevel) return false;
    return true;
  };

  // 日本語表示用
  const levelDesc = filterLevel !== undefined ? `レベル${filterLevel}` : "";
  const summary = `${levelDesc}モンスターを特殊召喚`;
  const description = `デッキから${levelDesc}モンスター1体を特殊召喚します`;

  return specialSummonFromDeckStep({
    id: `${context.cardId}-special-summon-from-deck-level${filterLevel ?? "any"}`,
    summary,
    description,
    filter,
    battlePosition,
  });
});
