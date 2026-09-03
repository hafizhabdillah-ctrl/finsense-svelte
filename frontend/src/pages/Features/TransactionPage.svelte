<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { transactionService } from '../../lib/services';

  let searchTerm = '';
  let transactions: any[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadTransactions();
  });

  async function loadTransactions() {
    loading = true;
    error = '';
    try {
      transactions = await transactionService.getAll();
    } catch (err: any) {
      error = err.response?.data?.error || 'Gagal memuat data transaksi.';
    } finally {
      loading = false;
    }
  }

  function goToDetail(id: string) {
    router.goto(`/transactions/${id}`);
  }

  $: filteredTransactions = searchTerm
    ? transactions.filter(
        (t) =>
          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (t.category?.name && t.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : transactions;

  $: totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  $: totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  $: totalTransaksiBulanIni = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  function formatRp(val: number) {
    return 'Rp ' + val.toLocaleString('id-ID');
  }
  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
</script>

<MainLayout>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h1 class="text-xl md:text-2xl font-bold">Catatan Keuangan</h1>
      <button
        on:click={() => router.goto('/new?type=transaction')}
        class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 px-4 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
      >
        Tambah Transaksi baru
      </button>
    </div>
    <p class="mx-2 -mt-3 mb-4 text-gray-500 text-sm">
      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Total Transaksi (Bulan Ini)</p>
        <h3 class="text-2xl font-bold">{totalTransaksiBulanIni}</h3>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Total Pemasukan</p>
        <h3 class="text-2xl font-bold">{formatRp(totalIncome)}</h3>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Total Pengeluaran</p>
        <h3 class="text-2xl font-bold">{formatRp(totalExpense)}</h3>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative mt-4 max-w-md mb-6">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Cari berdasarkan deskripsi atau kategori..."
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
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Tanggal</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Kategori</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Keterangan</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Nominal</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Tipe</th>
            </tr>
          </thead>
          <tbody>
            {#if filteredTransactions.length === 0}
              <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'Transaksi tidak ditemukan.' : 'Belum ada data transaksi.'}
                </td>
              </tr>
            {:else}
              {#each filteredTransactions as trx, i (trx.id)}
                <tr
                  class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  on:click={() => goToDetail(trx.id)}
                >
                  <td class="px-6 py-3 text-sm">{i + 1}</td>
                  <td class="px-6 py-3 text-sm">{formatDate(trx.transaction_date)}</td>
                  <td class="px-6 py-3 text-sky-900 text-sm">{trx.category?.name ?? '-'}</td>
                  <td class="px-6 py-3 font-medium">{trx.description ?? '-'}</td>
                  <td class="px-6 py-3 font-semibold">{formatRp(trx.amount)}</td>
                  <td class="px-6 py-3">
                    <span class="text-sm font-semibold {trx.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                      {trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
        <div class="px-6 py-3 text-sm text-gray-500 border-t">
          Menampilkan {filteredTransactions.length === 0 ? 0 : 1}-{filteredTransactions.length} dari {filteredTransactions.length} transaksi
        </div>
      {/if}
    </div>
  </div>
</MainLayout>
