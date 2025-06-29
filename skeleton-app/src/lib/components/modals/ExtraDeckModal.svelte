<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import CardsSection from "$lib/components/organisms/CardsSection.svelte";
  import type { Card } from "$lib/types/card";

  interface ExtraDeckModalProps {
    cards: Card[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  // Modal用のOpenChangeDetailsに対応するラッパー
  function handleOpenChange(details: { open: boolean }) {
    onOpenChange(details.open);
  }

  let { cards, open, onOpenChange }: ExtraDeckModalProps = $props();

  // カードをLoadedCardEntry形式に変換
  const cardEntries = $derived(
    cards.map((card) => ({
      cardData: card,
      quantity: 1, // エクストラデッキでは各カード1枚ずつ
    })),
  );

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
      <h2 class="text-2xl sm:text-3xl font-bold">エクストラデッキ</h2>
      <button type="button" class="btn preset-tonal rounded-full" onclick={modalClose}>
        <Icon icon="mdi:close" class="size-4" />
      </button>
    </header>

    {#if cards.length > 0}
      <CardsSection
        title="エクストラデッキ"
        cardCount={cards.length}
        cards={cardEntries}
        borderColor="border-purple-400"
      />
    {:else}
      <div class="text-center py-8">
        <p class="text-gray-500">エクストラデッキにカードがありません</p>
      </div>
    {/if}
  {/snippet}
</Modal>
