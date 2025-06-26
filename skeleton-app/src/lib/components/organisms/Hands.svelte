<script lang="ts">
  interface HandsProps {
    handCards?: number;
  }

  let { handCards = 5 }: HandsProps = $props();
</script>

<div class="card p-2 max-w-6xl mx-auto">
  <div class="transition-all duration-300">
    <div class="grid grid-cols-7 gap-2 md:gap-2 sm:gap-1 mb-4">
      <div></div>
      {#each Array(handCards) as _, i}
        <div
          class="border border-surface-300 rounded aspect-[3/4] flex items-center justify-center bg-surface-100-800-token transition-all duration-200 hover:border-primary-500"
        >
          <span class="text-xs opacity-50 select-none">H{i + 1}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
