<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { Toaster } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import ThemeSwitchModal from "$lib/components/modals/ThemeSwitchModal.svelte";
  import AudioToggle from "$lib/components/buttons/AudioToggle.svelte";
  import { applyTheme } from "$lib/stores/theme";
  import { toaster } from "$lib/utils/toaster";

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
  <title>My Static WebSite</title>
</svelte:head>

<Toaster {toaster} rounded="rounded-lg" />

{#if isLoaded}
  <header class="p-2 sm:p-4 shadow-md bg-surface-100-900">
    <div class="flex justify-between items-center">
      <a class="h5 flex items-center" href="./">
        <span class="hidden sm:inline">My Static WebSite</span>
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
{:else}
  <div class="h-screen flex items-center justify-center bg-gray-100">
    <div class="font-mono text-black text-[32px]">Now Loading...</div>
  </div>
{/if}
