<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { debtService } from '../../lib/services';

  let searchTerm = '';
  let debts: any[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadDebts();
  });

  async function loadDebts() {
    loading = true;
    error = '';
    try {
      debts = await debtService.getAll();
    } catch (err: any) {
      error = err.response?.data?.error || 'Gagal memuat data hutang.';
    } finally {
      loading = false;
    }
  }

  function goToDetail(id: string) {
    router.goto(`/debts/${id}`);
  }

  $: filteredDebts = searchTerm
    ? debts.filter((d) =>
        d.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : debts;

  $: totalDebt = debts.reduce((acc, d) => acc + d.total_debt, 0);
  $: totalPaid = debts.reduce((acc, d) => acc + d.paid_amount, 0);
  $: totalOverdue = debts.filter((d) => d.status === 'overdue').length;

  function formatRp(val: number) {
    return 'Rp ' + val.toLocaleString('id-ID');
  }
  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function statusLabel(s: string) {
    return { pending: 'Pending', partial: 'Sebagian', paid: 'Lunas', overdue: 'Jatuh Tempo' }[s] ?? s;
  }
  function statusClass(s: string) {
    return {
      pending: 'bg-yellow-100 text-yellow-700',
      partial: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
    }[s] ?? 'bg-gray-100 text-gray-600';
  }
</script>

<MainLayout>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h1 class="text-xl md:text-2xl font-bold">Catatan Hutang</h1>
      <button
        on:click={() => router.goto('/new?type=debt')}
        class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 px-4 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
      >
        Tambah Hutang baru
      </button>
    </div>
    <p class="mx-2 -mt-3 mb-4 text-gray-500 text-sm">
      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Total Hutang</p>
        <h3 class="text-2xl font-bold">{formatRp(totalDebt)}</h3>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative mt-4 max-w-md mb-6">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Cari berdasarkan nama pelanggan..."
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
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Nama Pelanggan</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Total Hutang</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Terbayar</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Jatuh Tempo</th>
              <th class="px-6 py-3 text-left text-sm font-bold text-white">Status</th>
            </tr>
          </thead>
          <tbody>
            {#if filteredDebts.length === 0}
              <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'Hutang tidak ditemukan.' : 'Belum ada data hutang.'}
                </td>
              </tr>
            {:else}
              {#each filteredDebts as debt, i (debt.id)}
                <tr
                  class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  on:click={() => goToDetail(debt.id)}
                >
                  <td class="px-6 py-3 text-sm">{i + 1}</td>
                  <td class="px-6 py-3 font-medium">{debt.customer_name}</td>
                  <td class="px-6 py-3 font-semibold">{formatRp(debt.total_debt)}</td>
                  <td class="px-6 py-3 text-green-600">{formatRp(debt.paid_amount)}</td>
                  <td class="px-6 py-3 text-sm">{formatDate(debt.due_date)}</td>
                  <td class="px-6 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold {statusClass(debt.status)}">
                      {statusLabel(debt.status)}
                    </span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
        <div class="px-6 py-3 text-sm text-gray-500 border-t">
          Menampilkan {filteredDebts.length === 0 ? 0 : 1}-{filteredDebts.length} dari {filteredDebts.length} hutang
        </div>
      {/if}
    </div>
  </div>
</MainLayout>
