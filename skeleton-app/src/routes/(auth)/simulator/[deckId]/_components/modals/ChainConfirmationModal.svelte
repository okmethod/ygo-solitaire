<script lang="ts">
  /**
   * ChainConfirmationModal - チェーン確認モーダル
   *
   * チェーン可能なカードをユーザーに提示し、発動するかパスするかを選択させる。
   * effectQueueStore の chainConfirmationConfig から情報を取得し、
   * ユーザーによる操作確定時に config 内のコールバックを実行する。
   */
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import type { DisplayCardData, ChainConfirmationModalConfig } from "$lib/presentation/types";
  import { getDisplayCardData } from "$lib/presentation/services/displayDataCache";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";

  interface ChainConfirmationModalProps {
    isOpen: boolean;
    config: ChainConfirmationModalConfig | null;
  }

  let { isOpen, config }: ChainConfirmationModalProps = $props();

  // 選択状態を内部で管理
  let selectedId = $state<string | null>(null);

  // isOpenがtrueになったら選択状態をリセット
  $effect(() => {
    if (isOpen) {
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

<Modal
  open={isOpen}
  onOpenChange={() => {}}
  contentBase="card bg-surface-50 dark:bg-surface-900 p-6 space-y-4 w-[95vw] md:max-w-4xl max-h-[90vh] overflow-auto shadow-2xl border-2 border-surface-300 dark:border-surface-700"
  backdropClasses="!bg-black/80 backdrop-blur-md"
  modal={true}
  trapFocus={true}
  closeOnEscape={false}
  preventScroll={true}
>
  {#snippet content()}
    {#if config}
      <!-- ヘッダー -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">チェーンしますか？</h3>
      </div>

      <!-- 説明文 -->
      <p class="text-sm text-surface-600-300-token mb-4">
        チェーン可能なカードがあります。発動するカードを選択するか、パスしてください。
      </p>

      <!-- カード選択エリア -->
      <div class="min-h-[150px] max-h-[400px] overflow-y-auto mb-6">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
      <div class="flex justify-end gap-3 mt-6">
        <button class="btn btn-ghost" onclick={handlePass}> パス </button>
        <button class="btn btn-primary" onclick={handleActivate} disabled={!selectedId}> 発動 </button>
      </div>
    {/if}
  {/snippet}
</Modal>
