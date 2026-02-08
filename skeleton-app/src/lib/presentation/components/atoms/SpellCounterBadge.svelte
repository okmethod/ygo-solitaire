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
    class="absolute bottom-8 right-1 px-1 bg-green-900 text-white rounded-full flex items-center justify-center font-bold border-1 border-green-400 shadow-md z-10"
    title="魔力カウンター: {count}"
    data-testid="spell-counter-badge"
  >
    <img src={spellCounterIcon} alt="魔力カウンター" class="w-4 h-4" />
    <span class="text-xs" data-testid="spell-counter-count">{count}</span>
  </div>
{/if}
