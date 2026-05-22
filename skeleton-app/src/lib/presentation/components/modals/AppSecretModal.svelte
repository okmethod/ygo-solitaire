<script lang="ts">
  import Icon from "@iconify/svelte";
  import { appSecretStore } from "$lib/application/stores/appSecretStore";
  import { getAuthCheckRepository } from "$lib/infrastructure/adapters/LLMProxyRepository";

  let inputSecret = $state("");
  let errorMessage = $state("");
  let isLoading = $state(false);

  async function handleSubmit(): Promise<void> {
    if (!inputSecret.trim()) return;
    isLoading = true;
    errorMessage = "";

    const ok = await getAuthCheckRepository().verifyAppSecret(fetch, inputSecret.trim());
    if (ok) {
      appSecretStore.setSecret(inputSecret.trim());
    } else {
      errorMessage = "あいことばが違います";
    }
    isLoading = false;
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter") void handleSubmit();
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="card bg-surface-100-900 mx-auto w-11/12 max-w-sm p-6 shadow-xl">
    <div class="mb-4 flex items-center gap-2">
      <Icon icon="mdi:lock-outline" class="text-primary-500 size-5" />
      <h2 class="text-lg font-bold">あいことばが必要です</h2>
    </div>
    <div class="flex gap-3">
      <input
        type="password"
        class="input rounded-xl"
        placeholder="ここに入力..."
        bind:value={inputSecret}
        onkeydown={handleKeydown}
        disabled={isLoading}
      />
      <button
        type="button"
        class="btn preset-filled-primary-500 w-12"
        onclick={handleSubmit}
        disabled={isLoading || !inputSecret.trim()}
      >
        {#if isLoading}
          <Icon icon="mdi:loading" class="size-5 animate-spin" />
        {:else}
          <Icon icon="mdi:arrow-right-bold" class="size-5" />
        {/if}
      </button>
    </div>
    {#if errorMessage}
      <p class="text-error-500 ml-4 text-sm">{errorMessage}</p>
    {/if}
  </div>
</div>
