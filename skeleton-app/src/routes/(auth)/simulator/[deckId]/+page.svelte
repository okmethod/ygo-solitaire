<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import type { CardDisplayData, CardInstanceDisplayInfo } from "$lib/presentation/types";
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
    monsterZoneDisplayStates,
    spellTrapZoneDisplayStates,
    fieldZoneDisplayStates,
  } from "$lib/application/stores/derivedStores";
  import { effectQueueStore } from "$lib/application/stores/effectQueueStore";
  import { initializeCache, getCardDisplayData } from "$lib/presentation/services/cardDisplayDataCache";
  import { toFixedSlotZone } from "$lib/presentation/services/fieldCardAdapter";
  import { showSuccessToast, showErrorToast } from "$lib/presentation/utils/toaster";
  import DuelField from "./_components/DuelField.svelte";
  import Hands from "./_components/Hands.svelte";
  import ConfirmationModal from "./_components/modals/ConfirmationModal.svelte";
  import CardSelectionModal from "./_components/modals/CardSelectionModal.svelte";
  import GameOverModal from "./_components/modals/GameOverModal.svelte";

  const { data } = $props<{ data: PageData }>();
  const deckName = data.deckData.name;

  onMount(async () => {
    // CardDisplayData キャッシュを初期化
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
      (message) => showSuccessToast(message), // 通知のコールバック
    );
  });

  // ゲーム終了したらモーダルを開く
  let isGameOverModalOpen = $state(false);
  $effect(() => {
    if ($gameResult.isGameOver) isGameOverModalOpen = true;
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
  function handleHandCardClick(_card: CardDisplayData, instanceId: string) {
    // Domain Layerで全ての判定を実施（フェーズチェック、発動可否など）
    const result = gameFacade.activateSpell(instanceId);
    if (!result.success) showErrorToast(result.error || "発動に失敗しました");
  }

  // モンスター召喚ハンドラー
  function handleSummonMonster(card: CardDisplayData, instanceId: string) {
    _executeGameAction(() => gameFacade.summonMonster(instanceId), `${card.name}を召喚しました`, "召喚に失敗しました");
  }

  // モンスターセットハンドラー
  function handleSetMonster(card: CardDisplayData, instanceId: string) {
    _executeGameAction(() => gameFacade.setMonster(instanceId), `${card.name}をセットしました`, "セットに失敗しました");
  }

  // 魔法・罠セットハンドラー
  function handleSetSpellTrap(card: CardDisplayData, instanceId: string) {
    _executeGameAction(
      () => gameFacade.setSpellTrap(instanceId),
      `${card.name}をセットしました`,
      "セットに失敗しました",
    );
  }

  // フィールドカードクリックで効果発動 - 手札選択をクリア
  function handleFieldCardClick(_card: CardDisplayData, instanceId: string) {
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
  function handleActivateSetSpell(card: CardDisplayData, instanceId: string) {
    _executeGameAction(() => gameFacade.activateSpell(instanceId), `${card.name}を発動しました`, "発動に失敗しました");
    selectedFieldCardInstanceId = null; // 選択解除
  }

  // 起動効果発動ハンドラー
  function handleActivateIgnitionEffect(card: CardDisplayData, instanceId: string) {
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

  // 手札カードマップ
  const handCardsWithInstanceId = $derived(
    $handCardRefs
      .map((ref) => ({ card: getCardDisplayData(ref.cardId), instanceId: ref.instanceId }))
      .filter((item): item is CardInstanceDisplayInfo => item.card !== undefined),
  );

  // 墓地カードマップ
  const graveyardCardsWithInstanceId = $derived(
    $graveyardCardRefs
      .map((ref) => ({ card: getCardDisplayData(ref.cardId), instanceId: ref.instanceId }))
      .filter((item): item is CardInstanceDisplayInfo => item.card !== undefined),
  );

  // フィールド上の各種ゾーン用のカードマップ
  const fieldSpellZoneCards = $derived(toFixedSlotZone($fieldZoneDisplayStates, ZONE_CAPACITY.fieldZone));
  const monsterZoneCards = $derived(toFixedSlotZone($monsterZoneDisplayStates, ZONE_CAPACITY.mainMonsterZone));
  const spellTrapZoneCards = $derived(toFixedSlotZone($spellTrapZoneDisplayStates, ZONE_CAPACITY.spellTrapZone));
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
