<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { ArrowLeft, ShoppingCart } from 'lucide-svelte';
  import { stockService, transactionService } from '../../lib/services';
  import api from '../../lib/services/api';

  // State
  let products: { id: string; name: string; sku: string | null; stock: number; unit: string | null; price: number | null }[] = [];
  let loadingProducts = true;

  let selectedProductId = '';
  let quantity: number | '' = '';
  let harga: number | '' = '';
  let loading = false;

  onMount(async () => {
    try {
      const data = await stockService.getAll();
      products = data;
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    } finally {
      loadingProducts = false;
    }
  });

  // Auto-fill harga saat produk dipilih
  $: selectedProduct = products.find((p) => p.id === selectedProductId);
  $: if (selectedProduct) {
    harga = selectedProduct.price ?? '';
  }

  async function handleKonfirmasi() {
    if (!selectedProductId || !quantity || !harga) {
      Swal.fire('Perhatian', 'Pilih barang, isi jumlah dan harga terlebih dahulu.', 'warning');
      return;
    }
    if (selectedProduct && Number(quantity) > selectedProduct.stock) {
      Swal.fire('Stok Tidak Cukup', `Stok tersedia: ${selectedProduct.stock}`, 'warning');
      return;
    }

    loading = true;
    try {
      const totalAmount = Number(quantity) * Number(harga);

      // Cari kategori income (Penjualan / Pendapatan Usaha)
      const catRes = await api.get('/categories');
      const allCats: { id: number; name: string; type: string }[] = catRes.data;
      const incomeCategory =
        allCats.find((c) => c.type === 'income' && (c.name.toLowerCase().includes('jual') || c.name.toLowerCase().includes('usaha'))) ||
        allCats.find((c) => c.type === 'income');

      if (!incomeCategory) {
        throw new Error('Tidak ada kategori pemasukan. Pastikan seed kategori sudah dijalankan.');
      }

      // 1. Buat transaksi income (penjualan)
      await transactionService.create({
        category_id: incomeCategory.id,
        type: 'income',
        amount: totalAmount,
        description: `Penjualan POS: ${selectedProduct!.name} x${quantity}`,
        source: 'manual',
        items: [
          {
            item_name: selectedProduct!.name,
            quantity: Number(quantity),
            unit: selectedProduct!.unit || undefined,
            unit_price: Number(harga),
            product_id: selectedProductId,
          },
        ],
      });

      // 2. Kurangi stok otomatis via stock-log
      await api.post('/stock-logs', {
        product_id: selectedProductId,
        type: 'out',
        quantity: Number(quantity),
        note: `POS penjualan ${selectedProduct!.name}`,
        status: 'completed',
      });

      await Swal.fire({
        icon: 'success',
        title: 'Transaksi Berhasil!',
        html: `<p>Penjualan <strong>${selectedProduct!.name}</strong> x${quantity} senilai <strong>Rp ${totalAmount.toLocaleString('id-ID')}</strong> berhasil dicatat.</p>`,
        confirmButtonColor: '#0c4a6e',
      });

      router.goto('/pos');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Gagal memproses transaksi POS.';
      Swal.fire('Gagal', msg, 'error');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <button
        on:click={() => router.goto('/pos')}
        class="flex items-center gap-2 text-gray-600 hover:text-sky-950 font-medium transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Kembali ke POS</span>
      </button>

      <div class="flex items-center gap-2 text-sky-950 font-bold text-xl">
        <ShoppingCart size={24} />
        <span>Tambah POS Baru</span>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-200">

      <!-- Nama Barang -->
      <div class="mb-5">
        <label for="pos-product" class="block text-sm font-bold text-gray-800 mb-2">
          Nama Barang:
        </label>
        {#if loadingProducts}
          <div class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-400 text-sm bg-gray-50">
            Memuat daftar produk...
          </div>
        {:else if products.length === 0}
          <div class="w-full px-4 py-2.5 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-700 text-sm">
            Belum ada produk.
            <button
              type="button"
              on:click={() => router.goto('/stocks/new')}
              class="underline font-semibold"
            >Tambah produk</button> terlebih dahulu.
          </div>
        {:else}
          <select
            id="pos-product"
            bind:value={selectedProductId}
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-gray-700"
          >
            <option value="">Pilih Barang dari Stok</option>
            {#each products as p}
              <option value={p.id} disabled={p.stock === 0}>
                {p.name}{p.sku ? ` (${p.sku})` : ''} — Stok: {p.stock}
                {p.stock === 0 ? ' [Habis]' : ''}
              </option>
            {/each}
          </select>
        {/if}

        {#if selectedProduct}
          <p class="text-xs text-gray-400 mt-1">
            Stok tersedia: <strong>{selectedProduct.stock}</strong>
            {selectedProduct.unit ? `· Satuan: ${selectedProduct.unit}` : ''}
          </p>
        {/if}
      </div>

      <!-- Jumlah Barang -->
      <div class="mb-5">
        <label for="pos-qty" class="block text-sm font-bold text-gray-800 mb-2">
          Jumlah Barang:
        </label>
        <input
          id="pos-qty"
          type="number"
          min="1"
          max={selectedProduct?.stock ?? undefined}
          bind:value={quantity}
          placeholder="Masukan jumlah Barang..."
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-700"
        />
      </div>

      <!-- Harga -->
      <div class="mb-7">
        <label for="pos-price" class="block text-sm font-bold text-gray-800 mb-2">
          Harga:
        </label>
        <input
          id="pos-price"
          type="number"
          min="0"
          bind:value={harga}
          placeholder="Masukan harga barang..."
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-700"
        />
        {#if selectedProduct && harga && quantity}
          <p class="text-xs text-gray-500 mt-1">
            Total: <strong>Rp {(Number(harga) * Number(quantity)).toLocaleString('id-ID')}</strong>
          </p>
        {/if}
      </div>

      <!-- Tombol Konfirmasi -->
      <button
        type="button"
        on:click={handleKonfirmasi}
        disabled={loading || !selectedProductId || products.length === 0}
        class="w-full sm:w-auto px-6 py-2.5 bg-sky-950 hover:bg-sky-800 text-white font-bold rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Memproses...' : 'Konfirmasi'}
      </button>
    </div>
  </div>
</div>
