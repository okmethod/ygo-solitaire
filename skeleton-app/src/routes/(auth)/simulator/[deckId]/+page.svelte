<script lang="ts">
  import DuelField from "$lib/components/organisms/board/DuelField.svelte";
  import GameInfo from "$lib/components/organisms/GameInfo.svelte";
  import Hands from "$lib/components/organisms/board/Hands.svelte";
  import ToastContainer from "$lib/components/organisms/ToastContainer.svelte";
  import type { PageData } from "./$types";
  import type { EffectResult } from "$lib/types/effect";
  import { toastStore } from "$lib/stores/toastStore";

  export let data: PageData;

  $: ({ duelState } = data);
  $: duelStats = duelState.getDuelStats();

  // 効果実行結果のハンドリング
  function handleEffectResult(result: EffectResult) {
    console.log("[Simulator] 効果実行結果:", result);

    if (result.success) {
      // 成功時のフィードバック
      toastStore.success(result.message);

      // ドローしたカードがある場合は追加情報
      if (result.drawnCards && result.drawnCards.length > 0) {
        const cardNames = result.drawnCards.map((card) => card.name).join(", ");
        toastStore.info(`ドローしたカード: ${cardNames}`);
      }

      // UI状態を更新（duelStateの変更は自動的にリアクティブに反映される）
      duelStats = duelState.getDuelStats();
    } else {
      // 失敗時のフィードバック
      toastStore.error(result.message);
    }
  }
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
        <Hands cards={duelState.hands} {duelState} onEffectResult={handleEffectResult} />
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

<!-- トーストコンテナ -->
<ToastContainer />
