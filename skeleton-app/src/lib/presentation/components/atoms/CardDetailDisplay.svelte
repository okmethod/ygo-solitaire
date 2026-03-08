<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import type { MonsterAttributes } from "$lib/presentation/types";
  import { selectedCardForDisplay, hideCardDetailDisplay } from "$lib/presentation/stores/cardDetailDisplayStore";
  import { getFrameBackgroundClass, getEditionBorderClass } from "$lib/presentation/constants/colors";

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

  const bgClass = $derived(getFrameBackgroundClass($selectedCardForDisplay?.frameType));
  const borderClass = $derived(getEditionBorderClass($selectedCardForDisplay?.edition));
</script>

{#if isVisible && $selectedCardForDisplay}
  <div
    class="
      fixed top-10 left-4 z-50 p-4 w-80
      {bgClass}
      {borderClass}
      border border-4 rounded-lg shadow-lg
      transition-all duration-300 ease-in-out
    "
    role="dialog"
    aria-labelledby="card-image-title"
    aria-describedby="card-image-description"
  >
    <div class="flex justify-between items-center mb-3">
      <h3 id="card-image-title" class="text-lg font-semibold truncate">
        {$selectedCardForDisplay.edition === "legacy" ? "L" : ""}
        《{$selectedCardForDisplay.jaName}》
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
        alt={$selectedCardForDisplay.jaName}
        class="w-full h-auto rounded-md shadow-sm"
        loading="lazy"
      />
    </div>

    <div id="card-image-description" class="text-sm space-y-2">
      {#if $selectedCardForDisplay.type === "monster" && $selectedCardForDisplay.monsterAttributes}
        {@const monsterData: MonsterAttributes = $selectedCardForDisplay.monsterAttributes}
        <div class="flex justify-between">
          <span class="text-surface-600-300-token inline-flex items-center gap-1">
            <Icon icon="mdi:star-circle" class="size-4" />
            {monsterData.level}
          </span>
          <span class="text-surface-600-300-token"> ATK / {monsterData.attack} </span>
          <span class="text-surface-600-300-token"> DEF / {monsterData.defense} </span>
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
