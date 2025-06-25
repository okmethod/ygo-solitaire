<script lang="ts">
  import Icon from "@iconify/svelte";
  import { audioContextProvider } from "$lib/stores/audio";
  import { playMelody, type MelodyNote } from "$lib/utils/melody";

  export let waveType: OscillatorType;
  export let melody: (MelodyNote | null)[];
  export let tempoBpm: number = 60;
  export let label: string | undefined = undefined;
  export let iconName: string | undefined = undefined;
  export let className: string | undefined = undefined;

  function handlePlayMelody() {
    playMelody(audioContextProvider, waveType, melody, tempoBpm);
  }
</script>

<button class={className ?? "btn preset-filled"} on:click={handlePlayMelody}>
  {#if iconName}
    <Icon icon={iconName} class="size-5" />
  {/if}
  {#if label}
    <span>{label}</span>
  {/if}
</button>
