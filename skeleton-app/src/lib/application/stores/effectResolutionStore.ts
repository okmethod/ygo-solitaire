import { writable, get as getStoreValue } from "svelte/store";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import type { EffectResolutionStep } from "$lib/domain/models/EffectResolutionStep";
import type { CardInstance } from "$lib/domain/models/Card";
import { checkVictoryConditions } from "$lib/domain/rules/VictoryRule";

/**
 * Card selection handler callback type
 * Presentation層のcardSelectionStoreが実装を提供する
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
 * Notification handler interface
 * Presentation層が実装を提供し、Dependency Injectionで注入する
 */
export interface NotificationHandler {
  /**
   * Show info notification (toast)
   * @param summary - Notification summary
   * @param description - Notification description
   */
  showInfo(summary: string, description: string): void;

  /**
   * Show interactive notification (modal)
   * @param step - Effect resolution step
   * @param onConfirm - Callback when confirmed
   * @param onCancel - Callback when cancelled (optional)
   */
  showInteractive(step: EffectResolutionStep, onConfirm: () => void, onCancel?: () => void): void;
}

interface EffectResolutionState {
  isActive: boolean;
  currentStep: EffectResolutionStep | null;
  steps: EffectResolutionStep[];
  currentIndex: number;
  cardSelectionHandler: CardSelectionHandler | null;
  notificationHandler: NotificationHandler | null;
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
     * Presentation層の初期化時に呼ばれる
     */
    registerCardSelectionHandler: (handler: CardSelectionHandler) => {
      update((state) => ({
        ...state,
        cardSelectionHandler: handler,
      }));
    },

    /**
     * 通知ハンドラを登録（Dependency Injection）
     * Presentation層の初期化時に呼ばれる
     */
    registerNotificationHandler: (handler: NotificationHandler) => {
      update((state) => ({
        ...state,
        notificationHandler: handler,
      }));
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

      // Auto-start for "info" and "silent" levels
      // "interactive" level will wait for user action (modal)
      const firstStep = steps[0];
      if (firstStep) {
        const notificationLevel = firstStep.notificationLevel || "info";
        if (notificationLevel === "info" || notificationLevel === "silent") {
          // Auto-execute first step
          effectResolutionStore.confirmCurrentStep();
        }
      }
    },

