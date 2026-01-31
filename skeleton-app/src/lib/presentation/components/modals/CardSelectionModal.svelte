<script lang="ts">
  /**
   * CardSelectionModal - カード選択モーダルコンポーネント
   *
   * カード効果により選択が必要な場面でプレイヤーにカード選択UIを提供する。
   * cardSelectionStore と連携し、選択状態の管理・確定・キャンセルを処理する。
   *
   * @module presentation/components/modals/CardSelectionModal
   */
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import { cardSelectionStore } from "$lib/presentation/stores/cardSelectionStore.svelte";
  import type { CardDisplayData } from "$lib/presentation/types/card";
  import { cardRepository } from "$lib/presentation/stores/zonesDisplayStore";

  // cardSelectionStore の状態を購読
  const isActive = $derived(cardSelectionStore.isActive);
  const config = $derived(cardSelectionStore.config);
  const selectedCount = $derived(cardSelectionStore.selectedCount);
  const isValidSelection = $derived(cardSelectionStore.isValidSelection);
  const cancelable = $derived(config?.cancelable ?? false); // Default: false

  // availableCardsのCardDisplayDataをフェッチ
  let availableCardDisplays = $state<CardDisplayData[]>([]);

  $effect(() => {
    if (config?.availableCards && config.availableCards.length > 0) {
      const cardIds = config.availableCards.map((c) => c.id);
      cardRepository
        .getCardsByIds(window.fetch, cardIds)
        .then((cards) => {
          availableCardDisplays = cards;
        })
        .catch((err) => {
          console.error("[CardSelectionModal] Failed to fetch card display data:", err);
          availableCardDisplays = [];
        });
    } else {
      availableCardDisplays = [];
    }
  });

  // Modal の onOpenChange ハンドラー
  function handleOpenChange(event: { open: boolean }) {
    // キャンセル可能な場合のみモーダルを閉じる
    if (!event.open && isActive && cancelable) {
      cardSelectionStore.cancelSelection();
    }
  }

  // カード選択ハンドリング
  function handleCardClick(instanceId: string) {
    // 選択上限に達していないか、または既に選択済みの場合のみトグル可能
    const canToggle = cardSelectionStore.canToggleCard(instanceId);
    const isSelected = cardSelectionStore.isSelected(instanceId);

    if (canToggle || isSelected) {
      cardSelectionStore.toggleCard(instanceId);
    }
  }

  // 確定ボタン
  function handleConfirm() {
    if (isValidSelection) {
      cardSelectionStore.confirmSelection();
    }
  }

  // キャンセルボタン
  function handleCancel() {
    cardSelectionStore.cancelSelection();
  }

  // カードが選択されているかチェック
  function isCardSelected(instanceId: string): boolean {
    return cardSelectionStore.isSelected(instanceId);
  }

  // instanceIdからCardDisplayDataを取得
  function getCardDisplay(instanceId: string): CardDisplayData | undefined {
    // availableCardsからinstanceIdに対応するCardInstanceを取得
    const cardInstance = config?.availableCards.find((c) => c.instanceId === instanceId);
    if (!cardInstance) return undefined;

    // availableCardDisplaysから対応するCardDisplayDataを取得
    return availableCardDisplays.find((card) => card.id === cardInstance.id);
  }
</script>

<Modal
  open={isActive}
  onOpenChange={handleOpenChange}
  contentBase="card bg-surface-50 dark:bg-surface-900 p-6 space-y-4 max-w-4xl max-h-[90vh] overflow-auto shadow-2xl border-2 border-surface-300 dark:border-surface-700"
  backdropClasses="!bg-black/80 backdrop-blur-md"
  modal={true}
  trapFocus={true}
  closeOnEscape={cancelable}
  preventScroll={true}
>
  {#snippet content()}
    {#if config}
      <!-- ヘッダー -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">{config.summary}</h3>
        {#if cancelable}
          <button class="btn btn-sm btn-circle btn-ghost" onclick={handleCancel}> ✕ </button>
        {/if}
      </div>

      <!-- 説明文 -->
      <p class="text-sm text-surface-600-300-token mb-4">{config.description}</p>

      <!-- 選択状況 -->
      <div
        class="flex justify-between items-center mb-4 p-3 bg-surface-200 dark:bg-surface-800 rounded-lg border border-surface-300 dark:border-surface-600"
      >
        <span class="text-sm font-semibold">
          選択中: {selectedCount} / {config.maxCards}枚
        </span>
      </div>

      <!-- カード選択エリア -->
      <div class="min-h-[200px] max-h-[400px] overflow-y-auto mb-6">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {#each config.availableCards as cardInstance (cardInstance.instanceId)}
            {@const isSelected = isCardSelected(cardInstance.instanceId)}
            {@const canToggle = cardSelectionStore.canToggleCard(cardInstance.instanceId)}
            {@const cardDisplay = getCardDisplay(cardInstance.instanceId)}
            {#if cardDisplay}
              <div class:opacity-50={!canToggle && !isSelected}>
                <CardComponent
                  card={cardDisplay}
                  size="small"
                  clickable={true}
                  selectable={false}
                  {isSelected}
                  animate={true}
                  onClick={() => handleCardClick(cardInstance.instanceId)}
                />
              </div>
            {/if}
          {/each}
        </div>
      </div>

      <!-- ボタンエリア -->
      <div class="flex justify-end gap-3 mt-6">
        {#if cancelable}
          <button class="btn btn-ghost" onclick={handleCancel}> キャンセル </button>
        {/if}
        <button class="btn btn-primary" onclick={handleConfirm} disabled={!isValidSelection}> 確定 </button>
      </div>
    {/if}
  {/snippet}
</Modal>
