<script lang="ts">
  import type { DisplayCardInstance } from "$lib/presentation/types";
  import { CARD_SIZE_CLASSES, type ComponentSize } from "$lib/presentation/constants/sizes";
  import { gameFacade } from "$lib/application/GameFacade";
  import { showSuccessToast, showErrorToast } from "$lib/presentation/utils/toaster";
  import { playSE } from "$lib/presentation/sounds/soundEffects";
  import CountBadge from "$lib/presentation/components/atoms/CountBadge.svelte";
  import cardBackImage from "$lib/presentation/assets/CardBack.jpg";
  import CardStackModal, { type CardActionDefinition } from "../modals/CardStackModal.svelte";

  interface ExtraDeckProps {
    cards: DisplayCardInstance[];
    size?: ComponentSize;
  }

  let { cards, size = "medium" }: ExtraDeckProps = $props();

  // ゲームアクション実行の共通ヘルパー
  function executeGameAction(action: () => { success: boolean; message?: string; error?: string }): boolean {
    const result = action();
    if (result.success) {
      if (result.message) {
        showSuccessToast(result.message);
      }
    } else {
      playSE.error();
      showErrorToast(result.error || "失敗しました");
    }
    return result.success;
  }

  // シンクロ召喚の可能性をチェック
  function canSynchroSummon(instanceId: string): boolean {
    return gameFacade.canSynchroSummon(instanceId);
  }

  // シンクロ召喚ハンドラー
  function handleSynchroSummon(instanceId: string) {
    playSE.summon();
    executeGameAction(() => gameFacade.synchroSummon(instanceId));
  }

  // EXデッキ用のカードアクション定義
  // TODO: 他の召喚方法も追加できるよう拡張が必要
  const cardActions: CardActionDefinition[] = [
    {
      label: "シンクロ召喚",
      canExecute: (instanceId) => canSynchroSummon(instanceId),
      onExecute: handleSynchroSummon,
    },
  ];

  // モーダル状態管理
  let modalOpen = $state(false);

  // クリック処理
  function handleClick() {
    modalOpen = true;
  }

  // モーダル状態変更処理
  function handleModalChange(open: boolean) {
    modalOpen = open;
  }

  // ホバー状態
  let isHovered = $state(false);

  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
  }
</script>

<div
  class="
    {CARD_SIZE_CLASSES[size]}
    relative
    cursor-pointer rounded-lg border-2
    border-dashed
    border-gray-400 bg-gray-100
    transition-all duration-300
    dark:bg-gray-800
    {isHovered ? 'scale-105 shadow-lg' : ''}
  "
  role="button"
  tabindex="0"
  onclick={handleClick}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onkeydown={(e) => e.key === "Enter" && handleClick()}
>
  <!-- エクストラデッキは常に裏向き表示 -->
  <div class="relative flex h-full items-center justify-center p-1">
    <img src={cardBackImage} alt="EXデッキ" class="h-full w-full rounded-sm object-cover" />
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-center text-xs font-bold text-white drop-shadow-lg select-none"> EX </span>
    </div>
  </div>
  <CountBadge count={cards.length} />
</div>

<!-- エクストラデッキモーダル -->
<CardStackModal {cards} open={modalOpen} onOpenChange={handleModalChange} title="EXデッキ" {cardActions} />
