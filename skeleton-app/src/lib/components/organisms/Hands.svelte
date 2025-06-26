<script lang="ts">
  interface HandProps {
    handCards?: number;
  }

  let { handCards = 5 }: HandProps = $props();
</script>

<div class="hand-container">
  <h4 class="h4 text-center mb-4">手札 ({handCards}枚)</h4>
  <div class="flex justify-center gap-2 flex-wrap">
    {#each Array(handCards) as _, i}
      <div
        class="border border-surface-300 rounded aspect-[3/4] w-16 md:w-12 flex items-center justify-center bg-surface-100-800-token hover:bg-surface-200-700-token transition-colors cursor-pointer"
      >
        <span class="text-xs opacity-50 select-none">{i + 1}</span>
      </div>
    {/each}
  </div>
</div>
