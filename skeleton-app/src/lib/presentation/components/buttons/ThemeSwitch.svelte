<script lang="ts">
  import { SegmentedControl } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import { themeLabels, getTheme, setTheme, applyTheme } from "$lib/presentation/stores/themeStore";
  import { isMobile } from "$lib/presentation/utils/mobile";

  let currentTheme = $state(getTheme());

  function handleThemeChange(selectedTheme: string) {
    setTheme({ name: selectedTheme, dark: currentTheme.dark });
    currentTheme = getTheme();
    applyTheme();
  }

  const _isMobile = isMobile();
</script>

<div class="space-y-3 w-full">
  <div class="flex items-center justify-between gap-2">
    <div class="flex items-center gap-1 md:gap-2">
      <Icon icon="mdi:shimmer" class="size-5" />
      UI<span class="hidden md:inline">テーマ</span>
    </div>
    <SegmentedControl
      name="toggle-dark-mode"
      value={String(currentTheme.dark)}
      onValueChange={(e) => {
        const isDark = e.value === "true";
        setTheme({ name: currentTheme.name, dark: isDark });
        currentTheme = getTheme();
        applyTheme();
      }}
    >
      <SegmentedControl.Control>
        <SegmentedControl.Indicator />
        <SegmentedControl.Item value="false">
          <SegmentedControl.ItemHiddenInput />
          <SegmentedControl.ItemText>
            <div class="text-xs md:text-base">
              ライト<span class="hidden md:inline">モード</span>
            </div>
          </SegmentedControl.ItemText>
        </SegmentedControl.Item>
        <SegmentedControl.Item value="true">
          <SegmentedControl.ItemHiddenInput />
          <SegmentedControl.ItemText>
            <div class="text-xs md:text-base">
              ダーク<span class="hidden md:inline">モード</span>
            </div>
          </SegmentedControl.ItemText>
        </SegmentedControl.Item>
      </SegmentedControl.Control>
    </SegmentedControl>
  </div>
  <details class="card p-4" open={!_isMobile}>
    <summary class="cursor-pointer font-bold p-1">テーマ選択</summary>
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
  </details>
</div>
