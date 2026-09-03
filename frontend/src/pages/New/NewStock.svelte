<script lang="ts">
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { ArrowLeft, Save, PackagePlus } from 'lucide-svelte';
  import { stockService } from '../../lib/services';

  // Field sesuai schema DB: name, sku, stock, unit, price, min_stock
  let name = '';
  let sku = '';
  let stock = 0;
  let unit = '';
  let price: number | '' = '';
  let min_stock = 10;
  let loading = false;

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;

    try {
      await stockService.create({
        name,
        sku: sku || undefined,
        stock: Number(stock),
        unit: unit || undefined,
        price: price !== '' ? Number(price) : undefined,
        min_stock: Number(min_stock),
      });

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Produk baru berhasil ditambahkan.',
        confirmButtonColor: '#0c4a6e',
      });

      router.goto('/stocks');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Gagal menambahkan produk.';
      Swal.fire('Gagal', msg, 'error');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
  <div class="max-w-3xl mx-auto">
    <!-- Header Page -->
    <div class="flex items-center justify-between mb-6">
      <button
        on:click={() => router.goto('/stocks')}
        class="flex items-center gap-2 text-gray-600 hover:text-sky-950 font-medium transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Kembali ke Stok</span>
      </button>

      <div class="flex items-center gap-2 text-sky-950 font-bold text-xl">
        <PackagePlus size={24} />
        <span>Tambah Produk Baru</span>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-200">
      <form on:submit={handleSubmit} class="space-y-6">

        <!-- Nama Produk & SKU -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="item-name" class="block text-sm font-semibold text-gray-700 mb-1">
              Nama Produk <span class="text-red-500">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              bind:value={name}
              placeholder="Contoh: Kopi Susu Aren"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label for="item-sku" class="block text-sm font-semibold text-gray-700 mb-1">
              Kode SKU / Barcode
            </label>
            <input
              id="item-sku"
              type="text"
              bind:value={sku}
              placeholder="Contoh: PRD-001 (Opsional)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <!-- Jumlah Stok & Satuan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="item-stock" class="block text-sm font-semibold text-gray-700 mb-1">
              Jumlah Stok Awal <span class="text-red-500">*</span>
            </label>
            <input
              id="item-stock"
              type="number"
              min="0"
              bind:value={stock}
              placeholder="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label for="item-unit" class="block text-sm font-semibold text-gray-700 mb-1">
              Satuan
            </label>
            <input
              id="item-unit"
              type="text"
              bind:value={unit}
              placeholder="Contoh: pcs, kg, lusin (Opsional)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <!-- Harga & Stok Minimum -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="item-price" class="block text-sm font-semibold text-gray-700 mb-1">
              Harga Jual (Rp)
            </label>
            <input
              id="item-price"
              type="number"
              min="0"
              bind:value={price}
              placeholder="0 (Opsional)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label for="item-min-stock" class="block text-sm font-semibold text-gray-700 mb-1">
              Stok Minimum (Peringatan)
            </label>
            <input
              id="item-min-stock"
              type="number"
              min="0"
              bind:value={min_stock}
              placeholder="10"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p class="text-xs text-gray-400 mt-1">Sistem akan memberi peringatan saat stok ≤ nilai ini.</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            on:click={() => router.goto('/stocks')}
            class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            class="px-6 py-2.5 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Menyimpan...' : 'Simpan Produk'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</div>