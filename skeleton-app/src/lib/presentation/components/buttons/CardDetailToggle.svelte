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
  <Segment.Item value="true">表示する</Segment.Item>
  <Segment.Item value="false">表示しない</Segment.Item>
</Segment>
