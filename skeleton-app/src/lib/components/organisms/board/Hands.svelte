<script lang="ts">
  import CardComponent from "$lib/components/atoms/Card.svelte";
  import CardSelectionModal from "$lib/components/modals/CardSelectionModal.svelte";
  import EffectResolutionModal from "$lib/components/modals/EffectResolutionModal.svelte";
  import type { Card } from "$lib/types/card";
  import type { DuelState } from "$lib/classes/DuelState";
  import type { EffectResult, InteractiveEffectResult } from "$lib/types/effect";
  import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";

  interface HandsProps {
    cards: Card[];
    duelState: DuelState;
    onEffectResult?: (result: EffectResult) => void;
  }

  let { cards, duelState, onEffectResult }: HandsProps = $props();

  // カード選択モーダルの状態
  let isCardSelectionOpen = $state(false);
  let cardSelectionTitle = $state("");
  let cardSelectionDescription = $state("");
  let cardSelectionCards = $state<Card[]>([]);
  let cardSelectionMaxSelections = $state(0);
  let cardSelectionCallback: ((selectedCards: Card[]) => void) | null = null;

  // 効果解決ストアの状態を購読
  const effectResolutionState = effectResolutionStore;

  // カード枚数に応じたレイアウトクラスを計算
  const layoutClasses = $derived(() => {
    const cardCount = cards.length;
    if (cardCount === 0) return "justify-center";
    if (cardCount <= 3) return "justify-center gap-4";
    if (cardCount <= 5) return "justify-center gap-3";
    if (cardCount <= 7) return "justify-center gap-2";
    return "justify-center gap-1"; // 7枚を超える場合
  });

  // カードサイズを動的に調整
  const cardSize = $derived(() => {
    const cardCount = cards.length;
    if (cardCount <= 3) return "large";
    if (cardCount <= 5) return "medium";
    return "small"; // 6枚以上
  });

  // カードクリック処理 - 効果発動
  async function handleCardClick(card: Card) {
    console.log(`[Hands] *** カード「${card.name}」(ID: ${card.id})がクリックされました ***`);

    // カードに効果があるかチェック
    const effects = duelState.getEffectsForCard(card.id);
    console.log(`[Hands] 効果チェック結果: ${effects.length}個の効果`, effects);

    if (effects.length === 0) {
      console.log(`[Hands] カード「${card.name}」には効果がありません`);
      return;
    }

    console.log(`[Hands] 効果実行を開始します...`);

    // 効果実行 - ステップバイステップで実行
    await executeEffectStepByStep(card);
  }

  // ステップバイステップで効果実行
  async function executeEffectStepByStep(card: Card) {
    // 効果解決ステップを作成
    const steps = [
      {
        id: "activate-magic",
        title: "魔法カード発動",
        message: `${card.name}を発動します`,
        action: async () => {
          console.log(`[Hands] 魔法カード「${card.name}」を発動`);
          // 実際の効果実行（手札から魔法・罠ゾーンへの移動も含む）
          const result = (await duelState.executeCardEffect(card.id)) as InteractiveEffectResult;
          console.log(`[Hands] 効果実行結果:`, result);

          // インタラクティブな結果の場合はカード選択モーダルを表示
          if (result.success && result.requiresCardSelection) {
            console.log(`[Hands] カード選択モーダルを表示します`);
            const selection = result.requiresCardSelection;
            cardSelectionTitle = selection.title;
            cardSelectionDescription = selection.description;
            cardSelectionCards = selection.cards;
            cardSelectionMaxSelections = selection.maxSelections;
            cardSelectionCallback = selection.onSelection;
            isCardSelectionOpen = true;
          }

          // 結果を親コンポーネントに通知（UI更新のため）
          if (onEffectResult) {
            console.log(`[Hands] 親コンポーネントに結果を通知します`);
            onEffectResult(result);
          }
        },
      },
    ];

    // ステップバイステップ実行を開始
    effectResolutionStore.startResolution(steps);
  }

  // カード選択モーダルの確定処理
  function handleCardSelectionConfirm(selectedCards: Card[]) {
    if (cardSelectionCallback) {
      cardSelectionCallback(selectedCards);
    }
    isCardSelectionOpen = false;
    cardSelectionCallback = null;
  }

  // カード選択モーダルのキャンセル処理
  function handleCardSelectionCancel() {
    isCardSelectionOpen = false;
    cardSelectionCallback = null;
  }

  // カードホバー処理
  function handleCardHover(card: Card | null) {
    if (card) {
      // カードに効果があるかチェックしてUIヒントを表示
      const effects = duelState.getEffectsForCard(card.id);
      if (effects.length > 0) {
        console.log(`[Hands] カード「${card.name}」には${effects.length}個の効果があります`);
      }
    }
  }

  // カードが効果を持っているかチェック
  function hasEffect(card: Card): boolean {
    const effects = duelState.getEffectsForCard(card.id);
    const hasEffects = effects.length > 0;
    if (hasEffects) {
      console.log(
        `[Hands] カード「${card.name}」(${card.id})には${effects.length}個の効果があります:`,
        effects.map((e: { name: string }) => e.name),
      );
    }
    return hasEffects;
  }

  // カードの効果が発動可能かチェック
  function canActivateEffect(card: Card): boolean {
    const effects = duelState.getEffectsForCard(card.id);
    const canActivate = effects.some((effect: { canActivate: (state: DuelState) => boolean }) =>
      effect.canActivate(duelState),
    );
    if (effects.length > 0) {
      console.log(`[Hands] カード「${card.name}」効果発動可能: ${canActivate}`);
    }
    return canActivate;
  }
