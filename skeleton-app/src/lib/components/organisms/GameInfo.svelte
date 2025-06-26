<script lang="ts">
  interface GameInfoProps {
    playerLifePoints?: number;
    opponentLifePoints?: number;
    currentTurn?: number;
    currentPhase?: string;
    gameStatus?: "準備中" | "実行中" | "停止中" | "完了";
  }

  let {
    playerLifePoints = 8000,
    opponentLifePoints = 8000,
    currentTurn = 1,
    currentPhase = "メインフェーズ1",
    gameStatus = "準備中",
  }: GameInfoProps = $props();

  function getStatusColor(status: string) {
    switch (status) {
      case "実行中":
        return "text-warning-500";
      case "完了":
        return "text-success-500";
      case "停止中":
        return "text-error-500";
      default:
        return "text-surface-600";
    }
  }

  function getLifePointsColor(points: number, isPlayer: boolean = true) {
    if (points <= 0) return "text-error-500";
    if (points <= 2000) return "text-warning-500";
    if (isPlayer) return "text-success-500";
    return "text-error-500";
  }
</script>

<div class="space-y-4">
  <div class="flex flex-col gap-8 p-2 bg-surface-100-800-token/20">
    <div class="flex items-center md:gap-1 md:text-center">
      <span class="opacity-75">ターン:</span>
      <span class="font-bold md:text-center">{currentTurn}</span>
    </div>

    <div class="flex items-center md:gap-1 md:text-center">
      <span class="font-bold md:text-center">{currentPhase}</span>
    </div>

    <div class="flex items-center md:gap-1 md:text-center">
      <span class="opacity-75">相手LP: </span>
      <div class="text-xl font-bold {getLifePointsColor(opponentLifePoints, false)}">
        {opponentLifePoints.toLocaleString()}
      </div>
    </div>

    <div class="flex items-center md:gap-1 md:text-center">
      <span class="opacity-75">自分LP: </span>
      <div class="text-xl font-bold {getLifePointsColor(playerLifePoints)}">
        {playerLifePoints.toLocaleString()}
      </div>
    </div>
  </div>
</div>
