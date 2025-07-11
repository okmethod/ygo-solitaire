import { writable } from "svelte/store";

export interface EffectResolutionStep {
  id: string;
  title: string;
  message: string;
  action: () => Promise<void> | void;
  showCancel?: boolean;
}

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
        // 現在のステップのアクションを実行
        await state.currentStep.action();

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
