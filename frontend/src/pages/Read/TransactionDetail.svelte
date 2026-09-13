<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { transactionService } from '../../lib/services';

  export let id: string;

  let transaction: any = null;
  let loading = true;

  onMount(async () => {
    try {
      transaction = await transactionService.getById(id);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal memuat detail transaksi', 'error');
      router.goto('/transactions');
    } finally {
      loading = false;
    }
  });

  async function onDeleteHandler() {
    const result = await Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Yakin ingin menghapus transaksi ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7f1d1d',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await transactionService.delete(id);
        Swal.fire('Sukses', 'Transaksi berhasil dihapus', 'success');
        router.goto('/transactions');
      } catch (err: any) {
        Swal.fire('Gagal', err.response?.data?.error || 'Gagal menghapus transaksi', 'error');
      }
    }
  }
</script>

<MainLayout>
  {#if loading}
    <div class="p-6">Memuat detail...</div>
  {:else if !transaction}
    <div class="p-6">Transaksi tidak ditemukan</div>
  {:else}
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Detail Transaksi</h1>
      <p class="mb-2 mt-2 text-sm text-gray-500">ID Transaksi: {transaction.id}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-2">
        <p class="font-semibold text-gray-600">Tanggal:</p>
        <p>{new Date(transaction.transaction_date).toLocaleDateString('id-ID')}</p>
        <p class="font-semibold text-gray-600">Kategori:</p>
        <p>{transaction.category?.name || '-'}</p>
        <p class="font-semibold text-gray-600">Keterangan:</p>
        <p>{transaction.description || '-'}</p>
        <p class="font-semibold text-gray-600">Nominal:</p>
        <p>Rp {transaction.amount?.toLocaleString()}</p>
        <p class="font-semibold text-gray-600">Tipe:</p>
        <p>{transaction.type === 'income' ? 'Masuk' : 'Keluar'}</p>
      </div>
      <div class="flex gap-4 mt-4">
        <button
          on:click={() => router.goto(`/transactions/edit/${id}`)}
          class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
        >
          Edit
        </button>
        <button
          on:click={onDeleteHandler}
          class="flex items-center gap-2 cursor-pointer bg-red-900 p-2 text-white font-semibold border rounded-lg hover:bg-white hover:text-red-900 transition-all"
        >
          Hapus
        </button>
      </div>
    </div>
  {/if}
</MainLayout>
