<script lang="ts">
  interface PlayerInfoProps {
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
  }: PlayerInfoProps = $props();

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
  <!-- メインプレイヤー情報 -->
  <div class="grid grid-cols-2 gap-8 p-4 rounded-lg bg-surface-100-800-token/20 border border-surface-300/50">
    <div class="text-center">
      <h3 class="h4 mb-2 opacity-75">相手</h3>
      <div class="text-2xl font-bold {getLifePointsColor(opponentLifePoints, false)}">
        LP: {opponentLifePoints.toLocaleString()}
      </div>
    </div>

    <div class="text-center">
      <h3 class="h4 mb-2">自分</h3>
      <div class="text-2xl font-bold {getLifePointsColor(playerLifePoints)}">
        LP: {playerLifePoints.toLocaleString()}
      </div>
    </div>
  </div>

  <!-- ゲーム状態情報 -->
  <div class="card p-4 bg-surface-50-900-token/30">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div class="flex justify-between items-center md:flex-col md:gap-1 md:text-center">
        <span class="opacity-75">ターン:</span>
        <span class="font-bold md:text-center">{currentTurn}</span>
      </div>

      <div class="flex justify-between items-center md:flex-col md:gap-1 md:text-center">
        <span class="opacity-75">フェーズ:</span>
        <span class="font-bold md:text-center">{currentPhase}</span>
      </div>

      <div class="flex justify-between items-center md:flex-col md:gap-1 md:text-center">
        <span class="opacity-75">状態:</span>
        <span class="font-bold {getStatusColor(gameStatus)} md:text-center">{gameStatus}</span>
      </div>
    </div>
  </div>
</div>
