/**
 * effectResolutionStore - 効果解決管理ストア
 *
 * ChainableAction からの EffectResolutionStepキューを管理。
 *
 * @module application/stores/effectResolutionStore
 */

import { writable, get as getStoreValue } from "svelte/store";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import type { GameState } from "$lib/domain/models/GameState";
import type { EffectResolutionStep } from "$lib/domain/models/EffectResolutionStep";
import type { CardInstance } from "$lib/domain/models/Card";
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";

/**
 * カード選択ハンドラのインターフェース（コールバック関数）
 */
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

/**
 * 通知ハンドラのインターフェース
 */
export interface NotificationHandler {
  /** info通知を表示（トースト） */
  showInfo(summary: string, description: string): void;

  /** interactive通知を表示（モーダル） */
  showInteractive(step: EffectResolutionStep, onConfirm: () => void, onCancel?: () => void): void;
}

/** 効果解決ストアの状態インターフェース */
interface EffectResolutionState {
  isActive: boolean;
  currentStep: EffectResolutionStep | null;
  steps: EffectResolutionStep[];
  currentIndex: number;
  cardSelectionHandler: CardSelectionHandler | null;
  notificationHandler: NotificationHandler | null;
}

/** ステップ実行の共通結果 */
type StepExecutionResult = {
  shouldContinue: boolean;
  delay?: number;
};

/** 通知レベル別の実行戦略（Strategy Pattern で分離） */
type NotificationStrategy = (
  step: EffectResolutionStep,
  gameState: GameState,
  handlers: {
    notification: NotificationHandler | null;
    cardSelection: CardSelectionHandler | null;
  },
) => Promise<StepExecutionResult>;

/** アクション実行の共通処理 */
function executeStepAction(step: EffectResolutionStep, gameState: GameState, selectedIds?: string[]): void {
  const result = step.action(gameState, selectedIds);
  if (result.success) {
    gameStateStore.set(result.newState);
  }
}

/** 次ステップへの遷移（共通処理） */
function transitionToNextStep(
  state: EffectResolutionState,
  update: (updater: (state: EffectResolutionState) => EffectResolutionState) => void,
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
    finalizeResolution(update);
    return false;
  }
}

/** 解決完了時の後処理（共通処理） */
function finalizeResolution(update: (updater: (state: EffectResolutionState) => EffectResolutionState) => void): void {
  // 勝利条件チェック
  const finalState = getStoreValue(gameStateStore);
  const victoryResult = checkVictoryConditions(finalState);
  if (victoryResult.isGameOver) {
    gameStateStore.set({ ...finalState, result: victoryResult });
  }

  // ストアリセット
  update((s) => ({
    ...s,
    isActive: false,
    currentStep: null,
    steps: [],
    currentIndex: -1,
  }));
}

/** Strategy: "silent"レベル - 通知なし、即座に実行 */
const silentStrategy: NotificationStrategy = async (step, gameState) => {
  executeStepAction(step, gameState);
  return { shouldContinue: true };
};

/** Strategy: "info"レベル - トースト通知を表示、自動で次へ進む */
const infoStrategy: NotificationStrategy = async (step, gameState, handlers) => {
  executeStepAction(step, gameState);

  if (handlers.notification) {
    handlers.notification.showInfo(step.summary, step.description);
  }

  return { shouldContinue: true, delay: 300 };
};

/** Strategy: "interactive"レベル（カード選択あり） - モーダル表示、ユーザー入力待ち */
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

/** Strategy: "interactive"レベル（カード選択なし） */
const interactiveWithoutSelectionStrategy: NotificationStrategy = async (step, gameState) => {
  executeStepAction(step, gameState);
  return { shouldContinue: true };
};

/** 通知レベルに応じたStrategy選択 */
function selectStrategy(step: EffectResolutionStep): NotificationStrategy {
  const level = step.notificationLevel || "info";

  if (level === "silent") return silentStrategy;
  if (level === "info") return infoStrategy;

  return step.cardSelectionConfig ? interactiveWithSelectionStrategy : interactiveWithoutSelectionStrategy;
}

function createEffectResolutionStore() {
  const { subscribe, update } = writable<EffectResolutionState>({
    isActive: false,
    currentStep: null,
    steps: [],
    currentIndex: -1,
    cardSelectionHandler: null,
    notificationHandler: null,
  });

  return {
    subscribe,

    /**
     * カード選択ハンドラを登録（Dependency Injection）
     */
    registerCardSelectionHandler: (handler: CardSelectionHandler) => {
      update((state) => ({ ...state, cardSelectionHandler: handler }));
    },

    /**
     * 通知ハンドラを登録（Dependency Injection）
     */
    registerNotificationHandler: (handler: NotificationHandler) => {
      update((state) => ({ ...state, notificationHandler: handler }));
    },

    /**
     * 効果解決シーケンスを開始
     */
    startResolution: (steps: EffectResolutionStep[]) => {
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
          effectResolutionStore.confirmCurrentStep();
        }
      }
    },

    /**
     * 現在のステップを確定して次に進む
     */
    confirmCurrentStep: async () => {
      const state = getStoreValue(effectResolutionStore);
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
          effectResolutionStore.confirmCurrentStep();
        }
      } else {
        finalizeResolution(update);
      }
    },

    /**
     * 効果解決をキャンセル
     */
    cancelResolution: () => {
      update((state) => ({
        ...state,
        isActive: false,
        currentStep: null,
        steps: [],
        currentIndex: -1,
      }));
    },

    /**
     * ストアをリセット
     */
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

export const effectResolutionStore = createEffectResolutionStore();
