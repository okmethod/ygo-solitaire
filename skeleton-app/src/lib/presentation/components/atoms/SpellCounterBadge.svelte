<script lang="ts">
  /**
   * SpellCounterBadge - 魔力カウンター表示バッジ
   *
   * カードに置かれた魔力カウンターの数を視覚的に表示するコンポーネント。
   * SpellCounter.png アイコンとカウンター数を組み合わせて表示する。
   *
   * @module presentation/components/atoms/SpellCounterBadge
   */
  import spellCounterIcon from "$lib/presentation/assets/SpellCounter.png";

  interface SpellCounterBadgeProps {
    count: number;
  }

  const { count }: SpellCounterBadgeProps = $props();

  // カウンターが0以下の場合は表示しない
  const shouldShow = $derived(count > 0);
</script>

{#if shouldShow}
  <div
    class="absolute right-1 bottom-8 z-10 flex items-center justify-center rounded-full border-1 border-green-400 bg-green-900 px-1 font-bold text-white shadow-md"
    title="魔力カウンター: {count}"
    data-testid="spell-counter-badge"
  >
    <img src={spellCounterIcon} alt="魔力カウンター" class="h-4 w-4" />
    <span class="text-xs" data-testid="spell-counter-count">{count}</span>
  </div>
{/if}
