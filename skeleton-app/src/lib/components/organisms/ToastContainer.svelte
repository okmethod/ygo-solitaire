<script lang="ts">
  import Toast from "$lib/components/atoms/Toast.svelte";
  import { toastStore } from "$lib/stores/toastStore";

  $: toasts = $toastStore;

  function handleToastClose(id: string) {
    toastStore.remove(id);
  }
</script>

{#each toasts as toast (toast.id)}
  <Toast
    message={toast.message}
    type={toast.type}
    duration={toast.duration}
    onClose={() => handleToastClose(toast.id)}
  />
{/each}
