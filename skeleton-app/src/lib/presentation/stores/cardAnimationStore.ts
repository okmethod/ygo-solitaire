import { writable, get } from "svelte/store";
import type { DisplayCardData } from "$lib/presentation/types";

export type AnimationZone = "hand" | "graveyard" | "mainDeck" | "monsterZone" | "spellTrapZone" | "fieldZone";

export interface CardAnimation {
  instanceId: string;
  cardData: DisplayCardData;
  sourceRect: DOMRect;
  targetRect: DOMRect;
  status: "animating" | "completed";
}

interface CardAnimationState {
  activeAnimations: CardAnimation[];
  isAnimating: boolean;
}

const initialState: CardAnimationState = {
  activeAnimations: [],
  isAnimating: false,
};

function createCardAnimationStore() {
  const { subscribe, set, update } = writable<CardAnimationState>(initialState);

  // カード位置のキャッシュ（状態変更前にキャプチャ）
  const cardPositionCache = new Map<string, DOMRect>();
  // ゾーン位置のキャッシュ
  const zonePositionCache = new Map<AnimationZone, DOMRect>();

  return {
    subscribe,

    // カード位置を登録（各フレームで更新）
    registerCardPosition(instanceId: string, rect: DOMRect): void {
      cardPositionCache.set(instanceId, rect);
    },

    // カード位置を取得
    getCardPosition(instanceId: string): DOMRect | undefined {
      return cardPositionCache.get(instanceId);
    },

    // カード位置を削除
    unregisterCardPosition(instanceId: string): void {
      cardPositionCache.delete(instanceId);
    },

    // ゾーン位置を登録
    registerZonePosition(zone: AnimationZone, rect: DOMRect): void {
      zonePositionCache.set(zone, rect);
    },

    // ゾーン位置を取得
    getZonePosition(zone: AnimationZone): DOMRect | undefined {
      return zonePositionCache.get(zone);
    },

    // アニメーション開始
    startAnimation(animation: Omit<CardAnimation, "status">): void {
      update((state) => ({
        activeAnimations: [...state.activeAnimations, { ...animation, status: "animating" }],
        isAnimating: true,
      }));
    },

    // アニメーション完了
    completeAnimation(instanceId: string): void {
      update((state) => {
        const remaining = state.activeAnimations.filter((a) => a.instanceId !== instanceId);
        return {
          activeAnimations: remaining,
          isAnimating: remaining.length > 0,
        };
      });
    },

    // 全アニメーションをクリア
    clearAnimations(): void {
      set(initialState);
    },

    // 現在アニメーション中のカードIDを取得
    getAnimatingCardIds(): string[] {
      return get({ subscribe }).activeAnimations.map((a) => a.instanceId);
    },

    // 特定のカードがアニメーション中か確認
    isCardAnimating(instanceId: string): boolean {
      return get({ subscribe }).activeAnimations.some((a) => a.instanceId === instanceId);
    },
  };
}

export const cardAnimationStore = createCardAnimationStore();
