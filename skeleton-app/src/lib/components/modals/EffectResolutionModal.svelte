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

<Modal open={isOpen} class="modal-bottom sm:modal-middle" onkeydown={handleKeydown}>
  <div class="modal-box">
    <!-- ヘッダー -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg">{title}</h3>
    </div>

    <!-- メッセージ -->
    <div class="py-4">
      <p class="text-center text-lg">{message}</p>
    </div>

    <!-- ボタンエリア -->
    <div class="modal-action">
      {#if showCancel}
        <button class="btn btn-ghost" onclick={handleCancel}> キャンセル </button>
      {/if}
      <button class="btn btn-primary" onclick={handleConfirm}> OK </button>
    </div>
  </div>
</Modal>
