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
  import type { DisplayCardData, DisplayCardInstance, DisplayCardInstanceOnField } from "$lib/presentation/types";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";
  import { gameFacade } from "$lib/application/GameFacade";
  import { isMobile } from "$lib/presentation/utils/mobile";
  import { cardAnimationStore } from "$lib/presentation/stores/cardAnimationStore";
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
    fieldCards: (DisplayCardInstanceOnField | null)[];
    monsterCards: (DisplayCardInstanceOnField | null)[];
    spellTrapCards: (DisplayCardInstanceOnField | null)[];
    selectedFieldCardInstanceId: string | null; // 選択されたフィールドカードのインスタンスID
    animatingInstanceIds?: Set<string>; // アニメーション中のカードのインスタンスID
    onFieldCardClick?: (card: DisplayCardData, instanceId: string) => void;
    onActivateSetSpell?: (card: DisplayCardData, instanceId: string) => void; // セット魔法カード発動
    onActivateIgnitionEffect?: (card: DisplayCardData, instanceId: string) => void; // 起動効果発動
    onCancelFieldCardSelection?: () => void; // 選択キャンセル
  }

  let {
    deckCards,
    extraDeckCards,
    graveyardCards,
    fieldCards,
    monsterCards,
    spellTrapCards,
    selectedFieldCardInstanceId,
    animatingInstanceIds = new Set<string>(),
    onFieldCardClick,
    onActivateSetSpell,
    onActivateIgnitionEffect,
    onCancelFieldCardSelection,
  }: DuelFieldProps = $props();

  // ゾーン数の定数
  const ZONE_COUNT = 5;
  const zones = [...Array(ZONE_COUNT).keys()];

  // スマホではカードサイズを小さく
  const _isMobile = isMobile();
  const cardSize: ComponentSize = _isMobile ? "small" : "medium";

  // フィールドカード要素の参照を保持
  let fieldCardElements: Record<string, HTMLElement | undefined> = $state({});

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
    // 全フィールドカードの位置を登録
    const allFieldCards = [...fieldCards, ...monsterCards, ...spellTrapCards].filter(
      (c): c is DisplayCardInstanceOnField => c !== null,
    );
    for (const card of allFieldCards) {
      const element = fieldCardElements[card.instanceId];
      if (element) {
        const rect = element.getBoundingClientRect();
        cardAnimationStore.registerCardPosition(card.instanceId, rect);
      }
    }
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

  // カードクリック処理
  function handleCardClick(card: DisplayCardData, instanceId: string) {
    if (onFieldCardClick) {
      onFieldCardClick(card, instanceId);
    }
  }

  // セット魔法・罠の発動可能性をチェック
  function canActivateSpell(instanceId: string): boolean {
    return gameFacade.canActivateSpell(instanceId);
  }

  // 起動効果の発動可能性をチェック
  function canActivateIgnitionEffect(instanceId: string): boolean {
    return gameFacade.canActivateIgnitionEffect(instanceId);
  }

  // セット魔法カード用のアクション定義
  function getSetSpellActions(instanceId: string): CardActionButton[] {
    // 発動条件を満たしていない場合は空配列を返す（ボタンを表示しない）
    if (!canActivateSpell(instanceId)) {
      return [];
    }
    return [
      {
        label: "発動",
        style: "filled",
        color: "primary",
        onClick: onActivateSetSpell || (() => {}),
      },
    ];
  }

  // フィールド魔法カード用のアクション定義
  function getFieldSpellActions(instanceId: string, faceDown: boolean): CardActionButton[] {
    if (faceDown) {
      // 裏側表示: カードの発動
      if (!canActivateSpell(instanceId)) {
        return [];
      }
      return [
        {
          label: "発動",
          style: "filled",
          color: "primary",
          onClick: onActivateSetSpell || (() => {}),
        },
      ];
    } else {
      // 表側表示: 起動効果の発動
      if (!canActivateIgnitionEffect(instanceId)) {
        return [];
      }
      return [
        {
          label: "効果発動",
          style: "filled",
          color: "primary",
          onClick: onActivateIgnitionEffect || (() => {}),
        },
      ];
    }
  }

  // モンスターカード用のアクション定義（起動効果）
  function getMonsterActions(instanceId: string): CardActionButton[] {
    if (!canActivateIgnitionEffect(instanceId)) {
      return [];
    }
    return [
      {
        label: "効果発動",
        style: "filled",
        color: "primary",
        onClick: onActivateIgnitionEffect || (() => {}),
      },
    ];
  }
</script>

