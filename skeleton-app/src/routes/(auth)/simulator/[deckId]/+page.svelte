<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import type { CardDisplayData } from "$lib/presentation/types";
  import type { EffectResolutionModalConfig, CardSelectionModalConfig } from "$lib/presentation/types/interaction";
  import { gameFacade } from "$lib/application/GameFacade";
  import { gameStateStore } from "$lib/application/stores/gameStateStore";
  import {
    currentPhase,
    currentTurn,
    playerLP,
    opponentLP,
    handCardCount,
    deckCardCount,
    gameResult,
    handCardInstances,
    graveyardCardInstances,
  } from "$lib/application/stores/derivedStores";
  import { effectQueueStore } from "$lib/application/stores/effectQueueStore";
  import { initializeCache, getCardDisplayData } from "$lib/presentation/services/cardDisplayDataCache";
  import { showSuccessToast, showErrorToast } from "$lib/presentation/utils/toaster";
  import DuelField from "./_components/DuelField.svelte";
  import Hands from "./_components/Hands.svelte";
  import EffectResolutionModal from "./_components/modals/EffectResolutionModal.svelte";
  import CardSelectionModal from "./_components/modals/CardSelectionModal.svelte";
  import GameOverModal from "./_components/modals/GameOverModal.svelte";

  const { data } = $props<{ data: PageData }>();

  onMount(async () => {
    // CardDisplayData キャッシュを初期化
    await initializeCache(data.uniqueCardIds);

    // effectQueueStore に通知ハンドラを登録（DI）
    effectQueueStore.registerNotificationHandler({
      showInfo: (_summary, description) => {
        showSuccessToast(description);
      },
      showInteractive: () => {
        // Interactive level uses modal logic
      },
    });
  });

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
    if ($currentTurn === 1 && $currentPhase === "Draw" && !hasAutoAdvanced && !$gameResult.isGameOver) {
      autoAdvanceToMainPhase();
      hasAutoAdvanced = true;
    }
  });

  // ゲーム終了したらモーダルを開く
  let isGameOverModalOpen = $state(false);
  $effect(() => {
    if ($gameResult.isGameOver) isGameOverModalOpen = true;
  });

  // 現在のステータス表示文字列を取得
  function getNowStatusString(): string {
    if ($gameResult.isGameOver) return "ゲーム終了";

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

  // モンスター召喚ハンドラー
  function handleSummonMonster(card: CardDisplayData, instanceId: string) {
    const result = gameFacade.summonMonster(instanceId);
    if (result.success) {
      showSuccessToast(result.message || `${card.name}を召喚しました`);
    } else {
      showErrorToast(result.error || "召喚に失敗しました");
    }
  }

  // モンスターセットハンドラー
  function handleSetMonster(card: CardDisplayData, instanceId: string) {
    const result = gameFacade.setMonster(instanceId);
    if (result.success) {
      // カード名を使った明示的なメッセージを優先
      showSuccessToast(`${card.name}をセットしました`);
    } else {
      showErrorToast(result.error || "セットに失敗しました");
    }
  }

  // 魔法・罠セットハンドラー
  function handleSetSpellTrap(card: CardDisplayData, instanceId: string) {
    const result = gameFacade.setSpellTrap(instanceId);
    if (result.success) {
      // カード名を使った明示的なメッセージを優先
      showSuccessToast(`${card.name}をセットしました`);
    } else {
      showErrorToast(result.error || "セットに失敗しました");
    }
  }

  // カード選択状態管理 - 一元管理
  let selectedHandCardInstanceId = $state<string | null>(null); // 手札カード選択
  let selectedFieldCardInstanceId = $state<string | null>(null); // フィールドカード選択（セット魔法・罠・モンスター）

  // 手札カード選択変更ハンドラー - フィールドカード選択をクリア
  function handleHandCardSelect(instanceId: string | null) {
    selectedHandCardInstanceId = instanceId;
    selectedFieldCardInstanceId = null; // フィールドカード選択をクリア
  }

  // フィールドカードクリックで効果発動 - 手札選択をクリア
  function handleFieldCardClick(card: CardDisplayData, instanceId: string) {
    // Find the card instance from field cards
    const currentState = gameFacade.getGameState();
    const allFieldCards = [
      ...currentState.zones.mainMonsterZone,
      ...currentState.zones.spellTrapZone,
      ...currentState.zones.fieldZone,
    ];
    const fieldCard = allFieldCards.find((c) => c.instanceId === instanceId);
    if (!fieldCard) {
      showErrorToast("Card not found on field");
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
    const result = gameFacade.activateSpell(instanceId);
    if (result.success) {
      showSuccessToast(result.message || `${card.name}を発動しました`);
    } else {
      showErrorToast(result.error || "発動に失敗しました");
    }
    selectedFieldCardInstanceId = null; // 選択解除
  }

  // 起動効果発動ハンドラー
  function handleActivateIgnitionEffect(card: CardDisplayData, instanceId: string) {
    const result = gameFacade.activateIgnitionEffect(instanceId);
    if (result.success) {
      showSuccessToast(result.message || `${card.name}の効果を発動しました`);
    } else {
      showErrorToast(result.error || "効果発動に失敗しました");
    }
    selectedFieldCardInstanceId = null; // 選択解除
  }

  // フィールドカード選択キャンセル
  function handleCancelFieldCardSelection() {
    selectedFieldCardInstanceId = null;
  }

  // 効果処理キューストアの状態を購読
  const effectQueueState = effectQueueStore;

  // 手札カードとinstanceIdのマッピング（cache経由でCardDisplayDataを取得）
  const handCardsWithInstanceId = $derived(
    $handCardInstances.map((instance) => ({
      card: getCardDisplayData(instance.id),
      instanceId: instance.instanceId,
    })),
  );

  // 墓地カード（cache経由でCardDisplayDataを取得）
  const graveyardDisplayCards = $derived(
    $graveyardCardInstances
      .map((instance) => getCardDisplayData(instance.id))
      .filter((card): card is CardDisplayData => card !== undefined),
  );

  // DuelField用のゾーンデータ抽出（CardInstanceとCardDisplayDataをマージ）
  // フィールド魔法ゾーン用カード（frameType === "field"）
  const fieldMagicCards = $derived.by(() => {
    const fieldInstances = $gameStateStore.zones.fieldZone;
    return fieldInstances
      .map((instance) => {
        const displayData = getCardDisplayData(instance.id);
        if (!displayData) return null;
        return {
          card: displayData,
          instanceId: instance.instanceId,
          faceDown: instance.position === "faceDown",
        };
      })
      .filter((item) => item !== null);
  });

  // モンスターゾーン用カード配列（5枚固定、null埋め）
  const monsterZoneCards = $derived.by(() => {
    const monsterInstances = $gameStateStore.zones.mainMonsterZone;
    const zone: ({ card: CardDisplayData; instanceId: string; faceDown: boolean; rotation?: number } | null)[] =
      Array(5).fill(null);
    monsterInstances.forEach((instance, i) => {
      if (i < 5) {
        const displayData = getCardDisplayData(instance.id);
        if (displayData) {
          zone[i] = {
            card: displayData,
            instanceId: instance.instanceId,
            faceDown: instance.position === "faceDown",
            rotation: instance.battlePosition === "defense" ? 270 : 0, // 守備表示は横向き回転
          };
        }
      }
    });
    return zone;
  });

  // 魔法・罠ゾーン用カード配列（5枚固定、フィールド魔法除外）
  const spellTrapZoneCards = $derived.by(() => {
    const spellTrapInstances = $gameStateStore.zones.spellTrapZone;
    const zone: ({ card: CardDisplayData; instanceId: string; faceDown: boolean } | null)[] = Array(5).fill(null);
    spellTrapInstances.forEach((instance, i) => {
      if (i < 5) {
        const displayData = getCardDisplayData(instance.id);
        if (displayData) {
          zone[i] = {
            card: displayData,
            instanceId: instance.instanceId,
            faceDown: instance.position === "faceDown",
          };
        }
      }
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
      graveyardCards={graveyardDisplayCards}
      fieldCards={fieldMagicCards}
      monsterCards={monsterZoneCards}
      spellTrapCards={spellTrapZoneCards}
      {selectedFieldCardInstanceId}
      onFieldCardClick={handleFieldCardClick}
      onActivateSetSpell={handleActivateSetSpell}
      onActivateIgnitionEffect={handleActivateIgnitionEffect}
      onCancelFieldCardSelection={handleCancelFieldCardSelection}
    />

    <!-- Hand Zone -->
    <div class="card px-4 space-y-4">
      <h2 class="text-xl font-bold">手札 ({$handCardCount} 枚)</h2>
      <Hands
        cards={handCardsWithInstanceId}
        handCardCount={$handCardCount}
        currentPhase={$currentPhase}
        isGameOver={$gameResult.isGameOver}
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

<!-- 効果処理モーダル: カード選択を伴わない interactive ステップ向け -->
<EffectResolutionModal
  isOpen={$effectQueueState.effectResolutionConfig !== null}
  config={$effectQueueState.effectResolutionConfig as EffectResolutionModalConfig | null}
/>

<!-- カード選択モーダル: カード選択を伴う interactive ステップ向け -->
<CardSelectionModal
  isOpen={$effectQueueState.cardSelectionConfig !== null}
  config={$effectQueueState.cardSelectionConfig as CardSelectionModalConfig | null}
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
