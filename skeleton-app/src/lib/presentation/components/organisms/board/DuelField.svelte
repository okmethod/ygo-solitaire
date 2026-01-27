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
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import ActivatableCard, {
    type CardActionButton,
  } from "$lib/presentation/components/molecules/ActivatableCard.svelte";
  import Graveyard from "$lib/presentation/components/organisms/board/Graveyard.svelte";
  import ExtraDeck from "$lib/presentation/components/organisms/board/ExtraDeck.svelte";
  import MainDeck from "$lib/presentation/components/organisms/board/MainDeck.svelte";
  import type { Card } from "$lib/presentation/types/card";
  import { gameFacade } from "$lib/application/GameFacade";

  // ゾーン数の定数
  const ZONE_COUNT = 5;
  const zones = [...Array(ZONE_COUNT).keys()];

  /**
   * カードと位置・表示状態を含む型
   */
  interface CardWithPosition {
    card: Card;
    instanceId: string; // カードインスタンスID
    faceDown: boolean;
    rotation?: number; // 守備表示時の回転角度
  }

  /**
   * DuelField コンポーネントのプロパティ
   */
  interface DuelFieldProps {
    deckCards: number;
    extraDeckCards: Card[];
    graveyardCards: Card[];
    fieldCards: CardWithPosition[];
    monsterCards: (CardWithPosition | null)[];
    spellTrapCards: (CardWithPosition | null)[];
    selectedFieldCardInstanceId: string | null; // 選択されたフィールドカードのinstanceId
    onFieldCardClick?: (card: Card, instanceId: string) => void;
    onActivateSetSpell?: (card: Card, instanceId: string) => void; // セット魔法カード発動
    onActivateIgnitionEffect?: (card: Card, instanceId: string) => void; // 起動効果発動
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
  function handleCardClick(card: Card, instanceId: string) {
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

  // モンスターカード用のアクション定義（現時点では起動効果なし）
  function getMonsterActions(): CardActionButton[] {
    return [];
  }
</script>

<div class="card p-2 max-w-6xl mx-auto">
  <div class="transition-all duration-300">
    <div class="grid grid-cols-7 gap-2 md:gap-2 sm:gap-1 mb-4">
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
            size="medium"
            showDetailOnClick={true}
          />
        {:else}
          <div class="relative">
            <!-- プレースホルダー色調：緑 -->
            <div style="filter: sepia(0.3) hue-rotate(90deg) saturate(1.5) brightness(0.9);">
              <CardComponent placeholder={true} placeholderText="フィールド" size="medium" />
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
              isActivatable={true}
              onSelect={handleCardClick}
              actionButtons={getMonsterActions()}
              onCancel={onCancelFieldCardSelection || (() => {})}
              size="medium"
              showDetailOnClick={true}
            />
          {:else}
            <div class="relative">
              <!-- プレースホルダー色調：橙 -->
              <div style="filter: sepia(0.5) hue-rotate(30deg) saturate(1.8) brightness(0.85);">
                <CardComponent placeholder={true} placeholderText="M{i + 1}" size="medium" />
              </div>
            </div>
          {/if}
        </div>
      {/each}

      <!-- 墓地 -->
      <div class="flex justify-center">
        <Graveyard cards={graveyardCards} size="medium" />
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2 md:gap-2 sm:gap-1 mb-4">
      <!-- エクストラデッキ -->
      <div class="flex justify-center">
        <ExtraDeck cards={extraDeckCards} size="medium" />
      </div>

      <!-- 魔法・罠ゾーン (5つ) -->
      {#each zones as i (i)}
        <div class="flex justify-center">
          {#if spellTrapCards[i]}
            {#if spellTrapCards[i].faceDown}
              <!-- セットされた魔法・罠はActivatableCardで選択可能 -->
              <ActivatableCard
                card={spellTrapCards[i].card}
                instanceId={spellTrapCards[i].instanceId}
                faceDown={true}
                isSelected={selectedFieldCardInstanceId === spellTrapCards[i].instanceId}
                isActivatable={getSetSpellActions(spellTrapCards[i].instanceId).length > 0}
                onSelect={handleCardClick}
                actionButtons={getSetSpellActions(spellTrapCards[i].instanceId)}
                onCancel={onCancelFieldCardSelection || (() => {})}
                size="medium"
                showDetailOnClick={true}
              />
            {:else}
              <!-- 表側表示の魔法・罠は通常のCardComponent -->
              <CardComponent
                card={spellTrapCards[i].card}
                faceDown={false}
                size="medium"
                clickable={true}
                showDetailOnClick={true}
                onClick={() =>
                  spellTrapCards[i] && handleCardClick(spellTrapCards[i].card, spellTrapCards[i].instanceId)}
              />
            {/if}
          {:else}
            <div class="relative">
              <!-- プレースホルダー色調：青 -->
              <div style="filter: sepia(0.4) hue-rotate(200deg) saturate(2) brightness(0.8);">
                <CardComponent placeholder={true} placeholderText="S{i + 1}" size="medium" />
              </div>
            </div>
          {/if}
        </div>
      {/each}

      <!-- メインデッキ -->
      <div class="flex justify-center">
        <MainDeck cardCount={deckCards} size="medium" />
      </div>
    </div>
  </div>
</div>
