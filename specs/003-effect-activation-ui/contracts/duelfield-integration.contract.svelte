<!--
  Contract: DuelField Integration

  Purpose: V2シミュレーターページでのDuelFieldコンポーネント統合仕様
  Location: src/routes/(auth)/simulator/[deckId]/+page.svelte
  Layer: Presentation
-->

<script lang="ts">
  import DuelField from "$lib/components/organisms/board/DuelField.svelte";
  import { gameFacade } from "$lib/application/GameFacade";
  import { gameStateStore } from "$lib/application/stores/gameStateStore";
  import {
    handCards,
    fieldCards,
    graveyardCards,
  } from "$lib/application/stores/cardDisplayStore";
  import {
    deckCardCount,
    currentPhase,
    canActivateSpells,
    isGameOver,
  } from "$lib/application/stores/derivedStores";
  import { showSuccessToast, showErrorToast } from "$lib/utils/toaster";
  import type { CardDisplayData } from "$lib/types/card";

  /**
   * フィールド魔法ゾーン用のカード抽出
   * - fieldCardsから最初の1枚を取得（フィールド魔法は1枚まで）
   */
  $: fieldSpellCards = $fieldCards.filter(c => c.frameType === "field").slice(0, 1);

  /**
   * モンスターゾーン用のカード配列作成
   * - fieldCardsからモンスターカードをフィルタ
   * - 最大5枚、不足分はnullで埋める
   */
  $: monsterZoneCards = (() => {
    const monsters = $fieldCards.filter(c => c.type === "monster").slice(0, 5);
    const nulls = Array(5 - monsters.length).fill(null);
    return [...monsters, ...nulls] as (CardDisplayData | null)[];
  })();

  /**
   * 魔法・罠ゾーン用のカード配列作成
   * - fieldCardsから魔法・罠カードをフィルタ（フィールド魔法を除く）
   * - 最大5枚、不足分はnullで埋める
   */
  $: spellTrapZoneCards = (() => {
    const spellTraps = $fieldCards
      .filter(c => (c.type === "spell" || c.type === "trap") && c.frameType !== "field")
      .slice(0, 5);
    const nulls = Array(5 - spellTraps.length).fill(null);
    return [...spellTraps, ...nulls] as (CardDisplayData | null)[];
  })();

  /**
   * カードクリックハンドラー
   * - 手札のカードクリック時に効果発動コマンドを実行
   * - Main1フェーズかつcanActivateSpellsがtrueの場合のみ実行可能
   *
   * @param card - クリックされたCardDisplayData
   * @param instanceId - CardInstanceの一意識別子
   */
  function handleCardClick(card: CardDisplayData, instanceId: string) {
    // ゲームオーバー時は何もしない
    if ($isGameOver) {
      return;
    }

    // フェーズチェック
    if ($currentPhase !== "Main1") {
      showErrorToast("メインフェーズ1でのみカードを発動できます");
      return;
    }

    // 魔法カード発動可否チェック
    if (!$canActivateSpells) {
      showErrorToast("現在、魔法カードを発動できません");
      return;
    }

    // GameFacadeを通じて効果発動コマンド実行
    const result = gameFacade.activateSpell(instanceId);

    if (result.success) {
      showSuccessToast(result.message || `${card.name}を発動しました`);
    } else {
      showErrorToast(result.error || "発動に失敗しました");
    }
  }

  /**
   * 手札カードとinstanceIdのマッピング
   * - handCardsとgameStateStore.zones.handを組み合わせる
   */
  $: handCardsWithInstanceId = $gameStateStore.zones.hand.map((instance, index) => ({
    card: $handCards[index],
    instanceId: instance.instanceId,
  }));
</script>

<!-- DuelField統合 -->
<DuelField
  deckCards={$deckCardCount}
  extraDeckCards={[]}
  graveyardCards={$graveyardCards}
  fieldCards={fieldSpellCards}
  monsterCards={monsterZoneCards}
  spellTrapCards={spellTrapZoneCards}
/>

<!-- 手札エリア（DuelFieldとは別に表示） -->
<div class="card p-4 space-y-4">
  <h2 class="text-xl font-bold">Hand ({$handCards.length} cards)</h2>

  <div class="grid grid-cols-5 gap-2">
    {#each handCardsWithInstanceId as { card, instanceId } (instanceId)}
      {#if card}
        <Card
          {card}
          size="medium"
          clickable={$currentPhase === "Main1" && $canActivateSpells && !$isGameOver}
          onClick={() => handleCardClick(card, instanceId)}
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

<!--
  実装要件:

  1. ストアのインポート:
     - handCards, fieldCards, graveyardCards from cardDisplayStore
     - deckCardCount, currentPhase, canActivateSpells, isGameOver from derivedStores
     - gameStateStore from gameStateStore

  2. ゾーン分割ロジック:
     - フィールド魔法: frameType === "field"
     - モンスターゾーン: type === "monster"、5枚固定（null埋め）
     - 魔法・罠ゾーン: type === "spell" | "trap" かつ frameType !== "field"、5枚固定（null埋め）

  3. カードクリックハンドラー:
     - フェーズチェック（Main1のみ）
     - 魔法発動可否チェック（canActivateSpells）
     - ゲームオーバーチェック
     - gameFacade.activateSpell(instanceId)実行
     - トーストメッセージ表示

  4. エラーハンドリング:
     - cardDisplayStoreからundefinedが返った場合はplaceholder表示
     - activateSpell失敗時はエラートースト

  5. パフォーマンス:
     - リアクティブ宣言（$:）で自動更新
     - 不要な再計算を避けるため、派生値は$:でキャッシュ
-->
