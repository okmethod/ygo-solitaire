<script lang="ts">
  /**
   * CardSelectionModal - カード選択モーダル
   *
   * カード選択を伴う interactive ステップで、ユーザーにカード選択UIを提供するモーダル。
   * effectQueueStore の cardSelectionConfig から情報を取得し、
   * ユーザーによる操作確定時に config 内のコールバックを実行する。
   *
   * cancelable=true の場合はキャンセルボタンも表示する。
   */
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import type { CardDisplayData } from "$lib/presentation/types";
  import type { CardSelectionModalConfig } from "$lib/presentation/types/interaction";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import { getCardDisplayData } from "$lib/presentation/services/cardDisplayDataCache";

  interface CardSelectionModalProps {
    isOpen: boolean;
    config: CardSelectionModalConfig | null;
  }

  let { isOpen, config }: CardSelectionModalProps = $props();

  // 選択状態を内部で管理
  let selectedIds = $state<Set<string>>(new Set());

  // isOpenがtrueになったら選択状態をリセット
  $effect(() => {
    if (isOpen) {
      selectedIds = new Set();
    }
  });

  // 派生状態
  const selectedCount = $derived(selectedIds.size);
  const cancelable = $derived(config?.cancelable ?? false);

  const isValidSelection = $derived(() => {
    if (!config) return false;
    return selectedCount >= config.minCards && selectedCount <= config.maxCards;
  });

  // カードが選択されているかチェック
  function isSelected(instanceId: string): boolean {
    return selectedIds.has(instanceId);
  }

  // カードの選択状態を切り替え可能かチェック
  function canToggleCard(instanceId: string): boolean {
    if (!config) return false;
    if (selectedIds.has(instanceId)) return true;
    return selectedIds.size < config.maxCards;
  }

  // Modal の onOpenChange ハンドラー
  function handleOpenChange(event: { open: boolean }) {
    if (!event.open && isOpen && cancelable) {
      handleCancel();
    }
  }

  // カード選択ハンドリング
  function handleCardClick(instanceId: string) {
    if (!config) return;

    // 選択対象のカードかチェック
    const isAvailable = config.availableCards.some((card) => card.instanceId === instanceId);
    if (!isAvailable) return;

    const canToggle = canToggleCard(instanceId);
    const alreadySelected = isSelected(instanceId);

    if (canToggle || alreadySelected) {
      const newSelectedIds = new Set(selectedIds);
      if (alreadySelected) {
        newSelectedIds.delete(instanceId);
      } else {
        newSelectedIds.add(instanceId);
      }
      selectedIds = newSelectedIds;
    }
  }

  // 確定ボタン
  function handleConfirm() {
    if (!config || !isValidSelection()) return;
    config.onConfirm(Array.from(selectedIds));
  }

  // キャンセルボタン
  function handleCancel() {
    config?.onCancel?.();
  }

  // instanceIdからCardDisplayDataを取得
  function getCardDisplay(instanceId: string): CardDisplayData | undefined {
    const cardInstance = config?.availableCards.find((c) => c.instanceId === instanceId);
    if (!cardInstance) return undefined;
    return getCardDisplayData(cardInstance.id);
  }
</script>

<Modal
  open={isOpen}
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
            {@const selected = isSelected(cardInstance.instanceId)}
            {@const canToggle = canToggleCard(cardInstance.instanceId)}
            {@const cardDisplay = getCardDisplay(cardInstance.instanceId)}
            {#if cardDisplay}
              <div class:opacity-50={!canToggle && !selected}>
                <CardComponent
                  card={cardDisplay}
                  size="small"
                  clickable={true}
                  selectable={false}
                  isSelected={selected}
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
        <button class="btn btn-primary" onclick={handleConfirm} disabled={!isValidSelection()}> 確定 </button>
      </div>
    {/if}
  {/snippet}
</Modal>
