<script lang="ts">
  import { Segment } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import { themeLabels, getTheme, setTheme, applyTheme } from "$lib/presentation/stores/themeStore";

  let currentTheme = $state(getTheme());

  function handleThemeChange(selectedTheme: string) {
    setTheme({ name: selectedTheme, dark: currentTheme.dark });
    currentTheme = getTheme();
    applyTheme();
  }
</script>

<div class="space-y-3">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Icon icon="mdi:shimmer" class="size-5" />
      <span>UI テーマ</span>
    </div>
    <Segment
      name="toggle-dark-mode"
      value={String(currentTheme.dark)}
      onValueChange={(e) => {
        const isDark = e.value === "true";
        setTheme({ name: currentTheme.name, dark: isDark });
        currentTheme = getTheme();
        applyTheme();
      }}
    >
      <Segment.Item value="false">ライトモード</Segment.Item>
      <Segment.Item value="true">ダークモード</Segment.Item>
    </Segment>
  </div>
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
