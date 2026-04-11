<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { gameStateStore } from "$lib/application/stores/gameStateStore";
  import type { PageData } from "./$types";
  import type { DisplayCardInstance } from "$lib/presentation/types";
  import { ZONE_CAPACITY } from "$lib/presentation/types";
  import { gameFacade } from "$lib/application/GameFacade";
  import {
    currentPhaseDisplayName,
    playerLP,
    opponentLP,
    handCardCount,
    deckCardCount,
    gameResult,
    handCardRefs,
    graveyardCardRefs,
    banishedCardRefs,
    extraDeckCardRefs,
    monsterZoneInstanceOnFieldRefs,
    spellTrapZoneInstanceOnFieldRefs,
    fieldZoneInstanceOnFieldRefs,
  } from "$lib/application/stores/derivedStores";
  import { effectQueueStore } from "$lib/application/stores/effectQueueStore";
  import { initializeCache, getDisplayCardData } from "$lib/presentation/services/displayDataCache";
  import { toFixedSlotZone } from "$lib/presentation/services/displayInstanceAdapter";
  import { showSuccessToast } from "$lib/presentation/utils/toaster";
  import { playSE } from "$lib/presentation/sounds/soundEffects";
  import DuelField from "./_components/DuelField.svelte";
  import Hands from "./_components/Hands.svelte";
  import ConfirmationModal from "./_components/modals/ConfirmationModal.svelte";
  import CardSelectionModal from "./_components/modals/CardSelectionModal.svelte";
  import OptionalTriggerConfirmModal from "./_components/modals/OptionalTriggerConfirmModal.svelte";
  import ChainConfirmationModal from "./_components/modals/ChainConfirmationModal.svelte";
  import GameOverModal from "./_components/modals/GameOverModal.svelte";
  import CardMovingAnimationOverlay from "./_components/animations/CardMovingAnimationOverlay.svelte";

  const { data } = $props<{ data: PageData }>();
  const deckName = data.deckData.name;

  // ゲーム状態が変化するたびに自動保存するサブスクリプション
  let unsubscribeAutoSave: (() => void) | undefined;

  onMount(async () => {
    // 復元モードの場合はスナップショットを復元する
    if (data.isRestore) {
      gameFacade.restoreGame();
    }

    // DisplayCardData キャッシュを初期化
    await initializeCache(data.uniqueCardIds);

    // effectQueueStore に通知ハンドラを登録（DI）
    effectQueueStore.registerNotificationHandler({
      showInfo: (_summary, description) => {
        showSuccessToast(description);
      },
      // Interactiveレベルの通知はモーダルを使う
    });

    // 新規ゲームの場合のみ Main1 まで自動進行
    if (!data.isRestore) {
      gameFacade.autoAdvanceToMainPhase(
        () => new Promise((resolve) => setTimeout(resolve, 300)), // ディレイのコールバック
        (message) => {
          playSE.attention();
          showSuccessToast(message);
        }, // 通知のコールバック
      );
    }

    // ゲーム状態変化時に自動保存（ゲーム終了時はクリア）
    unsubscribeAutoSave = gameStateStore.subscribe((snapshot) => {
      if (snapshot.result.isGameOver) {
        gameFacade.clearSavedGame();
      } else {
        gameFacade.saveGame(data.deckId);
      }
    });
  });

  onDestroy(() => {
    unsubscribeAutoSave?.();
  });

  // ゲーム終了したらモーダルを開く
  let isGameOverModalOpen = $state(false);
  $effect(() => {
    if ($gameResult.isGameOver) {
      playSE.attention();
      isGameOverModalOpen = true;
    }
  });

  // 現在のステータス表示文字列を取得
  function getNowStatusString(): string {
    if ($gameResult.isGameOver) return "ゲーム終了";
    return $currentPhaseDisplayName;
  }

  // 手札カードマップ
  const handCardsWithInstanceId = $derived(
    $handCardRefs
      .map((ref) => ({ card: getDisplayCardData(ref.cardId), instanceId: ref.instanceId }))
      .filter((item): item is DisplayCardInstance => item.card !== undefined),
  );

  // 除外カードマップ
  const banishedCardsWithInstanceId = $derived(
    $banishedCardRefs
      .map((ref) => ({ card: getDisplayCardData(ref.cardId), instanceId: ref.instanceId }))
      .filter((item): item is DisplayCardInstance => item.card !== undefined),
  );

  // 墓地カードマップ
  const graveyardCardsWithInstanceId = $derived(
    $graveyardCardRefs
      .map((ref) => ({ card: getDisplayCardData(ref.cardId), instanceId: ref.instanceId }))
      .filter((item): item is DisplayCardInstance => item.card !== undefined),
  );

  // エクストラデッキカードマップ
  const extraDeckCardsWithInstanceId = $derived(
    $extraDeckCardRefs
      .map((ref) => ({ card: getDisplayCardData(ref.cardId), instanceId: ref.instanceId }))
      .filter((item): item is DisplayCardInstance => item.card !== undefined),
  );

  // フィールド上の各種ゾーン用のカードマップ
  const fieldSpellZoneCards = $derived(toFixedSlotZone($fieldZoneInstanceOnFieldRefs, ZONE_CAPACITY.fieldZone));
  const monsterZoneCards = $derived(toFixedSlotZone($monsterZoneInstanceOnFieldRefs, ZONE_CAPACITY.mainMonsterZone));
  const spellTrapZoneCards = $derived(toFixedSlotZone($spellTrapZoneInstanceOnFieldRefs, ZONE_CAPACITY.spellTrapZone));