</script>

<div class="w-full max-w-6xl mx-auto">
  <div class="transition-all duration-300">
    <!-- 手札情報 -->
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-semibold">手札</h3>
      <span class="badge preset-tonal-surface text-sm">
        {cards.length}枚
      </span>
    </div>

    <!-- カード表示エリア -->
    <div class="bg-surface-100-800-token rounded-lg p-4 min-h-[150px]">
      {#if cards.length > 0}
        <div class="flex {layoutClasses()} flex-wrap">
          {#each cards as card (card.instanceId || `fallback-${card.id}-${Math.random()}`)}
            {@const hasCardEffect = hasEffect(card)}
            {@const canActivate = canActivateEffect(card)}
            <div
              class="transition-all duration-200 hover:scale-105 hover:-translate-y-2 relative"
              class:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]={canActivate}
              class:hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]={canActivate}
              class:drop-shadow-[0_0_4px_rgba(234,179,8,0.3)]={hasCardEffect && !canActivate}
            >
              <!-- 効果発動可能インジケーター -->
              {#if canActivate}
                <div
                  class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full z-10 animate-pulse shadow-lg"
                ></div>
              {/if}

              <!-- 効果有りインジケーター -->
              {#if hasCardEffect && !canActivate}
                <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full z-10 opacity-60"></div>
              {/if}

              <CardComponent
                {card}
                size={cardSize()}
                clickable={hasCardEffect}
                selectable={false}
                animate={true}
                onClick={handleCardClick}
                onHover={handleCardHover}
              />
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex items-center justify-center h-32 text-surface-600-300-token">
          <p class="text-lg">手札にカードがありません</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- カード選択モーダル -->
<CardSelectionModal
  isOpen={isCardSelectionOpen}
  title={cardSelectionTitle}
  description={cardSelectionDescription}
  cards={cardSelectionCards}
  maxSelections={cardSelectionMaxSelections}
  onConfirm={handleCardSelectionConfirm}
  onCancel={handleCardSelectionCancel}
/>

<!-- 効果解決モーダル -->
<EffectResolutionModal
  isOpen={$effectResolutionState.isActive}
  title={$effectResolutionState.currentStep?.title || ""}
  message={$effectResolutionState.currentStep?.message || ""}
  onConfirm={effectResolutionStore.confirmCurrentStep}
  onCancel={$effectResolutionState.currentStep?.showCancel ? effectResolutionStore.cancelResolution : undefined}
  showCancel={$effectResolutionState.currentStep?.showCancel || false}
/>
