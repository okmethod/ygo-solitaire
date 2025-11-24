<script lang="ts">
  import type { PageData } from "./$types";
  import { gameFacade } from "$lib/application/GameFacade";
  import {
    currentPhase,
    currentTurn,
    playerLP,
    opponentLP,
    handCardCount,
    deckCardCount,
    graveyardCardCount,
    exodiaPieceCount,
    isGameOver,
    gameResult,
  } from "$lib/application/stores/derivedStores";

  export let data: PageData;

  // Button handlers
  function handleDrawCard() {
    const result = gameFacade.drawCard(1);
    if (result.success) {
      console.log("[Simulator-V2] Draw success:", result.message);
    } else {
      console.error("[Simulator-V2] Draw failed:", result.error);
    }
  }

  function handleAdvancePhase() {
    const result = gameFacade.advancePhase();
    if (result.success) {
      console.log("[Simulator-V2] Phase advance success:", result.message);
    } else {
      console.error("[Simulator-V2] Phase advance failed:", result.error);
    }
  }

  function handleCheckVictory() {
    const result = gameFacade.checkVictory();
    console.log("[Simulator-V2] Victory check:", result);
  }

  // Map phase to Japanese
  function getPhaseJapanese(phase: string): string {
    const phaseMap: Record<string, string> = {
      Draw: "ドローフェイズ",
      Standby: "スタンバイフェイズ",
      Main1: "メインフェイズ1",
      End: "エンドフェイズ",
    };
    return phaseMap[phase] || phase;
  }
</script>

<div class="container mx-auto p-4">
  <main class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="card p-4">
      <h1 class="text-2xl font-bold mb-2">New Architecture Simulator (V2)</h1>
      <p class="text-sm opacity-75">Deck: {data.deckName}</p>
    </div>

    <!-- Game Info -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Left Column: Game Status -->
      <div class="card p-4 space-y-4">
        <h2 class="text-xl font-bold">Game Status</h2>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Turn:</span>
            <span class="font-bold">{$currentTurn}</span>
          </div>

          <div class="flex justify-between">
            <span>Phase:</span>
            <span class="font-bold">{getPhaseJapanese($currentPhase)}</span>
          </div>

          <div class="flex justify-between">
            <span>Player LP:</span>
            <span class="font-bold text-success-500">{$playerLP.toLocaleString()}</span>
          </div>

          <div class="flex justify-between">
            <span>Opponent LP:</span>
            <span class="font-bold text-error-500">{$opponentLP.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Zone Info -->
      <div class="card p-4 space-y-4">
        <h2 class="text-xl font-bold">Zone Info</h2>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Deck:</span>
            <span class="font-bold">{$deckCardCount} cards</span>
          </div>

          <div class="flex justify-between">
            <span>Hand:</span>
            <span class="font-bold">{$handCardCount} cards</span>
          </div>

          <div class="flex justify-between">
            <span>Graveyard:</span>
            <span class="font-bold">{$graveyardCardCount} cards</span>
          </div>

          <div class="flex justify-between">
            <span>Exodia Pieces:</span>
            <span class="font-bold text-warning-500">{$exodiaPieceCount} / 5</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="card p-4 space-y-4">
      <h2 class="text-xl font-bold mb-4">Actions</h2>

      <div class="grid grid-cols-3 gap-4">
        <button class="btn variant-filled-primary" on:click={handleDrawCard} disabled={$isGameOver}> Draw Card </button>

        <button class="btn variant-filled-secondary" on:click={handleAdvancePhase} disabled={$isGameOver}>
          Advance Phase
        </button>

        <button class="btn variant-filled-tertiary" on:click={handleCheckVictory}>Check Victory</button>
      </div>
    </div>

    <!-- Game Result -->
    {#if $isGameOver}
      <div class="card p-4 bg-success-500/10">
        <h2 class="text-xl font-bold mb-2">Game Over!</h2>
        <p class="text-lg">
          Winner: <span class="font-bold">{$gameResult.winner === "player" ? "You" : "Opponent"}</span>
        </p>
        {#if $gameResult.reason}
          <p class="text-sm opacity-75">Reason: {$gameResult.reason}</p>
        {/if}
        {#if $gameResult.message}
          <p class="text-sm mt-2">{$gameResult.message}</p>
        {/if}
      </div>
    {/if}

    <!-- Debug Info -->
    <details class="card p-4">
      <summary class="cursor-pointer font-bold">Debug Info</summary>
      <pre class="text-xs mt-4 overflow-auto">{JSON.stringify(gameFacade.getGameState(), null, 2)}</pre>
    </details>
  </main>
</div>
