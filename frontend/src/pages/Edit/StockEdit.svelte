<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { stockService } from '../../lib/services';

  export let id: string;

  let name = '';
  let sku = '';
  let unit = '';
  let price: number | '' = '';
  let min_stock: number | '' = '';
  let loading = true;
  let submitting = false;

  onMount(async () => {
    try {
      const product = await stockService.getById(id);
      name = product.name;
      sku = product.sku;
      unit = product.unit || '';
      price = product.price || '';
      min_stock = product.min_stock || 10;
    } catch (err) {
      router.goto('/stocks');
    } finally {
      loading = false;
    }
  });

  async function onSubmitHandler(e: Event) {
    e.preventDefault();
    submitting = true;
    try {
      await stockService.update(id, {
        name,
        sku,
        unit: unit || null,
        price: price ? parseFloat(String(price)) : null,
        min_stock: parseInt(String(min_stock)),
      });
      Swal.fire('Sukses', 'Produk berhasil diperbarui', 'success');
      router.goto(`/stocks/${id}`);
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal memperbarui produk', 'error');
    } finally {
      submitting = false;
    }
  }
</script>

<MainLayout>
  {#if loading}
    <div class="p-6">Memuat data...</div>
  {:else}
    <form on:submit={onSubmitHandler}>
      <h1 class="text-2xl font-bold text-gray-800">Edit Produk</h1>
      <p class="mb-2 mt-2 text-sm text-gray-500">ID Produk: {id}</p>
      <div class="grid grid-cols-2 gap-2 border-t pt-2">
        <p class="flex items-center font-semibold text-gray-600">Nama Produk:</p>
        <input class="p-2 border border-gray-400 rounded" bind:value={name} required />
        <p class="flex items-center font-semibold text-gray-600">SKU:</p>
        <input class="p-2 border border-gray-400 rounded" bind:value={sku} required />
        <p class="flex items-center font-semibold text-gray-600">Satuan:</p>
        <input class="p-2 border border-gray-400 rounded" bind:value={unit} />
        <p class="flex items-center font-semibold text-gray-600">Harga:</p>
        <input type="number" class="p-2 border border-gray-400 rounded" bind:value={price} />
        <p class="flex items-center font-semibold text-gray-600">Minimal Stok:</p>
        <input type="number" class="p-2 border border-gray-400 rounded" bind:value={min_stock} />
      </div>
      <button
        type="submit"
        disabled={submitting}
        class="flex items-center gap-2 mt-4 cursor-pointer bg-sky-950 p-2 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
      >
        {submitting ? 'Menyimpan...' : 'Konfirmasi'}
      </button>
    </form>
  {/if}
</MainLayout>
