<script lang="ts">
  /**
   * ConfirmationModal - ユーザー確認モーダル
   *
   * カード選択を伴わない interactive ステップで、ユーザーに確認を求めるモーダル。
   * effectQueueStore の confirmationConfig から情報を取得し、
   * ユーザーによる操作確定/キャンセル時に config 内のコールバックを実行する。
   *
   * cancelable=true の場合はキャンセルボタンも表示する。
   */
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import type { ConfirmationModalConfig } from "$lib/presentation/types";

  interface ConfirmationModalProps {
    isOpen: boolean;
    config: ConfirmationModalConfig | null;
  }

  let { isOpen, config }: ConfirmationModalProps = $props();

  const cancelable = $derived(config?.cancelable ?? false);

  function handleConfirm() {
    config?.onConfirm();
  }

  function handleCancel() {
    config?.onCancel?.();
  }

  function handleOpenChange(event: { open: boolean }) {
    if (!event.open && isOpen && cancelable) {
      handleCancel();
    }
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
    <Dialog.Backdrop class="fixed inset-0 bg-black/80 backdrop-blur-md z-40" />
    <Dialog.Positioner class="fixed inset-0 flex items-center justify-center z-50">
      <Dialog.Content
        class="card bg-surface-50 dark:bg-surface-900 p-6 space-y-4 max-w-md shadow-2xl border-2 border-surface-300 dark:border-surface-700"
      >
        {#if config}
          <header class="text-center">
            <h2 class="h3 font-bold text-primary-600-300-token">{config.summary}</h2>
          </header>

          <article class="text-center">
            <p class="text-lg">{config.description}</p>
          </article>

          <footer class="flex justify-center gap-3">
            {#if cancelable}
              <button class="btn variant-ghost" onclick={handleCancel}>キャンセル</button>
            {/if}
            <button class="btn variant-filled-primary" onclick={handleConfirm}>OK</button>
          </footer>
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
