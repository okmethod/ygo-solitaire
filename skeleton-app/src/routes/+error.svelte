<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="flex h-screen">
  <div class="m-auto text-center">
    <p class="text-4xl leading-loose font-bold tracking-wider text-gray-800">
      {page.status}
      {page.error?.message}
    </p>
  </div>
</div>
