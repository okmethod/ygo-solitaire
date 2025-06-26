<script lang="ts">
  interface GameBoardProps {
    deckCards?: number;
    extraDeckCards?: number;
    graveyardCards?: number;
  }

  let { deckCards = 40, extraDeckCards = 15, graveyardCards = 0 }: GameBoardProps = $props();
</script>

<div class="card p-6 max-w-6xl mx-auto">
  <!-- 自分フィールド -->
  <div class="transition-all duration-300">
    <div class="grid grid-cols-7 gap-2 md:gap-2 sm:gap-1 mb-4">
      <!-- フィールド魔法ゾーン -->
      <div
        class="border border-surface-300 rounded aspect-[3/4] flex items-center justify-center bg-surface-200-700-token transition-all duration-200 hover:border-primary-500"
      >
        <span class="text-xs opacity-50 select-none">フィールド</span>
      </div>

      <!-- 魔法・罠ゾーン (5つ) -->
      {#each Array(5) as _, i}
        <div
          class="border border-surface-300 rounded aspect-[3/4] flex items-center justify-center bg-surface-100-800-token transition-all duration-200 hover:border-primary-500"
        >
          <span class="text-xs opacity-50 select-none">S{i + 1}</span>
        </div>
      {/each}

      <!-- 墓地 -->
      <div
        class="border border-surface-300 rounded aspect-[3/4] flex items-center justify-center bg-surface-50-900-token transition-all duration-200 hover:border-primary-500"
      >
        <div class="flex flex-col items-center">
          <span class="text-xs opacity-50 select-none">墓地</span>
          <span class="text-xs opacity-50 mt-1 select-none">{graveyardCards}枚</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2 md:gap-2 sm:gap-1 mb-4">
      <!-- エクストラデッキ -->
      <div
        class="border border-surface-300 rounded aspect-[3/4] flex items-center justify-center bg-surface-100-800-token transition-all duration-200 hover:border-primary-500"
      >
        <div class="flex flex-col items-center">
          <span class="text-xs opacity-50 select-none">EX</span>
          <span class="text-xs opacity-50 mt-1 select-none">{extraDeckCards}枚</span>
        </div>
      </div>

      <!-- 自分モンスターゾーン (5つ) -->
      {#each Array(5) as _, i}
        <div
          class="border border-surface-300 rounded aspect-[3/4] flex items-center justify-center bg-surface-100-800-token transition-all duration-200 hover:border-primary-500"
        >
          <span class="text-xs opacity-50 select-none">M{i + 1}</span>
        </div>
      {/each}

      <!-- 自分デッキ -->
      <div
        class="border border-surface-300 rounded aspect-[3/4] flex items-center justify-center bg-surface-100-800-token transition-all duration-200 hover:border-primary-500"
      >
        <div class="flex flex-col items-center">
          <span class="text-xs opacity-50 select-none">デッキ</span>
          <span class="text-xs opacity-50 mt-1 select-none">{deckCards}枚</span>
        </div>
      </div>
    </div>
  </div>
</div>
