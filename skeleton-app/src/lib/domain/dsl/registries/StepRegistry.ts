/**
 * StepRegistry - DSLステップ名からAtomicStepビルダーへのマッピング
 *
 * DSLの "step" キーワードを既存のAtomicStepビルダー関数に変換する。
 * レジストリパターンにより、新規ステップの追加が容易。
 *
 * @module domain/dsl/registries/StepRegistry
 */

import type { AtomicStep } from "$lib/domain/models/GameProcessing";
import type { Player } from "$lib/domain/models/GameState";
import type { CardInstance } from "$lib/domain/models/Card";
import { drawStep, fillHandsStep } from "$lib/domain/effects/steps/draws";
import { selectAndDiscardStep } from "$lib/domain/effects/steps/discards";
import { markThenStep } from "$lib/domain/effects/steps/timing";
import { gainLpStep } from "$lib/domain/effects/steps/lifePoints";
import { searchFromDeckByConditionStep, salvageFromGraveyardStep } from "$lib/domain/effects/steps/searches";
import { addCounterStep, removeCounterStep } from "$lib/domain/effects/steps/counters";
import { discardAllHandEndPhaseStep } from "$lib/domain/effects/steps/discards";
import type { CounterType } from "$lib/domain/models/Card";

/**
 * ステップビルドコンテキスト
 *
 * ステップ生成時に必要なコンテキスト情報。
 */
export interface StepBuildContext {
  /** カードID */
  readonly cardId: number;
  /** 発動元カードインスタンスID（オプション） */
  readonly sourceInstanceId?: string;
}

/**
 * ステップビルダー関数の型
 *
 * DSL定義のargsとコンテキストからAtomicStepを生成する。
 */
export type StepBuilder = (args: Readonly<Record<string, unknown>>, context: StepBuildContext) => AtomicStep;

/**
 * 登録済みステップのレジストリ
 */
