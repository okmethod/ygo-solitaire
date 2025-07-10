<script lang="ts">
  import { onMount } from "svelte";
  import CardComponent from "$lib/components/atoms/Card.svelte";
  import type { Card } from "$lib/types/card";

  interface CardSelectionModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    cards: Card[];
    maxSelections: number;
    onConfirm: (selectedCards: Card[]) => void;
    onCancel: () => void;
  }

  let { isOpen, title, description, cards, maxSelections, onConfirm, onCancel }: CardSelectionModalProps = $props();

  let selectedCards = $state<Card[]>([]);
  let modal: HTMLDialogElement;

  // モーダルの開閉制御
  $effect(() => {
    if (isOpen && modal) {
      modal.showModal();
      selectedCards = []; // 選択をリセット
    } else if (!isOpen && modal) {
      modal.close();
    }
  });

  // カード選択ハンドリング
  function handleCardClick(card: Card) {
    const isSelected = selectedCards.includes(card);

    if (isSelected) {
      // 選択解除
      selectedCards = selectedCards.filter((c) => c !== card);
    } else if (selectedCards.length < maxSelections) {
      // 選択追加
      selectedCards = [...selectedCards, card];
    }
  }

  // 確定ボタン
  function handleConfirm() {
    onConfirm(selectedCards);
  }

  // キャンセルボタン
  function handleCancel() {
    onCancel();
  }

  // カードが選択されているかチェック
  function isCardSelected(card: Card): boolean {
    return selectedCards.includes(card);
  }

  // 確定ボタンの有効性
  const canConfirm = $derived(selectedCards.length === maxSelections);
</script>

<dialog bind:this={modal} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box max-w-4xl">
    <!-- ヘッダー -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg">{title}</h3>
      <button class="btn btn-sm btn-circle btn-ghost" onclick={handleCancel}> ✕ </button>
    </div>

    <!-- 説明文 -->
    <p class="text-sm text-surface-600-300-token mb-4">{description}</p>

    <!-- 選択状況 -->
    <div class="flex justify-between items-center mb-4 p-3 bg-surface-100-800-token rounded-lg">
      <span class="text-sm">
        選択中: {selectedCards.length} / {maxSelections}枚
      </span>
      <div class="flex gap-2">
        {#each selectedCards as card (card.id)}
          <div class="badge badge-primary text-xs">{card.name}</div>
        {/each}
      </div>
    </div>

    <!-- カード選択エリア -->
    <div class="min-h-[200px] max-h-[400px] overflow-y-auto mb-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {#each cards as card (card.id)}
          {@const isSelected = isCardSelected(card)}
          <button
            class="transition-all duration-200 transform hover:scale-105 relative"
            class:ring-2={isSelected}
            class:ring-primary-500={isSelected}
            class:opacity-50={!isSelected && selectedCards.length >= maxSelections}
            onclick={() => handleCardClick(card)}
            disabled={!isSelected && selectedCards.length >= maxSelections}
          >
            <!-- 選択インジケーター -->
            {#if isSelected}
              <div
                class="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10"
              >
                {selectedCards.indexOf(card) + 1}
              </div>
            {/if}

            <CardComponent {card} size="small" clickable={false} selectable={false} animate={true} />
          </button>
        {/each}
      </div>
    </div>

    <!-- ボタンエリア -->
    <div class="modal-action">
      <button class="btn btn-ghost" onclick={handleCancel}> キャンセル </button>
      <button class="btn btn-primary" onclick={handleConfirm} disabled={!canConfirm}>
        確定 ({selectedCards.length}/{maxSelections})
      </button>
    </div>
  </div>

  <!-- 背景クリックでキャンセル -->
  <form method="dialog" class="modal-backdrop">
    <button onclick={handleCancel}>close</button>
  </form>
</dialog>
