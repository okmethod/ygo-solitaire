<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";

  interface EffectResolutionModalProps {
    isOpen: boolean;
    summary: string;
    description: string;
    onConfirm: () => void;
  }

  let { isOpen, summary, description, onConfirm }: EffectResolutionModalProps = $props();

  function handleConfirm() {
    onConfirm();
  }
</script>

<Modal
  open={isOpen}
  contentBase="card bg-surface-50 dark:bg-surface-900 p-6 space-y-4 max-w-md shadow-2xl border-2 border-surface-300 dark:border-surface-700"
  backdropClasses="!bg-black/80 backdrop-blur-md"
  modal={true}
  trapFocus={true}
  closeOnEscape={false}
  preventScroll={true}
>
  {#snippet content()}
    <header class="text-center">
      <h2 class="h3 font-bold text-primary-600-300-token">{summary}</h2>
    </header>

    <article class="text-center">
      <p class="text-lg">{description}</p>
    </article>

    <footer class="flex justify-center">
      <button class="btn variant-filled-primary" onclick={handleConfirm}> OK </button>
    </footer>
  {/snippet}
</Modal>
