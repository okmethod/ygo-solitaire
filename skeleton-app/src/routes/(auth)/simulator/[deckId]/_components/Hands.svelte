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
  import type { DisplayCardData } from "$lib/presentation/types";
  import type { ComponentSize } from "$lib/presentation/constants/sizes";
  import { gameFacade } from "$lib/application/GameFacade";
  import { isMobile } from "$lib/presentation/utils/mobile";
  import CardComponent from "$lib/presentation/components/atoms/Card.svelte";
  import ActivatableCard, {
    type CardActionButton,
  } from "$lib/presentation/components/molecules/ActivatableCard.svelte";

  /**
   * Hands コンポーネントのプロパティ
   */
  interface HandZoneProps {
    cards: Array<{ card: DisplayCardData | null; instanceId: string }>;
    selectedHandCardInstanceId: string | null; // 選択された手札カードのinstanceId
    onCardClick: (card: DisplayCardData, instanceId: string) => void;
    onSummonMonster: (card: DisplayCardData, instanceId: string) => void;
    onSetMonster: (card: DisplayCardData, instanceId: string) => void;
    onSetSpellTrap: (card: DisplayCardData, instanceId: string) => void;
    onHandCardSelect: (instanceId: string | null) => void; // 手札カード選択変更の通知
  }

  let {
    cards,
    selectedHandCardInstanceId,
    onCardClick,
    onSummonMonster,
    onSetMonster,
    onSetSpellTrap,
    onHandCardSelect,
  }: HandZoneProps = $props();

  // スマホではカードサイズを小さく
  const _isMobile = isMobile();
  const cardSize: ComponentSize = _isMobile ? "small" : "medium";

  // カードを発動可能か
  function isActivatable(instanceId: string): boolean {
    return gameFacade.canActivateSpell(instanceId);
  }

  // モンスターを召喚可能か
  function canSummonMonster(instanceId: string): boolean {
    return gameFacade.canSummonMonster(instanceId);
  }

  // モンスターをセット可能か
  function canSetMonster(instanceId: string): boolean {
    return gameFacade.canSetMonster(instanceId);
  }

  // 魔法・罠をセット可能か
  function canSetSpellTrap(instanceId: string): boolean {
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
    if (_isMobile) {
      // スマホでは最大5列
      if (handCount >= 5) return "grid-cols-5";
    } else {
      // PCでは最大10列
      if (handCount >= 10) return "grid-cols-10";
    }
    return gridClassMap[handCount];
  }

  // カードクリック時：選択状態をトグルして親に通知
  function handleSelect(card: DisplayCardData, instanceId: string) {
    // 同じカードをクリックしたら選択解除、違うカードなら選択
    const newSelection = selectedHandCardInstanceId === instanceId ? null : instanceId;
    onHandCardSelect(newSelection);
  }

  // 発動ボタンクリック時：親コンポーネントのonCardClickを呼び出して選択解除
  function handleActivate(card: DisplayCardData, instanceId: string) {
    onCardClick(card, instanceId);
    onHandCardSelect(null);
  }

  // 召喚ボタンクリック時
  function handleSummon(card: DisplayCardData, instanceId: string) {
    onSummonMonster(card, instanceId);
    onHandCardSelect(null);
  }

  // モンスターセットボタンクリック時
  function handleSetMonster(card: DisplayCardData, instanceId: string) {
    onSetMonster(card, instanceId);
    onHandCardSelect(null);
  }

  // 魔法・罠セットボタンクリック時
  function handleSetSpellTrap(card: DisplayCardData, instanceId: string) {
    onSetSpellTrap(card, instanceId);
    onHandCardSelect(null);
  }

  // キャンセルボタンクリック時：選択解除
  function handleCancel() {
    onHandCardSelect(null);
  }

  // カードタイプに応じたアクション定義
  function getActionsForCard(card: DisplayCardData, instanceId: string): CardActionButton[] {
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

<div class="grid {getHandGridColumns(cards.length)} gap-2 mb-16">
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
        size={cardSize}
      />
    {:else}
      <!-- ローディング中のplaceholder -->
      <CardComponent placeholder={true} placeholderText="..." size={cardSize} />
    {/if}
  {:else}
    <div class="text-center text-sm opacity-50">No cards in hand</div>
  {/each}
</div>
