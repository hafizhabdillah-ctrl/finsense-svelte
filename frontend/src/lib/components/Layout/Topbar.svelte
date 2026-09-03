<script lang="ts">
  import { router } from 'tinro';
  import { authStore } from '../../stores/auth';
  import SettingsModal from './SettingsModal.svelte';
  import { Settings } from 'lucide-svelte';

  export let onMenuClick = () => {};

  let isSettingsModalOpen = false;
  let auth = $authStore;

  $: auth = $authStore;
</script>

<div
  class="sticky top-0 z-30 flex items-center justify-between w-full py-3 px-4 md:py-4 border-b border-gray-200 bg-white"
>
  <!-- Kiri Tombol menu (mobile) + back -->
  <div class="flex items-center gap-2">
    <button
      on:click={onMenuClick}
      class="lg:hidden text-gray-600 hover:text-gray-900 p-1 rounded-md focus:outline-none cursor-pointer"
    >
      ☰
    </button>
    <button
      on:click={() => window.history.back()}
      class="hidden sm:block text-gray-500 hover:text-gray-700 p-1 rounded-md transition-colors cursor-pointer"
    >
      <span class="text-2xl">←</span>
    </button>
  </div>

  <!-- Kanan Settings, Profile -->
  <div class="flex items-center gap-2 md:gap-4 text-gray-500">
    <button
      on:click={() => (isSettingsModalOpen = true)}
      class="cursor-pointer hover:text-gray-700 transition-colors p-1"
    >
      <Settings />
    </button>
    <div class="pl-2 md:pl-4 border-l border-gray-300 font-semibold text-sky-950">
      {auth.user?.full_name || 'User'}
    </div>
  </div>
</div>

<SettingsModal bind:isOpen={isSettingsModalOpen} />
