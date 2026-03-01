/**
 * AtomicStep Effect Library - ステップライブラリ
 *
 * ステップの登録とエクスポートを行う。
 * 各ステップ実装ファイルから具体的なビルダーをインポートし、
 * レジストリに登録する。
 *
 * @module domain/effects/steps
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { CounterType } from "$lib/domain/models/Card";
import type { Player } from "$lib/domain/models/GameState";

// レジストリAPI
import { AtomicStepRegistry, type StepBuilder, type StepBuildContext } from "./AtomicStepRegistry";

// 具体実装
import { drawStep, fillHandsStep } from "./draws";
import { selectAndDiscardStep, discardAllHandEndPhaseStep } from "./discards";
import { markThenStep } from "./timing";
import { gainLpStep, payLpStep } from "./lifePoints";
import { searchFromDeckByConditionStep, salvageFromGraveyardStep } from "./searches";
import { addCounterStep, removeCounterStep } from "./counters";

// ===========================
// エクスポート
// ===========================

export { AtomicStepRegistry, type StepBuilder, type StepBuildContext };

// 後方互換性のためのエイリアス関数
export const buildStep = AtomicStepRegistry.build.bind(AtomicStepRegistry);
export const registerStep = AtomicStepRegistry.register.bind(AtomicStepRegistry);
export const isStepRegistered = AtomicStepRegistry.isRegistered.bind(AtomicStepRegistry);
export const getRegisteredStepNames = AtomicStepRegistry.getRegisteredNames.bind(AtomicStepRegistry);
export const clearStepRegistry = AtomicStepRegistry.clear.bind(AtomicStepRegistry);

// 具体実装（直接利用する場合）
export {
  drawStep,
  fillHandsStep,
  selectAndDiscardStep,
  discardAllHandEndPhaseStep,
  markThenStep,
  gainLpStep,
  payLpStep,
  searchFromDeckByConditionStep,
  salvageFromGraveyardStep,
  addCounterStep,
  removeCounterStep,
};

// ===========================
// 日本語変換マップ
// ===========================

/** カードタイプの日本語変換 */
const cardTypeToJapanese: Record<string, string> = {
  spell: "魔法",
  monster: "モンスター",
  trap: "罠",
};

/** フレームタイプの日本語変換 */
const frameTypeToJapanese: Record<string, string> = {
  normal: "通常",
  effect: "効果",
  fusion: "融合",
  ritual: "儀式",
  synchro: "シンクロ",
  xyz: "エクシーズ",
  link: "リンク",
};

/** スペルタイプの日本語変換 */
const spellTypeToJapanese: Record<string, string> = {
  field: "フィールド",
  normal: "通常",
  "quick-play": "速攻",
  continuous: "永続",
  equip: "装備",
  ritual: "儀式",
};

/**
 * フィルター条件を日本語に変換する
 */
function buildJapaneseFilterDesc(filterType: string, filterSpellType?: string, filterFrameType?: string): string {
  const parts: string[] = [];

  if (filterFrameType) {
    parts.push(frameTypeToJapanese[filterFrameType] ?? filterFrameType);
  }
  if (filterSpellType) {
    parts.push(spellTypeToJapanese[filterSpellType] ?? filterSpellType);
  }

  const typeJa = cardTypeToJapanese[filterType] ?? filterType;
  parts.push(typeJa);

  return parts.join("");
}

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
 * args: { count: number, cancelable?: boolean }
 */
AtomicStepRegistry.register("SELECT_AND_DISCARD", (args) => {
  const count = args.count as number;
  const cancelable = args.cancelable as boolean | undefined;
  if (typeof count !== "number" || count < 1) {
    throw new Error("SELECT_AND_DISCARD step requires a positive count argument");
  }
  return selectAndDiscardStep(count, cancelable);
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
 * args: { filterType: string, filterSpellType?: string, count: number }
 */
AtomicStepRegistry.register("SEARCH_FROM_DECK", (args, context) => {
  const filterType = args.filterType as string;
  const filterSpellType = args.filterSpellType as string | undefined;
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
  const filterDescJa = buildJapaneseFilterDesc(filterType, filterSpellType);

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
 * args: { filterType: string, filterSpellType?: string, filterFrameType?: string, count: number }
 */
AtomicStepRegistry.register("SALVAGE_FROM_GRAVEYARD", (args, context) => {
  const filterType = args.filterType as string;
  const filterSpellType = args.filterSpellType as string | undefined;
  const filterFrameType = args.filterFrameType as string | undefined;
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
  const filterDescJa = buildJapaneseFilterDesc(filterType, filterSpellType, filterFrameType);

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
