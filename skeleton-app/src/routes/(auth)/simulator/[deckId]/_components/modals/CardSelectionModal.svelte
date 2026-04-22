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
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import type { DisplayCardData, CardSelectionModalConfig } from "$lib/presentation/types";
  import { getDisplayCardData } from "$lib/presentation/services/displayDataCache";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";

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

  // 対象が不足していて効果が不発になるかチェック
  const isFizzled = $derived(config != null && config.availableCards.length < config.minCards);

  // 選択中のカードインスタンス配列
  const selectedCards = $derived(() => {
    if (!config) return [];
    return config.availableCards.filter((c) => selectedIds.has(c.instanceId));
  });

  const isValidSelection = $derived(() => {
    if (!config) return false;
    const countValid = selectedCount >= config.minCards && selectedCount <= config.maxCards;
    if (!countValid) return false;
    // canConfirm が設定されている場合は追加チェック
    if (config.canConfirm) {
      return config.canConfirm(selectedCards());
    }
    return true;
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

  // Dialog の onOpenChange ハンドラー
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

  // 不発確認ボタン
  function handleFizzle() {
    config?.onConfirm([]);
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

  // instanceIdからDisplayCardDataを取得
  function getCardDisplay(instanceId: string): DisplayCardData | undefined {
    const cardInstance = config?.availableCards.find((c) => c.instanceId === instanceId);
    if (!cardInstance) return undefined;
    return getDisplayCardData(cardInstance.id);
  }
</script>

<Dialog
  open={isOpen}
  onOpenChange={handleOpenChange}
  modal={true}
  trapFocus={true}
  closeOnEscape={cancelable}
  preventScroll={true}
>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-black/80 backdrop-blur-md" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Content
        class="card bg-surface-50 dark:bg-surface-900 border-surface-300 dark:border-surface-700 max-h-[90vh] w-[95vw] space-y-4 overflow-auto border-2 p-6 shadow-2xl md:max-w-4xl"
      >
        {#if config}
          <!-- ヘッダー -->
          <div class="mb-4 flex items-center justify-between">
            <div>
              {#if config.sourceCardName}
                <p class="mb-1 text-xs font-semibold">{config.sourceCardName}</p>
              {/if}
              <h3 class="text-lg font-bold">{config.summary}</h3>
            </div>
            {#if cancelable}
              <button class="btn btn-sm btn-circle btn-ghost" onclick={handleCancel}> ✕ </button>
            {/if}
          </div>

          {#if isFizzled}
            <!-- 不発UI -->
            <div class="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <p class="text-surface-500 dark:text-surface-400 text-sm">
                対象となるカードが存在しないため、不発となります
              </p>
            </div>
            <div class="mt-6 flex justify-end">
              <button class="btn btn-primary" onclick={handleFizzle}> 確認 </button>
            </div>
          {:else}
            <!-- 説明文 -->
            <p class="text-surface-600-300-token mb-4 text-sm">{config.description}</p>

            <!-- 選択状況 -->
            <div
              class="bg-surface-200 dark:bg-surface-800 border-surface-300 dark:border-surface-600 mb-4 flex items-center justify-between rounded-lg border p-3"
            >
              <span class="text-sm font-semibold">
                選択中: {selectedCount} / {config.maxCards}枚
              </span>
            </div>

            <!-- カード選択エリア -->
            <div class="mb-6 max-h-[400px] min-h-[200px] overflow-y-auto">
              <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
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
            <div class="mt-6 flex justify-end gap-3">
              {#if cancelable}
                <button class="btn btn-ghost" onclick={handleCancel}> キャンセル </button>
              {/if}
              <button class="btn btn-primary" onclick={handleConfirm} disabled={!isValidSelection()}> 確定 </button>
            </div>
          {/if}
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
