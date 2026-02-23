<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import type { DisplayCardData, DisplayCardInstance } from "$lib/presentation/types";
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
    monsterZoneInstanceOnFieldRefs,
    spellTrapZoneInstanceOnFieldRefs,
    fieldZoneInstanceOnFieldRefs,
  } from "$lib/application/stores/derivedStores";
  import { effectQueueStore } from "$lib/application/stores/effectQueueStore";
  import { cardAnimationStore } from "$lib/presentation/stores/cardAnimationStore";
  import { initializeCache, getDisplayCardData } from "$lib/presentation/services/displayDataCache";
  import { toFixedSlotZone } from "$lib/presentation/services/displayInstanceAdapter";
  import { showSuccessToast, showErrorToast } from "$lib/presentation/utils/toaster";
  import { playSE } from "$lib/presentation/sounds/soundEffects";
  import DuelField from "./_components/DuelField.svelte";
  import Hands from "./_components/Hands.svelte";
  import ConfirmationModal from "./_components/modals/ConfirmationModal.svelte";
  import CardSelectionModal from "./_components/modals/CardSelectionModal.svelte";
  import ChainConfirmationModal from "./_components/modals/ChainConfirmationModal.svelte";
  import GameOverModal from "./_components/modals/GameOverModal.svelte";
  import CardMovingAnimationOverlay from "./_components/animations/CardMovingAnimationOverlay.svelte";

  const { data } = $props<{ data: PageData }>();
  const deckName = data.deckData.name;

  onMount(async () => {
    // DisplayCardData キャッシュを初期化
    await initializeCache(data.uniqueCardIds);

    // effectQueueStore に通知ハンドラを登録（DI）
    effectQueueStore.registerNotificationHandler({
      showInfo: (_summary, description) => {
        showSuccessToast(description);
      },
      // Interactiveレベルの通知はモーダルを使う
    });

    // ゲーム開始時、Main1 まで自動進行
    gameFacade.autoAdvanceToMainPhase(
      () => new Promise((resolve) => setTimeout(resolve, 300)), // ディレイのコールバック
      (message) => {
        showSuccessToast(message);
      }, // 通知のコールバック
    );
  });

  // ゲーム終了したらモーダルを開く
  let isGameOverModalOpen = $state(false);
  $effect(() => {
    if ($gameResult.isGameOver) {
      playSE.win();
      isGameOverModalOpen = true;
    }
  });

  // 現在のステータス表示文字列を取得
  function getNowStatusString(): string {
    if ($gameResult.isGameOver) return "ゲーム終了";
    return $currentPhaseDisplayName;
  }

  // ゲームアクション実行の共通ヘルパー
  function _executeGameAction(
    action: () => { success: boolean; message?: string; error?: string },
    successMessage: string,
    errorMessage: string,
  ): boolean {
    const result = action();
    if (result.success) {
      showSuccessToast(result.message || successMessage);
    } else {
      showErrorToast(result.error || errorMessage);
    }
    return result.success;
  }

  // カード選択状態管理 - 一元管理
  let selectedHandCardInstanceId = $state<string | null>(null); // 手札カード選択
  let selectedFieldCardInstanceId = $state<string | null>(null); // フィールドカード選択（セット魔法・罠・モンスター）

  // 手札カード選択変更ハンドラー - フィールドカード選択をクリア
  function handleHandCardSelect(instanceId: string | null) {
    selectedHandCardInstanceId = instanceId;
    selectedFieldCardInstanceId = null; // フィールドカード選択をクリア
  }

  // 手札のカードクリックで効果発動
  function handleHandCardClick(_card: DisplayCardData, instanceId: string) {
    // ドメイン層で全ての判定を実施（フェーズチェック、発動可否など）
    const result = gameFacade.activateSpell(instanceId);
    if (!result.success) {
      showErrorToast(result.error || "発動に失敗しました");
    }
  }

  // モンスター召喚ハンドラー
  function handleSummonMonster(card: DisplayCardData, instanceId: string) {
    _executeGameAction(() => gameFacade.summonMonster(instanceId), `${card.name}を召喚しました`, "召喚に失敗しました");
  }

  // モンスターセットハンドラー
  function handleSetMonster(card: DisplayCardData, instanceId: string) {
    _executeGameAction(() => gameFacade.setMonster(instanceId), `${card.name}をセットしました`, "セットに失敗しました");
  }

  // 魔法・罠セットハンドラー
  function handleSetSpellTrap(card: DisplayCardData, instanceId: string) {
    _executeGameAction(
      () => gameFacade.setSpellTrap(instanceId),
      `${card.name}をセットしました`,
      "セットに失敗しました",
    );
  }

  // フィールドカードクリックで効果発動 - 手札選択をクリア
  function handleFieldCardClick(_card: DisplayCardData, instanceId: string) {
    const fieldCard = gameFacade.findCardOnField(instanceId);
    if (!fieldCard) {
      showErrorToast("カードが見つかりませんでした");
      return;
    }

    // 手札選択をクリア
    selectedHandCardInstanceId = null;

    // フィールドカードは選択状態をトグル
    // - セット魔法・罠: 発動メニュー表示用
    // - モンスター: 選択表示用
    // - フィールド魔法: 選択表示用（起動効果がある場合も同様）
    selectedFieldCardInstanceId = selectedFieldCardInstanceId === instanceId ? null : instanceId;
  }

  // セット魔法カードの発動ハンドラー
  function handleActivateSetSpell(card: DisplayCardData, instanceId: string) {
    _executeGameAction(() => gameFacade.activateSpell(instanceId), `${card.name}を発動しました`, "発動に失敗しました");
    selectedFieldCardInstanceId = null; // 選択解除
  }

  // 起動効果発動ハンドラー
  function handleActivateIgnitionEffect(card: DisplayCardData, instanceId: string) {
    _executeGameAction(
      () => gameFacade.activateIgnitionEffect(instanceId),
      `${card.name}の効果を発動しました`,
      "効果発動に失敗しました",
    );
    selectedFieldCardInstanceId = null; // 選択解除
  }

  // フィールドカード選択キャンセル
  function handleCancelFieldCardSelection() {
    selectedFieldCardInstanceId = null;
  }

  // カード移動アニメーション用の差分検出
  // 前回の状態を記憶（通常変数 - リアクティブ追跡不要）
  let previousHandIds: Set<string> = new Set();
  let previousFieldIds: Set<string> = new Set();
  let previousGraveyardIds: Set<string> = new Set();
  let previousDeckCount: number = 0;
  let isAnimationInitialized = false;

  // フィールド上の全カードIDを取得するヘルパー
  function getAllFieldCardIds(): Set<string> {
    const ids = new Set<string>();
    for (const ref of $monsterZoneInstanceOnFieldRefs) {
      ids.add(ref.instanceId);
    }
    for (const ref of $spellTrapZoneInstanceOnFieldRefs) {
      ids.add(ref.instanceId);
    }
    for (const ref of $fieldZoneInstanceOnFieldRefs) {
      ids.add(ref.instanceId);
    }
    return ids;
  }

  // フィールドカードのcardIdを取得するヘルパー
  function getFieldCardRef(instanceId: string): { cardId: number } | undefined {
    const allRefs = [
      ...$monsterZoneInstanceOnFieldRefs,
      ...$spellTrapZoneInstanceOnFieldRefs,
      ...$fieldZoneInstanceOnFieldRefs,
    ];
    return allRefs.find((r) => r.instanceId === instanceId);
  }

  // フィールド魔法ゾーンへの移動かどうかを判定
  function isFieldZoneCard(instanceId: string): boolean {
    return $fieldZoneInstanceOnFieldRefs.some((r) => r.instanceId === instanceId);
  }

  // アニメーション開始のヘルパー（座標登録を待機）
  function startAnimationWithRetry(
    instanceId: string,
    cardId: number,
    getSourceRect: () => DOMRect | undefined,
    getTargetRect: () => DOMRect | undefined,
  ) {
    let retryCount = 0;
    const maxRetries = 5;

    function tryStart() {
      const cardData = getDisplayCardData(cardId);
      const sourceRect = getSourceRect();
      const targetRect = getTargetRect();

      if (cardData && sourceRect && targetRect) {
        cardAnimationStore.startAnimation({
          instanceId,
          cardData,
          sourceRect,
          targetRect,
        });
      } else if (retryCount < maxRetries) {
        retryCount++;
        requestAnimationFrame(tryStart);
      }
    }

    requestAnimationFrame(tryStart);
  }

  // 状態変化を検出してアニメーションをトリガー
  $effect(() => {
    const currentHandIds = new Set($handCardRefs.map((r) => r.instanceId));
    const currentGraveyardIds = new Set($graveyardCardRefs.map((r) => r.instanceId));
    const currentFieldIds = getAllFieldCardIds();
    const currentDeckCount = $deckCardCount;

    // 初回は状態を記録するのみ（アニメーションなし）
    if (!isAnimationInitialized) {
      previousHandIds = currentHandIds;
      previousFieldIds = currentFieldIds;
      previousGraveyardIds = currentGraveyardIds;
      previousDeckCount = currentDeckCount;
      isAnimationInitialized = true;
      return;
    }

    // デッキ→手札の移動検出
    if (currentDeckCount < previousDeckCount) {
      for (const instanceId of currentHandIds) {
        if (!previousHandIds.has(instanceId)) {
          const cardRef = $handCardRefs.find((r) => r.instanceId === instanceId);
          if (cardRef) {
            startAnimationWithRetry(
              instanceId,
              cardRef.cardId,
              () => cardAnimationStore.getZonePosition("mainDeck"),
              () => cardAnimationStore.getCardPosition(instanceId),
            );
          }
        }
      }
    }

    // 手札→墓地の移動検出
    for (const instanceId of previousHandIds) {
      if (!currentHandIds.has(instanceId) && currentGraveyardIds.has(instanceId)) {
        const cardRef = $graveyardCardRefs.find((r) => r.instanceId === instanceId);
        if (cardRef) {
          const sourceRect = cardAnimationStore.getCardPosition(instanceId);
          const targetRect = cardAnimationStore.getZonePosition("graveyard");
          const cardData = getDisplayCardData(cardRef.cardId);
          if (cardData && sourceRect && targetRect) {
            cardAnimationStore.startAnimation({ instanceId, cardData, sourceRect, targetRect });
          }
        }
      }
    }

    // 手札→フィールドの移動検出
    for (const instanceId of previousHandIds) {
      if (!currentHandIds.has(instanceId) && currentFieldIds.has(instanceId)) {
        const cardRef = getFieldCardRef(instanceId);
        if (cardRef) {
          const sourceRect = cardAnimationStore.getCardPosition(instanceId);
          // フィールド魔法ゾーンへの移動の場合はゾーン位置を使用
          const getTargetRect = isFieldZoneCard(instanceId)
            ? () => cardAnimationStore.getZonePosition("fieldZone")
            : () => cardAnimationStore.getCardPosition(instanceId);
          startAnimationWithRetry(instanceId, cardRef.cardId, () => sourceRect, getTargetRect);
        }
      }
    }

    // フィールド→墓地の移動検出
    for (const instanceId of previousFieldIds) {
      if (!currentFieldIds.has(instanceId) && currentGraveyardIds.has(instanceId)) {
        const cardRef = $graveyardCardRefs.find((r) => r.instanceId === instanceId);
        if (cardRef) {
          const sourceRect = cardAnimationStore.getCardPosition(instanceId);
          const targetRect = cardAnimationStore.getZonePosition("graveyard");
          const cardData = getDisplayCardData(cardRef.cardId);
          if (cardData && sourceRect && targetRect) {
            cardAnimationStore.startAnimation({ instanceId, cardData, sourceRect, targetRect });
          }
        }
      }
    }

    // 墓地→手札の移動検
    for (const instanceId of previousGraveyardIds) {
      if (!currentGraveyardIds.has(instanceId) && currentHandIds.has(instanceId)) {
        const cardRef = $handCardRefs.find((r) => r.instanceId === instanceId);
        if (cardRef) {
          startAnimationWithRetry(
            instanceId,
            cardRef.cardId,
            () => cardAnimationStore.getZonePosition("graveyard"),
            () => cardAnimationStore.getCardPosition(instanceId),
          );
        }
      }
    }

    // 墓地→フィールドの移動検出
    for (const instanceId of previousGraveyardIds) {
      if (!currentGraveyardIds.has(instanceId) && currentFieldIds.has(instanceId)) {
        const cardRef = getFieldCardRef(instanceId);
        if (cardRef) {
          startAnimationWithRetry(
            instanceId,
            cardRef.cardId,
            () => cardAnimationStore.getZonePosition("graveyard"),
            () => cardAnimationStore.getCardPosition(instanceId),
          );
        }
      }
    }

    // 状態を更新
    previousHandIds = currentHandIds;
    previousFieldIds = currentFieldIds;
    previousGraveyardIds = currentGraveyardIds;
    previousDeckCount = currentDeckCount;
  });

  // アニメーション中のカードのインスタンスID
  const animatingInstanceIds = $derived(new Set($cardAnimationStore.activeAnimations.map((a) => a.instanceId)));

  // 手札カードマップ
  const handCardsWithInstanceId = $derived(
    $handCardRefs
      .map((ref) => ({ card: getDisplayCardData(ref.cardId), instanceId: ref.instanceId }))
      .filter((item): item is DisplayCardInstance => item.card !== undefined),
  );

  // 墓地カードマップ
  const graveyardCardsWithInstanceId = $derived(
    $graveyardCardRefs
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
        <h1 class="text-2xl font-bold">Deck: {deckName}</h1>
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
      extraDeckCards={[]}
      graveyardCards={graveyardCardsWithInstanceId}
      fieldCards={fieldSpellZoneCards}
      monsterCards={monsterZoneCards}
      spellTrapCards={spellTrapZoneCards}
      {selectedFieldCardInstanceId}
      {animatingInstanceIds}
      onFieldCardClick={handleFieldCardClick}
      onActivateSetSpell={handleActivateSetSpell}
      onActivateIgnitionEffect={handleActivateIgnitionEffect}
      onCancelFieldCardSelection={handleCancelFieldCardSelection}
    />

    <!-- 手札UI -->
    <div class="card px-4 space-y-4">
      <h2 class="text-xl font-bold">手札 ({$handCardCount} 枚)</h2>
      <Hands
        cards={handCardsWithInstanceId}
        {selectedHandCardInstanceId}
        {animatingInstanceIds}
        onCardClick={handleHandCardClick}
        onSummonMonster={handleSummonMonster}
        onSetMonster={handleSetMonster}
        onSetSpellTrap={handleSetSpellTrap}
        onHandCardSelect={handleHandCardSelect}
      />
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