    /**
     * 現在のステップを確定して次に進む
     */
    confirmCurrentStep: async () => {
      const state = getStoreValue(effectResolutionStore);

      if (state.currentStep) {
        // 現在のGameStateを取得してactionに注入（Dependency Injection）
        const currentGameState = getStoreValue(gameStateStore);

        // Determine notification level (default: "info")
        const notificationLevel = state.currentStep.notificationLevel || "info";

        // Handle "silent" level: No notification, execute immediately
        if (notificationLevel === "silent") {
          const result = state.currentStep.action(currentGameState);

          // Apply action result
          if (result.success) {
            gameStateStore.set(result.newState);
          }

          // Move to next step
          const nextIndex = state.currentIndex + 1;
          if (nextIndex < state.steps.length) {
            update((s) => ({
              ...s,
              currentIndex: nextIndex,
              currentStep: s.steps[nextIndex],
            }));
            // Auto-execute next step regardless of level (all levels are handled by confirmCurrentStep)
            effectResolutionStore.confirmCurrentStep();
          } else {
            // All steps completed - check victory conditions
            const finalState = getStoreValue(gameStateStore);
            const victoryResult = checkVictoryConditions(finalState);
            if (victoryResult.isGameOver) {
              gameStateStore.set({ ...finalState, result: victoryResult });
            }

            update((s) => ({
              ...s,
              isActive: false,
              currentStep: null,
              steps: [],
              currentIndex: -1,
            }));
          }
          return;
        }

        // Handle "info" level: Show toast notification, auto-advance
        if (notificationLevel === "info") {
          // Execute action first
          const result = state.currentStep.action(currentGameState);

          // Apply action result
          if (result.success) {
            gameStateStore.set(result.newState);
          }

          // Show toast notification after action execution
          if (state.notificationHandler) {
            state.notificationHandler.showInfo(state.currentStep.summary, state.currentStep.description);
          }

          // Wait 300ms for toast visibility before moving to next step
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Move to next step
          const nextIndex = state.currentIndex + 1;
          if (nextIndex < state.steps.length) {
            update((s) => ({
              ...s,
              currentIndex: nextIndex,
              currentStep: s.steps[nextIndex],
            }));
            // Auto-execute next step regardless of level (all levels are handled by confirmCurrentStep)
            effectResolutionStore.confirmCurrentStep();
          } else {
            // All steps completed - check victory conditions
            const finalState = getStoreValue(gameStateStore);
            const victoryResult = checkVictoryConditions(finalState);
            if (victoryResult.isGameOver) {
              gameStateStore.set({ ...finalState, result: victoryResult });
            }

            update((s) => ({
              ...s,
              isActive: false,
              currentStep: null,
              steps: [],
              currentIndex: -1,
            }));
          }
          return;
        }

        // Handle "interactive" level: Show modal, wait for user input
        // (Existing card selection logic applies here)
        // カード選択が必要な場合（cardSelectionConfigがある場合）
        if (state.currentStep.cardSelectionConfig) {
          // ハンドラが未登録の場合はエラー
          if (!state.cardSelectionHandler) {
            console.error("Card selection handler not registered");
            return;
          }

          // CardSelectionModalを開いてユーザー入力を待つ
          return new Promise<void>((resolve) => {
            // Use availableCards from config, but if empty, populate dynamically based on _sourceZone
            // This allows effects to select from newly drawn cards (e.g., Graceful Charity)
            const config = state.currentStep!.cardSelectionConfig!;
            let availableCards = config.availableCards;

            // If availableCards is empty, populate dynamically from _sourceZone
            if (availableCards.length === 0 && config._sourceZone) {
              const sourceZone = currentGameState.zones[config._sourceZone];
              availableCards = config._filter
                ? sourceZone.filter((card, index) => config._filter!(card, index))
                : sourceZone;
            } else if (availableCards.length === 0) {
              // If still empty and no _sourceZone, use hand as fallback
              // This is for effects that select from newly drawn cards (e.g., Graceful Charity)
              availableCards = currentGameState.zones.hand;
            }

            state.cardSelectionHandler!({
              ...config,
              availableCards,
              onConfirm: (selectedInstanceIds: string[]) => {
                // ユーザーがカードを選択したら、actionを実行（同期化）
                const result = state.currentStep!.action(currentGameState, selectedInstanceIds);

                // actionの結果を反映
                if (result.success) {
                  gameStateStore.set(result.newState);
                }

                // 次のステップに進む
                const nextIndex = state.currentIndex + 1;
                if (nextIndex < state.steps.length) {
                  update((s) => ({
                    ...s,
                    currentIndex: nextIndex,
                    currentStep: s.steps[nextIndex],
                  }));
                  // Auto-execute next step (all levels are handled by confirmCurrentStep)
                  effectResolutionStore.confirmCurrentStep();
                } else {
                  // 全ステップ完了
                  update((s) => ({
                    ...s,
                    isActive: false,
                    currentStep: null,
                    steps: [],
                    currentIndex: -1,
                  }));
                }

                resolve();
              },
              onCancel: () => {
                // キャンセル時は効果解決を中止
                update((s) => ({
                  ...s,
                  isActive: false,
                  currentStep: null,
                  steps: [],
                  currentIndex: -1,
                }));
                resolve();
              },
            });
          });
        } else {
          // カード選択不要な場合（従来の動作、同期化）
          const result = state.currentStep.action(currentGameState);

          // actionの結果を反映
          if (result.success) {
            gameStateStore.set(result.newState);
          }

          // 次のステップに進む
          const nextIndex = state.currentIndex + 1;
          if (nextIndex < state.steps.length) {
            update((s) => ({
              ...s,
              currentIndex: nextIndex,
              currentStep: s.steps[nextIndex],
            }));
            // Auto-execute next step (all levels are handled by confirmCurrentStep)
            effectResolutionStore.confirmCurrentStep();
          } else {
            // 全ステップ完了
            update((s) => ({
              ...s,
              isActive: false,
              currentStep: null,
              steps: [],
              currentIndex: -1,
            }));
          }
        }
      }
    },

    /**
     * 効果解決をキャンセル（可能な場合）
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
     * 現在の状態をリセット
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
