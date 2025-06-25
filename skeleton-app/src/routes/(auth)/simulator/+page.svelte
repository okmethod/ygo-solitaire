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
      <!-- 相手フィールド（上部・反転表示） -->
      <div class="mb-8 rotate-180">
        <div class="grid grid-cols-7 gap-2 mb-4">
          <!-- 相手エクストラデッキ -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50 rotate-180">EX</span>
          </div>

          <!-- 相手モンスターゾーン (5つ) -->
          {#each Array(5) as _, i}
            <div
              class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
            >
              <span class="text-xs opacity-50 rotate-180">M{i + 1}</span>
            </div>
          {/each}

          <!-- 相手墓地 -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-50-900-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50 rotate-180">墓地</span>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-2 mb-4">
          <!-- 相手デッキ -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50 rotate-180">デッキ</span>
          </div>

          <!-- 相手魔法・罠ゾーン (5つ) -->
          {#each Array(5) as _, i}
            <div
              class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
            >
              <span class="text-xs opacity-50 rotate-180">S{i + 1}</span>
            </div>
          {/each}

          <!-- フィールド魔法ゾーン -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-200-700-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50 rotate-180">フィールド</span>
          </div>
        </div>
      </div>

      <!-- プレイヤー情報 -->
      <div class="grid grid-cols-2 gap-8 my-6">
        <div class="text-center">
          <h3 class="h4 mb-2">相手</h3>
          <div class="text-xl font-bold">LP: 8000</div>
        </div>
        <div class="text-center">
          <h3 class="h4 mb-2">自分</h3>
          <div class="text-xl font-bold">LP: 8000</div>
          <div class="text-sm opacity-75">ターン: 1 | メインフェーズ1</div>
        </div>
      </div>

      <!-- 自分フィールド（下部） -->
      <div>
        <div class="grid grid-cols-7 gap-2 mb-4">
          <!-- 自分デッキ -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50">デッキ</span>
            <span class="text-xs opacity-50 mt-1">40枚</span>
          </div>

          <!-- 自分魔法・罠ゾーン (5つ) -->
          {#each Array(5) as _, i}
            <div
              class="border border-surface-300 rounded aspect-[3/4] bg-surface-100-800-token flex items-center justify-center"
            >
              <span class="text-xs opacity-50">S{i + 1}</span>
            </div>
          {/each}

          <!-- フィールド魔法ゾーン -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-200-700-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50">フィールド</span>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-2 mb-4">
          <!-- 自分エクストラデッキ -->
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

          <!-- 自分墓地 -->
          <div
            class="border border-surface-300 rounded aspect-[3/4] bg-surface-50-900-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50">墓地</span>
            <span class="text-xs opacity-50 mt-1">0枚</span>
          </div>
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
      </div>
    </div>

    <!-- 操作パネル -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card p-6">
        <h3 class="h3 mb-4">ゲーム操作</h3>
        <div class="flex flex-col gap-3">
          <button class="btn variant-filled-primary"> コンボ開始 </button>
          <button class="btn variant-outline-surface"> 次のステップ </button>
          <button class="btn variant-outline-surface"> リセット </button>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="h3 mb-4">ゲーム情報</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>フェーズ:</span>
            <span class="font-bold">メインフェーズ1</span>
          </div>
          <div class="flex justify-between">
            <span>手順:</span>
            <span class="font-bold">1 / 20</span>
          </div>
          <div class="flex justify-between">
            <span>コンボ:</span>
            <span class="font-bold">準備中</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
