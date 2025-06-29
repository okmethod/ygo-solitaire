<script lang="ts">
  interface CountBadgeProps {
    count: number;
    size?: "small" | "medium" | "large";
    colorClasses?: string;
  }

  let { count, size = "medium", colorClasses = "bg-primary-200 text-primary-900" }: CountBadgeProps = $props();

  // サイズ別のクラス
  const sizeClasses = {
    small: "w-4 h-4 text-xs",
    medium: "w-6 h-6 text-xs",
    large: "w-8 h-8 text-sm",
  };
</script>

<div
  class="absolute -top-2 -right-2 {sizeClasses[
    size
  ]} {colorClasses} rounded-full flex items-center justify-center font-bold shadow-md z-10"
>
  {count}
</div>
