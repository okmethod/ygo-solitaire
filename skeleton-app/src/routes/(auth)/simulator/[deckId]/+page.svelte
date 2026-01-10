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
  import DuelField from "$lib/presentation/components/organisms/board/DuelField.svelte";
  import Hands from "$lib/presentation/components/organisms/board/Hands.svelte";
  import EffectResolutionModal from "$lib/presentation/components/modals/EffectResolutionModal.svelte";
  import CardSelectionModal from "$lib/presentation/components/modals/CardSelectionModal.svelte";
  import GameOverModal from "$lib/presentation/components/modals/GameOverModal.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";

  const { data } = $props<{ data: PageData }>();

  // 自動フェイズ進行 - Draw → Standby → Main1 まで自動進行
  async function autoAdvanceToMainPhase() {
    // フェイズ進行（2回）
    for (let i = 0; i < 2; i++) {
      // 300ms待機
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = gameFacade.advancePhase();
      if (result.success) {
        console.log(`[Simulator] ${result.message}`);
        if (result.message) {
          showSuccessToast(result.message);
        }
      } else {
        showErrorToast(result.error || "フェーズ移行に失敗しました");
        break;
      }
    }
  }

  // ゲーム開始時、Main1 まで自動進行
  let hasAutoAdvanced = $state(false);
  $effect(() => {
    if ($currentTurn === 1 && $currentPhase === "Draw" && !hasAutoAdvanced && !$isGameOver) {
      autoAdvanceToMainPhase();
      hasAutoAdvanced = true;
    }
  });

  // ゲーム終了したらモーダルを開く
  let isGameOverModalOpen = $state(false);
  $effect(() => {
    if ($isGameOver) isGameOverModalOpen = true;
  });

  // 現在のステータス表示文字列を取得
  function getNowStatusString(): string {
    if ($isGameOver) return "ゲーム終了";

    function _getPhaseDisplay(phase: string): string {
      const phaseMap: Record<string, string> = {
        Draw: "ドローフェイズ",
        Standby: "スタンバイフェイズ",
        Main1: "メインフェイズ1",
        End: "エンドフェイズ",
      };
      return phaseMap[phase] || phase;
    }

    return _getPhaseDisplay($currentPhase);
  }

  // 手札のカードクリックで効果発動
  function handleHandCardClick(card: CardDisplayData, instanceId: string) {
    // Domain Layerで全ての判定を実施（フェーズチェック、発動可否など）
    const result = gameFacade.activateSpell(instanceId);
    if (!result.success) showErrorToast(result.error || "発動に失敗しました");
  }

  // モンスター召喚ハンドラー (T032)
  function handleSummonMonster(card: CardDisplayData, instanceId: string) {
    const result = gameFacade.summonMonster(instanceId);
    if (result.success) {
      showSuccessToast(result.message || `${card.name}を召喚しました`);
    } else {
      showErrorToast(result.error || "召喚に失敗しました");
    }
  }

  // モンスターセットハンドラー (T032)
  function handleSetMonster(card: CardDisplayData, instanceId: string) {
    const result = gameFacade.setMonster(instanceId);
    if (result.success) {
      showSuccessToast(result.message || `${card.name}をセットしました`);
    } else {
      showErrorToast(result.error || "セットに失敗しました");
    }
  }

  // 魔法・罠セットハンドラー (T032)
  function handleSetSpellTrap(card: CardDisplayData, instanceId: string) {
    const result = gameFacade.setSpellTrap(instanceId);
    if (result.success) {
      showSuccessToast(result.message || `${card.name}をセットしました`);
    } else {
      showErrorToast(result.error || "セットに失敗しました");
    }
  }

  // フィールドカードクリックで起動効果発動
  function handleFieldCardClick(card: CardDisplayData) {
    // Find the card instance ID from field cards (mainMonsterZone + spellTrapZone + fieldZone) (T031)
    const currentState = gameFacade.getGameState();
    const allFieldCards = [
      ...currentState.zones.mainMonsterZone,
      ...currentState.zones.spellTrapZone,
      ...currentState.zones.fieldZone,
    ];
    const fieldCard = allFieldCards.find((c) => c.id === card.id);
    if (!fieldCard) {
      showErrorToast("Card not found on field");
      return;
    }

    // Domain Layerで全ての判定を実施（フェーズチェック、LP、1ターンに1度制限など）
    const result = gameFacade.activateIgnitionEffect(fieldCard.instanceId);

    // トーストメッセージ表示
    if (result.success) {
      showSuccessToast(result.message || `${card.name}の効果を発動しました`);
    } else {
      showErrorToast(result.error || "効果発動に失敗しました");
    }
  }

  // 効果解決ストアの状態を購読
  const effectResolutionState = effectResolutionStore;

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
      <h2 class="text-xl font-bold">手札 ({$handCardCount} 枚)</h2>
      <Hands
        cards={handCardsWithInstanceId}
        handCardCount={$handCardCount}
        currentPhase={$currentPhase}
        canActivateSpells={$canActivateSpells}
        isGameOver={$isGameOver}
        onCardClick={handleHandCardClick}
        onSummonMonster={handleSummonMonster}
        onSetMonster={handleSetMonster}
        onSetSpellTrap={handleSetSpellTrap}
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

<!-- 効果解決モーダル (interactive level without card selection only) -->
<!-- Note: Only show modal for interactive level steps that don't have cardSelectionConfig -->
<!-- info/silent levels are handled by effectResolutionStore (toast/no-ui) -->
<EffectResolutionModal
  isOpen={$effectResolutionState.isActive &&
    $effectResolutionState.currentStep?.notificationLevel === "interactive" &&
    !$effectResolutionState.currentStep?.cardSelectionConfig}
  summary={$effectResolutionState.currentStep?.summary || ""}
  description={$effectResolutionState.currentStep?.description || ""}
  onConfirm={effectResolutionStore.confirmCurrentStep}
  onCancel={$effectResolutionState.currentStep?.showCancel ? effectResolutionStore.cancelResolution : undefined}
  showCancel={$effectResolutionState.currentStep?.showCancel || false}
/>

<!-- カード選択モーダル -->
<CardSelectionModal />

<!-- ゲーム終了モーダル -->
<GameOverModal
  isOpen={isGameOverModalOpen}
  winner={$gameResult.winner}
  reason={$gameResult.reason}
  message={$gameResult.message}
  onClose={() => {
    console.log("[Simulator] Game result modal closed");
    isGameOverModalOpen = false;
  }}
/>
