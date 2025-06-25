<script lang="ts">
  import BeepButton from "$lib/components/buttons/BeepButton.svelte";
  import type { LabelType } from "$lib/utils/beep";
  import { getNotesWithOctaveShift } from "$lib/utils/musicalNote";

  export let waveType: OscillatorType = "triangle";
  export let octaveShift: number = 0;
  export let showLabel: LabelType = "none";
  export let includeRightC: boolean = true;

  $: musicalNotes = getNotesWithOctaveShift(octaveShift);
  $: whiteKeys = includeRightC
    ? musicalNotes.filter((note) => !note.isSharp)
    : musicalNotes.filter((note) => !note.isSharp).slice(0, -1); // 右端の「ド」を除外
  $: blackKeys = musicalNotes.filter((note) => note.isSharp);

  const blackKeyPositions = [0, 1, null, 2, 3, 4, null, null];
  const cGridCols = includeRightC ? "grid-cols-8" : "grid-cols-7";
</script>

<div class="w-80 h-32">
  <div class="w-full h-full grid {cGridCols}">
    {#each whiteKeys as whiteKey, index (index)}
      <div class="relative flex-1">
        <!-- 白鍵 -->
        <BeepButton
          frequency={whiteKey.frequency}
          {waveType}
          label={showLabel === "ja" ? whiteKey.name.ja : showLabel === "en" ? whiteKey.name.en : undefined}
          className="
          flex items-end justify-center
          w-full h-full
          bg-white hover:bg-gray-100 active:bg-gray-200
          text-gray-500
          border border-gray-300
          rounded-sm
          pointer-events-auto
          "
        />

        <!-- 黒鍵 -->
        {#if blackKeyPositions[index] !== null}
          <BeepButton
            frequency={blackKeys[blackKeyPositions[index]].frequency}
            {waveType}
            className="
            absolute z-10 top-0 right-0 transform translate-x-1/2
            w-3/5 h-3/5
            bg-black hover:bg-gray-900 active:bg-gray-800
            rounded-lg
            pointer-events-auto
            "
          />
        {/if}
      </div>
    {/each}
  </div>
</div>
