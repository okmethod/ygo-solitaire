import { writable } from "svelte/store";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";
import type { CardInstance } from "$lib/domain/models/Card";

// Re-export EffectResolutionStep from Domain Layer for backward compatibility
export type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";

/**
 * Card selection handler callback type
 * Presentation層のcardSelectionStoreが実装を提供する
 */
export interface CardSelectionHandler {
  (config: {
    availableCards: readonly CardInstance[];
    minCards: number;
    maxCards: number;
    title: string;
    message: string;
    onConfirm: (selectedInstanceIds: string[]) => void;
    onCancel?: () => void;
  }): void;
}

interface EffectResolutionState {
  isActive: boolean;
  currentStep: EffectResolutionStep | null;
  steps: EffectResolutionStep[];
  currentIndex: number;
  cardSelectionHandler: CardSelectionHandler | null;
}

function createEffectResolutionStore() {
  const { subscribe, set, update } = writable<EffectResolutionState>({
    isActive: false,
    currentStep: null,
    steps: [],
    currentIndex: -1,
    cardSelectionHandler: null,
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
    },

    /**
     * 現在のステップを確定して次に進む
     */
    confirmCurrentStep: async () => {
      const state = get(effectResolutionStore);

      if (state.currentStep) {
        // 現在のGameStateを取得してactionに注入（Dependency Injection）
        const currentGameState = get(gameStateStore);

        // カード選択が必要な場合（cardSelectionConfigがある場合）
        if (state.currentStep.cardSelectionConfig) {
          // ハンドラが未登録の場合はエラー
          if (!state.cardSelectionHandler) {
            console.error("Card selection handler not registered");
            return;
          }

          // CardSelectionModalを開いてユーザー入力を待つ
          return new Promise<void>((resolve) => {
            // IMPORTANT: Use currentGameState.zones.hand instead of original config's availableCards
            // This ensures we're selecting from the CURRENT hand after any previous effects (e.g., drawing cards)
            state.cardSelectionHandler!({
              ...state.currentStep!.cardSelectionConfig!,
              availableCards: currentGameState.zones.hand,
              onConfirm: async (selectedInstanceIds: string[]) => {
                // ユーザーがカードを選択したら、actionを実行
                const result = await state.currentStep!.action(currentGameState, selectedInstanceIds);

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
          // カード選択不要な場合（従来の動作）
          const result = await state.currentStep.action(currentGameState);

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

// Svelteストアの重複を避けるためのヘルパー
function get<T>(store: { subscribe: (fn: (value: T) => void) => () => void }): T {
  let value: T;
  const unsubscribe = store.subscribe((v) => (value = v));
  unsubscribe();
  return value!;
}

export const effectResolutionStore = createEffectResolutionStore();
