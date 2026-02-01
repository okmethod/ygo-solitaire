<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import {
    getCardDetailDisplayEnabled,
    setCardDetailDisplayEnabled,
  } from "$lib/presentation/stores/cardDetailDisplayStore";

  let currentEnabled: boolean = getCardDetailDisplayEnabled();

  function toggleCardDetail() {
    currentEnabled = !currentEnabled;
    setCardDetailDisplayEnabled(currentEnabled);
  }
</script>

<Switch
  name="cardDetailToggle"
  controlClasses="h-8"
  controlActive="bg-surface-950-50"
  compact
  checked={currentEnabled}
  onCheckedChange={() => toggleCardDetail()}
>
  {#snippet activeChild()}
    <Icon icon="mdi:card-text" class="size-5 text-white" />
  {/snippet}
  {#snippet inactiveChild()}
    <Icon icon="mdi:card-text-outline" class="size-5 text-white" />
  {/snippet}
</Switch>
