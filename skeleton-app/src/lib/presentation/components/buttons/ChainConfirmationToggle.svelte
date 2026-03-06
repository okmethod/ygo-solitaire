<script lang="ts">
  import { Segment } from "@skeletonlabs/skeleton-svelte";
  import {
    getChainConfirmationEnabled,
    setChainConfirmationEnabled,
  } from "$lib/presentation/stores/chainConfirmationStore";

  let currentEnabled: boolean = getChainConfirmationEnabled();
</script>

<Segment
  name="chainConfirmationToggle"
  value={String(currentEnabled)}
  onValueChange={(e) => {
    currentEnabled = e.value === "true";
    setChainConfirmationEnabled(currentEnabled);
  }}
>
  <Segment.Item value="true">確認する</Segment.Item>
  <Segment.Item value="false">確認しない</Segment.Item>
</Segment>
