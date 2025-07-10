<script lang="ts">
  import { onMount } from "svelte";

  interface ToastProps {
    message: string;
    type?: "success" | "error" | "info" | "warning";
    duration?: number;
    onClose?: () => void;
  }

  let { message, type = "info", duration = 3000, onClose }: ToastProps = $props();

  let visible = $state(true);
  let progress = $state(100);

  // タイプ別のスタイル
  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-black",
  };

  // タイプ別のアイコン
  const typeIcons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };

  onMount(() => {
    // プログレスバーのアニメーション
    const progressInterval = setInterval(() => {
      progress -= (100 / duration) * 50; // 50msごとに更新
      if (progress <= 0) {
        clearInterval(progressInterval);
      }
    }, 50);

    // 自動閉じ
    const timer = setTimeout(() => {
      visible = false;
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // フェードアウト時間
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  });

  function handleClose() {
    visible = false;
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  }
</script>

<div
  class="fixed top-4 right-4 max-w-sm z-50 transform transition-all duration-300 ease-in-out"
  class:translate-x-0={visible}
  class:translate-x-full={!visible}
  class:opacity-100={visible}
  class:opacity-0={!visible}
>
  <div class="rounded-lg shadow-lg p-4 {typeStyles[type]} border-l-4 border-white">
    <div class="flex items-start justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-lg">{typeIcons[type]}</span>
        <p class="text-sm font-medium flex-1">{message}</p>
      </div>
      <button class="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity" onclick={handleClose}>
        ✕
      </button>
    </div>

    <!-- プログレスバー -->
    <div class="mt-2 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
      <div class="h-full bg-white transition-all duration-50 ease-linear" style="width: {Math.max(0, progress)}%"></div>
    </div>
  </div>
</div>
