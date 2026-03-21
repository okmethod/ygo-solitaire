<script lang="ts">
  /**
   * CardMovingAnimationOverlay - カード移動アニメーション検出・表示オーバーレイ
   *
   * ゲーム状態の変化を監視してカード移動を検出し、アニメーションを表示する。
   * 検出 → トリガー → 描画 の全責務を担当する。
   */
  import {
    handCardRefs,
    graveyardCardRefs,
    deckCardCount,
    monsterZoneInstanceOnFieldRefs,
    spellTrapZoneInstanceOnFieldRefs,
    fieldZoneInstanceOnFieldRefs,
  } from "$lib/application/stores/derivedStores";
  import { cardAnimationStore } from "$lib/presentation/stores/cardAnimationStore";
  import { getDisplayCardData } from "$lib/presentation/services/displayDataCache";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import { isMobile } from "$lib/presentation/utils/mobile";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";

  const ANIMATION_DURATION_MS = 300 as const;

  // 画面サイズに応じたカードサイズ（元のカードと一致させる）
  const cardSize: ComponentSize = isMobile() ? "small" : "medium";

  // アニメーション状態を購読
  const animationState = $derived($cardAnimationStore);

  // ========================================
  // カード移動検出ロジック
  // ========================================

  // 前回の状態を記憶（通常変数 - リアクティブ追跡不要）
  let previousHandIds: Set<string> = new Set();
  let previousFieldIds: Set<string> = new Set();
  let previousGraveyardIds: Set<string> = new Set();
  let previousDeckCount: number = 0;
  let isAnimationInitialized = false;

  // フィールド上の全カードIDを取得するヘルパー
  function getAllFieldCardIds(): Set<string> {
    const ids = new Set<string>();
    for (const ref of $monsterZoneInstanceOnFieldRefs) {
      ids.add(ref.instanceId);
    }
    for (const ref of $spellTrapZoneInstanceOnFieldRefs) {
      ids.add(ref.instanceId);
    }
    for (const ref of $fieldZoneInstanceOnFieldRefs) {
      ids.add(ref.instanceId);
    }
    return ids;
  }

  // フィールドカードのcardIdを取得するヘルパー
  function getFieldCardRef(instanceId: string): { cardId: number } | undefined {
    const allRefs = [
      ...$monsterZoneInstanceOnFieldRefs,
      ...$spellTrapZoneInstanceOnFieldRefs,
      ...$fieldZoneInstanceOnFieldRefs,
    ];
    return allRefs.find((r) => r.instanceId === instanceId);
  }

  // フィールド魔法ゾーンへの移動かどうかを判定
  function isFieldZoneCard(instanceId: string): boolean {
    return $fieldZoneInstanceOnFieldRefs.some((r) => r.instanceId === instanceId);
  }

  // アニメーション開始のヘルパー（座標登録を待機）
  function startAnimationWithRetry(
    instanceId: string,
    cardId: number,
    getSourceRect: () => DOMRect | undefined,
    getTargetRect: () => DOMRect | undefined,
  ) {
    let retryCount = 0;
    const maxRetries = 5;

    function tryStart() {
      const cardData = getDisplayCardData(cardId);
      const sourceRect = getSourceRect();
      const targetRect = getTargetRect();

      if (cardData && sourceRect && targetRect) {
        cardAnimationStore.startAnimation({
          instanceId,
          cardData,
          sourceRect,
          targetRect,
        });
      } else if (retryCount < maxRetries) {
        retryCount++;
        requestAnimationFrame(tryStart);
      }
    }

    requestAnimationFrame(tryStart);
  }

  // 状態変化を検出してアニメーションをトリガー
  $effect(() => {
    const currentHandIds = new Set($handCardRefs.map((r) => r.instanceId));
    const currentGraveyardIds = new Set($graveyardCardRefs.map((r) => r.instanceId));
    const currentFieldIds = getAllFieldCardIds();
    const currentDeckCount = $deckCardCount;

    // 初回は状態を記録するのみ（アニメーションなし）
    if (!isAnimationInitialized) {
      previousHandIds = currentHandIds;
      previousFieldIds = currentFieldIds;
      previousGraveyardIds = currentGraveyardIds;
      previousDeckCount = currentDeckCount;
      isAnimationInitialized = true;
      return;
    }

    // デッキ→手札の移動検出
    if (currentDeckCount < previousDeckCount) {
      for (const instanceId of currentHandIds) {
        if (!previousHandIds.has(instanceId)) {
          const cardRef = $handCardRefs.find((r) => r.instanceId === instanceId);
          if (cardRef) {
            startAnimationWithRetry(
              instanceId,
              cardRef.cardId,
              () => cardAnimationStore.getZonePosition("mainDeck"),
              () => cardAnimationStore.getCardPosition(instanceId),
            );
          }
        }
      }
    }

    // 手札→墓地の移動検出
    for (const instanceId of previousHandIds) {
      if (!currentHandIds.has(instanceId) && currentGraveyardIds.has(instanceId)) {
        const cardRef = $graveyardCardRefs.find((r) => r.instanceId === instanceId);
        if (cardRef) {
          const sourceRect = cardAnimationStore.getCardPosition(instanceId);
          const targetRect = cardAnimationStore.getZonePosition("graveyard");
          const cardData = getDisplayCardData(cardRef.cardId);
          if (cardData && sourceRect && targetRect) {
            cardAnimationStore.startAnimation({ instanceId, cardData, sourceRect, targetRect });
          }
        }
      }
    }

    // 手札→フィールドの移動検出
    for (const instanceId of previousHandIds) {
      if (!currentHandIds.has(instanceId) && currentFieldIds.has(instanceId)) {
        const cardRef = getFieldCardRef(instanceId);
        if (cardRef) {
          const sourceRect = cardAnimationStore.getCardPosition(instanceId);
          // フィールド魔法ゾーンへの移動の場合はゾーン位置を使用
          const getTargetRect = isFieldZoneCard(instanceId)
            ? () => cardAnimationStore.getZonePosition("fieldZone")
            : () => cardAnimationStore.getCardPosition(instanceId);
          startAnimationWithRetry(instanceId, cardRef.cardId, () => sourceRect, getTargetRect);
        }
      }
    }

    // フィールド→墓地の移動検出
    for (const instanceId of previousFieldIds) {
      if (!currentFieldIds.has(instanceId) && currentGraveyardIds.has(instanceId)) {
        const cardRef = $graveyardCardRefs.find((r) => r.instanceId === instanceId);
        if (cardRef) {
          const sourceRect = cardAnimationStore.getCardPosition(instanceId);
          const targetRect = cardAnimationStore.getZonePosition("graveyard");
          const cardData = getDisplayCardData(cardRef.cardId);
          if (cardData && sourceRect && targetRect) {
            cardAnimationStore.startAnimation({ instanceId, cardData, sourceRect, targetRect });
          }
        }
      }
    }

    // 墓地→手札の移動検出
    for (const instanceId of previousGraveyardIds) {
      if (!currentGraveyardIds.has(instanceId) && currentHandIds.has(instanceId)) {
        const cardRef = $handCardRefs.find((r) => r.instanceId === instanceId);
        if (cardRef) {
          startAnimationWithRetry(
            instanceId,
            cardRef.cardId,
            () => cardAnimationStore.getZonePosition("graveyard"),
            () => cardAnimationStore.getCardPosition(instanceId),
          );
        }
      }
    }

    // 墓地→フィールドの移動検出
    for (const instanceId of previousGraveyardIds) {
      if (!currentGraveyardIds.has(instanceId) && currentFieldIds.has(instanceId)) {
        const cardRef = getFieldCardRef(instanceId);
        if (cardRef) {
          startAnimationWithRetry(
            instanceId,
            cardRef.cardId,
            () => cardAnimationStore.getZonePosition("graveyard"),
            () => cardAnimationStore.getCardPosition(instanceId),
          );
        }
      }
    }

    // 状態を更新
    previousHandIds = currentHandIds;
    previousFieldIds = currentFieldIds;
    previousGraveyardIds = currentGraveyardIds;
    previousDeckCount = currentDeckCount;
  });

  // ========================================
  // アニメーション描画ロジック
  // ========================================

  // トランジション開始済みのアニメーションIDを追跡
  // （初期位置でレンダリング後、次フレームでトランジション開始）
  let startedAnimations = $state<Set<string>>(new Set());

  // フォールバックタイマーを個別に管理（キーはinstanceId、値はtimeoutId）
  let fallbackTimers = $state<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // 新しいアニメーションが追加されたら、次フレームでトランジション開始
  // 複数のアニメーションが同時に追加された場合も一度の更新で処理する（競合状態を防ぐ）
  $effect(() => {
    const newIds = animationState.activeAnimations
      .filter((a) => !startedAnimations.has(a.instanceId))
      .map((a) => a.instanceId);

    if (newIds.length === 0) return;

    // 初期位置でレンダリングされた後、次フレームでトランジション開始
    const frameId = requestAnimationFrame(() => {
      startedAnimations = new Set([...startedAnimations, ...newIds]);
    });

    // フォールバック: transitionend が発火しない場合に備えて、タイムアウトで完了させる
    // （sourceRect と targetRect が同じ位置の場合、トランジションが発生しない）
    newIds.forEach((id) => {
      const timerId = setTimeout(() => {
        if (animationState.activeAnimations.some((a) => a.instanceId === id)) {
          cardAnimationStore.completeAnimation(id);
          startedAnimations = new Set([...startedAnimations].filter((sid) => sid !== id));
          fallbackTimers.delete(id);
        }
      }, ANIMATION_DURATION_MS + 100);

      fallbackTimers.set(id, timerId);
    });

    // cleanup: コンポーネントのアンマウント時のみ
    return () => {
      cancelAnimationFrame(frameId);
    };
  });

  // アニメーションが削除されたら、対応するフォールバックタイマーをキャンセル
  $effect(() => {
    const activeIds = new Set(animationState.activeAnimations.map((a) => a.instanceId));

    // 削除されたアニメーションのタイマーをキャンセル
    Array.from(fallbackTimers.keys()).forEach((id) => {
      if (!activeIds.has(id)) {
        const timerId = fallbackTimers.get(id);
        if (timerId !== undefined) {
          clearTimeout(timerId);
          fallbackTimers.delete(id);
        }
      }
    });
  });

  // アニメーション完了時のハンドラー
  function handleTransitionEnd(instanceId: string) {
    cardAnimationStore.completeAnimation(instanceId);
    // startedAnimationsからも削除
    startedAnimations = new Set([...startedAnimations].filter((id) => id !== instanceId));
  }

  // アニメーションのtransform値を計算
  function getTransform(animation: (typeof animationState.activeAnimations)[0]): string {
    if (startedAnimations.has(animation.instanceId)) {
      // トランジション開始済み: 目標位置へ移動
      const dx = animation.targetRect.left - animation.sourceRect.left;
      const dy = animation.targetRect.top - animation.sourceRect.top;
      return `translate(${dx}px, ${dy}px)`;
    }
    // まだ開始していない: 初期位置（移動なし）
    return "translate(0, 0)";
  }
</script>

{#if animationState.isAnimating}
  <div class="fixed inset-0 pointer-events-none z-50">
    {#each animationState.activeAnimations as animation (animation.instanceId)}
      {@const sourceRect = animation.sourceRect}
      <div
        class="absolute transition-transform ease-in-out"
        style="
          left: {sourceRect.left}px;
          top: {sourceRect.top}px;
          width: {sourceRect.width}px;
          height: {sourceRect.height}px;
          transform: {getTransform(animation)};
          transition-duration: {ANIMATION_DURATION_MS}ms;
        "
        ontransitionend={() => handleTransitionEnd(animation.instanceId)}
      >
        <CardComponent card={animation.cardData} size={cardSize} clickable={false} animate={false} />
      </div>
    {/each}
  </div>
{/if}
