<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { ArrowLeft } from 'lucide-svelte';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { stockService } from '../../lib/services';

  export let id: string;

  let stock: any = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadStock();
  });

  async function loadStock() {
    loading = true;
    error = '';
    try {
      stock = await stockService.getById(id);
    } catch (err: any) {
      error = err.response?.data?.error || 'Gagal memuat detail produk.';
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    const result = await Swal.fire({
      title: `Hapus "${stock.name}"?`,
      text: 'Data produk akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus',
    });
    if (!result.isConfirmed) return;
    try {
      await stockService.delete(id);
      await Swal.fire({ icon: 'success', title: 'Berhasil dihapus!', timer: 1500, showConfirmButton: false });
      router.goto('/stocks');
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menghapus produk.', 'error');
    }
  }

  function handleEdit() {
    Swal.fire('Segera Hadir', 'Fitur edit produk akan segera tersedia.', 'info');
  }

  function formatRp(val: number) {
    return 'Rp ' + val.toLocaleString('id-ID');
  }
</script>

<MainLayout>
  <div class="max-w-2xl">
    <button
      on:click={() => router.goto('/stocks')}
      class="flex items-center gap-2 text-gray-600 hover:text-sky-950 font-medium transition cursor-pointer mb-4"
    >
      <ArrowLeft size={20} />
      <span>Kembali ke Stok</span>
    </button>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-950"></div>
        <span class="ml-3 text-gray-500">Memuat data...</span>
      </div>
    {:else if error}
      <div class="py-8 text-center text-red-500">{error}</div>
    {:else if stock}
      <p class="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">
        Read / Detail
      </p>
      <h1 class="text-2xl md:text-3xl font-bold mb-4">Detail Produk</h1>

      <div class="bg-white rounded-xl shadow p-6 space-y-4">
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">Nama Produk</span>
          <span class="col-span-2 text-sm text-gray-800">{stock.name}</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">SKU</span>
          <span class="col-span-2 text-sm text-gray-800">{stock.sku ?? '-'}</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">Stok</span>
          <span class="col-span-2 text-sm text-gray-800">{stock.stock} {stock.unit ?? ''}</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">Harga Jual</span>
          <span class="col-span-2 text-sm font-semibold text-gray-800">
            {stock.price != null ? formatRp(stock.price) : '-'}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <span class="text-sm font-semibold text-gray-700">Status</span>
          <span class="col-span-2 text-sm {stock.stock <= stock.min_stock ? 'text-red-600' : 'text-green-600'}">
            {stock.stock <= stock.min_stock ? 'Menipis' : 'Aman'}
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
