<script lang="ts">
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import ChainConfirmationToggle from "$lib/presentation/components/buttons/ChainConfirmationToggle.svelte";
  import ThemeSwitch from "$lib/presentation/components/buttons/ThemeSwitch.svelte";

  let openState = $state(false);

  function modalClose() {
    openState = false;
  }
</script>

<Dialog open={openState} onOpenChange={(e) => (openState = e.open)}>
  <Dialog.Trigger class="btn preset-tonal p-2 rounded-xl h-10 w-10">
    <Icon icon="mdi:cog" class="size-5" />
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
    <Dialog.Positioner class="fixed inset-0 flex items-center justify-center z-50">
      <Dialog.Content class="card bg-surface-100-900 p-4 mx-auto space-y-4 shadow-xl max-w-80 sm:max-w-screen-sm">
        <header class="flex justify-between items-center">
          <h2 class="text-2xl sm:text-3xl">Settings</h2>
          <button type="button" class="btn preset-tonal rounded-full" onclick={modalClose}>
            <Icon icon="mdi:close" class="size-4" />
          </button>
        </header>

        <!-- チェーン確認設定 -->
        <div class="flex items-center justify-between py-2 border-b border-surface-300-700 gap-2">
          <div class="flex items-center gap-1 md:gap-2">
            <Icon icon="mdi:link-variant" class="size-5" />
            <div class="text-sm md:text-base">チェーン確認</div>
          </div>
          <ChainConfirmationToggle />
        </div>

        <!-- テーマ設定 -->
        <div class="flex items-center justify-between py-2 gap-2">
          <ThemeSwitch />
        </div>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
