<script lang="ts">
  import { SegmentedControl } from "@skeletonlabs/skeleton-svelte";
  import {
    getCardDetailDisplayEnabled,
    setCardDetailDisplayEnabled,
  } from "$lib/presentation/stores/cardDetailDisplayStore";

  let currentEnabled: boolean = getCardDetailDisplayEnabled();
</script>

<SegmentedControl
  name="cardDetailToggle"
  value={String(currentEnabled)}
  onValueChange={(e) => {
    currentEnabled = e.value === "true";
    setCardDetailDisplayEnabled(currentEnabled);
  }}
>
  <SegmentedControl.Control>
    <SegmentedControl.Indicator />
    <SegmentedControl.Item value="true">
      <SegmentedControl.ItemText>
        <div class="text-xs md:text-base">
          <span class="hidden md:inline">表示</span>する
        </div>
      </SegmentedControl.ItemText>
    </SegmentedControl.Item>
    <SegmentedControl.Item value="false">
      <SegmentedControl.ItemText>
        <div class="text-xs md:text-base">
          <span class="hidden md:inline">表示</span>しない
        </div>
      </SegmentedControl.ItemText>
    </SegmentedControl.Item>
  </SegmentedControl.Control>
</SegmentedControl>
