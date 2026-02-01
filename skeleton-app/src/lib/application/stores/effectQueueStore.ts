/**
 * effectQueueStore - 効果処理ステップキューストア
 *
 * 効果処理ステップキューの Single Source of Truth (SSOT)。
 * 蓄積された AtomicStep を順次実行し、通知・カード選択を Presentation Layer に委譲する。
 *
 * @architecture レイヤー間依存ルール - Application Layer (Store)
 * - ROLE: ゲーム進行制御、Presentation Layer へのデータ提供
 * - ALLOWED: Domain Layer への依存
 * - FORBIDDEN: Infrastructure Layer への依存、Presentation Layer への依存
 *
 * @module application/stores/effectQueueStore
 */

import { writable, get as getStoreValue } from "svelte/store";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import type { CardInstance } from "$lib/domain/models/Card";

/**
 * モーダル向け設定のインターフェース定義
 *
 * 実際の型定義は Presentation Layer（presentation/types/interaction.ts）に存在。
 * Application Layer では具体的な型に依存せず、ジェネリックに扱う。
 *
 * @remark 効果処理モーダル群の設計思想
 * - effectQueueStore が効果処理の状態を一元管理（SSOT）
 * - モーダルは状態を直接参照し、コールバックで操作を委譲
 * - config オブジェクトに summary, description, コールバックをまとめて渡す
 * - 型の詳細は Presentation Layer が所有するが、effectQueueStoreはそれに依存しない
 *
 * TODO: 型の定義をここに書いていないだけで、実質プレゼンテーション層の型を知っている状態になっているのでは？
 * ユーザー操作自体は Presentation 層で実装されるが、
 * ユーザーの意思決定を要するということ自体はゲームのルールに関わるため、
 * Domain 層の lib/domain/models/AtomicStep.ts で設定を定義している。
 * このストアでも Domain 層の型を参照する形にし、プレゼンテーション層はそれを継承して細かい型を定義する形にしたい。
 */
type EffectResolutionConfig = unknown;
type CardSelectionConfig = unknown;

/** 通知ハンドラのインターフェース */
interface NotificationHandler {
  showInfo(summary: string, description: string): void;
}

// 効果処理ステップキューストアの状態インターフェース
interface EffectQueueState {
  isActive: boolean;
  currentStep: AtomicStep | null;
  steps: AtomicStep[];
  currentIndex: number;
  notificationHandler: NotificationHandler | null;
  // 効果確認モーダル用の設定（null = モーダル非表示）
  effectResolutionConfig: EffectResolutionConfig | null;
  // カード選択モーダル用の設定（null = モーダル非表示）
  cardSelectionConfig: CardSelectionConfig | null;
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
  },
  updateState: (updater: (state: EffectQueueState) => EffectQueueState) => void,
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
const interactiveWithSelectionStrategy: NotificationStrategy = async (step, gameState, _handlers, updateState) => {
  const config = step.cardSelectionConfig!;

  // availableCardsの取得: 配列=直接指定, null=動的指定
  let availableCards: readonly CardInstance[];
  if (config.availableCards !== null) {
    // 直接指定: config.availableCards をそのまま使用
    availableCards = config.availableCards;
  } else {
    // 動的指定: _sourceZone から実行時に取得
    if (!config._sourceZone) {
      console.error("_sourceZone must be specified when availableCards is null");
      return { shouldContinue: false };
    }
    const sourceZone = gameState.zones[config._sourceZone];
    availableCards = config._filter ? sourceZone.filter((card, index) => config._filter!(card, index)) : sourceZone;
  }

  // カード選択モーダル（Promise化）- 状態を更新してモーダルを表示
  await new Promise<void>((resolve) => {
    updateState((s) => ({
      ...s,
      cardSelectionConfig: {
        availableCards,
        minCards: config.minCards,
        maxCards: config.maxCards,
        summary: config.summary,
        description: config.description,
        cancelable: config.cancelable,
        onConfirm: (selectedInstanceIds: string[]) => {
          executeStepAction(step, gameState, selectedInstanceIds);
          updateState((s) => ({ ...s, cardSelectionConfig: null }));
          resolve();
        },
        onCancel: () => {
          updateState((s) => ({ ...s, cardSelectionConfig: null }));
          resolve();
        },
      },
    }));
  });

  return { shouldContinue: true };
};

// Strategy: "interactive"レベル（カード選択なし） - モーダル表示、ユーザー入力待ち
const interactiveWithoutSelectionStrategy: NotificationStrategy = async (step, gameState, _handlers, updateState) => {
  // 効果確認モーダル（Promise化）- 状態を更新してモーダルを表示
  await new Promise<void>((resolve) => {
    updateState((s) => ({
      ...s,
      effectResolutionConfig: {
        summary: step.summary,
        description: step.description,
        onConfirm: () => {
          executeStepAction(step, gameState);
          updateState((s) => ({ ...s, effectResolutionConfig: null }));
          resolve();
        },
      },
    }));
  });

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
    notificationHandler: null,
    effectResolutionConfig: null,
    cardSelectionConfig: null,
  });

  return {
    subscribe,

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
      const result = await strategy(
        state.currentStep,
        currentGameState,
        { notification: state.notificationHandler },
        update,
      );

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
