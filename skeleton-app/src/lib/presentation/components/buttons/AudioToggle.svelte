<script lang="ts">
  import Icon from "@iconify/svelte";
  import { getAudioOn, setAudioOn } from "$lib/presentation/stores/audioStore";

  let currentAudioOn: boolean = $state(getAudioOn());

  function toggleAudio() {
    currentAudioOn = !currentAudioOn;
    setAudioOn(currentAudioOn);
  }
</script>

<button
  type="button"
  class="btn p-2 rounded-xl h-10 w-10 {currentAudioOn ? 'preset-filled-primary-500' : 'preset-tonal'}"
  onclick={toggleAudio}
  aria-label={currentAudioOn ? "音声をオフにする" : "音声をオンにする"}
>
  {#if currentAudioOn}
    <Icon icon="mdi:volume-high" class="size-5" />
  {:else}
    <Icon icon="mdi:volume-off" class="size-5" />
  {/if}
</button>
