<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import { themeLabels, getTheme, setTheme, applyTheme } from "$lib/stores/theme";

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

<Modal
  open={openState}
  onOpenChange={(e) => (openState = e.open)}
  triggerBase="btn preset-filled"
  contentBase="card bg-surface-100-900 p-4 mx-auto space-y-4 shadow-xl max-w-80 sm:max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
  {#snippet trigger()}
    <Icon icon="mdi:shimmer" class="size-4" />
    <span>Theme</span>
  {/snippet}
  {#snippet content()}
    <header class="flex justify-between">
      <h2 class="text-2xl sm:text-3xl w-64 sm:w-80">Switch Theme</h2>
      <Switch
        name="toggle-dark-mode"
        controlClasses="h-8 w-12"
        controlActive="bg-surface-200"
        checked={currentTheme.dark}
        onCheckedChange={() => toggleDarkMode()}
      >
        {#snippet inactiveChild()}<Icon icon="mdi:weather-sunny" class="size-6" />{/snippet}
        {#snippet activeChild()}<Icon icon="mdi:weather-night" class="size-6" />{/snippet}
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
              class={`btn w-full flex items-center space-x-1 ${
                currentTheme.name === theme.name
                  ? "preset-outlined-primary-500"
                  : "preset-filled-primary-500 dark:preset-tonal-primary"
              }`}
              aria-pressed={currentTheme.name === theme.name}
            >
              <span class="w-3 text-center">{theme.emoji}</span>
              <span class="flex-1 text-left hidden sm:inline">{theme.name}</span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/snippet}
</Modal>
