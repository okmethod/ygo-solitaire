<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import { getAudioOn, setAudioOn } from "$lib/stores/audio";

  let currentAudioOn: boolean = getAudioOn();

  // オーディオのオン/オフを切り替える関数
  function toggleAudio() {
    currentAudioOn = !currentAudioOn;
    setAudioOn(currentAudioOn);
  }
</script>

<Switch
  name="audioToggle"
  controlClasses="h-8"
  controlActive="bg-surface-950-50"
  compact
  checked={currentAudioOn}
  onCheckedChange={() => toggleAudio()}
>
  {#snippet activeChild()}
    <Icon icon="mdi:volume-high" class="size-5 text-white" />
  {/snippet}
  {#snippet inactiveChild()}
    <Icon icon="mdi:volume-off" class="size-5 text-white" />
  {/snippet}
</Switch>
