<script lang="ts">
  export let fullScreen = false;
  export let text = 'Memuat...';
</script>

{#if fullScreen}
  <div class="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-950 mx-auto mb-4"></div>
      <p class="text-gray-600">{text}</p>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center p-4">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-950 mx-auto mb-2"></div>
      <p class="text-gray-600 text-sm">{text}</p>
    </div>
  </div>
{/if}
