<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { stockService } from '../../lib/services';

  let searchTerm = '';
  let stocks: any[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadStocks();
  });

  async function loadStocks() {
    loading = true;
    error = '';
    try {
      stocks = await stockService.getAll();
    } catch (err: any) {
      error = err.response?.data?.error || 'Gagal memuat data stok.';
    } finally {
      loading = false;
    }
  }

  function goToDetail(id: string) {
    router.goto(`/stocks/${id}`);
  }

  $: filteredStocks = searchTerm
    ? stocks.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.sku && s.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : stocks;

  $: totalProducts = stocks.length;
  $: lowStockCount = stocks.filter((s) => s.stock <= s.min_stock).length;

  function formatRp(val: number) {
    return 'Rp ' + val.toLocaleString('id-ID');
  }
</script>

<MainLayout>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h1 class="text-xl md:text-2xl font-bold">Manajemen Stok</h1>
      <button
        on:click={() => router.goto('/new?type=product')}
        class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 px-4 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
      >
        Tambah Stok baru
      </button>
    </div>
    <p class="mx-2 -mt-3 mb-4 text-gray-500 text-sm">
      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm font-bold">PRODUK AKTIF</p>
        <h3 class="text-2xl font-bold">{totalProducts}</h3>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm font-bold">PRODUK MENIPIS</p>
        <h3 class="text-2xl font-bold">{lowStockCount}</h3>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative mt-4 max-w-md mb-6">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Cari berdasarkan nama atau SKU..."
        class="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-950"
      />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      {#if loading}
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-950"></div>
          <span class="ml-3 text-gray-500">Memuat data...</span>
        </div>
      {:else if error}
        <div class="py-8 text-center text-red-500">{error}</div>
      {:else}
        <table class="w-full">
          <thead>
            <tr class="bg-sky-950">
              <th class="px-6 py-3 text-left text-sm font-bold text-white">No.</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Nama Produk</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">SKU</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Stok</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Satuan</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Harga Jual</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Status</th>
            </tr>
          </thead>
          <tbody>
            {#if filteredStocks.length === 0}
              <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'Produk tidak ditemukan.' : 'Belum ada data produk. Tambah produk pertama Anda!'}
                </td>
              </tr>
            {:else}
              {#each filteredStocks as stock, i (stock.id)}
                <tr
                  class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  on:click={() => goToDetail(stock.id)}
                >
                  <td class="px-6 py-3 text-sm">{i + 1}</td>
                  <td class="px-6 py-3 font-medium">{stock.name}</td>
                  <td class="px-6 py-3 text-gray-500">{stock.sku ?? '-'}</td>
                  <td class="px-6 py-3 font-semibold">{stock.stock}</td>
                  <td class="px-6 py-3 text-gray-500">{stock.unit ?? '-'}</td>
                  <td class="px-6 py-3">
                    {stock.price != null ? formatRp(stock.price) : '-'}
                  </td>
                  <td class="px-6 py-3">
                    <span
                      class="text-sm font-semibold
                        {stock.stock <= stock.min_stock ? 'text-red-600' : 'text-green-600'}"
                    >
                      {stock.stock <= stock.min_stock ? 'Menipis' : 'Aman'}
                    </span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
        <div class="px-6 py-3 text-sm text-gray-500 border-t">
          Menampilkan {filteredStocks.length === 0 ? 0 : 1}-{filteredStocks.length} dari {filteredStocks.length} produk
        </div>
      {/if}
    </div>
  </div>
</MainLayout>
