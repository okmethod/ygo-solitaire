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
  <Segment.Item value="true">
    <div class="text-xs md:text-base">
      <span class="hidden md:inline">確認</span>する
    </div>
  </Segment.Item>
  <Segment.Item value="false">
    <div class="text-xs md:text-base">
      <span class="hidden md:inline">確認</span>しない
    </div>
  </Segment.Item>
</Segment>
