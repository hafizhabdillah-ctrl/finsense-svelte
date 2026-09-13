<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { stockService } from '../../lib/services';
  import api from '../../lib/services/api';

  export let id: string;

  let product: any = null;
  let loading = true;

  onMount(async () => {
    await loadProduct();
  });

  async function loadProduct() {
    loading = true;
    try {
      product = await stockService.getById(id);
    } catch (err) {
      product = null;
    } finally {
      loading = false;
    }
  }

  async function onDeleteHandler() {
    const result = await Swal.fire({
      title: 'Hapus Produk?',
      text: `Yakin ingin menghapus "${product?.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7f1d1d',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await stockService.delete(id);
        Swal.fire('Sukses', 'Produk berhasil dihapus', 'success');
        router.goto('/stocks');
      } catch (err: any) {
        Swal.fire('Gagal', err.response?.data?.error || 'Gagal menghapus produk', 'error');
      }
    }
  }

  async function onAdjustStock(type: 'in' | 'out') {
    const { value: quantity } = await Swal.fire({
      title: `${type === 'in' ? 'Tambah Stok' : 'Kurangi Stok'}`,
      input: 'number',
      inputLabel: 'Jumlah',
      inputPlaceholder: 'Masukkan jumlah',
      showCancelButton: true,
    });
    if (quantity && Number(quantity) > 0) {
      try {
        await api.patch(`/products/${id}/stock`, { quantity: Number(quantity), type, note: '' });
        Swal.fire('Sukses', `Stok berhasil ${type === 'in' ? 'ditambah' : 'dikurangi'}`, 'success');
        await loadProduct();
      } catch (err: any) {
        Swal.fire('Gagal', err.response?.data?.error || 'Gagal update stok', 'error');
      }
    }
  }
</script>

<MainLayout>
  {#if loading}
    <div class="p-6">Memuat detail...</div>
  {:else if !product}
    <div class="p-6">Produk tidak ditemukan</div>
  {:else}
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Detail Produk</h1>
      <p class="mb-2 mt-2 text-sm text-gray-500">ID Produk: {product.id}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 border-t pt-4 mt-2">
        <p class="font-semibold text-gray-600">Nama Produk:</p>
        <p>{product.name}</p>
        <p class="font-semibold text-gray-600">SKU:</p>
        <p>{product.sku}</p>
        <p class="font-semibold text-gray-600">Jumlah Stok:</p>
        <p>{product.stock} {product.unit || ''}</p>
        <p class="font-semibold text-gray-600">Minimal Stok:</p>
        <p>{product.min_stock}</p>
        <p class="font-semibold text-gray-600">Status:</p>
        <span class="font-bold {product.stock <= product.min_stock ? 'text-red-600' : 'text-green-600'}">
          {product.stock <= product.min_stock ? 'Menipis' : 'Aman'}
        </span>
      </div>
      <div class="flex gap-4 mt-4">
        <button
          on:click={() => router.goto(`/stocks/edit/${id}`)}
          class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
        >
          Edit
        </button>
        <button
          on:click={() => onAdjustStock('in')}
          class="flex items-center gap-2 cursor-pointer bg-green-700 p-2 text-white font-semibold border rounded-lg hover:bg-white hover:text-green-700 transition-all"
        >
          Tambah Stok
        </button>
        <button
          on:click={() => onAdjustStock('out')}
          class="flex items-center gap-2 cursor-pointer bg-yellow-600 p-2 text-white font-semibold border rounded-lg hover:bg-white hover:text-yellow-600 transition-all"
        >
          Kurangi Stok
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
