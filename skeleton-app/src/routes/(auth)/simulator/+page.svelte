<script lang="ts">
  import GameBoard from "$lib/components/organisms/GameBoard.svelte";
  import PlayerInfo from "$lib/components/organisms/PlayerInfo.svelte";

  let gameState = {
    playerLifePoints: 8000,
    opponentLifePoints: 8000,
    currentTurn: 1,
    currentPhase: "メインフェーズ1",
    gameStatus: "準備中" as const,
    handCards: 5,
    deckCards: 40,
    extraDeckCards: 15,
    graveyardCards: 0,
  };
</script>

<div class="container mx-auto p-4">
  <main class="max-w-6xl mx-auto space-y-6">
    <!-- ゲームボード -->
    <GameBoard
      playerLifePoints={gameState.playerLifePoints}
      opponentLifePoints={gameState.opponentLifePoints}
      handCards={gameState.handCards}
      deckCards={gameState.deckCards}
      extraDeckCards={gameState.extraDeckCards}
      graveyardCards={gameState.graveyardCards}
    />

    <!-- プレイヤー情報 -->
    <PlayerInfo
      playerLifePoints={gameState.playerLifePoints}
      opponentLifePoints={gameState.opponentLifePoints}
      currentTurn={gameState.currentTurn}
      currentPhase={gameState.currentPhase}
      gameStatus={gameState.gameStatus}
    />

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
        <h3 class="h3 mb-4">コンボ情報</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="opacity-75">手順:</span>
            <span class="font-bold">1 / 20</span>
          </div>
          <div class="flex justify-between">
            <span class="opacity-75">進行:</span>
            <span class="font-bold">5%</span>
          </div>
          <div class="flex justify-between">
            <span class="opacity-75">目標:</span>
            <span class="font-bold text-warning-500">1ターンキル</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
