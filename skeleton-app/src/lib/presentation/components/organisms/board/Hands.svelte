<script lang="ts">
  /**
   * Hands - 手札表示・操作コンポーネント
   *
   * プレイヤーの手札を表示し、カードの発動・召喚・セット操作を提供する。
   * ゲーム操作が集中する重要なコンポーネント。
   *
   * ARCH: Presentation Layer - レイヤー依存ルール
   * - Application Layer（GameFacade）経由でのみゲームロジック呼び出し可能
   * - 魔法・罠セット、モンスター召喚等の操作は GameFacade メソッドで検証
   *
   * @module presentation/components/organisms/board/Hands
   */
  import Card from "$lib/presentation/components/atoms/Card.svelte";
  import ActivatableCard, {
    type CardActionButton,
  } from "$lib/presentation/components/molecules/ActivatableCard.svelte";
  import type { Card as CardDisplayData } from "$lib/presentation/types/card";
  import { gameFacade } from "$lib/application/GameFacade";

  /**
   * Hands コンポーネントのプロパティ
   */
  interface HandZoneProps {
    cards: Array<{ card: CardDisplayData | null; instanceId: string }>;
    handCardCount: number;
    currentPhase: string;
    isGameOver: boolean;
    selectedHandCardInstanceId: string | null; // 選択された手札カードのinstanceId
    onCardClick: (card: CardDisplayData, instanceId: string) => void;
    onSummonMonster: (card: CardDisplayData, instanceId: string) => void;
    onSetMonster: (card: CardDisplayData, instanceId: string) => void;
    onSetSpellTrap: (card: CardDisplayData, instanceId: string) => void;
    onHandCardSelect: (instanceId: string | null) => void; // 手札カード選択変更の通知
  }

  let {
    cards,
    handCardCount,
    currentPhase,
    isGameOver,
    selectedHandCardInstanceId,
    onCardClick,
    onSummonMonster,
    onSetMonster,
    onSetSpellTrap,
    onHandCardSelect,
  }: HandZoneProps = $props();

  // カードごとの発動可能性をチェック
  function isActivatable(instanceId: string): boolean {
    if (isGameOver) return false;
    if (currentPhase !== "Main1") return false;

    // GameFacade経由でカード固有の発動条件をチェック
    return gameFacade.canActivateSpell(instanceId);
  }

  // モンスター召喚可能性をチェック
  function canSummonMonster(instanceId: string): boolean {
    if (isGameOver) return false;
    if (currentPhase !== "Main1") return false;

    return gameFacade.canSummonMonster(instanceId);
  }

  // モンスターセット可能性をチェック
  function canSetMonster(instanceId: string): boolean {
    if (isGameOver) return false;
    if (currentPhase !== "Main1") return false;

    return gameFacade.canSetMonster(instanceId);
  }

  // 魔法・罠セット可能性をチェック
  function canSetSpellTrap(instanceId: string): boolean {
    if (isGameOver) return false;
    if (currentPhase !== "Main1") return false;

    return gameFacade.canSetSpellTrap(instanceId);
  }

  // 手札枚数に応じたグリッドカラム数を計算
  function getHandGridColumns(handCount: number): string {
    // 明示的にクラス名を定義してTailwindのスキャナーに伝える
    const gridClassMap: Record<number, string> = {
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
    return gridClassMap[handCount];
  }

  // カードクリック時：選択状態をトグルして親に通知
  function handleSelect(card: CardDisplayData, instanceId: string) {
    // 同じカードをクリックしたら選択解除、違うカードなら選択
    const newSelection = selectedHandCardInstanceId === instanceId ? null : instanceId;
    onHandCardSelect(newSelection);
  }

  // 発動ボタンクリック時：親コンポーネントのonCardClickを呼び出して選択解除
  function handleActivate(card: CardDisplayData, instanceId: string) {
    onCardClick(card, instanceId);
    onHandCardSelect(null);
  }

  // 召喚ボタンクリック時
  function handleSummon(card: CardDisplayData, instanceId: string) {
    onSummonMonster(card, instanceId);
    onHandCardSelect(null);
  }

  // モンスターセットボタンクリック時
  function handleSetMonster(card: CardDisplayData, instanceId: string) {
    onSetMonster(card, instanceId);
    onHandCardSelect(null);
  }

  // 魔法・罠セットボタンクリック時
  function handleSetSpellTrap(card: CardDisplayData, instanceId: string) {
    onSetSpellTrap(card, instanceId);
    onHandCardSelect(null);
  }

  // キャンセルボタンクリック時：選択解除
  function handleCancel() {
    onHandCardSelect(null);
  }

  // カードタイプに応じたアクション定義
  function getActionsForCard(card: CardDisplayData, instanceId: string): CardActionButton[] {
    const actionButtons: CardActionButton[] = [];

    // モンスターカードの場合
    if (card.type === "monster") {
      // 召喚ボタン
      if (canSummonMonster(instanceId)) {
        actionButtons.push({
          label: "召喚",
          style: "filled",
          color: "primary",
          onClick: handleSummon,
        });
      }
      // セットボタン
      if (canSetMonster(instanceId)) {
        actionButtons.push({
          label: "セット",
          style: "filled",
          color: "primary",
          onClick: handleSetMonster,
        });
      }
    }
    // 魔法・罠カードの場合
    else if (card.type === "spell" || card.type === "trap") {
      // 発動ボタン
      if (isActivatable(instanceId)) {
        actionButtons.push({
          label: "発動",
          style: "filled",
          color: "primary",
          onClick: handleActivate,
        });
      }
      // セットボタン
      if (canSetSpellTrap(instanceId)) {
        actionButtons.push({
          label: "セット",
          style: "filled",
          color: "primary",
          onClick: handleSetSpellTrap,
        });
      }
    }

    return actionButtons;
  }
</script>

<div class="grid {getHandGridColumns(handCardCount)} gap-2 mb-16">
  {#each cards as { card, instanceId } (instanceId)}
    {#if card}
      <ActivatableCard
        {card}
        {instanceId}
        isSelected={selectedHandCardInstanceId === instanceId}
        isActivatable={getActionsForCard(card, instanceId).length > 0}
        onSelect={handleSelect}
        actionButtons={getActionsForCard(card, instanceId)}
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
