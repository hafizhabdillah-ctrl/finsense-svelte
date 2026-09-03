<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { logService } from '../../lib/services';

  let searchTerm = '';
  let logs: any[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadLogs();
  });

  async function loadLogs() {
    loading = true;
    error = '';
    try {
      logs = await logService.getAll();
    } catch (err: any) {
      error = err.response?.data?.error || 'Gagal memuat data log.';
    } finally {
      loading = false;
    }
  }

  function goToDetail(id: string) {
    router.goto(`/logs/${id}`);
  }

  $: filteredLogs = searchTerm
    ? logs.filter(
        (l) =>
          (l.product?.name && l.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (l.product?.sku && l.product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : logs;

  $: totalLogs = logs.length;
  $: inCount = logs.filter((l) => l.type === 'in').length;
  $: outCount = logs.filter((l) => l.type === 'out').length;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function typeLabel(t: string) {
    return { in: 'Masuk', out: 'Keluar', adjust: 'Penyesuaian' }[t] ?? t;
  }
  function typeClass(t: string) {
    return {
      in: 'bg-green-100 text-green-700',
      out: 'bg-red-100 text-red-700',
      adjust: 'bg-blue-100 text-blue-700',
    }[t] ?? 'bg-gray-100 text-gray-600';
  }
  function statusClass(s: string) {
    return s === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  }
</script>

<MainLayout>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h1 class="text-xl md:text-2xl font-bold">Log Barang</h1>
      <button
        on:click={() => router.goto('/new?type=log')}
        class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 px-4 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
      >
        Tambah Log baru
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Total Log</p>
        <h3 class="text-2xl font-bold">{totalLogs}</h3>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Barang Masuk</p>
        <h3 class="text-2xl font-bold">{inCount}</h3>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Barang Keluar</p>
        <h3 class="text-2xl font-bold">{outCount}</h3>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative mt-4 max-w-md mb-6">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Cari berdasarkan nama produk atau SKU..."
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
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Produk</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">SKU</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Tipe</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Jumlah</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Operator</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Status</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {#if filteredLogs.length === 0}
              <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'Log tidak ditemukan.' : 'Belum ada data log stok.'}
                </td>
              </tr>
            {:else}
              {#each filteredLogs as log, i (log.id)}
                <tr
                  class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  on:click={() => goToDetail(log.id)}
                >
                  <td class="px-6 py-3 text-sm">{i + 1}</td>
                  <td class="px-6 py-3 font-medium">{log.product?.name ?? '-'}</td>
                  <td class="px-6 py-3 text-gray-500 text-sm">{log.product?.sku ?? '-'}</td>
                  <td class="px-6 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold {typeClass(log.type)}">
                      {typeLabel(log.type)}
                    </span>
                  </td>
                  <td class="px-6 py-3 font-semibold">{log.quantity}</td>
                  <td class="px-6 py-3 text-gray-500 text-sm">{log.operator ?? '-'}</td>
                  <td class="px-6 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold {statusClass(log.status)}">
                      {log.status === 'completed' ? 'Selesai' : 'Audit'}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm">{formatDate(log.created_at)}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
        <div class="px-6 py-3 text-sm text-gray-500 border-t">
          Menampilkan {filteredLogs.length === 0 ? 0 : 1}-{filteredLogs.length} dari {filteredLogs.length} log
        </div>
      {/if}
    </div>
  </div>
</MainLayout>
