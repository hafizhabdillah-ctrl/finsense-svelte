<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { CirclePlus, Search } from 'lucide-svelte';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { stockService } from '../../lib/services';

  let searchTerm = '';
  let products: any[] = [];
  let loading = true;

  onMount(async () => {
    loading = true;
    try {
      products = await stockService.getAll();
    } catch (err: any) {
      Swal.fire('Error', 'Gagal memuat data produk', 'error');
    } finally {
      loading = false;
    }
  });

  // ---------------- Statistik ----------------
  $: totalProducts = products.length;
  $: lowStock = products.filter((p) => p.stock <= p.min_stock).length;

  // ---------------- Filter (nama atau SKU) + pagination ----------------
  let currentPage = 1;
  const itemsPerPage = 5;

  $: filteredProducts = !searchTerm.trim()
    ? products
    : products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
      );

  // Kembali ke halaman 1 saat pencarian berubah
  $: {
    searchTerm;
    currentPage = 1;
  }

  $: indexOfLastItem = currentPage * itemsPerPage;
  $: indexOfFirstItem = indexOfLastItem - itemsPerPage;
  $: currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  $: totalItems = filteredProducts.length;
  $: startRange = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  $: endRange = Math.min(indexOfLastItem, totalItems);

  const goToNextPage = () => {
    if (indexOfLastItem < totalItems) currentPage += 1;
  };
  const goToPrevPage = () => {
    if (currentPage > 1) currentPage -= 1;
  };
</script>

<MainLayout>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <div>
        <h1 class="text-xl md:text-2xl font-bold">Manajemen Stok</h1>
        <p class="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <button
        on:click={() => router.goto('/new?type=product')}
        class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 px-4 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
      >
        <CirclePlus size={16} />
        <span>Tambah Stok baru</span>
      </button>
    </div>

    <!-- Statistik -->
    {#if loading}
      <div class="flex w-full gap-4 mt-4">Memuat statistik...</div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 border-gray-300 gap-4 mt-4">
        <div class="relative flex-1 flex flex-col justify-between bg-white p-4 border rounded-md border-gray-300 shadow-sm">
          <h1 class="text-gray-500 font-bold text-sm uppercase tracking-wider">PRODUK AKTIF</h1>
          <p class="flex items-center gap-2 text-2xl font-bold text-sky-950">
            <span>{totalProducts}</span>
            <span class="relative text-sm top-1">Barang</span>
          </p>
        </div>
        <div class="relative flex-1 flex flex-col justify-between bg-white p-4 border rounded-md border-gray-300 shadow-sm">
          <h1 class="text-gray-500 font-bold text-sm uppercase tracking-wider">PRODUK MENIPIS</h1>
          <p class="flex items-center gap-2 text-2xl font-bold text-sky-950">
            <span>{lowStock}</span>
            <span class="relative text-sm top-1">Barang</span>
          </p>
        </div>
      </div>
    {/if}

    <!-- Search Bar -->
    <div class="relative mt-4 max-w-md">
      <input
        type="text"
        placeholder="Cari berdasarkan nama atau SKU..."
        bind:value={searchTerm}
        class="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-950"
      />
      <Search size={16} class="absolute left-3 top-3 text-gray-400" />
    </div>

    <!-- Tabel -->
    <div class="overflow-x-auto mt-2">
      {#if loading}
        <div class="p-4">Memuat data stok...</div>
      {:else}
        <div class="overflow-x-auto">
          <div class="min-w-[800px]">
            <div class="bg-sky-950 p-2 flex w-full mt-4 text-white font-semibold">
              <div class="flex-1 text-center">No.</div>
              <div class="flex-4 text-center">Nama Produk</div>
              <div class="flex-4 text-center">SKU</div>
              <div class="flex-2 text-center">Stok</div>
              <div class="flex-4 text-center">Status</div>
            </div>
            <div class="flex flex-col">
              {#if currentItems.length === 0}
                <div class="p-4 text-center text-gray-500">
                  {searchTerm ? 'Tidak ada produk yang cocok' : 'Tidak ada data stok barang'}
                </div>
              {:else}
                {#each currentItems as product, idx (product.id)}
                  <div
                    role="button"
                    tabindex="0"
                    on:click={() => router.goto(`/stocks/${product.id}`)}
                    on:keydown={(e) => e.key === 'Enter' && router.goto(`/stocks/${product.id}`)}
                    class="flex items-center w-full p-2 border-b border-r border-l border-gray-300 cursor-pointer hover:bg-gray-300 transition-all"
                  >
                    <div class="flex-1 text-center text-gray-800 text-sm">{indexOfFirstItem + idx + 1}</div>
                    <div class="flex-4 text-center text-gray-800 text-sm">{product.name}</div>
                    <div class="flex-4 text-center text-gray-800 text-sm">{product.sku}</div>
                    <div class="flex-2 text-center text-gray-800 text-sm">{product.stock}</div>
                    <div class="flex-4 text-center text-gray-800 text-sm">
                      <span class="font-bold {product.stock <= product.min_stock ? 'text-red-700' : 'text-green-700'}">
                        {product.stock <= product.min_stock ? 'Menipis' : 'Aman'}
                      </span>
                    </div>
                  </div>
                {/each}
              {/if}
              <div class="p-2 border-t border-gray-200 flex justify-between">
                <p class="text-sm text-gray-500">
                  Menampilkan {startRange}-{endRange} dari {totalItems} produk
                </p>
                <div class="flex gap-2">
                  <button
                    on:click={goToPrevPage}
                    disabled={currentPage === 1}
                    class="px-3 py-1 text-sm border rounded-md font-medium {currentPage === 1
                      ? 'text-gray-300 border-gray-200'
                      : 'cursor-pointer text-gray-600 border-gray-300 hover:bg-white'}"
                  >
                    Sebelumnya
                  </button>
                  <button
                    on:click={goToNextPage}
                    disabled={indexOfLastItem >= totalItems}
                    class="px-3 py-1 text-sm border rounded-md font-medium {indexOfLastItem >= totalItems
                      ? 'text-gray-300 border-gray-200'
                      : 'cursor-pointer text-gray-600 border-gray-300 hover:bg-white'}"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</MainLayout>
