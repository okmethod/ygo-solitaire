<script lang="ts">
  import { selectedCardForDisplay, hideCardDetailDisplay } from "$lib/stores/cardDetailDisplayStore";
  import { onMount } from "svelte";

  let isVisible = false;

  $: if ($selectedCardForDisplay) {
    isVisible = true;
  } else {
    isVisible = false;
  }

  function handleClose() {
    hideCardDetailDisplay();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose();
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });
</script>

{#if isVisible && $selectedCardForDisplay}
  <div
    class="fixed top-4 right-4 z-50 bg-surface-100-800-token rounded-lg shadow-lg p-4 w-80 transition-all duration-300 ease-in-out"
    role="dialog"
    aria-labelledby="card-image-title"
    aria-describedby="card-image-description"
  >
    <div class="flex justify-between items-center mb-3">
      <h3 id="card-image-title" class="text-lg font-semibold truncate">
        {$selectedCardForDisplay.name}
      </h3>
      <button
        on:click={handleClose}
        class="btn-icon btn-icon-sm hover:bg-surface-200-700-token"
        aria-label="カード詳細を閉じる"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="mb-3">
      <img
        src={$selectedCardForDisplay.images?.image || "/CardBack.jpg"}
        alt={$selectedCardForDisplay.name}
        class="w-full h-auto rounded-md shadow-sm"
        loading="lazy"
      />
    </div>

    <div id="card-image-description" class="text-sm space-y-2">
      <div class="flex justify-between">
        <span class="text-surface-600-300-token">タイプ:</span>
        <span class="capitalize">{$selectedCardForDisplay.type}</span>
      </div>

      {#if $selectedCardForDisplay.type === "monster" && $selectedCardForDisplay.monster}
        <div class="flex justify-between">
          <span class="text-surface-600-300-token">ATK/DEF:</span>
          <span>{$selectedCardForDisplay.monster.attack}/{$selectedCardForDisplay.monster.defense}</span>
        </div>

        <div class="flex justify-between">
          <span class="text-surface-600-300-token">レベル:</span>
          <span>{$selectedCardForDisplay.monster.level}</span>
        </div>

        {#if $selectedCardForDisplay.monster.attribute}
          <div class="flex justify-between">
            <span class="text-surface-600-300-token">属性:</span>
            <span>{$selectedCardForDisplay.monster.attribute}</span>
          </div>
        {/if}

        {#if $selectedCardForDisplay.monster.race}
          <div class="flex justify-between">
            <span class="text-surface-600-300-token">種族:</span>
            <span>{$selectedCardForDisplay.monster.race}</span>
          </div>
        {/if}
      {/if}

      {#if $selectedCardForDisplay.description}
        <div class="mt-3 pt-3 border-t border-surface-300-600-token">
          <p class="text-xs text-surface-700-200-token leading-relaxed">
            {$selectedCardForDisplay.description}
          </p>
        </div>
      {/if}
    </div>
  </div>
{/if}
