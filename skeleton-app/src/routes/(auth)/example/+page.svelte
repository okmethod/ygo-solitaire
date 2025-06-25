<script lang="ts">
  import KeyboardInstrument from "$lib/components/organisms/KeyboardInstrument.svelte";
  import MelodyMaker from "$lib/components/organisms/MelodyMaker.svelte";
</script>

<div class="flex flex-col items-center justify-center p-4 space-y-4">
  <h2 class="h2">Example Page</h2>
  <p class="mt-4">This is an example page.</p>
  <hr class="w-full" />

  <KeyboardInstrument numOfOctaves={3} />
  <hr class="w-full" />

  <MelodyMaker />
  <hr class="w-full" />
</div>
