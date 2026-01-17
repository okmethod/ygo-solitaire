/**
 * effectQueueStore - 効果処理ステップキューストア
 *
 * 効果処理ステップキューの Single Source of Truth (SSOT)。
 * 蓄積された AtomicStep を順次実行し、通知・カード選択を Presentation Layer に委譲する。
 *
 * IMPORTANT REMINDER: Application Layer - レイヤー間依存ルール
 * - Application Layer は Domain Layer に依存できる
 * - Presentation Layer は Application Layer（GameFacade、Stores）のみに依存する
 * - Presentation Layer は Domain Layer に直接依存してはいけない
 *
 * @module application/stores/effectQueueStore
 */

import { writable, get as getStoreValue } from "svelte/store";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { CardInstance } from "$lib/domain/models/Card";

/** カード選択ハンドラのインターフェース（コールバック関数） */
export interface CardSelectionHandler {
  (config: {
    availableCards: readonly CardInstance[];
    minCards: number;
    maxCards: number;
    summary: string;
    description: string;
    cancelable?: boolean;
    onConfirm: (selectedInstanceIds: string[]) => void;
    onCancel?: () => void;
  }): void;
}

/** 通知ハンドラのインターフェース */
export interface NotificationHandler {
  /** info通知を表示（トースト） */
  showInfo(summary: string, description: string): void;

  /** interactive通知を表示（モーダル） */
  showInteractive(step: AtomicStep, onConfirm: () => void, onCancel?: () => void): void;
}

// 効果処理ステップキューストアの状態インターフェース
interface EffectQueueState {
  isActive: boolean;
  currentStep: AtomicStep | null;
  steps: AtomicStep[];
  currentIndex: number;
  cardSelectionHandler: CardSelectionHandler | null;
  notificationHandler: NotificationHandler | null;
}

// ステップ実行の共通結果
type StepExecutionResult = {
  shouldContinue: boolean;
  delay?: number;
};

// 通知レベル別の実行戦略（Strategy Pattern で分離）
type NotificationStrategy = (
  step: AtomicStep,
  gameState: GameState,
  handlers: {
    notification: NotificationHandler | null;
    cardSelection: CardSelectionHandler | null;
  },
) => Promise<StepExecutionResult>;

// 1ステップ分のアクションを実行する（共通処理）
function executeStepAction(step: AtomicStep, gameState: GameState, selectedIds?: string[]): void {
  const result = step.action(gameState, selectedIds);
  if (result.success) {
    gameStateStore.set(result.updatedState);
  }
}

// 次ステップに遷移する（共通処理）
function transitionToNextStep(
  state: EffectQueueState,
  update: (updater: (state: EffectQueueState) => EffectQueueState) => void,
): boolean {
  const nextIndex = state.currentIndex + 1;

  if (nextIndex < state.steps.length) {
    update((s) => ({
      ...s,
      currentIndex: nextIndex,
      currentStep: s.steps[nextIndex],
    }));
    return true;
  } else {
    finalizeProcessing(update);
    return false;
  }
}

// 効果処理完了時の後処理を行う（共通処理）
function finalizeProcessing(update: (updater: (state: EffectQueueState) => EffectQueueState) => void): void {
  // ストアリセット
  update((s) => ({
    ...s,
    isActive: false,
    currentStep: null,
    steps: [],
    currentIndex: -1,
  }));
}

// Strategy: "silent"レベル - 通知なし、即座に実行
const silentStrategy: NotificationStrategy = async (step, gameState) => {
  executeStepAction(step, gameState);
  return { shouldContinue: true };
};

// Strategy: "info"レベル - トースト通知を表示、自動で次へ進む
const infoStrategy: NotificationStrategy = async (step, gameState, handlers) => {
  executeStepAction(step, gameState);

  if (handlers.notification) {
    handlers.notification.showInfo(step.summary, step.description);
  }

  return { shouldContinue: true, delay: 300 };
};

