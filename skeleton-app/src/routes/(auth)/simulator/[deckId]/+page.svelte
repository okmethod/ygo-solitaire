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
    exodiaPieceCount,
    isGameOver,
    gameResult,
    canActivateSpells,
  } from "$lib/application/stores/derivedStores";
  import { handCards, fieldCards, graveyardCards } from "$lib/application/stores/cardDisplayStore";
  import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";
  import { showSuccessToast, showErrorToast } from "$lib/presentation/utils/toaster";
  import Card from "$lib/presentation/components/atoms/Card.svelte";
  import DuelField from "$lib/presentation/components/organisms/board/DuelField.svelte";
  import EffectResolutionModal from "$lib/presentation/components/modals/EffectResolutionModal.svelte";
  import CardSelectionModal from "$lib/presentation/components/modals/CardSelectionModal.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";

  const { data } = $props<{ data: PageData }>();

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

  // US1: 自動フェーズ進行 - Draw → Standby → Main1 まで自動進行
  async function autoAdvanceToMainPhase() {
    // Draw → Standby → Main1 まで2回のフェーズ進行
    for (let i = 0; i < 2; i++) {
      // 300ms待機
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = gameFacade.advancePhase();
      if (result.success) {
        console.log(`[Simulator-V2] Phase advanced: ${result.message}`);
        if (result.message) {
          showSuccessToast(result.message);
        }
      } else {
        showErrorToast(result.error || "フェーズ移行に失敗しました");
        break;
      }
    }
  }

  // User Story 2: カードクリックで効果発動
  function handleCardClick(card: CardDisplayData, instanceId: string) {
    // フェーズチェック（Main1フェーズのみ発動可能）
    if ($currentPhase !== "Main1") {
      showErrorToast("Can only activate cards during Main Phase 1");
      return;
    }

    // 魔法発動可否チェック
    if (!$canActivateSpells) {
      showErrorToast("Cannot activate cards at this time");
      return;
    }

    // GameFacade.activateSpell呼び出し（罠カード判定はDomain Layerで実施）
    const result = gameFacade.activateSpell(instanceId);

    // トーストメッセージ表示
    if (result.success) {
      showSuccessToast(result.message || `${card.name}を発動しました`);
    } else {
      showErrorToast(result.error || "発動に失敗しました");
    }
  }

  // Map phase to English display (avoid Japanese encoding issues)
  function getPhaseDisplay(phase: string): string {
    const phaseMap: Record<string, string> = {
      Draw: "Draw Phase",
      Standby: "Standby Phase",
      Main1: "Main Phase 1",
      End: "End Phase",
    };
    return phaseMap[phase] || phase;
  }

  // 効果解決ストアの状態を購読
  const effectResolutionState = effectResolutionStore;

  // US3: 効果解決完了時に自動勝利判定
  $effect(() => {
    // 効果解決が完了した時に勝利条件をチェック
    if (!$effectResolutionState.isResolving && $effectResolutionState.pendingActions.length === 0) {
      const victoryResult = gameFacade.checkVictory();

      if (victoryResult.isGameOver && victoryResult.winner) {
        // 勝利モーダル表示（次のフェーズで実装）
        console.log("[Victory Check] Game Over:", victoryResult);
        showSuccessToast(victoryResult.message || "Victory!");
      }
    }
  });

  // 手札カードとinstanceIdのマッピング
  const handCardsWithInstanceId = $derived(
    $gameStateStore.zones.hand.map((instance, index) => ({
      card: $handCards[index],
      instanceId: instance.instanceId,
    })),
  );

  // DuelField用のゾーンデータ抽出
  // フィールド魔法ゾーン用カード（frameType === "field"）
  const fieldMagicCards = $derived($fieldCards.filter((card) => card.frameType === "field"));

  // モンスターゾーン用カード配列（5枚固定、null埋め）
  const monsterZoneCards = $derived.by(() => {
    const monsters = $fieldCards.filter((card) => card.type === "monster");
    const zone: (CardDisplayData | null)[] = Array(5).fill(null);
    monsters.forEach((card, i) => {
      if (i < 5) zone[i] = card;
    });
    return zone;
  });

  // 魔法・罠ゾーン用カード配列（5枚固定、フィールド魔法除外）
  const spellTrapZoneCards = $derived.by(() => {
    const spellsTraps = $fieldCards.filter(
      (card) => (card.type === "spell" || card.type === "trap") && card.frameType !== "field",
    );
    const zone: (CardDisplayData | null)[] = Array(5).fill(null);
    spellsTraps.forEach((card, i) => {
      if (i < 5) zone[i] = card;
    });
    return zone;
  });

  // US2: ゲーム開始時に一度だけデッキをシャッフル
  let hasShuffled = $state(false);

  $effect(() => {
    // ゲーム初期化完了後（ターン1、Drawフェーズ）に一度だけシャッフル
    if ($currentTurn === 1 && $currentPhase === "Draw" && !hasShuffled) {
      const result = gameFacade.shuffleDeck();
      if (result.success) {
        console.log("[Simulator-V2] Deck shuffled:", result.message);
      }
      hasShuffled = true;
    }
  });

  // US1: ゲーム開始時に自動的にMain Phaseまでフェーズ進行
  let hasAutoAdvanced = $state(false);

  $effect(() => {
    // ゲーム初期化完了後（ターン1、Drawフェーズ）かつゲームオーバーでない場合に一度だけ自動進行
    if (
      $currentTurn === 1 &&
      $currentPhase === "Draw" &&
      !hasAutoAdvanced &&
      !$isGameOver
    ) {
      // シャッフル後に実行するため、少し待機
      setTimeout(() => {
        autoAdvanceToMainPhase();
      }, 100);
      hasAutoAdvanced = true;
    }
  });
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
            <span class="font-bold" data-testid="current-phase"
              >{getPhaseDisplay($currentPhase)}</span
            >
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

    <!-- DuelField Integration -->
    <DuelField
      deckCards={$deckCardCount}
      extraDeckCards={[]}
      graveyardCards={$graveyardCards}
      fieldCards={fieldMagicCards}
      monsterCards={monsterZoneCards}
      spellTrapCards={spellTrapZoneCards}
    />

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
              showDetailOnClick={true}
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

      <div class="mt-4 space-y-4">
        <div class="grid grid-cols-3 gap-4">
          <button class="btn variant-filled-primary btn-sm" on:click={handleDrawCard} disabled={$isGameOver}>
            Draw Card
          </button>
          <button class="btn variant-filled-secondary btn-sm" on:click={handleAdvancePhase} disabled={$isGameOver}>
            Advance Phase
          </button>
          <button class="btn variant-filled-tertiary btn-sm" on:click={handleCheckVictory}>
            Check Victory
          </button>
        </div>

        <pre class="text-xs overflow-auto">{JSON.stringify(gameFacade.getGameState(), null, 2)}</pre>
      </div>
    </details>
  </main>
</div>

<!-- 効果解決モーダル -->
<EffectResolutionModal
  isOpen={$effectResolutionState.isActive}
  title={$effectResolutionState.currentStep?.title || ""}
  message={$effectResolutionState.currentStep?.message || ""}
  onConfirm={effectResolutionStore.confirmCurrentStep}
  onCancel={$effectResolutionState.currentStep?.showCancel ? effectResolutionStore.cancelResolution : undefined}
  showCancel={$effectResolutionState.currentStep?.showCancel || false}
/>

<!-- カード選択モーダル -->
<CardSelectionModal />
