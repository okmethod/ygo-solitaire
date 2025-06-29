<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import CardList from "$lib/components/organisms/CardList.svelte";
  import type { Card, CardData } from "$lib/types/card";
  import type { LoadedCardEntry } from "$lib/types/deck";

  interface CardListModalProps {
    cards: Card[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    emptyMessage?: string;
    borderColor?: string;
  }

  // Modal用のOpenChangeDetailsに対応するラッパー
  function handleOpenChange(details: { open: boolean }) {
    onOpenChange(details.open);
  }

  let {
    cards,
    open,
    onOpenChange,
    title,
    emptyMessage = "カードがありません",
    borderColor = "border-gray-400",
  }: CardListModalProps = $props();

  // 同名カードを集約して LoadedCardEntry に変換
  const cardEntries = $derived((): LoadedCardEntry[] => {
    const cardMap = new Map<number, LoadedCardEntry>();

    cards.forEach((card) => {
      const existing = cardMap.get(card.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cardMap.set(card.id, {
          cardData: card as CardData, // Card を CardData にキャスト
          quantity: 1,
        });
      }
    });

    return Array.from(cardMap.values());
  });

  function modalClose() {
    onOpenChange(false);
  }
</script>

<Modal
  {open}
  onOpenChange={handleOpenChange}
  contentBase="card bg-surface-100-900 p-6 mx-auto space-y-4 shadow-xl max-w-4xl max-h-[90vh] overflow-auto"
  backdropClasses="backdrop-blur-sm"
>
  {#snippet content()}
    <header class="flex justify-between items-center mb-4">
      <h2 class="text-2xl sm:text-3xl font-bold">{title}</h2>
      <button type="button" class="btn preset-tonal rounded-full" onclick={modalClose}>
        <Icon icon="mdi:close" class="size-4" />
      </button>
    </header>

    {#if cards.length > 0}
      <CardList cards={cardEntries()} {borderColor} />
    {:else}
      <div class="text-center py-8">
        <p class="text-gray-500">{emptyMessage}</p>
      </div>
    {/if}
  {/snippet}
</Modal>
