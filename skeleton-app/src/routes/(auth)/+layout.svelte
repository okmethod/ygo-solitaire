<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import checkHeartbeat from "$lib/api/checkHeartbeat";

  let authorized = false;

  async function checkAuth(fetch: typeof window.fetch): Promise<boolean> {
    try {
      const message = await checkHeartbeat(fetch);
      console.log("Internal API health check:", message);
    } catch (error) {
      console.error("Internal API health check failed:", error);
      return true;
    }
    return true;
  }

  onMount(async () => {
    if (browser) {
      authorized = await checkAuth(window.fetch);
    }
    if (!authorized) {
      // 未認証の場合の処理をここに書く
      // void goto("/login");
    }
  });
</script>

{#if authorized}
  <slot />
{:else}
  <div class="container mx-auto flex h-full items-center justify-center">
    <div class="space-y-5 p-8">
      <h1 class="h1">Now Loading...</h1>
    </div>
  </div>
{/if}
