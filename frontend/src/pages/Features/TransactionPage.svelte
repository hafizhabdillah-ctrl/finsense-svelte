<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js';
  import { CirclePlus, Calendar } from 'lucide-svelte';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import api from '../../lib/services/api';

  Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

  type Transaction = {
    id: string;
    transaction_date: string;
    amount: number;
    description?: string | null;
    type: 'income' | 'expense';
    category?: { name?: string } | string | null;
  };

  // ---------------- Data ----------------
  let transactions: Transaction[] = []; // semua transaksi (tabel + ringkasan)
  let monthTransactions: Transaction[] = []; // transaksi bulan ini (statistik)
  let loading = true;

  // Rentang BULAN INI (waktu lokal): tanggal 1 pukul 00:00 s/d tanggal terakhir pukul 23:59:59
  const now = new Date();
  const MONTH_RANGE = {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(),
  };

  const isThisMonth = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  };

  onMount(async () => {
    loading = true;
    try {
      const [allRes, monthRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions', { params: MONTH_RANGE }),
      ]);
      transactions = allRes.data || [];
      monthTransactions = monthRes.data || [];
    } catch (err) {
      console.error('Gagal mengambil transaksi:', err);
      Swal.fire('Error', 'Gagal memuat data transaksi', 'error');
    } finally {
      loading = false;
    }
  });

  // ---------------- Statistik BULAN INI ----------------
  $: totals = monthTransactions.reduce(
    (acc, t) => {
      if (!isThisMonth(t.transaction_date)) return acc;
      acc.count += 1;
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0, count: 0 },
  );

  // ---------------- Filter tanggal + pagination ----------------
  let startDate = '';
  let endDate = '';
  let currentPage = 1;
  const itemsPerPage = 5;

  const handleReset = () => {
    startDate = '';
    endDate = '';
  };

  $: filteredTransactions =
    !startDate && !endDate
      ? transactions
      : transactions.filter((transaction) => {
          const txDate = transaction.transaction_date.split('T')[0]; // ambil YYYY-MM-DD
          if (startDate && endDate) return txDate >= startDate && txDate <= endDate;
          if (startDate) return txDate >= startDate;
          if (endDate) return txDate <= endDate;
          return true;
        });

  // Kembali ke halaman 1 saat filter berubah
  $: {
    startDate;
    endDate;
    currentPage = 1;
  }

  $: indexOfLastItem = currentPage * itemsPerPage;
  $: indexOfFirstItem = indexOfLastItem - itemsPerPage;
  $: currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  $: totalItems = filteredTransactions.length;
  $: startRange = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  $: endRange = Math.min(indexOfLastItem, totalItems);

  const goToNextPage = () => {
    if (indexOfLastItem < totalItems) currentPage += 1;
  };
  const goToPrevPage = () => {
    if (currentPage > 1) currentPage -= 1;
  };

  // Nama kategori untuk kolom tabel (sama dengan transaction.category?.name || '-' di React)
  const categoryName = (category: Transaction['category']) =>
    (category && typeof category === 'object' && category.name) || '-';

  // ---------------- Ringkasan Keuangan (donat) ----------------
  const getCategoryName = (category: Transaction['category']) => {
    if (!category) return 'Lainnya';
    if (typeof category === 'object') return category.name || 'Unknown';
    return String(category);
  };

  const getChartData = (type: 'income' | 'expense') => {
    const filtered = transactions.filter((t) => t.type === type);
    const labels = [...new Set(filtered.map((t) => getCategoryName(t.category)))];
    const dataPoints = labels.map((label) =>
      filtered
        .filter((t) => getCategoryName(t.category) === label)
        .reduce((sum, t) => sum + t.amount, 0),
    );
    const total = dataPoints.reduce((a, b) => a + b, 0);
    const percentages = dataPoints.map((val) => (total > 0 ? ((val / total) * 100).toFixed(1) : 0));
    const formattedLabels = labels.map((label, idx) => `${label} - ${percentages[idx]}%`);

    return {
      labels: formattedLabels,
      datasets: [
        {
          data: dataPoints,
          backgroundColor: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
          borderWidth: 1,
        },
      ],
    };
  };

  $: incomeData = getChartData('income');
  $: expenseData = getChartData('expense');
  $: hasIncomeData =
    incomeData.datasets[0].data.length > 0 && incomeData.datasets[0].data.reduce((a, b) => a + b, 0) > 0;
  $: hasExpenseData =
    expenseData.datasets[0].data.length > 0 && expenseData.datasets[0].data.reduce((a, b) => a + b, 0) > 0;

  // Data untuk grafik kosong
  const emptyData = {
    labels: ['Tidak ada data'],
    datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 0 }],
  };

  const doughnutOptions: any = {
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (context: any) => context[0].label,
          label: (context: any) => {
            const value = context.dataset.data[context.dataIndex];
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `Rp ${value.toLocaleString('id-ID')} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '70%',
  };

  // Action: render Doughnut pada canvas (dibuat ulang saat data berubah)
  function renderDoughnut(canvas: HTMLCanvasElement, data: any) {
    let chart: Chart | null = null;
    const build = (d: any) => {
      chart?.destroy();
      chart = new Chart(canvas, { type: 'doughnut', data: d, options: doughnutOptions });
    };
    build(data);
    return {
      update(newData: any) {
        build(newData);
      },
      destroy() {
        chart?.destroy();
      },
    };
  }
</script>

<MainLayout>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div>
        <h1 class="text-2xl font-bold">Catatan keuangan</h1>
        <p class="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <button
        on:click={() => router.goto('/new?type=transaction')}
        class="flex items-center gap-2 bg-sky-950 p-2 px-4 text-white rounded-lg font-semibold border hover:bg-white hover:text-sky-950 transition cursor-pointer"
      >
        <CirclePlus size={16} /> Tambah Transaksi
      </button>
    </div>

    <!-- Statistik BULAN INI -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      <div class="relative flex-1 flex flex-col justify-between bg-white p-4 border rounded-md border-gray-300 shadow-sm">
        <h1 class="text-gray-500 font-bold text-sm uppercase">PEMASUKAN</h1>
        <p class="flex items-center gap-2 text-2xl font-bold text-sky-950">
          <span>Rp.</span>
          <span>{totals.income.toLocaleString()}</span>
        </p>
      </div>
      <div class="relative flex-1 flex flex-col justify-between bg-white p-4 border rounded-md border-gray-300 shadow-sm">
        <h1 class="text-gray-500 font-bold text-sm uppercase">PENGELUARAN</h1>
        <p class="flex items-center gap-2 text-2xl font-bold text-sky-950">
          <span>Rp.</span>
          <span>{totals.expense.toLocaleString()}</span>
        </p>
      </div>
      <div class="relative flex-1 flex flex-col justify-between bg-white p-4 border rounded-md border-gray-300 shadow-sm">
        <h1 class="text-gray-500 font-bold text-sm uppercase">TOTAL TRANSAKSI</h1>
        <p class="flex items-center gap-2 text-2xl font-bold text-sky-950">
          <span>{totals.count}</span>
          <span class="relative text-sm top-1">Transaksi</span>
        </p>
      </div>
    </div>

    <!-- Filter Tanggal -->
    <div class="flex flex-wrap items-center gap-4 mt-4 px-2">
      <div class="flex items-center gap-2">
        <Calendar class="text-gray-500" size={18} />
        <span class="font-medium text-gray-700">Filter Tanggal:</span>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <input
          type="date"
          bind:value={startDate}
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Mulai"
        />
        <span class="text-gray-500">s/d</span>
        <input
          type="date"
          bind:value={endDate}
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Selesai"
        />
        <button
          on:click={handleReset}
          class="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Tabel -->
    <div class="overflow-x-auto mt-2">
      {#if loading}
        <div class="p-4">Memuat transaksi...</div>
      {:else}
        <div class="overflow-x-auto">
          <div class="min-w-[800px]">
            <div class="bg-sky-950 p-2 flex w-full mt-4 text-white font-semibold">
              <div class="flex-1 text-center">No.</div>
              <div class="flex-4 text-center">Tanggal</div>
              <div class="flex-4 text-center">Kategori</div>
              <div class="flex-4 text-center">Keterangan</div>
              <div class="flex-4 text-center">Nominal</div>
              <div class="flex-4 text-center">Tipe</div>
            </div>
            <div class="flex flex-col">
              {#if totalItems === 0}
                <div class="p-8 text-center text-gray-500 border-b border-r border-gray-300">
                  {startDate || endDate
                    ? 'Tidak ada transaksi dalam rentang tanggal tersebut'
                    : 'Belum ada catatan transaksi.'}
                </div>
              {:else}
                {#each currentItems as transaction, idx (transaction.id)}
                  <div
                    role="button"
                    tabindex="0"
                    on:click={() => router.goto(`/transactions/${transaction.id}`)}
                    on:keydown={(e) => e.key === 'Enter' && router.goto(`/transactions/${transaction.id}`)}
                    class="flex items-center w-full p-2 border-b border-r border-l border-gray-300 cursor-pointer hover:bg-gray-300 transition-all"
                  >
                    <div class="flex-1 text-center text-gray-800 text-sm">
                      {indexOfFirstItem + idx + 1}
                    </div>
                    <div class="flex-4 text-center text-gray-800 text-sm">
                      {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                    </div>
                    <div class="flex-4 text-center text-gray-800 text-sm">
                      {categoryName(transaction.category)}
                    </div>
                    <div class="flex-4 text-center text-gray-800 text-sm">
                      {transaction.description || '-'}
                    </div>
                    <div class="flex-4 text-center text-gray-800 text-sm">
                      Rp {transaction.amount?.toLocaleString()}
                    </div>
                    <div class="flex-4 text-center text-gray-800 text-sm">
                      <span
                        class="px-2 py-1 rounded text-xs font-bold uppercase {transaction.type === 'income'
                          ? 'text-green-700'
                          : 'text-red-700'}"
                      >
                        {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                      </span>
                    </div>
                  </div>
                {/each}
              {/if}
              <div class="p-2 border-t border-gray-200 flex justify-between">
                <p class="text-sm text-gray-500">
                  Menampilkan {startRange}-{endRange} dari {totalItems} transaksi
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

    <div class="mt-4">
      <hr />
    </div>
    <h1 class="p-2 text-2xl font-bold mt-2">Ringkasan Keuangan</h1>

    <!-- Ringkasan Keuangan (donat) -->
    <div class="flex flex-col md:flex-row gap-4 bg-white p-4 w-full md:w-3/4">
      <!-- Grafik Pemasukan -->
      <div class="flex-1 text-center">
        <p class="text-xs font-bold text-gray-500 mb-2 uppercase">ALOKASI PEMASUKAN</p>
        <div class="w-48 h-48 mx-auto mt-2 relative">
          {#if hasIncomeData}
            <canvas use:renderDoughnut={incomeData}></canvas>
          {:else}
            <canvas use:renderDoughnut={emptyData}></canvas>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-[10px] text-gray-400 font-semibold">KOSONG</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Grafik Pengeluaran -->
      <div class="flex-1 text-center">
        <p class="text-xs font-bold text-gray-500 mb-2 uppercase">ALOKASI PENGELUARAN</p>
        <div class="w-48 h-48 mx-auto mt-2 relative">
          {#if hasExpenseData}
            <canvas use:renderDoughnut={expenseData}></canvas>
          {:else}
            <canvas use:renderDoughnut={emptyData}></canvas>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-[10px] text-gray-400 font-semibold">KOSONG</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</MainLayout>
