<script lang="ts">
  /**
   * EffectResolutionModal - 効果処理確認モーダル
   *
   * カード選択を伴わない interactive ステップで、ユーザーに確認を求めるモーダル。
   * effectQueueStore の effectResolutionConfig から情報を取得し、
   * ユーザーによる操作確定時に config 内のコールバックを実行する。
   */
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import type { EffectResolutionModalConfig } from "$lib/presentation/types/interaction";

  interface EffectResolutionModalProps {
    isOpen: boolean;
    config: EffectResolutionModalConfig | null;
  }

  let { isOpen, config }: EffectResolutionModalProps = $props();

  function handleConfirm() {
    config?.onConfirm();
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
    {#if config}
      <header class="text-center">
        <h2 class="h3 font-bold text-primary-600-300-token">{config.summary}</h2>
      </header>

      <article class="text-center">
        <p class="text-lg">{config.description}</p>
      </article>

      <footer class="flex justify-center">
        <button class="btn variant-filled-primary" onclick={handleConfirm}> OK </button>
      </footer>
    {/if}
  {/snippet}
</Modal>