// Strategy: "interactive"レベル（カード選択あり） - モーダル表示、ユーザー入力待ち
const interactiveWithSelectionStrategy: NotificationStrategy = async (step, gameState, handlers) => {
  if (!handlers.cardSelection) {
    console.error("Card selection handler not registered");
    return { shouldContinue: false };
  }

  const config = step.cardSelectionConfig!;

  // availableCardsの動的取得
  let availableCards = config.availableCards;
  if (availableCards.length === 0 && config._sourceZone) {
    const sourceZone = gameState.zones[config._sourceZone];
    availableCards = config._filter ? sourceZone.filter((card, index) => config._filter!(card, index)) : sourceZone;
  } else if (availableCards.length === 0) {
    availableCards = gameState.zones.hand;
  }

  // カード選択モーダル（Promise化）
  await new Promise<void>((resolve) => {
    handlers.cardSelection!({
      ...config,
      availableCards,
      onConfirm: (selectedInstanceIds: string[]) => {
        executeStepAction(step, gameState, selectedInstanceIds);
        resolve();
      },
      onCancel: () => {
        resolve();
      },
    });
  });

  return { shouldContinue: true };
};

// Strategy: "interactive"レベル（カード選択なし） - モーダル表示、ユーザー入力待ち
const interactiveWithoutSelectionStrategy: NotificationStrategy = async (step, gameState) => {
  executeStepAction(step, gameState);
  return { shouldContinue: true };
};

// 通知レベルに応じた Strategyを選択する
function selectStrategy(step: AtomicStep): NotificationStrategy {
  const level = step.notificationLevel || "info";

  if (level === "silent") return silentStrategy;
  if (level === "info") return infoStrategy;

  return step.cardSelectionConfig ? interactiveWithSelectionStrategy : interactiveWithoutSelectionStrategy;
}

/** 効果処理ステップキューストアのインターフェース */
export interface EffectQueueStore {
  subscribe: (run: (value: EffectQueueState) => void) => () => void;

  /** カード選択ハンドラを登録する（Dependency Injection） */
  registerCardSelectionHandler: (handler: CardSelectionHandler) => void;

  /** 通知ハンドラを登録する（Dependency Injection） */
  registerNotificationHandler: (handler: NotificationHandler) => void;

  /** 効果処理シーケンスを開始する */
  startProcessing: (steps: AtomicStep[]) => void;

  /** 現在のステップを確定して次に進む */
  confirmCurrentStep: () => Promise<void>;

  /** 効果処理をキャンセルする */
  cancelProcessing: () => void;

  /** ストアをリセットする */
  reset: () => void;
}

// 効果処理ステップキューストアを生成する
function createEffectQueueStore(): EffectQueueStore {
  const { subscribe, update } = writable<EffectQueueState>({
    isActive: false,
    currentStep: null,
    steps: [],
    currentIndex: -1,
    cardSelectionHandler: null,
    notificationHandler: null,
  });

  return {
    subscribe,

    registerCardSelectionHandler: (handler: CardSelectionHandler) => {
      update((state) => ({ ...state, cardSelectionHandler: handler }));
    },

    registerNotificationHandler: (handler: NotificationHandler) => {
      update((state) => ({ ...state, notificationHandler: handler }));
    },

    startProcessing: (steps: AtomicStep[]) => {
      update((state) => ({
        ...state,
        isActive: true,
        steps,
        currentIndex: 0,
        currentStep: steps[0] || null,
      }));

      const firstStep = steps[0];
      if (firstStep) {
        const level = firstStep.notificationLevel || "info";
        if (level === "info" || level === "silent") {
          effectQueueStore.confirmCurrentStep();
        }
      }
    },

    confirmCurrentStep: async () => {
      const state = getStoreValue(effectQueueStore);
      if (!state.currentStep) return;

      const currentGameState = getStoreValue(gameStateStore);
      const strategy = selectStrategy(state.currentStep);

      // Strategy実行
      const result = await strategy(state.currentStep, currentGameState, {
        notification: state.notificationHandler,
        cardSelection: state.cardSelectionHandler,
      });

      // 遅延が必要なら待機
      if (result.delay) {
        await new Promise((resolve) => setTimeout(resolve, result.delay));
      }

      // 次ステップへ遷移
      if (result.shouldContinue) {
        const hasNext = transitionToNextStep(state, update);
        if (hasNext) {
          effectQueueStore.confirmCurrentStep();
        }
      } else {
        finalizeProcessing(update);
      }
    },

    cancelProcessing: () => {
      update((state) => ({
        ...state,
        isActive: false,
        currentStep: null,
        steps: [],
        currentIndex: -1,
      }));
    },

    reset: () => {
      update((state) => ({
        ...state,
        isActive: false,
        currentStep: null,
        steps: [],
        currentIndex: -1,
      }));
    },
  };
}

export const effectQueueStore = createEffectQueueStore();
