<script lang="ts">
</script>

<div class="container mx-auto p-4">
  <header class="mb-6">
    <h1 class="h1 text-center mb-2">遊戯王ソリティア</h1>
    <p class="text-center text-lg opacity-75">デュエルフィールド</p>
  </header>

  <main class="max-w-6xl mx-auto">
    <!-- ゲームボード -->
    <div class="card p-6 mb-6">
      <!-- 自分フィールド -->
      <div>
        <div class="grid grid-cols-7 gap-2 mb-4">
          <!-- フィールド魔法ゾーン -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-200-700-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50">フィールド</span>
          </div>

          <!-- 魔法・罠ゾーン (5つ) -->
          {#each Array(5) as _, i}
            <div
              class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
            >
              <span class="text-xs opacity-50">S{i + 1}</span>
            </div>
          {/each}

          <!-- 墓地 -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-50-900-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50">墓地</span>
            <span class="text-xs opacity-50 mt-1">0枚</span>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-2 mb-4">
          <!-- エクストラデッキ -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50">EX</span>
            <span class="text-xs opacity-50 mt-1">15枚</span>
          </div>

          <!-- 自分モンスターゾーン (5つ) -->
          {#each Array(5) as _, i}
            <div
              class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
            >
              <span class="text-xs opacity-50">M{i + 1}</span>
            </div>
          {/each}

          <!-- 自分デッキ -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50">デッキ</span>
            <span class="text-xs opacity-50 mt-1">40枚</span>
          </div>
        </div>

        <!-- プレイヤー情報 -->
        <div class="grid grid-cols-3 gap-8 my-6">
          <div class="text-center">
            <h3 class="h4 mb-2">相手</h3>
            <div class="text-xl font-bold">LP: 8000</div>
          </div>

          <!-- 手札 -->
          <div class="mt-6">
            <h4 class="h4 text-center mb-4">手札 (5枚)</h4>
            <div class="flex justify-center gap-2">
              {#each Array(5) as _, i}
                <div
                  class="border border-surface-300 rounded aspect-[3/4] w-16 bg-surface-100-800-token flex items-center justify-center"
                >
                  <span class="text-xs opacity-50">{i + 1}</span>
                </div>
              {/each}
            </div>
          </div>

          <div class="text-center">
            <h3 class="h4 mb-2">自分</h3>
            <div class="text-xl font-bold">LP: 8000</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
