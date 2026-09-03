<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { ArrowLeft } from 'lucide-svelte';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { transactionService } from '../../lib/services';

  export let id: string;

  let transaction: any = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadTransaction();
  });

  async function loadTransaction() {
    loading = true;
    error = '';
    try {
      transaction = await transactionService.getById(id);
    } catch (err: any) {
      error = err.response?.data?.error || 'Gagal memuat detail transaksi.';
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    const result = await Swal.fire({
      title: 'Hapus transaksi ini?',
      text: 'Data transaksi akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus',
    });
    if (!result.isConfirmed) return;
    try {
      await transactionService.delete(id);
      await Swal.fire({ icon: 'success', title: 'Berhasil dihapus!', timer: 1500, showConfirmButton: false });
      router.goto('/transactions');
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menghapus transaksi.', 'error');
    }
  }

  function handleEdit() {
    Swal.fire('Segera Hadir', 'Fitur edit transaksi akan segera tersedia.', 'info');
  }

  function formatRp(val: number) {
    return 'Rp ' + val.toLocaleString('id-ID');
  }
  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
</script>

<MainLayout>
  <div class="max-w-2xl">
    <button
      on:click={() => router.goto('/transactions')}
      class="flex items-center gap-2 text-gray-600 hover:text-sky-950 font-medium transition cursor-pointer mb-4"
    >
      <ArrowLeft size={20} />
      <span>Kembali ke Transaksi</span>
    </button>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-950"></div>
        <span class="ml-3 text-gray-500">Memuat data...</span>
      </div>
    {:else if error}
      <div class="py-8 text-center text-red-500">{error}</div>
    {:else if transaction}
      <p class="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">
        Read / Detail
      </p>
      <h1 class="text-2xl md:text-3xl font-bold mb-4">Detail Transaksi</h1>

      <div class="bg-white rounded-xl shadow p-6 space-y-4">
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">Tanggal</span>
          <span class="col-span-2 text-sm text-gray-800">{formatDate(transaction.transaction_date)}</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">Kategori</span>
          <span class="col-span-2 text-sm text-sky-900">{transaction.category?.name ?? '-'}</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">Keterangan</span>
          <span class="col-span-2 text-sm text-sky-900">{transaction.description ?? '-'}</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">Nominal</span>
          <span class="col-span-2 text-sm font-semibold text-gray-800">{formatRp(transaction.amount)}</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">Tipe</span>
          <span class="col-span-2 text-sm {transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
            {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </span>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            on:click={handleEdit}
            class="px-5 py-2.5 bg-sky-950 text-white font-bold rounded-lg hover:bg-sky-900 transition cursor-pointer"
          >
            Edit
          </button>
          <button
            on:click={handleDelete}
            class="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition cursor-pointer"
          >
            Hapus
          </button>
        </div>
      </div>
    {/if}
  </div>
</MainLayout>
