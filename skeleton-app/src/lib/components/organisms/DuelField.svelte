<script lang="ts">
  import Card from "$lib/components/atoms/Card.svelte";
  import type { Card as CardType } from "$lib/types/card";

  interface DuelFieldProps {
    deckCards?: number;
    extraDeckCards?: number;
    graveyardCards?: number;
    fieldCards?: CardType[];
    monsterCards?: CardType[];
    spellTrapCards?: CardType[];
  }

  let {
    deckCards = 40,
    extraDeckCards = 15,
    graveyardCards = 0,
    fieldCards = [],
    monsterCards = [],
    spellTrapCards = [],
  }: DuelFieldProps = $props();

  // カードクリック処理
  function handleCardClick(card: CardType) {
    console.log("Card clicked:", card.name);
  }

  // デッキクリック処理
  function handleDeckClick() {
    console.log("Deck clicked");
  }

  // 墓地クリック処理
  function handleGraveyardClick() {
    console.log("Graveyard clicked");
  }

  // エクストラデッキクリック処理
  function handleExtraDeckClick() {
    console.log("Extra deck clicked");
  }
</script>

<div class="card p-2 max-w-6xl mx-auto">
  <div class="transition-all duration-300">
    <div class="grid grid-cols-7 gap-2 md:gap-2 sm:gap-1 mb-4">
      <!-- フィールド魔法ゾーン -->
      <div class="flex justify-center">
        {#if fieldCards.length > 0}
          <Card card={fieldCards[0]} size="medium" clickable={true} onClick={handleCardClick} />
        {:else}
          <div class="relative">
            <!-- プレースホルダー色調：緑 -->
            <div style="filter: sepia(0.3) hue-rotate(90deg) saturate(1.5) brightness(0.9);">
              <Card placeholder={true} placeholderText="フィールド" size="medium" />
            </div>
          </div>
        {/if}
      </div>

      <!-- モンスターゾーン (5つ) -->
      {#each Array(5) as _, i}
        <div class="flex justify-center">
          {#if monsterCards[i]}
            <Card card={monsterCards[i]} size="medium" clickable={true} selectable={true} onClick={handleCardClick} />
          {:else}
            <div class="relative">
              <!-- プレースホルダー色調：橙 -->
              <div style="filter: sepia(0.5) hue-rotate(30deg) saturate(1.8) brightness(0.85);">
                <Card placeholder={true} placeholderText="M{i + 1}" size="medium" />
              </div>
            </div>
          {/if}
        </div>
      {/each}

      <!-- 墓地 -->
      <div class="flex justify-center">
        <div class="relative">
          <!-- プレースホルダー色調：グレー -->
          <div style="filter: grayscale(0.8) brightness(0.7) contrast(1.2);">
            <Card
              placeholder={true}
              placeholderText="墓地\n{graveyardCards}枚"
              size="medium"
              clickable={true}
              onClick={handleGraveyardClick}
            />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2 md:gap-2 sm:gap-1 mb-4">
      <!-- エクストラデッキ -->
      <div class="flex justify-center">
        <Card
          placeholder={true}
          placeholderText="EX\n{extraDeckCards}枚"
          size="medium"
          clickable={true}
          onClick={handleExtraDeckClick}
        />
      </div>

      <!-- 魔法・罠ゾーン (5つ) -->
      {#each Array(5) as _, i}
        <div class="flex justify-center">
          {#if spellTrapCards[i]}
            <Card card={spellTrapCards[i]} size="medium" clickable={true} onClick={handleCardClick} />
          {:else}
            <div class="relative">
              <!-- プレースホルダー色調：青 -->
              <div style="filter: sepia(0.4) hue-rotate(200deg) saturate(2) brightness(0.8);">
                <Card placeholder={true} placeholderText="S{i + 1}" size="medium" />
              </div>
            </div>
          {/if}
        </div>
      {/each}

      <!-- メインデッキ -->
      <div class="flex justify-center">
        <Card
          placeholder={true}
          placeholderText="デッキ\n{deckCards}枚"
          size="medium"
          clickable={true}
          onClick={handleDeckClick}
        />
      </div>
    </div>
  </div>
</div>
