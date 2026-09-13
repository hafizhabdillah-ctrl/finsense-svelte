<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
  } from 'chart.js';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import api from '../../lib/services/api';

  Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

  // ---------------- Statistik hari ini + grafik + prediksi AI ----------------
  let loading = true;
  let todayIncome = 0;
  let todayCount = 0;
  let chartData: { dates: string[]; amounts: number[] } = { dates: [], amounts: [] };
  let revenuePrediction: { predicted_revenue: number | string; prediction_date: string } | null = null;
  let predictionMessage = '';

  // ---------------- Rekomendasi Restok (produk menipis) ----------------
  let loadingStock = true;
  let lowStockList: { id: string; name: string; stock: number; min_stock: number }[] = [];

  let chartInstance: Chart | null = null;

  async function fetchDashboardData() {
    loading = true;
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      // 1. Transaksi hari ini
      const todayRes = await api.get('/transactions', {
        params: { startDate: startOfDay, endDate: endOfDay },
      });
      const todayIncomes = (todayRes.data || []).filter((t: any) => t.type === 'income');
      todayIncome = todayIncomes.reduce((s: number, t: any) => s + t.amount, 0);
      todayCount = todayIncomes.length;

      // 2. Grafik 7 hari
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weeklyRes = await api.get('/transactions', {
        params: { startDate: sevenDaysAgo.toISOString(), endDate: endOfDay },
      });
      const weeklyIncomes = (weeklyRes.data || []).filter((t: any) => t.type === 'income');
      const dailyMap = new Map<string, number>();
      weeklyIncomes.forEach((t: any) => {
        const date = t.transaction_date.split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + t.amount);
      });
      const sortedDates = Array.from(dailyMap.keys()).sort();
      chartData = { dates: sortedDates, amounts: sortedDates.map((d) => dailyMap.get(d) || 0) };

      // 3. Prediksi Revenue AI (dengan validasi kewajaran)
      try {
        const revRes = await api.get('/ai/predict-revenue');
        if (revRes.data?.available === false) {
          predictionMessage = revRes.data.message || 'Data transaksi belum cukup';
          revenuePrediction = null;
        } else {
          const rawValue = revRes.data?.predicted_revenue;
          // Jika null/undefined atau nilai tidak masuk akal (<=0) -> tampilkan placeholder
          const displayValue =
            rawValue === null || rawValue === undefined || rawValue <= 0 ? '......' : rawValue;
          revenuePrediction = {
            predicted_revenue: displayValue,
            prediction_date:
              revRes.data?.prediction_date || new Date().toISOString().split('T')[0],
          };
          predictionMessage = revRes.data?.note || '';
        }
      } catch (err) {
        console.error('Revenue prediction error:', err);
        revenuePrediction = null;
        predictionMessage = 'Gagal memuat prediksi pendapatan';
      }
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      loading = false;
    }
  }

  async function fetchLowStock() {
    loadingStock = true;
    try {
      const productsRes = await api.get('/products');
      const products = productsRes.data || [];
      lowStockList = products.filter((p: any) => p.stock <= p.min_stock);
    } catch (err) {
      console.error('Gagal mengambil data produk', err);
      lowStockList = [];
    } finally {
      loadingStock = false;
    }
  }

  // Action: render Line chart pada canvas (dipanggil saat canvas dibuat / data berubah)
  function renderChart(canvas: HTMLCanvasElement, data: { dates: string[]; amounts: number[] }) {
    const build = (d: { dates: string[]; amounts: number[] }) => {
      chartInstance?.destroy();
      chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels: d.dates,
          datasets: [
            {
              label: 'Pemasukan (Rp)',
              data: d.amounts,
              borderColor: '#0c4a6e',
              backgroundColor: 'rgba(12, 74, 110, 0.1)',
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Penjualan 7 Hari Terakhir' },
          },
        },
      });
    };
    build(data);
    return {
      update(newData: { dates: string[]; amounts: number[] }) {
        build(newData);
      },
      destroy() {
        chartInstance?.destroy();
        chartInstance = null;
      },
    };
  }

  onMount(() => {
    fetchDashboardData();
    fetchLowStock();
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

    <!-- Statistik -->
    {#if loading}
      <div class="flex gap-4">Memuat statistik...</div>
    {:else}
      <div class="flex flex-col w-full gap-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 border rounded-md border-gray-300 shadow-sm">
            <h2 class="text-gray-500 text-sm font-semibold">
              PEMASUKAN HARI INI
            </h2>
            <p class="text-xl md:text-2xl font-bold text-sky-950">
              Rp {todayIncome.toLocaleString()}
            </p>
          </div>
          <div class="flex-1 bg-white p-4 border rounded-md border-gray-300 shadow-sm">
            <h2 class="text-gray-500 text-sm font-semibold">
              TRANSAKSI HARI INI
            </h2>
            <p class="text-2xl font-bold text-sky-950">{todayCount}</p>
          </div>
        </div>

        <!-- PREDIKSI PEMASUKAN -->
        {#if revenuePrediction}
          <div class="w-full bg-blue-50 p-4 rounded-md shadow-sm border border-gray-300">
            <div class="flex gap-1">
              <h2 class="text-gray-500 text-sm font-semibold">
                Prediksi Pemasukan Besok
              </h2>
              <span class="flex font-semibold items-start text-green-500 text-xs">
                AI Powered
              </span>
            </div>
            <p class="text-2xl font-bold text-blue-900 mb-2">
              {#if revenuePrediction.predicted_revenue === '......'}
                <span class="text-gray-400">......</span>
              {:else}
                Rp {Number(revenuePrediction.predicted_revenue ?? 0).toLocaleString()}
              {/if}
            </p>
            {#if predictionMessage}
              <p class="text-xs text-yellow-600">{predictionMessage}</p>
            {/if}
            <p class="text-xs">{revenuePrediction.prediction_date}</p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Grafik 3/4 lebar, Rekomendasi Restok 1/4 lebar (desktop) -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
      <div class="lg:col-span-3">
        <div class="w-full h-full p-4 bg-white border border-gray-300 rounded-md shadow-sm overflow-x-auto">
          {#if loading}
            <p class="text-gray-500">Memuat grafik...</p>
          {:else}
            <div class="min-w-[300px]">
              <canvas use:renderChart={chartData}></canvas>
            </div>
          {/if}
        </div>
      </div>
      <div class="lg:col-span-1">
        <!-- Rekomendasi Restok: daftar produk yang stoknya menipis (stok <= stok minimum) -->
        <div class="h-full bg-white p-4 border border-gray-300 rounded-md shadow-sm">
          <h2 class="font-bold text-lg mb-2">Rekomendasi Restok</h2>
          {#if loadingStock}
            <p class="text-gray-500">Memuat data stok...</p>
          {:else if lowStockList.length === 0}
            <p class="text-gray-500">Semua produk aman, tidak perlu restok.</p>
          {:else}
            <ul>
              {#each lowStockList as p (p.id)}
                <li class="mb-2 border-b border-gray-300 pb-1 text-sm">
                  <span class="font-medium">{p.name}</span> - Stok: {p.stock} (min: {p.min_stock})
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </div>
  </div>
</MainLayout>
