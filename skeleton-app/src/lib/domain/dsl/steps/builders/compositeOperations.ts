/**
 * compositeOperations.ts - 複合操作系ステップビルダー
 *
 * StepBuilder:
 * - selectReturnShuffleDrawStepBuilder: 手札をデッキに戻してシャッフル後、同数ドロー
 * - returnAllHandShuffleDrawStepBuilder: 手札全てをデッキに戻してシャッフル後、同数ドロー
 */

import type { GameSnapshot, CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { selectCardsStep } from "$lib/domain/dsl/steps/primitives/userInteractions";
import type { CardInstance } from "$lib/domain/models/Card";

// ===========================
// 共通ヘルパー関数
// ===========================

/**
 * カードをデッキに戻し、シャッフルして同じ枚数ドローする
 * @returns 更新後のスペースとメッセージ
 */
const returnToDeckShuffleAndDraw = (
  space: CardSpace,
  cards: readonly CardInstance[],
): { updatedSpace: CardSpace; message: string } => {
  let updatedSpace = space;
  const count = cards.length;

  // カードをデッキに戻す
  for (const card of cards) {
    updatedSpace = GameState.Space.moveCard(updatedSpace, card, "mainDeck");
  }

  // デッキをシャッフル
  updatedSpace = GameState.Space.shuffleMainDeck(updatedSpace);

  // 同じ枚数ドロー
  updatedSpace = GameState.Space.drawCards(updatedSpace, count);

  return {
    updatedSpace,
    message: `${count}枚をデッキに戻し、シャッフルして${count}枚ドローしました`,
  };
};

// ===========================
// ステップ実装
// ===========================

/**
 * 手札から任意枚数を選択してデッキに戻し、シャッフルして同じ枚数ドローするステップ
 *
 * 任意枚数選択→デッキに戻す→シャッフル→ドローを1ステップで実行する。
 * 通知は「n枚をデッキに戻し、シャッフルしてn枚ドローしました」とまとめて表示される。
 * 選択した枚数を記録する必要があるため、1つのステップとしてまとめて実装している。
 */
export const selectReturnShuffleDrawStep = (options: { min: number; max?: number }): AtomicStep => {
  return selectCardsStep({
    id: "select-and-return-to-deck",
    summary: "手札をデッキに戻す",
    description: `デッキに戻すカードを選択してください（${options.min}〜${options.max ?? 100}枚）`,
    availableCards: null, // 動的指定: 実行時に手札から取得
    _sourceZone: "hand",
    _filter: undefined, // 全て対象
    minCards: options.min,
    maxCards: options.max ?? 100,
    cancelable: false,
    onSelect: (currentState: GameSnapshot, selectedInstanceIds: string[]): GameStateUpdateResult => {
      if (selectedInstanceIds.length === 0) {
        return GameProcessing.Result.success(currentState, "No cards selected");
      }

      const selectedCards = selectedInstanceIds.map((id) => GameState.Space.findCard(currentState.space, id)!);
      const { updatedSpace, message } = returnToDeckShuffleAndDraw(currentState.space, selectedCards);

      return GameProcessing.Result.success({ ...currentState, space: updatedSpace }, message);
    },
  });
};

/**
 * 手札を全てデッキに戻し、シャッフルして同じ枚数ドローするステップ
 *
 * 選択処理なしで手札全てを強制的にデッキに戻す。
 * 通知は「n枚をデッキに戻し、シャッフルしてn枚ドローしました」と表示。
 */
export const returnAllHandShuffleDrawStep = (): AtomicStep => {
  return {
    id: "return-all-hand-shuffle-draw",
    summary: "手札を全てデッキに戻す",
    description: "手札を全てデッキに戻し、シャッフルして同じ枚数ドローします",
    action: (currentState: GameSnapshot): GameStateUpdateResult => {
      const handCards = currentState.space.hand;

      if (handCards.length === 0) {
        return GameProcessing.Result.success(currentState, "手札がありません");
      }

      const { updatedSpace, message } = returnToDeckShuffleAndDraw(currentState.space, handCards);

      return GameProcessing.Result.success({ ...currentState, space: updatedSpace }, message);
    },
  };
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SELECT_RETURN_SHUFFLE_DRAW - 手札をデッキに戻してシャッフル後、同数ドロー
 * args: { min: number, max?: number }
 */
export const selectReturnShuffleDrawStepBuilder: StepBuilderFn = (args) => {
  const min = (args.min as number) ?? 0;
  const max = args.max as number | undefined;
  if (typeof min !== "number" || min < 0) {
    throw new Error("SELECT_RETURN_SHUFFLE_DRAW step requires a non-negative min argument");
  }
  return selectReturnShuffleDrawStep({ min, max });
};

/**
 * RETURN_ALL_HAND_SHUFFLE_DRAW - 手札を全てデッキに戻してシャッフル後、同数ドロー
 * args: なし
 */
export const returnAllHandShuffleDrawStepBuilder: StepBuilderFn = () => {
  return returnAllHandShuffleDrawStep();
};
