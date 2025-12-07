<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import CardComponent from "$lib/components/atoms/Card.svelte";
  import { cardSelectionStore } from "$lib/stores/cardSelectionStore.svelte";
  import { cardDisplayStore } from "$lib/application/stores/cardDisplayStore";
  import type { CardDisplayData } from "$lib/types/card";

  // cardSelectionStoreの状態を購読
  const isActive = $derived(cardSelectionStore.isActive);
  const config = $derived(cardSelectionStore.config);
  const selectedCount = $derived(cardSelectionStore.selectedCount);
  const isValidSelection = $derived(cardSelectionStore.isValidSelection);

  // 手札カードの表示データを取得
  const handCards = $derived(cardDisplayStore.handCards);

  // Modal の onOpenChange ハンドラー
  function handleOpenChange(event: { open: boolean }) {
    if (!event.open && isActive) {
      cardSelectionStore.cancelSelection();
    }
  }

  // カード選択ハンドリング
  function handleCardClick(instanceId: string) {
    if (cardSelectionStore.canToggleCard(instanceId)) {
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
    return handCards.find((card) => {
      // handCardsはCardDisplayData[]なので、instanceIdと照合するため
      // config.availableCardsからinstanceIdに対応するcardIdを取得
      const cardInstance = config?.availableCards.find((c) => c.instanceId === instanceId);
      return cardInstance && card.id.toString() === cardInstance.cardId;
    });
  }
</script>

<Modal
  open={isActive}
  onOpenChange={handleOpenChange}
  contentBase="card bg-surface-100-800-token p-6 space-y-4 max-w-4xl max-h-[90vh] overflow-auto"
  backdropClasses="backdrop-blur-sm"
  modal={true}
  trapFocus={true}
  closeOnEscape={true}
  preventScroll={true}
>
  {#snippet content()}
    {#if config}
      <!-- ヘッダー -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">{config.title}</h3>
        <button class="btn btn-sm btn-circle btn-ghost" onclick={handleCancel}> ✕ </button>
      </div>

      <!-- 説明文 -->
      <p class="text-sm text-surface-600-300-token mb-4">{config.message}</p>

      <!-- 選択状況 -->
      <div class="flex justify-between items-center mb-4 p-3 bg-surface-100-800-token rounded-lg">
        <span class="text-sm">
          選択中: {selectedCount} / {config.maxCards}枚
        </span>
        <div class="flex gap-2">
          {#each cardSelectionStore.selectedInstanceIds as instanceId (instanceId)}
            {@const cardDisplay = getCardDisplay(instanceId)}
            {#if cardDisplay}
              <div class="badge badge-primary text-xs">{cardDisplay.name}</div>
            {/if}
          {/each}
        </div>
      </div>

      <!-- カード選択エリア -->
      <div class="min-h-[200px] max-h-[400px] overflow-y-auto mb-6">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {#each config.availableCards as cardInstance (cardInstance.instanceId)}
            {@const isSelected = isCardSelected(cardInstance.instanceId)}
            {@const canToggle = cardSelectionStore.canToggleCard(cardInstance.instanceId)}
            {@const cardDisplay = getCardDisplay(cardInstance.instanceId)}
            {#if cardDisplay}
              <button
                class="transition-all duration-200 transform hover:scale-105 relative"
                class:ring-2={isSelected}
                class:ring-primary-500={isSelected}
                class:opacity-50={!canToggle && !isSelected}
                onclick={() => handleCardClick(cardInstance.instanceId)}
                disabled={!canToggle && !isSelected}
              >
                <!-- 選択インジケーター -->
                {#if isSelected}
                  {@const selectedIndex = cardSelectionStore.selectedInstanceIds.indexOf(cardInstance.instanceId)}
                  <div
                    class="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10"
                  >
                    {selectedIndex + 1}
                  </div>
                {/if}

                <CardComponent card={cardDisplay} size="small" clickable={false} selectable={false} animate={true} />
              </button>
            {/if}
          {/each}
        </div>
      </div>

      <!-- ボタンエリア -->
      <div class="flex justify-end gap-3 mt-6">
        <button class="btn btn-ghost" onclick={handleCancel}> キャンセル </button>
        <button class="btn btn-primary" onclick={handleConfirm} disabled={!isValidSelection}>
          確定 ({selectedCount}/{config.maxCards})
        </button>
      </div>
    {/if}
  {/snippet}
</Modal>
