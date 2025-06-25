<script lang="ts">
  import Icon from "@iconify/svelte";
  import { audioContextProvider } from "$lib/stores/audio";
  import { startBeep } from "$lib/utils/beep";

  export let frequency: number;
  export let waveType: OscillatorType;
  export let label: string | undefined = undefined;
  export let iconName: string | undefined = undefined;
  export let className: string | undefined = undefined;

  let stopBeep: (() => void) | null = null;

  function handleStartBeep(event: Event) {
    event.preventDefault();
    stopBeep = startBeep(audioContextProvider, waveType, frequency);
  }

  function handleStopBeep(event: Event) {
    event.preventDefault();
    if (stopBeep !== null) {
      stopBeep();
    }
  }
</script>

<button
  class={className ?? "btn preset-filled"}
  on:mousedown={handleStartBeep}
  on:mouseup={handleStopBeep}
  on:mouseleave={handleStopBeep}
  on:touchstart={handleStartBeep}
  on:touchend={handleStopBeep}
  on:touchcancel={handleStopBeep}
>
  {#if iconName}
    <Icon icon={iconName} class="size-4" />
  {/if}
  {#if label}
    <span>{label}</span>
  {/if}
</button>
