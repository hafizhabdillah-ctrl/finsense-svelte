<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { dashboardService } from '../../lib/services';

  let loading = true;
  let error = '';

  let stats = {
    totalPenjualanHariIni: 0,
    totalTransaksiHariIni: 0,
    stokProduk: 0,
    hutangPelanggan: 0,
  };
  let topStock: { id: string; name: string; stock: number; unit: string | null }[] = [];

  let chartCanvas: HTMLCanvasElement;
  let chartInstance: Chart | null = null;

  function formatRp(val: number) {
    return 'Rp ' + val.toLocaleString('id-ID');
  }

  function formatDay(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  }

  onMount(async () => {
    loading = true;
    error = '';
    try {
      const [statsData, graphData, stockData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getGraphData(),
        dashboardService.getStockData(),
      ]);
      stats = statsData;
      topStock = stockData;

      chartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels: graphData.map((d: any) => formatDay(d.date)),
          datasets: [
            {
              label: 'Pemasukan',
              data: graphData.map((d: any) => d.income),
              borderColor: '#16a34a',
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Pengeluaran',
              data: graphData.map((d: any) => d.expense),
              borderColor: '#dc2626',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { beginAtZero: true } },
        },
      });
    } catch (err: any) {
      error = err.response?.data?.error || 'Gagal memuat data dashboard.';
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    chartInstance?.destroy();
  });
</script>

<MainLayout>
  <div>
    <h1 class="text-xl md:text-2xl font-bold">
      Statistik Penjualan
    </h1>
    <p class="mx-2 mb-4 md:mb-6 text-gray-500 text-sm">
      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>

    {#if error}
      <div class="py-4 text-center text-red-500">{error}</div>
    {/if}

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
        <p class="text-gray-600 text-sm mb-2 font-bold">PEMASUKAN HARI INI</p>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">{formatRp(stats.totalPenjualanHariIni)}</h3>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
        <p class="text-gray-600 text-sm mb-2 font-bold">TRANSAKSI HARI INI</p>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">{stats.totalTransaksiHariIni}</h3>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold mb-4">Grafik Penjualan (7 Hari Terakhir)</h2>
        <div class="h-64 relative">
          <canvas bind:this={chartCanvas}></canvas>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold mb-4">Stok Teratas</h2>
        {#if loading}
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-950"></div>
          </div>
        {:else if topStock.length === 0}
          <div class="text-center text-gray-500 text-sm py-8">Belum ada data produk.</div>
        {:else}
          <div class="space-y-3">
            {#each topStock as product (product.id)}
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span class="text-sm font-medium">{product.name}</span>
                <span class="text-sm text-gray-600">{product.stock} {product.unit ?? 'pcs'}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</MainLayout>
