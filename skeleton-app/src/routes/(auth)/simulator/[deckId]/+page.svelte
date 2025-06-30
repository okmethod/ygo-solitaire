<script lang="ts">
  import DuelField from "$lib/components/organisms/board/DuelField.svelte";
  import GameInfo from "$lib/components/organisms/GameInfo.svelte";
  import Hands from "$lib/components/organisms/board/Hands.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  $: ({ duelState } = data);
  $: duelStats = duelState.getDuelStats();
</script>

<div class="container mx-auto p-4">
  <main class="max-w-6xl mx-auto space-y-6">
    <div class="grid grid-cols-6 gap-2 md:gap-2 sm:gap-1">
      <div class="col-span-5">
        <DuelField
          deckCards={duelStats.mainDeckRemaining}
          extraDeckCards={duelState.extraDeck}
          graveyardCards={duelState.graveyard}
        />
        <Hands cards={duelState.hands} />
      </div>
      <div class="col-span-1 p-4">
        <GameInfo
          deckName={duelStats.gameStatus.deckName}
          playerLifePoints={duelStats.gameStatus.playerLifePoints}
          opponentLifePoints={duelStats.gameStatus.opponentLifePoints}
          currentTurn={duelStats.gameStatus.currentTurn}
          currentPhase={duelStats.gameStatus.currentPhase}
        />
      </div>
    </div>
  </main>
</div>
