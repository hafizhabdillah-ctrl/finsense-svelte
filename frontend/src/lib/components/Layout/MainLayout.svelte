<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import { authStore } from '../../stores/auth';
  import Sidebar from './Sidebar.svelte';
  import Topbar from './Topbar.svelte';
  import Loading from '../Loading.svelte';

  let sidebarOpen = false;
  let auth = $authStore;

  $: auth = $authStore;

  onMount(() => {
    // Check if user is authenticated
    if (!auth.isAuthenticated || !auth.user) {
      router.goto('/login');
    }
  });
</script>

<div class="flex h-screen w-full bg-gray-100 relative">
  <!-- Sidebar untuk desktop & mobile -->
  <div
    class={`
      fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
      lg:relative lg:translate-x-0 lg:z-0
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}
  >
    <Sidebar onClose={() => (sidebarOpen = false)} />
  </div>

  <!-- Overlay untuk mobile saat sidebar terbuka -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
      on:click={() => (sidebarOpen = false)}
      role="presentation"
    />
  {/if}

  <!-- Konten utama -->
  <div class="flex-1 flex flex-col overflow-hidden w-full">
    <Topbar onMenuClick={() => (sidebarOpen = true)} />
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <slot />
    </div>
  </div>
</div>
