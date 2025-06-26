<script lang="ts">
  import GameBoard from "$lib/components/organisms/GameBoard.svelte";
  import PlayerInfo from "$lib/components/organisms/PlayerInfo.svelte";
  import Hand from "$lib/components/organisms/Hand.svelte";

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
  <header class="mb-6">
    <h1 class="h1 text-center mb-2">遊戯王ソリティア</h1>
    <p class="text-center text-lg opacity-75">デュエルフィールド</p>
  </header>

  <main class="max-w-6xl mx-auto space-y-6">
    <!-- ゲームボード -->
    <GameBoard
      deckCards={gameState.deckCards}
      extraDeckCards={gameState.extraDeckCards}
      graveyardCards={gameState.graveyardCards}
    />

    <!-- 手札 -->
    <div class="card p-6">
      <Hand handCards={gameState.handCards} />
    </div>

    <!-- プレイヤー情報 -->
    <PlayerInfo
      playerLifePoints={gameState.playerLifePoints}
      opponentLifePoints={gameState.opponentLifePoints}
      currentTurn={gameState.currentTurn}
      currentPhase={gameState.currentPhase}
      gameStatus={gameState.gameStatus}
    />
  </main>
</div>
