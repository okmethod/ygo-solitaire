<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Accordion } from "@skeletonlabs/skeleton-svelte";
  import {
    sineSoundEffects,
    squareSoundEffects,
    sawtoothSoundEffects,
    triangleSoundEffects,
    gameSoundEffects,
  } from "$lib/presentation/sounds/soundEffects";

  let value = $state(["all", "game"]);

  // 各セクションの定義をデータ化
  const waveSections = [
    { id: "sine", label: "正弦波パターン", icon: "mdi:sine-wave", effects: sineSoundEffects },
    { id: "square", label: "方形波パターン", icon: "mdi:square-wave", effects: squareSoundEffects },
    { id: "sawtooth", label: "ノコギリ波パターン", icon: "mdi:sawtooth-wave", effects: sawtoothSoundEffects },
    { id: "triangle", label: "三角波パターン", icon: "mdi:triangle-wave", effects: triangleSoundEffects },
  ];
</script>

<div class="container mx-auto p-4">
  <header class="text-center mb-8">
    <h1 class="h2 opacity-75">Sound Test</h1>
  </header>

  <Accordion {value} onValueChange={(e) => (value = e.value)} multiple>
    <!-- 各波形セクションをループで生成 -->
    {#each waveSections as { id, label, icon, effects } (id)}
      <Accordion.Item value={id}>
        <Accordion.ItemTrigger>
          <Icon {icon} class="size-4" />
          {label}
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <div class="grid grid-cols-8 gap-4">
            {#each effects as { name, play } (name)}
              <button class="btn preset-tonal-primary rounded-lg shadow p-3 flex flex-col items-start" onclick={play}>
                <span class="font-mono text-xs opacity-75">{name.split("_").slice(1).join("_") || name}</span>
              </button>
            {/each}
          </div>
        </Accordion.ItemContent>
      </Accordion.Item>
    {/each}

    <!-- ゲーム用SEセクション -->
    <Accordion.Item value="game">
      <Accordion.ItemTrigger>
        <Icon icon="mdi:music-note" class="size-4" />
        ゲーム用SEパターン
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <div class="grid grid-cols-1 grid-cols-3 gap-4 max-w-4xl mx-auto">
          {#each gameSoundEffects as { name, description, play } (name)}
            <button
              class="btn preset-tonal-primary rounded-lg shadow p-4 flex flex-col items-start text-left"
              onclick={play}
            >
              <span class="font-mono text-sm opacity-60">{name}</span>
              <span class="text-base">{description}</span>
            </button>
          {/each}
        </div>
      </Accordion.ItemContent>
    </Accordion.Item>
  </Accordion>
</div>