const registeredSteps: Record<string, StepBuilder> = {
  /**
   * DRAW - 指定枚数ドロー
   * args: { count: number }
   */
  DRAW: (args) => {
    const count = args.count as number;
    if (typeof count !== "number" || count < 1) {
      throw new Error("DRAW step requires a positive count argument");
    }
    return drawStep(count);
  },

  /**
   * SELECT_AND_DISCARD - 手札から指定枚数を選択して捨てる
   * args: { count: number, cancelable?: boolean }
   */
  SELECT_AND_DISCARD: (args) => {
    const count = args.count as number;
    const cancelable = args.cancelable as boolean | undefined;
    if (typeof count !== "number" || count < 1) {
      throw new Error("SELECT_AND_DISCARD step requires a positive count argument");
    }
    return selectAndDiscardStep(count, cancelable);
  },

  /**
   * FILL_HANDS - 手札が指定枚数になるまでドロー
   * args: { count: number }
   */
  FILL_HANDS: (args) => {
    const count = args.count as number;
    if (typeof count !== "number" || count < 1) {
      throw new Error("FILL_HANDS step requires a positive count argument");
    }
    return fillHandsStep(count);
  },

  /**
   * THEN - タイミング進行マーカー（「その後」）
   * args: なし
   */
  THEN: () => markThenStep(),

  /**
   * GAIN_LP - LP回復
   * args: { amount: number, target: "player" | "opponent" }
   */
  GAIN_LP: (args) => {
    const amount = args.amount as number;
    const target = (args.target as Player) ?? "player";
    if (typeof amount !== "number" || amount < 1) {
      throw new Error("GAIN_LP step requires a positive amount argument");
    }
    if (target !== "player" && target !== "opponent") {
      throw new Error('GAIN_LP step requires target to be "player" or "opponent"');
    }
    return gainLpStep(amount, target);
  },

  /**
   * SEARCH_FROM_DECK - デッキからカードをサーチ
   * args: { filterType: string, filterSpellType?: string, count: number }
   */
  SEARCH_FROM_DECK: (args, context) => {
    const filterType = args.filterType as string;
    const filterSpellType = args.filterSpellType as string | undefined;
    const count = args.count as number;

    if (!filterType) {
      throw new Error("SEARCH_FROM_DECK step requires filterType argument");
    }
    if (typeof count !== "number" || count < 1) {
      throw new Error("SEARCH_FROM_DECK step requires a positive count argument");
    }

    // DSL定義からフィルター関数を生成
    const filter = (card: CardInstance): boolean => {
      if (card.type !== filterType) return false;
      if (filterSpellType && card.spellType !== filterSpellType) return false;
      return true;
    };

    const filterDesc = filterSpellType ? `${filterSpellType}${filterType}` : filterType;

    return searchFromDeckByConditionStep({
      id: `search-from-deck-${filterDesc}-${context.cardId}`,
      summary: `${filterDesc}カード${count}枚をサーチ`,
      description: `デッキから${filterDesc}カード${count}枚を選択し、手札に加えます`,
      filter,
      minCards: count,
      maxCards: count,
      cancelable: false,
    });
  },

  /**
   * SALVAGE_FROM_GRAVEYARD - 墓地からカードをサルベージ
   * args: { filterType: string, filterSpellType?: string, filterFrameType?: string, count: number }
   */
  SALVAGE_FROM_GRAVEYARD: (args, context) => {
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

    // DSL定義からフィルター関数を生成
    const filter = (card: CardInstance): boolean => {
      if (card.type !== filterType) return false;
      if (filterSpellType && card.spellType !== filterSpellType) return false;
      if (filterFrameType && card.frameType !== filterFrameType) return false;
      return true;
    };

    const filterDescParts: string[] = [];
    if (filterFrameType) filterDescParts.push(filterFrameType);
    if (filterSpellType) filterDescParts.push(filterSpellType);
    filterDescParts.push(filterType);
    const filterDesc = filterDescParts.join("");

    return salvageFromGraveyardStep({
      id: `salvage-from-graveyard-${filterDesc}-${context.cardId}`,
      summary: `${filterDesc}カード${count}枚をサルベージ`,
      description: `墓地から${filterDesc}カード${count}枚を選択し、手札に加えます`,
      filter,
      minCards: count,
      maxCards: count,
      cancelable: false,
    });
  },

  /**
   * DISCARD_ALL_HAND_END_PHASE - エンドフェイズに手札を全て捨てる効果を登録
   * args: なし
   */
  DISCARD_ALL_HAND_END_PHASE: () => {
    return discardAllHandEndPhaseStep();
  },

  /**
   * PLACE_COUNTER - カードにカウンターを置く
   * args: { counterType: CounterType, count: number, limit?: number }
   */
  PLACE_COUNTER: (args, context) => {
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
  },

  /**
   * REMOVE_COUNTER - カードからカウンターを取り除く
   * args: { counterType: CounterType, count: number }
   */
  REMOVE_COUNTER: (args, context) => {
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
  },
};

/**
 * ステップ名からAtomicStepを生成する
 *
 * @param stepName - DSLのステップ名
 * @param args - ステップに渡す引数
 * @param context - ステップビルドコンテキスト
 * @returns 生成されたAtomicStep
 * @throws Error - 未登録のステップ名の場合
 */
export function buildStep(
  stepName: string,
  args: Readonly<Record<string, unknown>> = {},
  context: StepBuildContext,
): AtomicStep {
  const builder = registeredSteps[stepName];
  if (!builder) {
    throw new Error(
      `Unknown step "${stepName}" in card ${context.cardId}. Available steps: ${Object.keys(registeredSteps).join(", ")}`,
    );
  }
  return builder(args, context);
}

/**
 * 登録されているステップ名一覧を取得する
 */
export function getRegisteredStepNames(): readonly string[] {
  return Object.keys(registeredSteps);
}

/**
 * ステップが登録されているかチェックする
 */
export function isStepRegistered(stepName: string): boolean {
  return stepName in registeredSteps;
}

/**
 * 新しいステップを登録する（拡張用）
 *
 * @param stepName - ステップ名
 * @param builder - ステップビルダー関数
 */
export function registerStep(stepName: string, builder: StepBuilder): void {
  if (registeredSteps[stepName]) {
    throw new Error(`Step "${stepName}" is already registered`);
  }
  registeredSteps[stepName] = builder;
}
