<script lang="ts">
  import { BADGE_SIZE_CLASSES, type ComponentSize } from "$lib/presentation/constants/sizes";

  interface CountBadgeProps {
    count: number;
    size?: ComponentSize;
    colorClasses?: string;
  }

  let { count, size = "medium", colorClasses = "bg-primary-200 text-primary-900" }: CountBadgeProps = $props();
</script>

<div
  class="absolute -top-2 -right-2 {BADGE_SIZE_CLASSES[
    size
  ]} {colorClasses} z-10 flex items-center justify-center rounded-full font-bold shadow-md"
>
  {count}
</div>
