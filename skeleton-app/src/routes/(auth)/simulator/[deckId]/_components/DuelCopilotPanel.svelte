<script lang="ts">
  import type { IDuelCopilotClient } from "$lib/application/ports/IDuelCopilotClient";
  import type { GameSnapshot } from "$lib/domain/models/GameState";
  import type { DeckData } from "$lib/application/types/deck";

  interface Props {
    client: IDuelCopilotClient;
    deckData: DeckData;
    snapshot: GameSnapshot;
  }
  let { client, deckData, snapshot }: Props = $props();

  type Status = "idle" | "loading" | "streaming" | "done" | "error";

  let status = $state<Status>("idle");
  let responseText = $state("");
  let errorMessage = $state("");

  async function handleHint() {
    status = "loading";
    responseText = "";
    errorMessage = "";

    try {
      await client.requestHint(deckData, snapshot, (chunk) => {
        status = "streaming";
        responseText += chunk;
      });
      status = "done";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      status = "error";
    }
  }

  function handleReset() {
    status = "idle";
    responseText = "";
    errorMessage = "";
  }
</script>

<div class="card space-y-3 px-4 py-3">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold md:text-xl">Duel Copilot (WIP)</h2>
    <div class="flex gap-2">
      {#if status !== "idle"}
        <button class="btn btn-sm preset-tonal" onclick={handleReset}> リセット </button>
      {/if}
      <button
        class="btn btn-sm preset-filled-primary-500"
        onclick={handleHint}
        disabled={status === "loading" || status === "streaming"}
      >
        {#if status === "loading" || status === "streaming"}
          考え中…
        {:else}
          ヒントを見る
        {/if}
      </button>
    </div>
  </div>

  {#if status === "error"}
    <p class="text-error-500 text-sm">{errorMessage}</p>
  {/if}

  {#if responseText}
    <div class="bg-surface-100-900 rounded p-3 text-sm whitespace-pre-wrap">
      {responseText}{#if status === "streaming"}<span class="animate-pulse">▌</span>{/if}
    </div>
  {/if}
</div>
