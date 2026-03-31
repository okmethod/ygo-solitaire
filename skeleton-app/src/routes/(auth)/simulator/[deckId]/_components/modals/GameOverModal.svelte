<script lang="ts">
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";

  interface GameOverModalProps {
    isOpen: boolean;
    winner?: "player" | "opponent" | "draw";
    reason?: string;
    message?: string;
    onClose: () => void;
  }

  let { isOpen, winner, reason, message, onClose }: GameOverModalProps = $props();

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

<Dialog open={isOpen} {onOpenChange} modal={true} trapFocus={true} closeOnEscape={true} preventScroll={true}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 bg-black/80 backdrop-blur-md z-40" />
    <Dialog.Positioner class="fixed inset-0 flex items-center justify-center z-50">
      <Dialog.Content
        class="card bg-surface-50 dark:bg-surface-900 p-8 space-y-6 max-w-lg shadow-2xl border-4 {getBorderColor()}"
      >
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
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
