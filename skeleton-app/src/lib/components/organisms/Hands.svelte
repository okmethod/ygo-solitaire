<script lang="ts">
  import Card from "$lib/components/atoms/Card.svelte";
  import type { Card as CardType } from "$lib/types/card";

  interface HandsProps {
    handCards?: number;
    cards?: CardType[];
  }

  let { handCards = 5, cards = [] }: HandsProps = $props();

  // サンプルカードデータを生成
  function generateSampleCards(count: number): CardType[] {
    const sampleCards: CardType[] = [];
    for (let i = 0; i < count; i++) {
      sampleCards.push({
        id: 100000 + i + 1, // 数値IDに変更
        name: `手札${i + 1}`,
        type: "monster",
        description: `サンプルカード${i + 1}の効果説明です。`,
        monster: {
          attack: Math.floor(Math.random() * 3000) + 500,
          defense: Math.floor(Math.random() * 2500) + 200,
          level: Math.floor(Math.random() * 8) + 1,
          attribute: "光",
          race: "戦士族",
        },
      });
    }
    return sampleCards;
  }

  // カードデータまたはサンプルデータを使用
  const displayCards = $derived(cards.length > 0 ? cards : generateSampleCards(handCards));

  // カードクリック処理
  function handleCardClick(card: CardType) {
    console.log("Card clicked:", card.name);
  }

  // カードホバー処理
  function handleCardHover(card: CardType | null) {
    // ホバー時の処理（必要に応じて実装）
    console.log("Card hover:", card?.name || "none");
  }
</script>

<div class="card p-2 max-w-6xl mx-auto">
  <div class="transition-all duration-300">
    <div class="grid grid-cols-7 gap-2 md:gap-2 sm:gap-1 mb-4">
      <div></div>
      {#each displayCards as card, index (index)}
        <div class="flex justify-center">
          <Card
            {card}
            size="medium"
            clickable={true}
            selectable={false}
            animate={true}
            onClick={handleCardClick}
            onHover={handleCardHover}
          />
        </div>
      {/each}
      {#each [...Array(Math.max(0, handCards - displayCards.length)).keys()] as i (i)}
        <div class="flex justify-center">
          <Card placeholder={true} placeholderText="H{displayCards.length + i + 1}" size="medium" />
        </div>
      {/each}
    </div>
  </div>
</div>
