<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { Toaster } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import ThemeSwitchModal from "$lib/presentation/components/modals/ThemeSwitchModal.svelte";
  import AudioToggle from "$lib/presentation/components/buttons/AudioToggle.svelte";
  import CardDetailDisplay from "$lib/presentation/components/atoms/CardDetailDisplay.svelte";
  import { applyTheme } from "$lib/presentation/stores/theme";
  import { toaster } from "$lib/shared/utils/toaster";
  import { base } from "$app/paths";
  import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";
  import { cardSelectionStore } from "$lib/presentation/stores/cardSelectionStore.svelte";

  let { children } = $props();

  let isLoaded = $state(false);
  onMount(async () => {
    // Store間の依存関係をDIで解決（Presentation層の責務）
    effectResolutionStore.registerCardSelectionHandler((config) => {
      cardSelectionStore.startSelection(config);
    });

    function wait(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    await Promise.all([applyTheme(), wait(500)]);
    isLoaded = true;
  });
</script>

<svelte:head>
  <title>Yu-Gi-Oh! ソリティア</title>
</svelte:head>

<Toaster {toaster} rounded="rounded-lg" />

{#if isLoaded}
  <header class="p-2 sm:p-4 shadow-md bg-surface-100-900">
    <div class="flex justify-between items-center">
      <a class="h5 flex items-center" href="{base}/">
        <span class="hidden sm:inline">Yu-Gi-Oh! ソリティア</span>
        <Icon icon="mdi:home" class="size-6 sm:hidden" />
      </a>

      <nav>
        <ul class="flex space-x-4 items-center justify-center">
          <li>
            <AudioToggle />
          </li>
          <li>
            <ThemeSwitchModal />
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="mx-auto">
    {@render children()}
  </main>

  <!-- カード詳細表示エリア -->
  <CardDetailDisplay />
{:else}
  <div class="h-screen flex items-center justify-center bg-gray-100">
    <div class="font-mono text-black text-[32px]">Now Loading...</div>
  </div>
{/if}
