<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { Toast } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import AudioToggle from "$lib/presentation/components/buttons/AudioToggle.svelte";
  import SettingsModal from "$lib/presentation/components/modals/SettingsModal.svelte";
  import CardDetailDisplay from "$lib/presentation/components/atoms/CardDetailDisplay.svelte";
  import { applyTheme } from "$lib/presentation/stores/themeStore";
  import { toaster } from "$lib/presentation/utils/toaster";
  import { resolve } from "$app/paths";

  let { children } = $props();

  let isLoaded = $state(false);
  onMount(async () => {
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

<Toast.Group {toaster} class="fixed top-4 right-4 z-50 flex flex-col gap-2">
  {#snippet children(toast)}
    <Toast {toast} class="card w-64 rounded-lg p-4 shadow-lg md:w-96">
      <div class="flex w-full items-center gap-2">
        <Toast.Title class="flex-1">{toast.title}</Toast.Title>
        <Toast.CloseTrigger class="btn-icon btn-icon-sm preset-tonal ml-auto shrink-0">
          <Icon icon="mdi:close" class="size-4" />
        </Toast.CloseTrigger>
      </div>
    </Toast>
  {/snippet}
</Toast.Group>

{#if isLoaded}
  <header class="bg-surface-100-900 p-2 shadow-md sm:p-4">
    <div class="flex items-center justify-between">
      <a class="h5 flex items-center" href={resolve("/")}>
        <span class="hidden sm:inline">Yu-Gi-Oh! ソリティア</span>
        <Icon icon="mdi:home" class="size-6 sm:hidden" />
      </a>

      <nav>
        <ul class="flex items-center justify-center space-x-2">
          <li>
            <AudioToggle />
          </li>
          <li>
            <SettingsModal />
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
  <div class="flex h-screen items-center justify-center bg-gray-100">
    <div class="font-mono text-[32px] text-black">Now Loading...</div>
  </div>
{/if}
