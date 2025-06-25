<script lang="ts">
</script>

<div class="container mx-auto p-4">
  <header class="mb-8">
    <h1 class="h1 text-center mb-4">遊戯王ソリティア</h1>
    <p class="text-center text-lg opacity-75">1ターンキルコンボシミュレーター</p>
  </header>

  <main class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- プレイヤー情報 -->
    <div class="card p-4">
      <h3 class="h3 mb-4">プレイヤー情報</h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>ライフポイント:</span>
          <span class="font-bold">8000</span>
        </div>
        <div class="flex justify-between">
          <span>ターン:</span>
          <span class="font-bold">1</span>
        </div>
        <div class="flex justify-between">
          <span>フェーズ:</span>
          <span class="font-bold">メインフェーズ1</span>
        </div>
      </div>
    </div>

    <!-- ゲームボード -->
    <div class="lg:col-span-2">
      <div class="card p-6">
        <h3 class="h3 mb-4 text-center">ゲームボード</h3>

        <!-- フィールド -->
        <div class="grid grid-cols-1 gap-4">
          <!-- モンスターゾーン -->
          <div class="border-2 border-dashed border-surface-400 p-4 rounded-lg">
            <h4 class="h4 mb-2 text-center">モンスターゾーン</h4>
            <div class="grid grid-cols-5 gap-2 min-h-24">
              {#each Array(5) as _, i}
                <div
                  class="border border-surface-300 rounded aspect-[3/4] flex items-center justify-center bg-surface-100-800-token"
                >
                  <span class="text-xs opacity-50">M{i + 1}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- 魔法・罠ゾーン -->
          <div class="border-2 border-dashed border-surface-400 p-4 rounded-lg">
            <h4 class="h4 mb-2 text-center">魔法・罠ゾーン</h4>
            <div class="grid grid-cols-5 gap-2 min-h-24">
              {#each Array(5) as _, i}
                <div
                  class="border border-surface-300 rounded aspect-[3/4] flex items-center justify-center bg-surface-100-800-token"
                >
                  <span class="text-xs opacity-50">S{i + 1}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- 操作ボタン -->
        <div class="mt-6 flex justify-center gap-4">
          <button class="btn variant-filled-primary"> コンボ開始 </button>
          <button class="btn variant-outline-surface"> リセット </button>
        </div>
      </div>
    </div>

    <!-- 追加情報 -->
    <div class="lg:col-span-3">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 手札 -->
        <div class="card p-4">
          <h4 class="h4 mb-2">手札 (5枚)</h4>
          <div class="flex gap-1 overflow-x-auto">
            {#each Array(5) as _, i}
              <div
                class="border border-surface-300 rounded aspect-[3/4] w-12 flex-shrink-0 bg-surface-100-800-token flex items-center justify-center"
              >
                <span class="text-xs opacity-50">{i + 1}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- 墓地 -->
        <div class="card p-4">
          <h4 class="h4 mb-2">墓地 (0枚)</h4>
          <div
            class="border border-surface-300 rounded aspect-[3/4] w-16 bg-surface-50-900-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50">墓地</span>
          </div>
        </div>

        <!-- エクストラデッキ -->
        <div class="card p-4">
          <h4 class="h4 mb-2">エクストラデッキ (15枚)</h4>
          <div
            class="border border-surface-300 rounded aspect-[3/4] w-16 bg-surface-100-800-token flex items-center justify-center"
          >
            <span class="text-xs opacity-50">EX</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
