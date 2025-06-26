<script lang="ts">
  import DuelField from "$lib/components/organisms/DuelField.svelte";
  import PlayerInfo from "$lib/components/organisms/PlayerInfo.svelte";
  import Hands from "$lib/components/organisms/Hands.svelte";

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
    <DuelField
      deckCards={gameState.deckCards}
      extraDeckCards={gameState.extraDeckCards}
      graveyardCards={gameState.graveyardCards}
    />

    <Hands handCards={gameState.handCards} />

    <PlayerInfo
      playerLifePoints={gameState.playerLifePoints}
      opponentLifePoints={gameState.opponentLifePoints}
      currentTurn={gameState.currentTurn}
      currentPhase={gameState.currentPhase}
      gameStatus={gameState.gameStatus}
    />
  </main>
</div>
