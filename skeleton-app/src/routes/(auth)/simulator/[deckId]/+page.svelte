<script lang="ts">
  import type { PageData } from "./$types";
  import { gameFacade } from "$lib/application/GameFacade";
  import { gameStateStore } from "$lib/application/stores/gameStateStore";
  import {
    currentPhase,
    currentTurn,
    playerLP,
    opponentLP,
    handCardCount,
    deckCardCount,
    graveyardCardCount,
    fieldCardCount,
    exodiaPieceCount,
    isGameOver,
    gameResult,
    canActivateSpells,
  } from "$lib/application/stores/derivedStores";
  import { handCards } from "$lib/application/stores/cardDisplayStore";
  import { showSuccessToast, showErrorToast } from "$lib/utils/toaster";
  import Card from "$lib/components/atoms/Card.svelte";
  import type { Card as CardDisplayData } from "$lib/types/card";

  export let data: PageData;

  // Button handlers
  function handleDrawCard() {
    const result = gameFacade.drawCard(1);
    if (result.success) {
      showSuccessToast(result.message || "カードをドローしました");
    } else {
      showErrorToast(result.error || "ドローに失敗しました");
    }
  }

  function handleAdvancePhase() {
    const result = gameFacade.advancePhase();
    if (result.success) {
      showSuccessToast(result.message || "フェイズを進めました");
    } else {
      showErrorToast(result.error || "フェイズ移行に失敗しました");
    }
  }

  function handleCheckVictory() {
    const result = gameFacade.checkVictory();
    console.log("[Simulator-V2] Victory check:", result);
  }

  // T018-T022: User Story 2 - カードクリックで効果発動
  function handleCardClick(card: CardDisplayData, instanceId: string) {
    // T019: フェーズチェック（Main1フェーズのみ発動可能）
    if ($currentPhase !== "Main1") {
      showErrorToast("メインフェイズ1でのみカードを発動できます");
      return;
    }

    // T020: 魔法発動可否チェック
    if (!$canActivateSpells) {
      showErrorToast("現在カードを発動できません");
      return;
    }

    // T021: GameFacade.activateSpell呼び出し
    const result = gameFacade.activateSpell(instanceId);

    // T022: トーストメッセージ表示
    if (result.success) {
      showSuccessToast(result.message || `${card.name}を発動しました`);
    } else {
      showErrorToast(result.error || "発動に失敗しました");
    }
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

  // 手札カードとinstanceIdのマッピング
  $: handCardsWithInstanceId = $gameStateStore.zones.hand.map((instance, index) => ({
    card: $handCards[index],
    instanceId: instance.instanceId,
  }));
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

    <!-- Field Zone -->
    <div class="card p-4 space-y-4">
      <h2 class="text-xl font-bold">Field</h2>

      <div class="grid grid-cols-5 gap-2">
        {#each $gameStateStore.zones.field as card (card.instanceId)}
          <div class="card p-2 bg-surface-700">
            <p class="text-xs text-center">{card.cardId}</p>
            <p class="text-xs text-center opacity-75">{card.location}</p>
          </div>
        {:else}
          <div class="col-span-5 text-center text-sm opacity-50">No cards on field</div>
        {/each}
      </div>

      <div class="text-sm opacity-75">Field cards: {$fieldCardCount}</div>
    </div>

    <!-- Hand Zone -->
    <div class="card p-4 space-y-4">
      <h2 class="text-xl font-bold">Hand ({$handCardCount} cards)</h2>

      <div class="grid grid-cols-5 gap-2">
        {#each handCardsWithInstanceId as { card, instanceId } (instanceId)}
          {#if card}
            <Card
              {card}
              size="medium"
              clickable={$currentPhase === "Main1" && $canActivateSpells && !$isGameOver}
              onClick={(clickedCard) => handleCardClick(clickedCard, instanceId)}
            />
          {:else}
            <!-- ローディング中のplaceholder -->
            <Card placeholder={true} placeholderText="..." size="medium" />
          {/if}
        {:else}
          <div class="col-span-5 text-center text-sm opacity-50">No cards in hand</div>
        {/each}
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