</script>

<div class="container mx-auto p-4">
  <main class="max-w-4xl mx-auto space-y-2">
    <!-- Header -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Left Column: Deck Title -->
      <div class="card px-4">
        <h1 class="text-xl md:text-2xl font-bold">Deck: {deckName}</h1>
      </div>

      <!-- Right Column: Game Info -->
      <div class="card px-4 space-y-4">
        <div class="space-y-2">
          <div class="flex justify-start space-x-4">
            <span>Now:</span>
            <span class="font-bold" data-testid="current-phase">{getNowStatusString()}</span>
          </div>

          <div class="flex justify-between">
            <span>自分 LP:</span>
            <span class="font-bold text-success-500">{$playerLP.toLocaleString()}</span>
            <span>相手 LP:</span>
            <span class="font-bold text-error-500">{$opponentLP.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- デュエルフィールドUI -->
    <DuelField
      deckCards={$deckCardCount}
      extraDeckCards={extraDeckCardsWithInstanceId}
      graveyardCards={graveyardCardsWithInstanceId}
      banishedCards={banishedCardsWithInstanceId}
      fieldCards={fieldSpellZoneCards}
      monsterCards={monsterZoneCards}
      spellTrapCards={spellTrapZoneCards}
    />

    <!-- 手札UI -->
    <div class="card px-4 space-y-4">
      <h2 class="text-lg md:text-xl font-bold">手札 ({$handCardCount} 枚)</h2>
      <Hands cards={handCardsWithInstanceId} />
    </div>

    <!-- Debug Info -->
    <details class="card p-4">
      <summary class="cursor-pointer text-sm text-gray-400 font-bold">Debug Info</summary>

      <div class="mt-4 space-y-4">
        <pre class="text-xs overflow-auto">{JSON.stringify(gameFacade.getGameState(), null, 2)}</pre>
      </div>
    </details>
  </main>
</div>

<!-- ユーザー確認モーダル: カード選択を伴わない interactive ステップ向け -->
<ConfirmationModal
  isOpen={$effectQueueStore.confirmationConfig !== null}
  config={$effectQueueStore.confirmationConfig}
/>

<!-- カード選択モーダル: カード選択を伴う interactive ステップ向け -->
<CardSelectionModal
  isOpen={$effectQueueStore.cardSelectionConfig !== null}
  config={$effectQueueStore.cardSelectionConfig}
/>

<!-- 任意誘発効果の発動確認モーダル -->
<OptionalTriggerConfirmModal
  isOpen={$effectQueueStore.optionalTriggerConfirmConfig !== null}
  config={$effectQueueStore.optionalTriggerConfirmConfig}
/>

<!-- チェーン確認モーダル: チェーン可能なカードがある場合 -->
<ChainConfirmationModal
  isOpen={$effectQueueStore.chainConfirmationConfig !== null}
  config={$effectQueueStore.chainConfirmationConfig}
/>

<!-- ゲーム終了モーダル -->
<GameOverModal
  isOpen={isGameOverModalOpen}
  winner={$gameResult.winner}
  reason={$gameResult.reason}
  message={$gameResult.message}
  onClose={() => {
    isGameOverModalOpen = false;
  }}
/>

<!-- カード移動アニメーション -->
<CardMovingAnimationOverlay />
