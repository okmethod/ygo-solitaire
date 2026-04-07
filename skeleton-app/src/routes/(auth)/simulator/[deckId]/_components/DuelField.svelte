<script lang="ts">
  /**
   * DuelField - ゲーム盤面表示コンポーネント
   *
   * フィールド魔法ゾーン、モンスターゾーン、魔法罠ゾーン、墓地、デッキを表示・操作する。
   *
   * @architecture レイヤー間依存ルール - プレゼン層（UI）
   * - ROLE: UI提供、GameFacade 経由でのゲーム操作
   * - ALLOWED: アプリ層（GameFacade、Stores）への依存
   * - FORBIDDEN: ドメイン層への依存
   *
   * @module presentation/components/organisms/board/DuelField
   */
  import { tick, onMount } from "svelte";
  import type { DisplayCardInstance, DisplayCardInstanceOnField } from "$lib/presentation/types";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";
  import { gameFacade } from "$lib/application/GameFacade";
  import { cardAnimationStore } from "$lib/presentation/stores/cardAnimationStore";
  import { isMobile } from "$lib/presentation/utils/mobile";
  import { showSuccessToast, showErrorToast } from "$lib/presentation/utils/toaster";
  import { playSE } from "$lib/presentation/sounds/soundEffects";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import ActivatableCard, {
    type CardActionButton,
  } from "$lib/presentation/components/molecules/ActivatableCard.svelte";
  import Graveyard from "./zones/Graveyard.svelte";
  import ExtraDeck from "./zones/ExtraDeck.svelte";
  import MainDeck from "./zones/MainDeck.svelte";

  interface DuelFieldProps {
    deckCards: number;
    extraDeckCards: DisplayCardInstance[];
    graveyardCards: DisplayCardInstance[];
    banishedCards: DisplayCardInstance[];
    fieldCards: (DisplayCardInstanceOnField | null)[];
    monsterCards: (DisplayCardInstanceOnField | null)[];
    spellTrapCards: (DisplayCardInstanceOnField | null)[];
  }

  let {
    deckCards,
    extraDeckCards,
    graveyardCards,
    banishedCards,
    fieldCards,
    monsterCards,
    spellTrapCards,
  }: DuelFieldProps = $props();

  // アニメーション中のカードのインスタンスID（cardAnimationStore から直接取得）
  const animatingInstanceIds = $derived(new Set($cardAnimationStore.activeAnimations.map((a) => a.instanceId)));

  // ゾーン数の定数
  const ZONE_COUNT = 5;
  const zones = [...Array(ZONE_COUNT).keys()];

  // 装備対象のモンスター instanceId を抽出（装備カードが付いているモンスター）
  const equippedMonsterIds = $derived(
    new Set(
      spellTrapCards
        .filter((card): card is DisplayCardInstanceOnField => card !== null && !!card.equippedTo)
        .map((card) => card.equippedTo!),
    ),
  );

  // 現在ホバー中の装備カードの装備対象モンスター instanceId
  let hoveredEquipTargetId = $state<string | null>(null);

  // 装備カードのホバー処理
  function handleEquipCardHover(equippedTo: string | null) {
    hoveredEquipTargetId = equippedTo;
  }

  // スマホではカードサイズを小さく
  const _isMobile = isMobile();
  const cardSize: ComponentSize = _isMobile ? "small" : "medium";

  // フィールドカード要素の参照を保持
  // use: ディレクティブで要素を登録（Svelte 5 での bind:this の問題を回避）
  const fieldCardElements = new Map<string, HTMLElement>();

  // use: ディレクティブ用の登録関数
  function registerFieldCardElement(node: HTMLElement, instanceId: string) {
    fieldCardElements.set(instanceId, node);
    // 次フレームで位置を登録（レイアウト完了後の正確な位置）
    requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      cardAnimationStore.registerCardPosition(instanceId, rect);
    });
    return {
      destroy() {
        fieldCardElements.delete(instanceId);
      },
    };
  }

  // フィールド魔法ゾーンの要素参照
  let fieldZoneElement: HTMLElement | undefined = $state();

  // フィールド魔法ゾーンの位置を登録
  onMount(() => {
    if (fieldZoneElement) {
      const rect = fieldZoneElement.getBoundingClientRect();
      cardAnimationStore.registerZonePosition("fieldZone", rect);
    }
  });

  // カード位置を登録（フィールドカードが変更されたときのみ）
  let lastFieldCardIds: string[] = [];

  async function updateFieldCardPositions() {
    await tick(); // DOM更新を待つ

    // 全フィールドカードの位置を登録（リトライ付き）
    const allFieldCards = [...fieldCards, ...monsterCards, ...spellTrapCards].filter(
      (c): c is DisplayCardInstanceOnField => c !== null,
    );

    // bind:this のバインドが完了するまでリトライ
    const maxRetries = 10;
    let retryCount = 0;

    async function tryRegisterPositions(): Promise<void> {
      await new Promise((resolve) => requestAnimationFrame(resolve));

      let allBound = true;
      for (const card of allFieldCards) {
        const element = fieldCardElements.get(card.instanceId);
        if (element) {
          const rect = element.getBoundingClientRect();
          cardAnimationStore.registerCardPosition(card.instanceId, rect);
        } else {
          allBound = false;
        }
      }

      // 未バインドの要素があればリトライ
      if (!allBound && retryCount < maxRetries) {
        retryCount++;
        await tryRegisterPositions();
      }
    }

    await tryRegisterPositions();
  }

  $effect(() => {
    // フィールドカードの変更を検出（IDリストが変わった場合のみ）
    const allFieldCards = [...fieldCards, ...monsterCards, ...spellTrapCards].filter(
      (c): c is DisplayCardInstanceOnField => c !== null,
    );
    const currentIds = allFieldCards.map((c) => c.instanceId).join(",");
    const prevIds = lastFieldCardIds.join(",");
    if (currentIds !== prevIds) {
      lastFieldCardIds = allFieldCards.map((c) => c.instanceId);
      updateFieldCardPositions();
    }
  });

  // セットカードを発動可能か
  function canActivateSetCard(instanceId: string): boolean {
    // 現状、魔法カードのみ
    return gameFacade.canActivateSpell(instanceId);
  }

  // 起動効果を発動可能か
  function canActivateIgnitionEffect(instanceId: string): boolean {
    return gameFacade.canActivateIgnitionEffect(instanceId);
  }

  // ゲームアクション実行の共通ヘルパー
  function executeGameAction(action: () => { success: boolean; message?: string; error?: string }): boolean {
    const result = action();
    if (result.success) {
      if (result.message) {
        showSuccessToast(result.message);
      }
    } else {
      playSE.error();
      showErrorToast(result.error || "失敗しました");
    }
    return result.success;
  }

  // セットカード発動ボタンクリック時
  function handleActivateSetCard(instanceId: string) {
    playSE.activate();
    // 現状、魔法カードのみ
    executeGameAction(() => gameFacade.activateSpell(instanceId));
  }

  // 起動効果発動ボタンクリック時
  function handleActivateIgnitionEffect(instanceId: string) {
    playSE.activate();
    executeGameAction(() => gameFacade.activateIgnitionEffect(instanceId));
  }

  // モンスターカード用のアクション定義
  function getMonsterActions(instanceId: string, faceUp: boolean): CardActionButton[] {
    const actionButtons: CardActionButton[] = [];

    if (faceUp) {
      // 表側表示: 起動効果の発動
      if (canActivateIgnitionEffect(instanceId)) {
        actionButtons.push({
          label: "効果発動",
          style: "filled",
          color: "primary",
          onClick: handleActivateIgnitionEffect,
        });
      }
    } else {
      // 裏側表示: 現状、反転召喚はないのでアクションなし
    }
    return actionButtons;
  }

  // 魔法罠ゾーンのカード用のアクション定義
  function getSpellTrapActions(instanceId: string, faceUp: boolean): CardActionButton[] {
    const actionButtons: CardActionButton[] = [];

    if (faceUp) {
      // 表側表示: 起動効果の発動
      if (canActivateIgnitionEffect(instanceId)) {
        actionButtons.push({
          label: "効果発動",
          style: "filled",
          color: "primary",
          onClick: handleActivateIgnitionEffect,
        });
      }
    } else {
      // 裏側表示: カードの発動
      if (canActivateSetCard(instanceId)) {
        actionButtons.push({
          label: "発動",
          style: "filled",
          color: "primary",
          onClick: handleActivateSetCard,
        });
      }
    }
    return actionButtons;
  }

  // フィールド魔法カード用のアクション定義
  function getFieldSpellActions(instanceId: string, faceUp: boolean): CardActionButton[] {
    const actionButtons: CardActionButton[] = [];

    if (faceUp) {
      // 表側表示: 起動効果の発動
      if (canActivateIgnitionEffect(instanceId)) {
        actionButtons.push({
          label: "効果発動",
          style: "filled",
          color: "primary",
          onClick: handleActivateIgnitionEffect,
        });
      }
    } else {
      // 裏側表示: カードの発動
      if (canActivateSetCard(instanceId)) {
        actionButtons.push({
          label: "発動",
          style: "filled",
          color: "primary",
          onClick: handleActivateSetCard,
        });
      }
    }
    return actionButtons;
  }
