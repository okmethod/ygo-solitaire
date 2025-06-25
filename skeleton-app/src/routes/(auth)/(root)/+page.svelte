<script lang="ts">
  import { navigateTo } from "$lib/utils/navigation";

  function navigateToSimulator() {
    navigateTo("/simulator");
  }
</script>

<div class="container mx-auto p-8">
  <div class="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
    <header class="text-center">
      <h1 class="h1 mb-4">遊戯王ソリティア</h1>
      <p class="text-xl opacity-75 mb-8">1ターンキルコンボシミュレーター</p>
      <p class="text-base opacity-60 max-w-2xl">
        固定のデッキレシピで先行1ターン目をプレイし、勝利条件を満たすことを目的とするシミュレーションゲームです。
      </p>
    </header>

    <div class="flex flex-col items-center space-y-6">
      <button class="btn variant-filled-primary text-lg px-8 py-4" on:click={navigateToSimulator}>
        シミュレーター開始
      </button>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div class="card p-6 text-center">
          <h3 class="h3 mb-3">🎯 目標</h3>
          <p class="text-sm opacity-75">先行1ターン目で相手のライフポイントを0にする1ターンキルコンボを実行</p>
        </div>

        <div class="card p-6 text-center">
          <h3 class="h3 mb-3">🎮 操作</h3>
          <p class="text-sm opacity-75">コンボの各ステップを確認しながら、自動または手動でゲームを進行</p>
        </div>

        <div class="card p-6 text-center">
          <h3 class="h3 mb-3">📚 学習</h3>
          <p class="text-sm opacity-75">複雑なコンボの流れを理解し、遊戯王の戦術を学ぶことができます</p>
        </div>
      </div>
    </div>
  </div>
</div>
