<script lang="ts">
  import { router } from 'tinro';
  import { authStore } from '../../stores/auth';
  import { authService } from '../../services';

  // Import Ikon dari Lucide
  import {
    LayoutDashboard,
    ReceiptText,
    Package,
    ShoppingCart,
    Users,
    ClipboardList,
    Plus,
    X,
    LogOut
  } from 'lucide-svelte';

  export let onClose = () => {};

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Catatan Keuangan', icon: ReceiptText, path: '/transactions' },
    { name: 'Manajemen Stok', icon: Package, path: '/stocks' },
    { name: 'POS Terminal', icon: ShoppingCart, path: '/pos' },
    { name: 'Hutang Pelanggan', icon: Users, path: '/debts' },
    { name: 'Log Inventori', icon: ClipboardList, path: '/logs' },
  ];

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout gagal:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      authStore.set({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
      router.goto('/login');
    }
  };
</script>

<div
  class="w-64 h-full bg-white border-r border-gray-200 flex flex-col overflow-y-auto shadow-lg lg:shadow-none"
>
  <!-- Header dengan tombol close di mobile -->
  <div class="flex items-center justify-between px-4 py-4">
    <div class="flex items-center">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 md:h-14 md:w-14">
        <path d="M19.6 5.3c-2-2.9-5.9-3.8-8.8-2l-4.9 3.1a5.6 5.6 0 0 0-2.5 3.7 5.7 5.7 0 0 0 .6 3.8 5.5 5.5 0 0 0-.8 2.1 5.8 5.8 0 0 0 1 4.4c2 2.9 5.9 3.8 8.8 2l4.9-3.1a5.6 5.6 0 0 0 2.5-3.7 5.7 5.7 0 0 0-.6-3.8 5.5 5.5 0 0 0 .8-2.1 5.8 5.8 0 0 0-1-4.4Z" fill="#FF3E00"/>
        <path d="M10.4 19.4a3.5 3.5 0 0 1-3.7-1.4 3.2 3.2 0 0 1-.6-2.5l.2-.6.5.4a6.4 6.4 0 0 0 1.9 1l.4.1-.1.4a1 1 0 0 0 .2.9 1.1 1.1 0 0 0 1.2.4l.3-.1 4.9-3.1a.9.9 0 0 0 .4-.6 1 1 0 0 0-.1-.7 1.1 1.1 0 0 0-1.2-.4l-.3.1-1.9 1.2a3.6 3.6 0 0 1-1.1.4 3.5 3.5 0 0 1-3.7-1.4 3.2 3.2 0 0 1-.6-2.5 2.9 2.9 0 0 1 1.3-2l4.9-3.1a3.6 3.6 0 0 1 1.1-.4 3.5 3.5 0 0 1 3.7 1.4 3.2 3.2 0 0 1 .6 2.5l-.2.6-.5-.4a6.4 6.4 0 0 0-1.9-1l-.4-.1.1-.4a1 1 0 0 0-.2-.9 1.1 1.1 0 0 0-1.2-.4l-.3.1-4.9 3.1a.9.9 0 0 0-.4.6 1 1 0 0 0 .1.7 1.1 1.1 0 0 0 1.2.4l.3-.1 1.9-1.2a3.6 3.6 0 0 1 1.1-.4 3.5 3.5 0 0 1 3.7 1.4 3.2 3.2 0 0 1 .6 2.5 2.9 2.9 0 0 1-1.3 2l-4.9 3.1a3.6 3.6 0 0 1-1.1.4Z" fill="#FFF"/>
      </svg>
      <h1 class="font-bold py-1 px-2 text-2xl md:text-3xl">
        Fin<span class="text-orange-400">Sense</span>
      </h1>
    </div>
    <button
      on:click={onClose}
      class="lg:hidden text-gray-500 hover:text-gray-700 cursor-pointer p-1"
      aria-label="Tutup Menu"
    >
      <X size={20} />
    </button>
  </div>

  <!-- New Item -->
  <div class="mx-4 mt-2">
    <button
      on:click={() => {
        router.goto('/new');
        onClose();
      }}
      class="w-full bg-sky-950 text-white font-bold rounded-lg py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-sky-900 transition"
    >
      <Plus size={18} />
      <span>New Item</span>
    </button>
  </div>

  <!-- Menu Items -->
  <div class="mx-4 mt-8 text-sm">
    {#each menuItems as item (item.name)}
      <div class="mb-2">
        <a
          href={item.path}
          on:click={onClose}
          class="w-full py-3 px-3 flex items-center gap-3 rounded-lg transition cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <svelte:component this={item.icon} size={20} class="shrink-0" />
          <span class="font-medium">
            {item.name}
          </span>
        </a>
      </div>
    {/each}
  </div>

  <!-- Bottom Section -->
  <div class="flex flex-col mt-auto py-4 text-gray-600">
    <hr class="border-t border-gray-300 mx-4 mb-4" />
    <button
      on:click={handleLogout}
      class="flex mx-4 py-2 px-3 gap-3 items-center text-gray-600 cursor-pointer hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  </div>
</div>