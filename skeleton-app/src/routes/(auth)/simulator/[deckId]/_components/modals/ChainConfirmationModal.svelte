<script lang="ts">
  /**
   * ChainConfirmationModal - チェーン確認モーダル
   *
   * チェーン可能なカードをユーザーに提示し、発動するかパスするかを選択させる。
   * effectQueueStore の chainConfirmationConfig から情報を取得し、
   * ユーザーによる操作確定時に config 内のコールバックを実行する。
   *
   * chainConfirmationEnabled がオフの場合、モーダルを表示せず自動的にパスする。
   */
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import type { DisplayCardData, ChainConfirmationModalConfig } from "$lib/presentation/types";
  import { getDisplayCardData } from "$lib/presentation/services/displayDataCache";
  import { getChainConfirmationEnabled } from "$lib/presentation/stores/chainConfirmationStore";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";

  interface ChainConfirmationModalProps {
    isOpen: boolean;
    config: ChainConfirmationModalConfig | null;
  }

  let { isOpen, config }: ChainConfirmationModalProps = $props();

  // 選択状態を内部で管理
  let selectedId = $state<string | null>(null);

  // isOpenがtrueになったら選択状態をリセット、または自動パス
  $effect(() => {
    if (isOpen && config) {
      // チェーン確認がオフの場合は自動的にパス
      if (!getChainConfirmationEnabled()) {
        config.onPass();
        return;
      }
      selectedId = null;
    }
  });

  // カードが選択されているかチェック
  function isSelected(instanceId: string): boolean {
    return selectedId === instanceId;
  }

  // カード選択ハンドリング
  function handleCardClick(instanceId: string) {
    if (!config) return;

    // 選択対象のカードかチェック
    const isAvailable = config.chainableCards.some((c) => c.instance.instanceId === instanceId);
    if (!isAvailable) return;

    // 同じカードをクリックした場合は選択解除
    if (selectedId === instanceId) {
      selectedId = null;
    } else {
      selectedId = instanceId;
    }
  }

  // 発動ボタン
  function handleActivate() {
    if (!config || !selectedId) return;
    config.onActivate(selectedId);
  }

  // パスボタン
  function handlePass() {
    config?.onPass();
  }

  // instanceIdからDisplayCardDataを取得
  function getCardDisplay(instanceId: string): DisplayCardData | undefined {
    const entry = config?.chainableCards.find((c) => c.instance.instanceId === instanceId);
    if (!entry) return undefined;
    return getDisplayCardData(entry.instance.id);
  }
</script>

<Dialog open={isOpen} onOpenChange={() => {}} modal={true} trapFocus={true} closeOnEscape={false} preventScroll={true}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-black/80 backdrop-blur-md" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Content
        class="card bg-surface-50 dark:bg-surface-900 border-surface-300 dark:border-surface-700 max-h-[90vh] w-[95vw] space-y-4 overflow-auto border-2 p-6 shadow-2xl md:max-w-4xl"
      >
        {#if config}
          <!-- ヘッダー -->
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold">チェーンしますか？</h3>
          </div>

          <!-- 説明文 -->
          <p class="text-surface-600-300-token mb-4 text-sm">
            チェーン可能なカードがあります。発動するカードを選択するか、パスしてください。
          </p>

          <!-- カード選択エリア -->
          <div class="mb-6 max-h-[400px] min-h-[150px] overflow-y-auto">
            <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {#each config.chainableCards as entry (entry.instance.instanceId)}
                {@const selected = isSelected(entry.instance.instanceId)}
                {@const cardDisplay = getCardDisplay(entry.instance.instanceId)}
                {#if cardDisplay}
                  <div>
                    <CardComponent
                      card={cardDisplay}
                      size="small"
                      clickable={true}
                      selectable={false}
                      isSelected={selected}
                      animate={true}
                      onClick={() => handleCardClick(entry.instance.instanceId)}
                    />
                  </div>
                {/if}
              {/each}
            </div>
          </div>

          <!-- ボタンエリア -->
          <div class="mt-6 flex justify-end gap-3">
            <button class="btn btn-ghost" onclick={handlePass}> パス </button>
            <button class="btn btn-primary" onclick={handleActivate} disabled={!selectedId}> 発動 </button>
          </div>
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
