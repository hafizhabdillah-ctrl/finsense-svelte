<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { CirclePlus, Search } from 'lucide-svelte';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { debtService } from '../../lib/services';

  let searchTerm = '';
  let debts: any[] = [];
  let loading = true;

  onMount(async () => {
    loading = true;
    try {
      debts = await debtService.getAll();
    } catch (err: any) {
      Swal.fire('Error', 'Gagal memuat data hutang', 'error');
    } finally {
      loading = false;
    }
  });

  // Total sisa hutang (total_debt - paid_amount) untuk status belum lunas
  $: total = debts
    .filter((item) => item.status === 'pending' || item.status === 'overdue' || item.status === 'partial')
    .reduce((acc, item) => acc + (item.total_debt - (item.paid_amount || 0)), 0);

  // ---------------- Filter (nama pelanggan) + pagination ----------------
  let currentPage = 1;
  const itemsPerPage = 10;

  $: filteredDebts = !searchTerm.trim()
    ? debts
    : debts.filter((debt) => debt.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Kembali ke halaman 1 saat pencarian berubah
  $: {
    searchTerm;
    currentPage = 1;
  }

  $: totalItems = filteredDebts.length;
  $: totalPages = Math.ceil(totalItems / itemsPerPage);
  $: indexOfLastItem = currentPage * itemsPerPage;
  $: indexOfFirstItem = indexOfLastItem - itemsPerPage;
  $: currentItems = filteredDebts.slice(indexOfFirstItem, indexOfLastItem);
  $: startRange = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  $: endRange = Math.min(indexOfLastItem, totalItems);

  const goToNextPage = () => (currentPage = Math.min(currentPage + 1, totalPages));
  const goToPrevPage = () => (currentPage = Math.max(currentPage - 1, 1));

  // Helper untuk badge status
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: 'Belum Lunas', className: 'bg-yellow-100 text-yellow-800' },
    partial: { label: 'Sebagian Lunas', className: 'bg-blue-100 text-blue-800' },
    paid: { label: 'Lunas', className: 'bg-green-100 text-green-800' },
    overdue: { label: 'Jatuh Tempo', className: 'bg-red-100 text-red-800' },
  };
  const getStatus = (status: string) =>
    statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
</script>

<MainLayout>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <div>
        <h1 class="text-xl md:text-2xl font-bold">Catatan Hutang</h1>
        <p class="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <button
        on:click={() => router.goto('/new?type=debt')}
        class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 px-4 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
      >
        <CirclePlus size={16} />
        <span>Tambah Hutang baru</span>
      </button>
    </div>

    <!-- Statistik -->
    {#if loading}
      <div class="p-4">Memuat total hutang...</div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <div class="flex w-full sm:w-1/4 flex-col justify-between bg-white p-4 border rounded-md border-gray-300 shadow-sm">
          <p class="text-md text-gray-500 font-semibold mb-2">TOTAL PIUTANG AKTIF</p>
          <p class="text-sky-950 font-bold text-2xl">Rp. {total.toLocaleString('id-ID')}</p>
        </div>
      </div>
    {/if}

    <!-- Search Bar -->
    <div class="relative mt-4 max-w-md">
      <input
        type="text"
        placeholder="Cari berdasarkan nama pelanggan..."
        bind:value={searchTerm}
        class="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-950"
      />
      <Search size={16} class="absolute left-3 top-3 text-gray-400" />
    </div>

    <!-- Tabel -->
    <div class="overflow-x-auto mt-2">
      {#if loading}
        <div class="p-4 text-center text-gray-500">Memuat daftar hutang...</div>
      {:else if filteredDebts.length === 0}
        <div class="p-4 text-center text-gray-500">
          {searchTerm ? 'Tidak ada hutang yang cocok' : 'Belum ada data hutang'}
        </div>
      {:else}
        <div class="overflow-x-auto shadow-md rounded-lg">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-sky-950 text-white">
              <tr>
                <th class="px-4 py-3 text-center text-sm font-semibold">No</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Nama Pelanggan</th>
                <th class="px-4 py-3 text-right text-sm font-semibold">Total Hutang</th>
                <th class="px-4 py-3 text-right text-sm font-semibold">Sudah Dibayar</th>
                <th class="px-4 py-3 text-right text-sm font-semibold">Sisa Hutang</th>
                <th class="px-4 py-3 text-center text-sm font-semibold">Jatuh Tempo</th>
                <th class="px-4 py-3 text-center text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {#each currentItems as debt, idx (debt.id)}
                <tr
                  on:click={() => router.goto(`/debts/${debt.id}`)}
                  class="border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-all"
                >
                  <td class="px-4 py-3 text-center text-sm text-gray-700">{indexOfFirstItem + idx + 1}</td>
                  <td class="px-4 py-3 text-left text-sm font-medium text-gray-900">{debt.customer_name}</td>
                  <td class="px-4 py-3 text-right text-sm text-gray-500 line-through">
                    Rp {debt.total_debt?.toLocaleString('id-ID')}
                  </td>
                  <td class="px-4 py-3 text-right text-sm text-gray-600">
                    Rp {debt.paid_amount?.toLocaleString('id-ID')}
                  </td>
                  <td class="px-4 py-3 text-right text-sm font-bold text-red-700">
                    Rp {(debt.total_debt - debt.paid_amount)?.toLocaleString('id-ID')}
                  </td>
                  <td class="px-4 py-3 text-center text-sm text-gray-700">
                    {new Date(debt.due_date).toLocaleDateString('id-ID')}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded-full text-xs font-medium {getStatus(debt.status).className}">
                      {getStatus(debt.status).label}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>

          <!-- Pagination -->
          {#if totalPages > 1}
            <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <p class="text-sm text-gray-500">
                Menampilkan {startRange}-{endRange} dari {totalItems} hutang
              </p>
              <div class="flex gap-2 items-center">
                <button
                  on:click={goToPrevPage}
                  disabled={currentPage === 1}
                  class="px-3 py-1 text-sm border rounded-md font-medium transition-all {currentPage === 1
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'text-gray-600 border-gray-300 hover:bg-white cursor-pointer'}"
                >
                  Sebelumnya
                </button>
                <span class="px-3 py-1 text-sm text-gray-700">Halaman {currentPage} dari {totalPages}</span>
                <button
                  on:click={goToNextPage}
                  disabled={currentPage === totalPages}
                  class="px-3 py-1 text-sm border rounded-md font-medium transition-all {currentPage === totalPages
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'text-gray-600 border-gray-300 hover:bg-white cursor-pointer'}"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</MainLayout>
