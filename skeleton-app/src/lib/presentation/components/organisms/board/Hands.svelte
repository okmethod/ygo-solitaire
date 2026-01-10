<script lang="ts">
  import Card from "$lib/presentation/components/atoms/Card.svelte";
  import ActivatableCard, {
    type CardActionButton,
  } from "$lib/presentation/components/molecules/ActivatableCard.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";
  import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
  import { SummonMonsterCommand } from "$lib/domain/commands/SummonMonsterCommand";
  import { SetMonsterCommand } from "$lib/domain/commands/SetMonsterCommand";
  import { SetSpellTrapCommand } from "$lib/domain/commands/SetSpellTrapCommand";
  import { gameStateStore } from "$lib/application/stores/gameStateStore";

  interface HandZoneProps {
    cards: Array<{ card: CardDisplayData | null; instanceId: string }>;
    handCardCount: number;
    currentPhase: string;
    canActivateSpells: boolean;
    isGameOver: boolean;
    onCardClick: (card: CardDisplayData, instanceId: string) => void;
    onSummonMonster: (card: CardDisplayData, instanceId: string) => void;
    onSetMonster: (card: CardDisplayData, instanceId: string) => void;
    onSetSpellTrap: (card: CardDisplayData, instanceId: string) => void;
  }

  let {
    cards,
    handCardCount,
    currentPhase,
    canActivateSpells,
    isGameOver,
    onCardClick,
    onSummonMonster,
    onSetMonster,
    onSetSpellTrap,
  }: HandZoneProps = $props();

  // カードごとの発動可能性をチェック (T032)
  function isCardActivatable(instanceId: string): boolean {
    if (isGameOver) return false;
    if (currentPhase !== "Main1") return false;
    if (!canActivateSpells) return false;

    // ActivateSpellCommand.canExecute()でカード固有の発動条件をチェック
    const command = new ActivateSpellCommand(instanceId);
    return command.canExecute($gameStateStore);
  }

  // モンスター召喚可能性をチェック (T032)
  function canSummonMonster(instanceId: string): boolean {
    if (isGameOver) return false;
    if (currentPhase !== "Main1") return false;

    const command = new SummonMonsterCommand(instanceId);
    return command.canExecute($gameStateStore);
  }

  // モンスターセット可能性をチェック (T032)
  function canSetMonster(instanceId: string): boolean {
    if (isGameOver) return false;
    if (currentPhase !== "Main1") return false;

    const command = new SetMonsterCommand(instanceId);
    return command.canExecute($gameStateStore);
  }

  // 魔法・罠セット可能性をチェック (T032)
  function canSetSpellTrap(instanceId: string): boolean {
    if (isGameOver) return false;
    if (currentPhase !== "Main1") return false;

    const command = new SetSpellTrapCommand(instanceId);
    return command.canExecute($gameStateStore);
  }

  // 選択中のカードのinstanceId
  let selectedInstanceId = $state<string | null>(null);

  // 手札枚数に応じたグリッドカラム数を計算
  function getHandGridColumns(handCount: number): string {
    // 1〜10枚までのクラス名を明示的に定義（Tailwindのスキャナーに教えるため）
    const gridMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
      9: "grid-cols-9",
      10: "grid-cols-10",
    };

    if (handCount <= 0) return "grid-cols-1";
    if (handCount >= 10) return "grid-cols-10";
    return gridMap[handCount];
  }

  // カードクリック時：選択状態をトグル
  function handleSelect(card: CardDisplayData, instanceId: string) {
    // 同じカードをクリックしたら選択解除、違うカードなら選択
    selectedInstanceId = selectedInstanceId === instanceId ? null : instanceId;
  }

  // 発動ボタンクリック時：親コンポーネントのonCardClickを呼び出して選択解除
  function handleActivate(card: CardDisplayData, instanceId: string) {
    onCardClick(card, instanceId);
    selectedInstanceId = null;
  }

  // 召喚ボタンクリック時 (T032)
  function handleSummon(card: CardDisplayData, instanceId: string) {
    onSummonMonster(card, instanceId);
    selectedInstanceId = null;
  }

  // モンスターセットボタンクリック時 (T032)
  function handleSetMonster(card: CardDisplayData, instanceId: string) {
    onSetMonster(card, instanceId);
    selectedInstanceId = null;
  }

  // 魔法・罠セットボタンクリック時 (T032)
  function handleSetSpellTrap(card: CardDisplayData, instanceId: string) {
    onSetSpellTrap(card, instanceId);
    selectedInstanceId = null;
  }

  // キャンセルボタンクリック時：選択解除
  function handleCancel() {
    selectedInstanceId = null;
  }

  // カードタイプに応じたアクション定義 (T032)
  function getActionsForCard(card: CardDisplayData, instanceId: string): CardActionButton[] {
    const actions: CardActionButton[] = [];

    // モンスターカードの場合
    if (card.type === "monster") {
      // 召喚ボタン
      if (canSummonMonster(instanceId)) {
        actions.push({
          label: "召喚",
          style: "filled",
          color: "primary",
          onClick: handleSummon,
        });
      }
      // セットボタン
      if (canSetMonster(instanceId)) {
        actions.push({
          label: "セット",
          style: "outline",
          color: "secondary",
          onClick: handleSetMonster,
        });
      }
    }
    // 魔法・罠カードの場合
    else if (card.type === "spell" || card.type === "trap") {
      // 発動ボタン
      if (isCardActivatable(instanceId)) {
        actions.push({
          label: "発動",
          style: "filled",
          color: "primary",
          onClick: handleActivate,
        });
      }
      // セットボタン
      if (canSetSpellTrap(instanceId)) {
        actions.push({
          label: "セット",
          style: "outline",
          color: "secondary",
          onClick: handleSetSpellTrap,
        });
      }
    }

    return actions;
  }
</script>

<div class="grid {getHandGridColumns(handCardCount)} gap-2 mb-16">
  {#each cards as { card, instanceId } (instanceId)}
    {#if card}
      <ActivatableCard
        {card}
        {instanceId}
        isSelected={selectedInstanceId === instanceId}
        isActivatable={getActionsForCard(card, instanceId).length > 0}
        onSelect={handleSelect}
        actions={getActionsForCard(card, instanceId)}
        onCancel={handleCancel}
        size="medium"
      />
    {:else}
      <!-- ローディング中のplaceholder -->
      <Card placeholder={true} placeholderText="..." size="medium" />
    {/if}
  {:else}
    <div class="text-center text-sm opacity-50">No cards in hand</div>
  {/each}
</div>
