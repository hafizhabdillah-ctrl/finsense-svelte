<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { CirclePlus, Search } from 'lucide-svelte';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import api from '../../lib/services/api';

  let searchTerm = '';
  let logs: any[] = [];
  let todayLogs: any[] = [];
  let loading = true;

  onMount(async () => {
    loading = true;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    try {
      const [allRes, todayRes] = await Promise.all([
        api.get('/stock-logs'),
        api.get('/stock-logs', { params: { startDate: startOfDay, endDate: endOfDay } }),
      ]);
      logs = allRes.data || [];
      todayLogs = todayRes.data || [];
    } catch (err: any) {
      Swal.fire('Error', 'Gagal memuat data log stok', 'error');
    } finally {
      loading = false;
    }
  });

  // ---------------- Statistik hari ini ----------------
  $: stockIn = todayLogs.filter((l) => l.type === 'in').reduce((sum, l) => sum + l.quantity, 0);
  $: stockOut = todayLogs.filter((l) => l.type === 'out').reduce((sum, l) => sum + l.quantity, 0);

  // ---------------- Filter (nama produk atau SKU) + pagination ----------------
  let currentPage = 1;
  const itemsPerPage = 10;

  $: filteredLogs = !searchTerm.trim()
    ? logs
    : logs.filter(
        (log) =>
          log.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
      );

  // Kembali ke halaman 1 saat pencarian berubah
  $: {
    searchTerm;
    currentPage = 1;
  }

  $: indexOfLastItem = currentPage * itemsPerPage;
  $: indexOfFirstItem = indexOfLastItem - itemsPerPage;
  $: currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  $: totalItems = filteredLogs.length;
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
        <h1 class="text-xl md:text-2xl font-bold">Log Barang</h1>
        <p class="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <button
        on:click={() => router.goto('/new?type=log')}
        class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 px-4 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
      >
        <CirclePlus size={16} />
        <span>Tambah Log baru</span>
      </button>
    </div>

    <!-- Statistik -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      <div class="relative flex-1 flex flex-col justify-between bg-white p-4 border rounded-md border-gray-300 shadow-sm">
        <h1 class="text-gray-500 font-bold text-sm uppercase tracking-wider">STOK MASUK HARI INI</h1>
        <p class="flex items-center gap-2 text-2xl font-bold text-sky-950">
          <span>{stockIn}</span>
          <span class="relative text-sm top-1">Barang</span>
        </p>
      </div>
      <div class="relative flex-1 flex flex-col justify-between bg-white p-4 border rounded-md border-gray-300 shadow-sm">
        <h1 class="text-gray-500 font-bold text-sm uppercase tracking-wider">STOK KELUAR HARI INI</h1>
        <p class="flex items-center gap-2 text-2xl font-bold text-sky-950">
          <span>{stockOut}</span>
          <span class="relative text-sm top-1">Barang</span>
        </p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative mt-4 max-w-md">
      <input
        type="text"
        placeholder="Cari berdasarkan nama produk atau SKU..."
        bind:value={searchTerm}
        class="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-950"
      />
      <Search size={16} class="absolute left-3 top-3 text-gray-400" />
    </div>

    <!-- Tabel -->
    <div class="overflow-x-auto mt-2">
      {#if loading}
        <div class="p-4">Memuat data log...</div>
      {:else}
        <div class="overflow-x-auto">
          <div class="min-w-[800px]">
            <div class="bg-sky-950 p-2 flex w-full mt-4 text-white font-semibold">
              <div class="flex-1 text-center">Waktu</div>
              <div class="flex-1 text-center">Produk</div>
              <div class="flex-1 text-center">SKU</div>
              <div class="flex-1 text-center">Tipe</div>
              <div class="flex-1 text-center">Jumlah</div>
              <div class="flex-1 text-center">Oleh</div>
              <div class="flex-1 text-center">Status</div>
            </div>
            <div class="flex flex-col">
              {#if currentItems.length === 0}
                <div class="p-4 text-center text-gray-500">
                  {searchTerm ? 'Tidak ada log yang cocok' : 'Tidak ada data log barang'}
                </div>
              {:else}
                {#each currentItems as log (log.id)}
                  <div
                    role="button"
                    tabindex="0"
                    on:click={() => router.goto(`/logs/${log.id}`)}
                    on:keydown={(e) => e.key === 'Enter' && router.goto(`/logs/${log.id}`)}
                    class="flex items-center w-full p-2 border-b border-r border-l border-gray-300 cursor-pointer hover:bg-gray-300 transition-all"
                  >
                    <div class="flex-1 text-center text-gray-800 text-sm">{new Date(log.created_at).toLocaleString()}</div>
                    <div class="flex-1 text-center text-gray-800 text-sm font-bold">{log.product?.name}</div>
                    <div class="flex-1 text-center text-gray-500 text-sm">{log.product?.sku}</div>
                    <div class="flex-1 text-center text-gray-500 text-sm">
                      {log.type === 'in' ? 'Stok Masuk' : log.type === 'out' ? 'Stok Keluar' : 'Penyesuaian'}
                    </div>
                    <div class="flex-1 text-center text-gray-800 text-sm">{log.quantity}</div>
                    <div class="flex-1 text-center text-gray-800 text-sm">{log.operator}</div>
                    <div class="flex-1 text-center text-gray-800 text-sm">
                      {log.status === 'completed' ? 'Selesai' : 'Menunggu audit'}
                    </div>
                  </div>
                {/each}
              {/if}
              <div class="p-2 border-t border-gray-200 flex justify-between">
                <p class="text-sm text-gray-500">
                  Menampilkan {startRange}-{endRange} dari {totalItems} log
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
