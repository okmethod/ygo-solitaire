<script lang="ts">
  /**
   * OptionalTriggerConfirmModal - 任意誘発効果の発動確認モーダル
   *
   * 任意誘発効果を発動するかどうかをユーザーに確認する。
   * effectQueueStore の optionalTriggerConfirmConfig から情報を取得し、
   * ユーザーによる操作確定時に config 内のコールバックを実行する。
   */
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import type { OptionalTriggerConfirmModalConfig } from "$lib/presentation/types";

  interface OptionalTriggerConfirmModalProps {
    isOpen: boolean;
    config: OptionalTriggerConfirmModalConfig | null;
  }

  let { isOpen, config }: OptionalTriggerConfirmModalProps = $props();

  function handleActivate() {
    config?.onActivate();
  }

  function handlePass() {
    config?.onPass();
  }
</script>

<Dialog open={isOpen} onOpenChange={() => {}} modal={true} trapFocus={true} closeOnEscape={false} preventScroll={true}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-black/80 backdrop-blur-md" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Content
        class="card bg-surface-50 dark:bg-surface-900 border-surface-300 dark:border-surface-700 max-h-[90vh] w-[95vw] space-y-4 overflow-auto border-2 p-6 shadow-2xl md:max-w-md"
      >
        {#if config}
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold">効果を発動しますか？</h3>
          </div>

          <p class="text-surface-600-300-token mb-4 text-sm">
            {config.sourceCardName} の効果を発動できます。
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <button class="btn btn-ghost" onclick={handlePass}> 発動しない </button>
            <button class="btn btn-primary" onclick={handleActivate}> 発動する </button>
          </div>
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
