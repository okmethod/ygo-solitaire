<script lang="ts">
  import { Segment } from "@skeletonlabs/skeleton-svelte";
  import {
    getCardDetailDisplayEnabled,
    setCardDetailDisplayEnabled,
  } from "$lib/presentation/stores/cardDetailDisplayStore";

  let currentEnabled: boolean = getCardDetailDisplayEnabled();
</script>

<Segment
  name="cardDetailToggle"
  value={String(currentEnabled)}
  onValueChange={(e) => {
    currentEnabled = e.value === "true";
    setCardDetailDisplayEnabled(currentEnabled);
  }}
>
  <Segment.Item value="true">
    <div class="text-xs md:text-base">
      <span class="hidden md:inline">表示</span>する
    </div>
  </Segment.Item>
  <Segment.Item value="false">
    <div class="text-xs md:text-base">
      <span class="hidden md:inline">表示</span>しない
    </div>
  </Segment.Item>
</Segment>
