<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { selectedCardForDisplay, hideCardDetailDisplay } from "$lib/stores/cardDetailDisplayStore";
  import { getCardTypeBackgroundClass } from "$lib/constants/cardTypes";

  const isVisible = $derived(!!$selectedCardForDisplay);

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

  // カードタイプに応じた背景色
  const backgroundClass = $derived(() => {
    if (!$selectedCardForDisplay) return "bg-gray-100 dark:bg-gray-800";
    const typeClass = getCardTypeBackgroundClass($selectedCardForDisplay.type, "bg-gray-100 dark:bg-gray-800");
    return typeClass;
  });
</script>

{#if isVisible && $selectedCardForDisplay}
  <div
    class="
      fixed top-4 right-4 z-50 p-4 w-80
      {backgroundClass()}
      rounded-lg shadow-lg
      border border-4 border-gray-400 dark:border-gray-700
      transition-all duration-300 ease-in-out
    "
    role="dialog"
    aria-labelledby="card-image-title"
    aria-describedby="card-image-description"
  >
    <div class="flex justify-between items-center mb-3">
      <h3 id="card-image-title" class="text-lg font-semibold truncate">
        {$selectedCardForDisplay.name}
      </h3>
      <button
        onclick={handleClose}
        class="btn-icon btn-icon-sm border hover:bg-surface-200-700-token"
        aria-label="カード詳細を閉じる"
      >
        <Icon icon="mdi:close" class="size-4" />
      </button>
    </div>

    <div class="mb-3">
      <img
        src={$selectedCardForDisplay.images?.imageCropped || "/CardBack.jpg"}
        alt={$selectedCardForDisplay.name}
        class="w-full h-auto rounded-md shadow-sm"
        loading="lazy"
      />
    </div>

    <div id="card-image-description" class="text-sm space-y-2">
      {#if $selectedCardForDisplay.type === "monster" && $selectedCardForDisplay.monster}
        <div class="flex justify-between">
          <span class="text-surface-600-300-token"> ⭐︎{$selectedCardForDisplay.monster.level} </span>
          <span class="text-surface-600-300-token"> ATK / {$selectedCardForDisplay.monster.attack} </span>
          <span class="text-surface-600-300-token"> DEF / {$selectedCardForDisplay.monster.defense} </span>
        </div>
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
