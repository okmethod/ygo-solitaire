<script lang="ts">
  import { navigateTo } from "$lib/utils/navigation";

  function navigateToSimulator() {
    navigateTo("/simulator");
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex flex-col ustify-center min-h-[70vh] space-y-8">
    <header class="text-center">
      <h1 class="h2 opacity-75 p-4">ワンキルシミュレーター</h1>
    </header>

    <div class="flex flex-col items-center space-y-6">
      <button class="btn preset-tonal rounded-full text-lg px-8 py-4" on:click={navigateToSimulator}> 決闘開始 </button>
    </div>
  </div>
</div>
