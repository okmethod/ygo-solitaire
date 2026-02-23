<script lang="ts">
  import { SoundEffects } from "$lib/presentation/sounds/soundEffects";
</script>

<div class="container mx-auto p-4">
  <header class="text-center mb-8">
    <h1 class="h2 opacity-75">Sound Test</h1>
  </header>

  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
    {#each SoundEffects as { name, description, play } (name)}
      <button
        class="btn preset-tonal-primary rounded-lg shadow p-4 flex flex-col items-start text-left"
        on:click={play}
      >
        <span class="font-mono text-sm opacity-60">{name}</span>
        <span class="text-base">{description}</span>
      </button>
    {/each}
  </div>
</div>
