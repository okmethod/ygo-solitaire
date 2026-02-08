<script lang="ts">
  /**
   * DuelField - ゲーム盤面表示コンポーネント
   *
   * フィールド魔法ゾーン、モンスターゾーン、魔法罠ゾーン、墓地、デッキを表示・操作する。
   *
   * ARCH: Presentation Layer - レイヤー依存ルール
   * - Presentation Layer は Application Layer（GameFacade、Stores）のみに依存する
   * - Domain Layer（Command、Rule等）を直接 import してはいけない
   * - 全てのゲームロジック呼び出しは GameFacade 経由で行う
   *
   * @module presentation/components/organisms/board/DuelField
   */
  import type { CardDisplayData } from "$lib/presentation/types";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";
  import { gameFacade } from "$lib/application/GameFacade";
  import { isMobile } from "$lib/presentation/utils/mobile";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import ActivatableCard, {
    type CardActionButton,
  } from "$lib/presentation/components/molecules/ActivatableCard.svelte";
  import Graveyard from "./zones/Graveyard.svelte";
  import ExtraDeck from "./zones/ExtraDeck.svelte";
  import MainDeck from "./zones/MainDeck.svelte";

  // ゾーン数の定数
  const ZONE_COUNT = 5;
  const zones = [...Array(ZONE_COUNT).keys()];

  // スマホ判定
  const mobile = isMobile();

  // スマホではカードサイズを小さく
  const cardSize: ComponentSize = mobile ? "small" : "medium";

  /**
   * カードと位置・表示状態を含む型
   */
  interface CardWithPosition {
    card: CardDisplayData;
    instanceId: string; // カードインスタンスID
    faceDown: boolean;
    rotation?: number; // 守備表示時の回転角度
    spellCounterCount?: number; // 魔力カウンター数
  }

  /**
   * DuelField コンポーネントのプロパティ
   */
  interface DuelFieldProps {
    deckCards: number;
    extraDeckCards: CardDisplayData[];
    graveyardCards: CardDisplayData[];
    fieldCards: CardWithPosition[];
    monsterCards: (CardWithPosition | null)[];
    spellTrapCards: (CardWithPosition | null)[];
    selectedFieldCardInstanceId: string | null; // 選択されたフィールドカードのinstanceId
    onFieldCardClick?: (card: CardDisplayData, instanceId: string) => void;
    onActivateSetSpell?: (card: CardDisplayData, instanceId: string) => void; // セット魔法カード発動
    onActivateIgnitionEffect?: (card: CardDisplayData, instanceId: string) => void; // 起動効果発動
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
    onFieldCardClick,
    onActivateSetSpell,
    onActivateIgnitionEffect,
    onCancelFieldCardSelection,
  }: DuelFieldProps = $props();

  // カードクリック処理
  function handleCardClick(card: CardDisplayData, instanceId: string) {
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

<div class="card p-2 max-w-6xl mx-auto">
  <div class="transition-all duration-300">
    {#if mobile}
      <!-- スマホレイアウト: 3行構成 -->
      <!-- 1行目: フィールドゾーン / EXデッキ / デッキ / 墓地 -->
      <div class="grid grid-cols-4 gap-1 mb-2">
        <!-- フィールド魔法ゾーン -->
        <div class="flex justify-center">
          {#if fieldCards.length > 0}
            <ActivatableCard
              card={fieldCards[0].card}
              instanceId={fieldCards[0].instanceId}
              faceDown={fieldCards[0].faceDown}
              isSelected={selectedFieldCardInstanceId === fieldCards[0].instanceId}
              isActivatable={getFieldSpellActions(fieldCards[0].instanceId, fieldCards[0].faceDown).length > 0}
              onSelect={handleCardClick}
              actionButtons={getFieldSpellActions(fieldCards[0].instanceId, fieldCards[0].faceDown)}
              onCancel={onCancelFieldCardSelection || (() => {})}
              size={cardSize}
              showDetailOnClick={true}
            />
          {:else}
            <div class="relative">
              <div style="filter: sepia(0.3) hue-rotate(90deg) saturate(1.5) brightness(0.9);">
                <CardComponent placeholder={true} placeholderText="F" size={cardSize} />
              </div>
            </div>
          {/if}
        </div>
        <!-- エクストラデッキ -->
        <div class="flex justify-center">
          <ExtraDeck cards={extraDeckCards} size={cardSize} />
        </div>
        <!-- メインデッキ -->
        <div class="flex justify-center">
          <MainDeck cardCount={deckCards} size={cardSize} />
        </div>
        <!-- 墓地 -->
        <div class="flex justify-center">
          <Graveyard cards={graveyardCards} size={cardSize} />
        </div>
      </div>

      <!-- 2行目: モンスターゾーン (5枚) -->
      <div class="grid grid-cols-5 gap-1 mb-2">
        {#each zones as i (i)}
          <div class="flex justify-center">
            {#if monsterCards[i]}
              <ActivatableCard
                card={monsterCards[i].card}
                instanceId={monsterCards[i].instanceId}
                faceDown={monsterCards[i].faceDown}
                rotation={monsterCards[i].rotation || 0}
                isSelected={selectedFieldCardInstanceId === monsterCards[i].instanceId}
                isActivatable={getMonsterActions(monsterCards[i].instanceId).length > 0}
                onSelect={handleCardClick}
                actionButtons={getMonsterActions(monsterCards[i].instanceId)}
                onCancel={onCancelFieldCardSelection || (() => {})}
                size={cardSize}
                showDetailOnClick={true}
                spellCounterCount={monsterCards[i].spellCounterCount || 0}
              />
            {:else}
              <div class="relative">
                <div style="filter: sepia(0.5) hue-rotate(30deg) saturate(1.8) brightness(0.85);">
                  <CardComponent placeholder={true} placeholderText="M{i + 1}" size={cardSize} />
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- 3行目: 魔法罠ゾーン (5枚) -->
      <div class="grid grid-cols-5 gap-1 mb-2">
        {#each zones as i (i)}
          <div class="flex justify-center">
            {#if spellTrapCards[i]}
              {#if spellTrapCards[i].faceDown}
                <ActivatableCard
                  card={spellTrapCards[i].card}
                  instanceId={spellTrapCards[i].instanceId}
                  faceDown={true}
                  isSelected={selectedFieldCardInstanceId === spellTrapCards[i].instanceId}
                  isActivatable={getSetSpellActions(spellTrapCards[i].instanceId).length > 0}
                  onSelect={handleCardClick}
                  actionButtons={getSetSpellActions(spellTrapCards[i].instanceId)}
                  onCancel={onCancelFieldCardSelection || (() => {})}
                  size={cardSize}
                  showDetailOnClick={true}
                />
              {:else}
                <CardComponent
                  card={spellTrapCards[i].card}
                  faceDown={false}
                  size={cardSize}
                  clickable={true}
                  showDetailOnClick={true}
                  onClick={() =>
                    spellTrapCards[i] && handleCardClick(spellTrapCards[i].card, spellTrapCards[i].instanceId)}
                />
              {/if}
            {:else}
              <div class="relative">
                <div style="filter: sepia(0.4) hue-rotate(200deg) saturate(2) brightness(0.8);">
                  <CardComponent placeholder={true} placeholderText="S{i + 1}" size={cardSize} />
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <!-- PCレイアウト: 2行構成 -->
      <!-- 1行目: フィールドゾーン / モンスターゾーン(5枚) / 墓地 -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        <!-- フィールド魔法ゾーン -->
        <div class="flex justify-center">
          {#if fieldCards.length > 0}
            <ActivatableCard
              card={fieldCards[0].card}
              instanceId={fieldCards[0].instanceId}
              faceDown={fieldCards[0].faceDown}
              isSelected={selectedFieldCardInstanceId === fieldCards[0].instanceId}
              isActivatable={getFieldSpellActions(fieldCards[0].instanceId, fieldCards[0].faceDown).length > 0}
              onSelect={handleCardClick}
              actionButtons={getFieldSpellActions(fieldCards[0].instanceId, fieldCards[0].faceDown)}
              onCancel={onCancelFieldCardSelection || (() => {})}
              size={cardSize}
              showDetailOnClick={true}
            />
          {:else}
            <div class="relative">
              <div style="filter: sepia(0.3) hue-rotate(90deg) saturate(1.5) brightness(0.9);">
                <CardComponent placeholder={true} placeholderText="フィールド" size={cardSize} />
              </div>
            </div>
          {/if}
        </div>

        <!-- モンスターゾーン (5つ) -->
        {#each zones as i (i)}
          <div class="flex justify-center">
            {#if monsterCards[i]}
              <ActivatableCard
                card={monsterCards[i].card}
                instanceId={monsterCards[i].instanceId}
                faceDown={monsterCards[i].faceDown}
                rotation={monsterCards[i].rotation || 0}
                isSelected={selectedFieldCardInstanceId === monsterCards[i].instanceId}
                isActivatable={getMonsterActions(monsterCards[i].instanceId).length > 0}
                onSelect={handleCardClick}
                actionButtons={getMonsterActions(monsterCards[i].instanceId)}
                onCancel={onCancelFieldCardSelection || (() => {})}
                size={cardSize}
                showDetailOnClick={true}
                spellCounterCount={monsterCards[i].spellCounterCount || 0}
              />
            {:else}
              <div class="relative">
                <div style="filter: sepia(0.5) hue-rotate(30deg) saturate(1.8) brightness(0.85);">
                  <CardComponent placeholder={true} placeholderText="M{i + 1}" size={cardSize} />
                </div>
              </div>
            {/if}
          </div>
        {/each}

        <!-- 墓地 -->
        <div class="flex justify-center">
          <Graveyard cards={graveyardCards} size={cardSize} />
        </div>
      </div>

      <!-- 2行目: EXデッキ / 魔法罠ゾーン(5枚) / デッキ -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        <!-- エクストラデッキ -->
        <div class="flex justify-center">
          <ExtraDeck cards={extraDeckCards} size={cardSize} />
        </div>

        <!-- 魔法・罠ゾーン (5つ) -->
        {#each zones as i (i)}
          <div class="flex justify-center">
            {#if spellTrapCards[i]}
              {#if spellTrapCards[i].faceDown}
                <ActivatableCard
                  card={spellTrapCards[i].card}
                  instanceId={spellTrapCards[i].instanceId}
                  faceDown={true}
                  isSelected={selectedFieldCardInstanceId === spellTrapCards[i].instanceId}
                  isActivatable={getSetSpellActions(spellTrapCards[i].instanceId).length > 0}
                  onSelect={handleCardClick}
                  actionButtons={getSetSpellActions(spellTrapCards[i].instanceId)}
                  onCancel={onCancelFieldCardSelection || (() => {})}
                  size={cardSize}
                  showDetailOnClick={true}
                />
              {:else}
                <CardComponent
                  card={spellTrapCards[i].card}
                  faceDown={false}
                  size={cardSize}
                  clickable={true}
                  showDetailOnClick={true}
                  onClick={() =>
                    spellTrapCards[i] && handleCardClick(spellTrapCards[i].card, spellTrapCards[i].instanceId)}
                />
              {/if}
            {:else}
              <div class="relative">
                <div style="filter: sepia(0.4) hue-rotate(200deg) saturate(2) brightness(0.8);">
                  <CardComponent placeholder={true} placeholderText="S{i + 1}" size={cardSize} />
                </div>
              </div>
            {/if}
          </div>
        {/each}

        <!-- メインデッキ -->
        <div class="flex justify-center">
          <MainDeck cardCount={deckCards} size={cardSize} />
        </div>
      </div>
    {/if}
  </div>
</div>