</script>

{#snippet monsterZone(i: number)}
  {@const card = monsterCards[i]}
  {@const instanceId = card?.instanceId}
  {@const isAnimating = instanceId ? animatingInstanceIds.has(instanceId) : false}
  {@const isEquipped = instanceId ? equippedMonsterIds.has(instanceId) : false}
  {@const isEquipmentHovered = instanceId === hoveredEquipTargetId}
  {#key instanceId}
    <div class="flex justify-center">
      {#if card && instanceId && !isAnimating}
        <div use:registerFieldCardElement={instanceId}>
          <ActivatableCard
            card={card.card}
            {instanceId}
            faceUp={card.faceUp}
            rotation={card.rotation || 0}
            actionButtons={getMonsterActions(instanceId, card.faceUp)}
            size={cardSize}
            spellCounterCount={card.spellCounterCount || 0}
            {isEquipped}
            {isEquipmentHovered}
          />
        </div>
      {:else}
        <div class="relative">
          <div style="filter: sepia(0.5) hue-rotate(30deg) saturate(1.8) brightness(0.85);">
            <CardComponent placeholder={true} placeholderText="M{i + 1}" size={cardSize} />
          </div>
          <!-- アニメーション中: 位置取得用の透明要素 -->
          {#if card && instanceId && isAnimating}
            <div use:registerFieldCardElement={instanceId} class="absolute inset-0 opacity-0 pointer-events-none">
              <ActivatableCard
                card={card.card}
                {instanceId}
                faceUp={card.faceUp}
                rotation={card.rotation || 0}
                actionButtons={[]}
                size={cardSize}
                spellCounterCount={card.spellCounterCount || 0}
                {isEquipped}
                {isEquipmentHovered}
              />
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/key}
{/snippet}

{#snippet spellTrapZone(i: number)}
  {@const card = spellTrapCards[i]}
  {@const instanceId = card?.instanceId}
  {@const isAnimating = instanceId ? animatingInstanceIds.has(instanceId) : false}
  {#key instanceId}
    <div class="flex justify-center">
      {#if card && instanceId && !isAnimating}
        <div use:registerFieldCardElement={instanceId}>
          {#if card.faceUp}
            <ActivatableCard
              card={card.card}
              {instanceId}
              faceUp={true}
              actionButtons={getSpellTrapActions(instanceId, true)}
              size={cardSize}
              onHover={(hoveredCard) => handleEquipCardHover(hoveredCard ? (card.equippedTo ?? null) : null)}
            />
          {:else}
            <ActivatableCard
              card={card.card}
              {instanceId}
              faceUp={false}
              actionButtons={getSpellTrapActions(instanceId, false)}
              size={cardSize}
            />
          {/if}
        </div>
      {:else}
        <div class="relative">
          <div style="filter: sepia(0.4) hue-rotate(200deg) saturate(2) brightness(0.8);">
            <CardComponent placeholder={true} placeholderText="S{i + 1}" size={cardSize} />
          </div>
          <!-- アニメーション中: 位置取得用の透明要素 -->
          {#if card && instanceId && isAnimating}
            <div use:registerFieldCardElement={instanceId} class="absolute inset-0 opacity-0 pointer-events-none">
              {#if card.faceUp}
                <CardComponent card={card.card} faceUp={true} size={cardSize} clickable={false} />
              {:else}
                <ActivatableCard card={card.card} {instanceId} faceUp={false} actionButtons={[]} size={cardSize} />
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/key}
{/snippet}

<!-- ゾーン用 Snippets -->
{#snippet fieldZone(placeholderText: string)}
  {@const card = fieldCards[0]}
  {@const instanceId = card?.instanceId}
  {@const isAnimating = instanceId ? animatingInstanceIds.has(instanceId) : false}
  <div bind:this={fieldZoneElement} class="flex justify-center">
    {#key instanceId}
      {#if card && instanceId && !isAnimating}
        <div use:registerFieldCardElement={instanceId}>
          <ActivatableCard
            card={card.card}
            {instanceId}
            faceUp={card.faceUp}
            actionButtons={getFieldSpellActions(instanceId, card.faceUp)}
            size={cardSize}
          />
        </div>
      {:else}
        <div class="relative">
          <div style="filter: sepia(0.3) hue-rotate(90deg) saturate(1.5) brightness(0.9);">
            <CardComponent placeholder={true} {placeholderText} size={cardSize} />
          </div>
          <!-- アニメーション中: 位置取得用の透明要素 -->
          {#if card && instanceId && isAnimating}
            <div use:registerFieldCardElement={instanceId} class="absolute inset-0 opacity-0 pointer-events-none">
              <ActivatableCard card={card.card} {instanceId} faceUp={card.faceUp} actionButtons={[]} size={cardSize} />
            </div>
          {/if}
        </div>
      {/if}
    {/key}
  </div>
{/snippet}

{#snippet graveyardZone()}
  <div class="flex justify-center">
    <Graveyard cards={graveyardCards} {banishedCards} size={cardSize} {animatingInstanceIds} />
  </div>
{/snippet}

{#snippet extraDeckZone()}
  <div class="flex justify-center">
    <ExtraDeck cards={extraDeckCards} size={cardSize} />
  </div>
{/snippet}

{#snippet mainDeckZone()}
  <div class="flex justify-center">
    <MainDeck cardCount={deckCards} size={cardSize} />
  </div>
{/snippet}

<!-- レイアウト -->
<div class="card p-2 max-w-6xl mx-auto">
  <div class="transition-all duration-300">
    {#if _isMobile}
      <!-- スマホレイアウト: 3行構成 -->
      <div class="grid grid-cols-4 gap-1 mb-2">
        {@render fieldZone("F")}
        {@render extraDeckZone()}
        {@render mainDeckZone()}
        {@render graveyardZone()}
      </div>
      <div class="grid grid-cols-5 gap-1 mb-2">
        {#each zones as i (i)}
          {@render monsterZone(i)}
        {/each}
      </div>
      <div class="grid grid-cols-5 gap-1 mb-2">
        {#each zones as i (i)}
          {@render spellTrapZone(i)}
        {/each}
      </div>
    {:else}
      <!-- PCレイアウト: 2行構成 -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        {@render fieldZone("フィールド")}
        {#each zones as i (i)}
          {@render monsterZone(i)}
        {/each}
        {@render graveyardZone()}
      </div>
      <div class="grid grid-cols-7 gap-2 mb-4">
        {@render extraDeckZone()}
        {#each zones as i (i)}
          {@render spellTrapZone(i)}
        {/each}
        {@render mainDeckZone()}
      </div>
    {/if}
  </div>
</div>
