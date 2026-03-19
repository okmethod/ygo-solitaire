<script lang="ts">
  /**
   * CardMovingAnimationOverlay - カード移動アニメーション表示オーバーレイ
   *
   * カードがゾーン間を移動する際のアニメーションを表示する。
   * position: fixedで画面全体をカバーし、移動中のカードをアニメーション表示する。
   */
  import { cardAnimationStore } from "$lib/presentation/stores/cardAnimationStore";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import { isMobile } from "$lib/presentation/utils/mobile";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";

  const ANIMATION_DURATION_MS = 300 as const;

  // 画面サイズに応じたカードサイズ（元のカードと一致させる）
  const cardSize: ComponentSize = isMobile() ? "small" : "medium";

  // アニメーション状態を購読
  const animationState = $derived($cardAnimationStore);

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
