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

  // Enterキーでも確定できるように
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      handleConfirm();
    } else if (event.key === "Escape" && showCancel) {
      handleCancel();
    }
  }
</script>

{#if isOpen}
  <Modal>
    <div slot="header" class="text-xl font-bold text-primary-600-300-token">
      {title}
    </div>

    <div class="py-4">
      <p class="text-center text-lg">{message}</p>
    </div>

    <div slot="footer" class="flex justify-end gap-2">
      {#if showCancel}
        <button class="btn variant-ghost" onclick={handleCancel}> キャンセル </button>
      {/if}
      <button class="btn variant-filled-primary" onclick={handleConfirm}> OK </button>
    </div>
  </Modal>
{/if}
