<script lang="ts">
  import { Dialog, Switch, Portal } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import { themeLabels, getTheme, setTheme, applyTheme } from "$lib/presentation/stores/themeStore";

  let openState = $state(false);
  let currentTheme = $state(getTheme());

  function handleThemeChange(selectedTheme: string) {
    setTheme({ name: selectedTheme, dark: currentTheme.dark });
    currentTheme = getTheme();
    applyTheme();
  }

  function toggleDarkMode() {
    setTheme({ name: currentTheme.name, dark: !currentTheme.dark });
    currentTheme = getTheme();
    applyTheme();
  }

  function modalClose() {
    openState = false;
  }
</script>

<Dialog open={openState} onOpenChange={(e) => (openState = e.open)}>
  <Dialog.Trigger class="btn preset-filled">
    <Icon icon="mdi:shimmer" class="size-4" />
    <span>Theme</span>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Content class="card bg-surface-100-900 mx-auto max-w-80 space-y-4 p-4 shadow-xl sm:max-w-screen-sm">
        <header class="flex justify-between">
          <h2 class="w-64 text-2xl sm:w-80 sm:text-3xl">Switch Theme</h2>
          <Switch name="toggle-dark-mode" checked={currentTheme.dark} onCheckedChange={() => toggleDarkMode()}>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch>
          <button type="button" class="btn preset-tonal rounded-full" onclick={modalClose}>
            <Icon icon="mdi:close" class="size-4" />
          </button>
        </header>
        <div class="flex flex-col space-y-4">
          <ul class="grid grid-cols-4 gap-4">
            {#each themeLabels as theme, key (key)}
              <li>
                <button
                  onclick={() => handleThemeChange(theme.name)}
                  class={`btn flex w-full items-center space-x-1 ${
                    currentTheme.name === theme.name
                      ? "preset-outlined-primary-500"
                      : "preset-filled-primary-500 dark:preset-tonal-primary"
                  }`}
                  aria-pressed={currentTheme.name === theme.name}
                >
                  <span class="w-3 text-center">{theme.emoji}</span>
                  <span class="hidden flex-1 text-left sm:inline">{theme.name}</span>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
