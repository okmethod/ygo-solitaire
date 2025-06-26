<script lang="ts">
  interface GameBoardProps {
    playerLifePoints?: number;
    opponentLifePoints?: number;
    handCards?: number;
    deckCards?: number;
    extraDeckCards?: number;
    graveyardCards?: number;
  }

  let {
    playerLifePoints = 8000,
    opponentLifePoints = 8000,
    handCards = 5,
    deckCards = 40,
    extraDeckCards = 15,
    graveyardCards = 0,
  }: GameBoardProps = $props();
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

    <!-- プレイヤー情報 -->
    <div
      class="grid grid-cols-3 gap-8 my-6 p-4 rounded-lg bg-surface-50-900-token/20 md:grid-cols-1 md:gap-4 md:text-sm"
    >
      <div class="text-center">
        <h3 class="h4 mb-2">相手</h3>
        <div class="text-xl font-bold text-error-500">LP: {opponentLifePoints.toLocaleString()}</div>
      </div>

      <!-- 手札 -->
      <div class="mt-6">
        <h4 class="h4 text-center mb-4">手札 ({handCards}枚)</h4>
        <div class="flex justify-center gap-2 flex-wrap">
          {#each Array(handCards) as _, i}
            <div
              class="border border-surface-300 rounded aspect-[3/4] w-16 md:w-12 flex items-center justify-center bg-surface-100-800-token hover:bg-surface-200-700-token transition-colors cursor-pointer"
            >
              <span class="text-xs opacity-50 select-none">{i + 1}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="text-center">
        <h3 class="h4 mb-2">自分</h3>
        <div class="text-xl font-bold text-success-500">LP: {playerLifePoints.toLocaleString()}</div>
      </div>
    </div>
  </div>
</div>
