<script lang="ts">
  interface EffectResolutionModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
  }

  let { isOpen, title, message, onConfirm, onCancel, showCancel = false }: EffectResolutionModalProps = $props();

  let modal: HTMLDialogElement;

  // モーダルの開閉制御
  $effect(() => {
    if (isOpen && modal) {
      modal.showModal();
    } else if (!isOpen && modal) {
      modal.close();
    }
  });

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

<dialog bind:this={modal} class="modal modal-bottom sm:modal-middle" onkeydown={handleKeydown}>
  <div class="modal-box bg-surface-100-800-token">
    <!-- ヘッダー -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg text-primary-600-300-token">{title}</h3>
    </div>

    <!-- メッセージ -->
    <div class="py-4">
      <p class="text-center text-lg">{message}</p>
    </div>

    <!-- ボタンエリア -->
    <div class="modal-action">
      {#if showCancel}
        <button class="btn variant-ghost" onclick={handleCancel}> キャンセル </button>
      {/if}
      <button class="btn variant-filled-primary" onclick={handleConfirm}> OK </button>
    </div>
  </div>
  
  <!-- 背景クリックを無効化（効果解決中なので） -->
  <form method="dialog" class="modal-backdrop">
    <button type="button"></button>
  </form>
</dialog>
