<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { logService } from '../../lib/services';

  export let id: string;

  let log: any = null;
  let loading = true;

  onMount(async () => {
    try {
      log = await logService.getById(id);
    } catch (err) {
      log = null;
    } finally {
      loading = false;
    }
  });

  async function onDeleteHandler() {
    const result = await Swal.fire({
      title: 'Hapus Log?',
      text: `Yakin ingin menghapus log ini "${log.product?.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7f1d1d',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await logService.delete(id);
        Swal.fire('Sukses', 'Log stok berhasil dihapus', 'success');
        router.goto('/logs');
      } catch (err: any) {
        Swal.fire('Gagal', err.response?.data?.error || 'Gagal menghapus log stok', 'error');
      }
    }
  }
</script>

<MainLayout>
  {#if loading}
    <div class="p-6">Memuat detail...</div>
  {:else if !log}
    <div class="p-6">Log tidak ditemukan</div>
  {:else}
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Detail Log</h1>
      <p class="mb-2 mt-2 text-sm text-gray-500">ID Log: {log.id}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 border-t pt-4 mt-2">
        <p class="font-semibold text-gray-600">Waktu:</p>
        <p>{new Date(log.created_at).toLocaleString()}</p>
        <p class="font-semibold text-gray-600">Nama Produk:</p>
        <p>{log.product?.name}</p>
        <p class="font-semibold text-gray-600">SKU:</p>
        <p>{log.product?.sku}</p>
        <p class="font-semibold text-gray-600">Tipe:</p>
        <p>{log.type === 'in' ? 'Stok Masuk' : log.type === 'out' ? 'Stok Keluar' : 'Penyesuaian'}</p>
        <p class="font-semibold text-gray-600">Jumlah:</p>
        <p>{log.quantity}</p>
        <p class="font-semibold text-gray-600">Oleh:</p>
        <p>{log.operator}</p>
        <p class="font-semibold text-gray-600">Status:</p>
        <p>{log.status === 'completed' ? 'Selesai' : 'Menunggu audit'}</p>
        <p class="font-semibold text-gray-600">Catatan:</p>
        <p>{log.note || '-'}</p>
      </div>
      <div class="flex gap-4 mt-4">
        <button
          on:click={() => router.goto(`/logs/edit/${id}`)}
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
