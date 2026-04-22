<script lang="ts">
  import Icon from "@iconify/svelte";
  import { getAudioOn, setAudioOn } from "$lib/presentation/stores/audioStore";
  import { playSE } from "$lib/presentation/sounds/soundEffects";

  let currentAudioOn: boolean = $state(getAudioOn());

  function toggleAudio() {
    currentAudioOn = !currentAudioOn;
    setAudioOn(currentAudioOn);
    playSE.attention();
  }
</script>

<button
  type="button"
  class="btn h-10 w-10 rounded-xl p-2 {currentAudioOn ? 'preset-filled-primary-500' : 'preset-tonal'}"
  onclick={toggleAudio}
  aria-label={currentAudioOn ? "音声をオフにする" : "音声をオンにする"}
>
  {#if currentAudioOn}
    <Icon icon="mdi:volume-high" class="size-5" />
  {:else}
    <Icon icon="mdi:volume-off" class="size-5" />
  {/if}
</button>
