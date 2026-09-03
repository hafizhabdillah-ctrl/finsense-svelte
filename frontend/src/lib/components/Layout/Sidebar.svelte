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
        <path d="M16.3 8.2c-1.6-.9-3-.8-4.3 0l-3.8 2.4c-.8.5-1.1 1.5-.6 2.3.4.6 1.1.9 1.8.7M7.7 15.8c1.6.9 3 .8 4.3 0l3.8-2.4c.8-.5 1.1-1.5.6-2.3-.4-.6-1.1-.9-1.8-.7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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