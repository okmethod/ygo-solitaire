<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";

  interface EffectResolutionModalProps {
    isOpen: boolean;
    summary: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
  }

  let { isOpen, summary, description, onConfirm, onCancel, showCancel = false }: EffectResolutionModalProps = $props();

  function handleConfirm() {
    onConfirm();
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
    }
  }

  function onOpenChange(event: { open: boolean }) {
    if (!event.open && showCancel && onCancel) {
      handleCancel();
    }
  }
</script>

<Modal
  open={isOpen}
  {onOpenChange}
  contentBase="card bg-surface-50 dark:bg-surface-900 p-6 space-y-4 max-w-md shadow-2xl border-2 border-surface-300 dark:border-surface-700"
  backdropClasses="!bg-black/80 backdrop-blur-md"
  modal={true}
  trapFocus={true}
  closeOnEscape={showCancel}
  preventScroll={true}
>
  {#snippet content()}
    <header class="text-center">
      <h2 class="h3 font-bold text-primary-600-300-token">{summary}</h2>
    </header>

    <article class="text-center">
      <p class="text-lg">{description}</p>
    </article>

    <footer class="flex justify-end gap-2">
      {#if showCancel}
        <button class="btn variant-ghost" onclick={handleCancel}> キャンセル </button>
      {/if}
      <button class="btn variant-filled-primary" onclick={handleConfirm}> OK </button>
    </footer>
  {/snippet}
</Modal>
