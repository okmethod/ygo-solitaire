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
    <Dialog.Backdrop class="fixed inset-0 bg-black/80 backdrop-blur-md z-40" />
    <Dialog.Positioner class="fixed inset-0 flex items-center justify-center z-50">
      <Dialog.Content
        class="card bg-surface-50 dark:bg-surface-900 p-6 space-y-4 w-[95vw] md:max-w-md max-h-[90vh] overflow-auto shadow-2xl border-2 border-surface-300 dark:border-surface-700"
      >
        {#if config}
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-lg">効果を発動しますか？</h3>
          </div>

          <p class="text-sm text-surface-600-300-token mb-4">
            {config.sourceCardName} の効果を発動できます。
          </p>

          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-ghost" onclick={handlePass}> 発動しない </button>
            <button class="btn btn-primary" onclick={handleActivate}> 発動する </button>
          </div>
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
