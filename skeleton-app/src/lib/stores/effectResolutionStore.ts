import { writable } from "svelte/store";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { cardSelectionStore } from "./cardSelectionStore.svelte";
import type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";

// Re-export EffectResolutionStep from Domain Layer for backward compatibility
export type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";

interface EffectResolutionState {
  isActive: boolean;
  currentStep: EffectResolutionStep | null;
  steps: EffectResolutionStep[];
  currentIndex: number;
}

function createEffectResolutionStore() {
  const { subscribe, set, update } = writable<EffectResolutionState>({
    isActive: false,
    currentStep: null,
    steps: [],
    currentIndex: -1,
  });

  return {
    subscribe,

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
          // CardSelectionModalを開いてユーザー入力を待つ
          return new Promise<void>((resolve) => {
            cardSelectionStore.startSelection({
              ...state.currentStep!.cardSelectionConfig!,
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
      set({
        isActive: false,
        currentStep: null,
        steps: [],
        currentIndex: -1,
      });
    },

    /**
     * 現在の状態をリセット
     */
    reset: () => {
      set({
        isActive: false,
        currentStep: null,
        steps: [],
        currentIndex: -1,
      });
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
