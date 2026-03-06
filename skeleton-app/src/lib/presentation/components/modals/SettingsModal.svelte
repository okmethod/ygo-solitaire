<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import CardDetailToggle from "$lib/presentation/components/buttons/CardDetailToggle.svelte";
  import ThemeSwitch from "$lib/presentation/components/atoms/ThemeSwitch.svelte";

  let openState = $state(false);

  function modalClose() {
    openState = false;
  }
</script>

<Modal
  open={openState}
  onOpenChange={(e) => (openState = e.open)}
  triggerBase="btn preset-tonal p-2 rounded-xl h-10 w-10"
  contentBase="card bg-surface-100-900 p-4 mx-auto space-y-4 shadow-xl max-w-80 sm:max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
  {#snippet trigger()}
    <Icon icon="mdi:cog" class="size-5" />
  {/snippet}
  {#snippet content()}
    <header class="flex justify-between items-center">
      <h2 class="text-2xl sm:text-3xl">Settings</h2>
      <button type="button" class="btn preset-tonal rounded-full" onclick={modalClose}>
        <Icon icon="mdi:close" class="size-4" />
      </button>
    </header>

    <!-- カード詳細表示設定 -->
    <div class="flex items-center justify-between py-2 border-b border-surface-300-700">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:card-text" class="size-5" />
        <span>カード詳細表示</span>
      </div>
      <CardDetailToggle />
    </div>

    <!-- テーマ設定 -->
    <ThemeSwitch />
  {/snippet}
</Modal>
