<script lang="ts">
  import CardComponent from "$lib/components/atoms/Card.svelte";
  import Graveyard from "$lib/components/organisms/Graveyard.svelte";
  import ExtraDeck from "$lib/components/organisms/ExtraDeck.svelte";
  import type { Card } from "$lib/types/card";

  // ゾーン数の定数
  const ZONE_COUNT = 5;
  const zones = [...Array(ZONE_COUNT).keys()];

  interface DuelFieldProps {
    deckCards?: number;
    extraDeckCards?: Card[];
    graveyardCards?: Card[];
    fieldCards?: Card[];
    monsterCards?: Card[];
    spellTrapCards?: Card[];
  }

  let {
    deckCards = 40,
    extraDeckCards = [],
    graveyardCards = [],
    fieldCards = [],
    monsterCards = [],
    spellTrapCards = [],
  }: DuelFieldProps = $props();

  // カードクリック処理
  function handleCardClick(card: Card) {
    console.log("Card clicked:", card.name);
  }

  // デッキクリック処理
  function handleDeckClick() {
    console.log("Deck clicked");
  }
</script>

<div class="card p-2 max-w-6xl mx-auto">
  <div class="transition-all duration-300">
    <div class="grid grid-cols-7 gap-2 md:gap-2 sm:gap-1 mb-4">
      <!-- フィールド魔法ゾーン -->
      <div class="flex justify-center">
        {#if fieldCards.length > 0}
          <CardComponent card={fieldCards[0]} size="medium" clickable={true} onClick={handleCardClick} />
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
            <CardComponent
              card={monsterCards[i]}
              size="medium"
              clickable={true}
              selectable={true}
              onClick={handleCardClick}
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
            <CardComponent card={spellTrapCards[i]} size="medium" clickable={true} onClick={handleCardClick} />
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
        <CardComponent
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
