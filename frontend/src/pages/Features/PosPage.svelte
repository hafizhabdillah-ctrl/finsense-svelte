<script lang="ts">
  import { router } from 'tinro';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
</script>

<MainLayout>
  <div class="px-4 h-full flex flex-col">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
      <h1 class="text-2xl font-bold">POS Terminal</h1>
      <button
        on:click={() => router.goto('/pos/new')}
        class="flex items-center gap-2 bg-sky-950 p-2 px-4 text-white font-semibold border cursor-pointer rounded-lg hover:bg-white hover:text-sky-950 transition"
      >
        Tambah POS baru
      </button>
    </div>
    <div class="flex flex-col lg:flex-row gap-4 mt-4 flex-1">
      <div class="flex flex-col gap-4 lg:w-3/4">
        <div class="bg-white rounded-lg shadow-md p-4">
          <h2 class="text-lg font-bold mb-4">Daftar Produk</h2>
          <div class="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p class="text-gray-500">Produk akan ditampilkan di sini</p>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-4">
          <h2 class="text-lg font-bold mb-4">Produk Sering Dibeli</h2>
          <div class="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p class="text-gray-500">Produk populer akan ditampilkan di sini</p>
          </div>
        </div>
      </div>
      <div class="border border-gray-400 rounded-md w-full lg:w-1/4 bg-white p-4">
        <h2 class="text-lg font-bold mb-4">Keranjang</h2>
        <div class="text-center text-gray-500">Keranjang kosong</div>
      </div>
    </div>
  </div>
</MainLayout>
