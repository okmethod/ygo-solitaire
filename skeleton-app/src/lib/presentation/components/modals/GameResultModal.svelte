<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";

  interface GameResultModalProps {
    isOpen: boolean;
    winner?: "player" | "opponent" | "draw";
    reason?: string;
    message?: string;
    onClose: () => void;
  }

  let { isOpen, winner, reason, message, onClose }: GameResultModalProps = $props();

  function handleClose() {
    onClose();
  }

  function onOpenChange(event: { open: boolean }) {
    if (!event.open) {
      handleClose();
    }
  }

  function getBorderColor(): string {
    if (winner === "player") return "border-success-500";
    if (winner === "opponent") return "border-error-500";
    if (winner === "draw") return "border-warning-500";
    return "border-surface-500";
  }
</script>

<Modal
  open={isOpen}
  {onOpenChange}
  contentBase="card bg-surface-50 dark:bg-surface-900 p-8 space-y-6 max-w-lg shadow-2xl border-4 {getBorderColor()}"
  backdropClasses="!bg-black/80 backdrop-blur-md"
  modal={true}
  trapFocus={true}
  closeOnEscape={true}
  preventScroll={true}
>
  {#snippet content()}
    <header class="text-center">
      <h2
        class="h2 font-bold {winner === 'player'
          ? 'text-success-600 dark:text-success-400'
          : 'text-error-600 dark:text-error-400'}"
      >
        Game Over!
      </h2>
    </header>

    <article class="space-y-4 text-center">
      {#if winner}
        <p class="text-2xl font-bold">
          {#if winner === "draw"}
            <span class="text-warning-600 dark:text-warning-400">Draw</span>
          {:else}
            Winner: <span
              class={winner === "player"
                ? "text-success-600 dark:text-success-400"
                : "text-error-600 dark:text-error-400"}
            >
              {winner === "player" ? "You" : "Opponent"}
            </span>
          {/if}
        </p>
      {/if}

      {#if reason}
        <p class="text-base opacity-75">
          <span class="font-semibold">Reason:</span>
          {reason}
        </p>
      {/if}

      {#if message}
        <p class="text-base">
          {message}
        </p>
      {/if}
    </article>

    <footer class="flex justify-center">
      <button class="btn variant-filled-primary" onclick={handleClose}> 閉じる </button>
    </footer>
  {/snippet}
</Modal>
