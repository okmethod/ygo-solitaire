<script lang="ts">
  import { Segment } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import { waveTypes } from "$lib/utils/beep";
  import { sampleMelody, type MelodyNote } from "$lib/utils/melody";
  import MelodyButton from "$lib/components/buttons/MelodyButton.svelte";

  let selectedWaveType: OscillatorType = "square";
  let editableMelody: (MelodyNote | null)[] = [...sampleMelody.melodyNotes];

  // 音符または休符を更新する関数
  function updateNote(index: number, field: "name" | "octave" | "duration", value: string | number) {
    editableMelody = editableMelody.map((note, i) => (i === index && note ? { ...note, [field]: value } : note));
  }

  // 休符と音符を切り替える関数
  function toggleRest(index: number) {
    editableMelody = editableMelody.map((note, i) =>
      i === index ? (note ? null : { name: "C", octave: 4, duration: 1 }) : note,
    );
  }
</script>

<div class="flex flex-col items-center bg-primary-200 dark:bg-primary-800 rounded-lg shadow-lg space-y-4 p-4">
  <Segment
    name="waveType"
    value={selectedWaveType}
    onValueChange={(e) => (selectedWaveType = e.value as OscillatorType)}
    classes="h-full space-x-1"
  >
    {#each waveTypes as waveType, key (key)}
      <Segment.Item value={waveType}>
        <Icon icon="mdi:{waveType}-wave" class="size-4" />
      </Segment.Item>
    {/each}
  </Segment>

  <!-- メロディのリストを表示 -->
  <ul class="w-full space-y-2">
    {#each editableMelody as note, index (index)}
      <li class="grid grid-cols-8 place-items-center gap-2 p-1 h-12 bg-white dark:bg-gray-700 rounded shadow">
        <span class="col-span-1">
          {index + 1}.
        </span>

        <!-- 休符の切り替え -->
        <div class="col-span-1">
          <button class="p-1 w-full bg-gray-300 dark:bg-gray-600 rounded" on:click={() => toggleRest(index)}>
            <Icon icon="mdi:{note ? 'music-note-quarter' : 'music-rest-quarter'}" />
          </button>
        </div>

        <div class="col-span-6 flex items-center space-x-2">
          {#if note}
            <!-- 音名 -->
            <input
              type="text"
              class="p-1 border rounded dark:bg-gray-600 dark:text-gray-200"
              bind:value={note.name}
              on:input={(e: Event) => updateNote(index, "name", (e.target as HTMLInputElement).value)}
            />

            <!-- オクターブ -->
            <input
              type="number"
              class="p-1 border rounded dark:bg-gray-600 dark:text-gray-200"
              bind:value={note.octave}
              on:input={(e: Event) => updateNote(index, "octave", parseInt((e.target as HTMLInputElement).value))}
            />

            <!-- 拍数 -->
            <input
              type="number"
              class="p-1 border rounded dark:bg-gray-600 dark:text-gray-200"
              bind:value={note.duration}
              on:input={(e: Event) => updateNote(index, "duration", parseFloat((e.target as HTMLInputElement).value))}
            />
          {:else}
            <!-- 休符の場合 -->
            <span class="text-gray-600 dark:text-gray-400">-</span>
          {/if}
        </div>
      </li>
    {/each}
  </ul>

  <MelodyButton
    waveType={selectedWaveType}
    melody={editableMelody}
    tempoBpm={sampleMelody.defaultTempoBpm}
    iconName="mdi:music"
    label="Play"
    className="btn preset-filled"
  />
</div>