<!-- ゾーン用 Snippets -->
{#snippet fieldZone(placeholderText: string)}
  {@const card = fieldCards[0]}
  {@const instanceId = card?.instanceId}
  {@const isAnimating = instanceId ? animatingInstanceIds.has(instanceId) : false}
  <div bind:this={fieldZoneElement} class="flex justify-center">
    {#if card && instanceId && !isAnimating}
      <div bind:this={fieldCardElements[instanceId]}>
        <ActivatableCard
          card={card.card}
          {instanceId}
          faceDown={card.faceDown}
          isSelected={selectedFieldCardInstanceId === instanceId}
          isActivatable={getFieldSpellActions(instanceId, card.faceDown).length > 0}
          onSelect={handleCardClick}
          actionButtons={getFieldSpellActions(instanceId, card.faceDown)}
          onCancel={onCancelFieldCardSelection || (() => {})}
          size={cardSize}
          showDetailOnClick={true}
        />
      </div>
    {:else}
      <div class="relative">
        <div style="filter: sepia(0.3) hue-rotate(90deg) saturate(1.5) brightness(0.9);">
          <CardComponent placeholder={true} {placeholderText} size={cardSize} />
        </div>
        <!-- アニメーション中: 位置取得用の透明要素 -->
        {#if card && instanceId && isAnimating}
          <div bind:this={fieldCardElements[instanceId]} class="absolute inset-0 opacity-0 pointer-events-none">
            <ActivatableCard
              card={card.card}
              {instanceId}
              faceDown={card.faceDown}
              isSelected={false}
              isActivatable={false}
              onSelect={() => {}}
              actionButtons={[]}
              onCancel={() => {}}
              size={cardSize}
            />
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet monsterZone(i: number)}
  {@const card = monsterCards[i]}
  {@const instanceId = card?.instanceId}
  {@const isAnimating = instanceId ? animatingInstanceIds.has(instanceId) : false}
  <div class="flex justify-center">
    {#if card && instanceId && !isAnimating}
      <div bind:this={fieldCardElements[instanceId]}>
        <ActivatableCard
          card={card.card}
          {instanceId}
          faceDown={card.faceDown}
          rotation={card.rotation || 0}
          isSelected={selectedFieldCardInstanceId === instanceId}
          isActivatable={getMonsterActions(instanceId).length > 0}
          onSelect={handleCardClick}
          actionButtons={getMonsterActions(instanceId)}
          onCancel={onCancelFieldCardSelection || (() => {})}
          size={cardSize}
          showDetailOnClick={true}
          spellCounterCount={card.spellCounterCount || 0}
        />
      </div>
    {:else}
      <div class="relative">
        <div style="filter: sepia(0.5) hue-rotate(30deg) saturate(1.8) brightness(0.85);">
          <CardComponent placeholder={true} placeholderText="M{i + 1}" size={cardSize} />
        </div>
        <!-- アニメーション中: 位置取得用の透明要素 -->
        {#if card && instanceId && isAnimating}
          <div bind:this={fieldCardElements[instanceId]} class="absolute inset-0 opacity-0 pointer-events-none">
            <ActivatableCard
              card={card.card}
              {instanceId}
              faceDown={card.faceDown}
              rotation={card.rotation || 0}
              isSelected={false}
              isActivatable={false}
              onSelect={() => {}}
              actionButtons={[]}
              onCancel={() => {}}
              size={cardSize}
              spellCounterCount={card.spellCounterCount || 0}
            />
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet spellTrapZone(i: number)}
  {@const card = spellTrapCards[i]}
  {@const instanceId = card?.instanceId}
  {@const isAnimating = instanceId ? animatingInstanceIds.has(instanceId) : false}
  <div class="flex justify-center">
    {#if card && instanceId && !isAnimating}
      <div bind:this={fieldCardElements[instanceId]}>
        {#if card.faceDown}
          <ActivatableCard
            card={card.card}
            {instanceId}
            faceDown={true}
            isSelected={selectedFieldCardInstanceId === instanceId}
            isActivatable={getSetSpellActions(instanceId).length > 0}
            onSelect={handleCardClick}
            actionButtons={getSetSpellActions(instanceId)}
            onCancel={onCancelFieldCardSelection || (() => {})}
            size={cardSize}
            showDetailOnClick={true}
          />
        {:else}
          <CardComponent
            card={card.card}
            faceDown={false}
            size={cardSize}
            clickable={true}
            showDetailOnClick={true}
            onClick={() => handleCardClick(card.card, instanceId)}
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
          <div bind:this={fieldCardElements[instanceId]} class="absolute inset-0 opacity-0 pointer-events-none">
            {#if card.faceDown}
              <ActivatableCard
                card={card.card}
                {instanceId}
                faceDown={true}
                isSelected={false}
                isActivatable={false}
                onSelect={() => {}}
                actionButtons={[]}
                onCancel={() => {}}
                size={cardSize}
              />
            {:else}
              <CardComponent card={card.card} faceDown={false} size={cardSize} clickable={false} />
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet graveyardZone()}
  <div class="flex justify-center">
    <Graveyard cards={graveyardCards} size={cardSize} {animatingInstanceIds} />
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
