<script lang="ts">
  /**
   * CardStackModal - カードスタック表示モーダル
   *
   * 墓地やエクストラデッキなど、カードの一覧を表示するモーダル。
   * - デフォルト: 順序保持の個別表示（墓地のLIFO順序を反映）
   * - オプション: 集約表示（同名カードをまとめて枚数表示）
   */
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import type { CardDisplayData } from "$lib/presentation/types";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import CountBadge from "$lib/presentation/components/atoms/CountBadge.svelte";

  interface CardStackModalProps {
    cards: CardDisplayData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    emptyMessage?: string;
    borderColor?: string;
  }

  let {
    cards,
    open,
    onOpenChange,
    title,
    emptyMessage = "カードがありません",
    borderColor = "border-gray-400",
  }: CardStackModalProps = $props();

  // 直近に捨てたカードが先頭に来るよう反転したリスト
  const reverseCards = cards.slice().reverse();

  // 集約表示モードの状態
  let isAggregated = $state(false);

  // 集約表示用のデータ構造
  interface AggregatedCard {
    card: CardDisplayData;
    quantity: number;
  }

  // 集約表示用データを生成
  const aggregatedCards = () => {
    const cardMap = new Map<number, AggregatedCard>();

    reverseCards.forEach((card) => {
      const existing = cardMap.get(card.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cardMap.set(card.id, { card, quantity: 1 });
      }
    });

    return Array.from(cardMap.values());
  };

  function handleOpenChange(details: { open: boolean }) {
    onOpenChange(details.open);
  }

  function modalClose() {
    onOpenChange(false);
  }

  function toggleAggregation() {
    isAggregated = !isAggregated;
  }
</script>

<Modal
  {open}
  onOpenChange={handleOpenChange}
  contentBase="card bg-surface-100-900 p-6 mx-auto space-y-4 shadow-xl w-[95vw] md:max-w-4xl max-h-[90vh] overflow-auto"
  backdropClasses="backdrop-blur-sm"
>
  {#snippet content()}
    <header class="flex justify-between items-center mb-4">
      <h2 class="text-2xl sm:text-3xl font-bold mx-2">{title}</h2>
      <div class="flex items-center gap-2">
        <!-- 集約表示トグル -->
        <button
          type="button"
          class="btn btn-sm {isAggregated ? 'preset-filled-primary-500' : 'preset-tonal'}"
          onclick={toggleAggregation}
          title={isAggregated ? "個別表示に切り替え" : "集約表示に切り替え"}
        >
          <Icon icon={isAggregated ? "mdi:card-multiple" : "mdi:cards"} class="size-4" />
          <span class="text-xs">{isAggregated ? "集約" : "個別"}</span>
        </button>
        <!-- 閉じるボタン -->
        <button type="button" class="btn preset-tonal rounded-full" onclick={modalClose}>
          <Icon icon="mdi:close" class="size-4" />
        </button>
      </div>
    </header>

    <!-- カード枚数表示 -->
    <div class="text-sm text-surface-600-300-token mb-2">
      {cards.length}枚
    </div>

    {#if cards.length > 0}
      <div class="flex gap-2 flex-wrap">
        {#if isAggregated}
          <!-- 集約表示モード -->
          {#each aggregatedCards() as { card, quantity } (card.id)}
            <div class="relative">
              <div class="border-2 {borderColor} rounded-lg shadow-md overflow-hidden">
                <CardComponent {card} size="medium" showDetailOnClick={true} />
              </div>
              {#if quantity > 1}
                <CountBadge count={quantity} colorClasses="bg-primary-200 text-primary-900" />
              {/if}
            </div>
          {/each}
        {:else}
          <!-- 個別表示モード（順序保持） -->
          {#each reverseCards as card, index (index)}
            <div class="relative">
              <div class="border-2 {borderColor} rounded-lg shadow-md overflow-hidden">
                <CardComponent {card} size="medium" showDetailOnClick={true} />
              </div>
            </div>
          {/each}
        {/if}
      </div>
    {:else}
      <div class="text-center py-8">
        <p class="text-gray-500">{emptyMessage}</p>
      </div>
    {/if}
  {/snippet}
</Modal>
