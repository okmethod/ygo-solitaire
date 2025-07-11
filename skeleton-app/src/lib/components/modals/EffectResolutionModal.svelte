<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";

  interface EffectResolutionModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
  }

  let { isOpen, title, message, onConfirm, onCancel, showCancel = false }: EffectResolutionModalProps = $props();

  function handleConfirm() {
    onConfirm();
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
    }
  }

  function modalClose() {
    if (showCancel && onCancel) {
      handleCancel();
    }
  }

  function onOpenChange(event: { open: boolean }) {
    if (!event.open && showCancel && onCancel) {
      onCancel();
    }
  }
</script>

<Modal
  open={isOpen}
  {onOpenChange}
  contentBase="card bg-surface-100-800-token p-6 space-y-4 max-w-md"
  modal={true}
  trapFocus={true}
  closeOnEscape={showCancel}
  preventScroll={true}
>
  {#snippet content()}
    <header class="text-center">
      <h2 class="h3 font-bold text-primary-600-300-token">{title}</h2>
    </header>

    <article class="text-center">
      <p class="text-lg">{message}</p>
    </article>

    <footer class="flex justify-end gap-2">
      {#if showCancel}
        <button class="btn variant-ghost" onclick={handleCancel}> キャンセル </button>
      {/if}
      <button class="btn variant-filled-primary" onclick={handleConfirm}> OK </button>
    </footer>
  {/snippet}
</Modal>
