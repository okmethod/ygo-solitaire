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
  import GameResultModal from "$lib/presentation/components/modals/GameResultModal.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";

  const { data } = $props<{ data: PageData }>();

  // 自動フェーズ進行 - Draw → Standby → Main1 まで自動進行
  async function autoAdvanceToMainPhase() {
    // Draw → Standby → Main1 まで2回のフェーズ進行
    for (let i = 0; i < 2; i++) {
      // 300ms待機
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = gameFacade.advancePhase();
      if (result.success) {
        console.log(`[Simulator] Phase advanced: ${result.message}`);
        if (result.message) {
          showSuccessToast(result.message);
        }
      } else {
        showErrorToast(result.error || "フェーズ移行に失敗しました");
        break;
      }
    }
  }

  // 手札のカードクリックで効果発動
  function handleHandCardClick(card: CardDisplayData, instanceId: string) {
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

  // フィールドカードクリックで起動効果発動
  function handleFieldCardClick(card: CardDisplayData) {
    // フェーズチェック（Main1フェーズのみ発動可能）
    if ($currentPhase !== "Main1") {
      showErrorToast("Can only activate effects during Main Phase 1");
      return;
    }

    // Find the card instance ID from field cards
    const currentState = gameFacade.getGameState();
    const fieldCard = currentState.zones.field.find((c) => c.id === card.id);
    if (!fieldCard) {
      showErrorToast("Card not found on field");
      return;
    }

    // Activate ignition effect
    const result = gameFacade.activateIgnitionEffect(fieldCard.instanceId);

    // トーストメッセージ表示
    if (result.success) {
      showSuccessToast(result.message || `${card.name}の効果を発動しました`);
    } else {
      showErrorToast(result.error || "効果発動に失敗しました");
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

  // 効果解決完了時に自動勝利判定
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

  // ゲーム開始時に自動的にMain Phaseまでフェーズ進行
  let hasAutoAdvanced = $state(false);

  $effect(() => {
    // ゲーム初期化完了後（ターン1、Drawフェーズ）かつゲームオーバーでない場合に一度だけ自動進行
    if ($currentTurn === 1 && $currentPhase === "Draw" && !hasAutoAdvanced && !$isGameOver) {
      autoAdvanceToMainPhase();
      hasAutoAdvanced = true;
    }
  });

  // ゲーム終了モーダルの開閉状態
  let isGameResultModalOpen = $state(false);

  $effect(() => {
    // ゲームオーバーになったらモーダルを開く
    if ($isGameOver) {
      isGameResultModalOpen = true;
    }
  });
</script>

<div class="container mx-auto p-4">
  <main class="max-w-4xl mx-auto space-y-2">
    <!-- Header -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Left Column: Deck Title -->
      <div class="card p-4">
        <h1 class="text-2xl font-bold">Deck: {data.deckName}</h1>
      </div>

      <!-- Right Column: Game Info -->
      <div class="card p-4 space-y-4">
        <div class="space-y-2">
          <div class="flex justify-start space-x-4">
            <span>Phase:</span>
            <span class="font-bold" data-testid="current-phase">{getPhaseDisplay($currentPhase)}</span>
          </div>

          <div class="flex justify-between">
            <span>Player LP:</span>
            <span class="font-bold text-success-500">{$playerLP.toLocaleString()}</span>
            <span>Opponent LP:</span>
            <span class="font-bold text-error-500">{$opponentLP.toLocaleString()}</span>
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
      onFieldCardClick={handleFieldCardClick}
    />

    <!-- Hand Zone -->
    <div class="card px-4 space-y-4">
      <h2 class="text-xl font-bold">Hand ({$handCardCount} cards)</h2>

      <div class="grid grid-cols-5 gap-2">
        {#each handCardsWithInstanceId as { card, instanceId } (instanceId)}
          {#if card}
            <Card
              {card}
              size="medium"
              clickable={$currentPhase === "Main1" && $canActivateSpells && !$isGameOver}
              onClick={(clickedCard) => handleHandCardClick(clickedCard, instanceId)}
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

    <!-- Debug Info -->
    <details class="card p-4">
      <summary class="cursor-pointer font-bold">Debug Info</summary>

      <div class="mt-4 space-y-4">
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

<!-- ゲーム終了モーダル -->
<GameResultModal
  isOpen={isGameResultModalOpen}
  winner={$gameResult.winner}
  reason={$gameResult.reason}
  message={$gameResult.message}
  onClose={() => {
    console.log("[Simulator] Game result modal closed");
    isGameResultModalOpen = false;
  }}
/>
