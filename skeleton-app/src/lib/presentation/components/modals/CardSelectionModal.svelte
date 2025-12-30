<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import { cardSelectionStore } from "$lib/presentation/stores/cardSelectionStore.svelte";
  import { handCards } from "$lib/application/stores/cardDisplayStore";
  import type { CardDisplayData } from "$lib/presentation/types/card";

  // cardSelectionStoreの状態を購読
  const isActive = $derived(cardSelectionStore.isActive);
  const config = $derived(cardSelectionStore.config);
  const selectedCount = $derived(cardSelectionStore.selectedCount);
  const isValidSelection = $derived(cardSelectionStore.isValidSelection);
  const cancelable = $derived(config?.cancelable ?? true); // Default: true (backward compatible)

  // Modal の onOpenChange ハンドラー
  function handleOpenChange(event: { open: boolean }) {
    // Only allow closing if cancelable is true
    if (!event.open && isActive && cancelable) {
      cardSelectionStore.cancelSelection();
    }
  }

  // カード選択ハンドリング
  function handleCardClick(instanceId: string) {
    // Check if this card can be toggled (selection limit not reached or already selected)
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
    return $handCards.find((card: CardDisplayData) => {
      // handCardsはCardDisplayData[]なので、instanceIdと照合するため
      // config.availableCardsからinstanceIdに対応するcard.idを取得
      const cardInstance = config?.availableCards.find((c) => c.instanceId === instanceId);
      return cardInstance && card.id === cardInstance.id; // CardInstance extends CardData
    });
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
