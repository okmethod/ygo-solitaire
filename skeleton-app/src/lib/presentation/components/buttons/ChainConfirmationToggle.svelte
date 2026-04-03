<script lang="ts">
  import { SegmentedControl } from "@skeletonlabs/skeleton-svelte";
  import {
    getChainConfirmationEnabled,
    setChainConfirmationEnabled,
  } from "$lib/presentation/stores/chainConfirmationStore";

  let currentEnabled: boolean = getChainConfirmationEnabled();
</script>

<SegmentedControl
  name="chainConfirmationToggle"
  value={String(currentEnabled)}
  onValueChange={(e) => {
    currentEnabled = e.value === "true";
    setChainConfirmationEnabled(currentEnabled);
  }}
>
  <SegmentedControl.Control>
    <SegmentedControl.Indicator />
    <SegmentedControl.Item value="true">
      <SegmentedControl.ItemHiddenInput />
      <SegmentedControl.ItemText>
        <div class="text-xs md:text-base">
          <span class="hidden md:inline">確認</span>する
        </div>
      </SegmentedControl.ItemText>
    </SegmentedControl.Item>
    <SegmentedControl.Item value="false">
      <SegmentedControl.ItemHiddenInput />
      <SegmentedControl.ItemText>
        <div class="text-xs md:text-base">
          <span class="hidden md:inline">確認</span>しない
        </div>
      </SegmentedControl.ItemText>
    </SegmentedControl.Item>
  </SegmentedControl.Control>
</SegmentedControl>
