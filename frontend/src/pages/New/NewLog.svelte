<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { ArrowLeft, Save, ClipboardList } from 'lucide-svelte';
  import { logService, stockService } from '../../lib/services';

  // Field sesuai schema DB: product_id, type (in/out/adjust), quantity, note, operator, status
  let product_id = '';
  let type: 'in' | 'out' | 'adjust' = 'in';
  let quantity: number | '' = '';
  let note = '';
  let operator = '';
  let status: 'completed' | 'pending_audit' = 'completed';
  let loading = false;

  // Daftar produk dari API
  let products: { id: string; name: string; sku: string | null; stock: number }[] = [];
  let loadingProducts = true;

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

  $: selectedProduct = products.find((p) => p.id === product_id);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!product_id || !quantity) {
      Swal.fire('Perhatian', 'Produk dan jumlah wajib diisi.', 'warning');
      return;
    }
    loading = true;
    try {
      await logService.create({
        product_id,
        type,
        quantity: Number(quantity),
        note: note || undefined,
        operator: operator || undefined,
        status,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Log stok berhasil dicatat dan stok produk diperbarui.',
        confirmButtonColor: '#0c4a6e',
      });

      router.goto('/logs');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Gagal mencatat log stok.';
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
        on:click={() => router.goto('/logs')}
        class="flex items-center gap-2 text-gray-600 hover:text-sky-950 font-medium transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Kembali ke Log</span>
      </button>

      <div class="flex items-center gap-2 text-sky-950 font-bold text-xl">
        <ClipboardList size={24} />
        <span>Tambah Log Stok</span>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-200">
      <form on:submit={handleSubmit} class="space-y-6">

        <!-- Pilih Produk -->
        <div>
          <label for="log-product" class="block text-sm font-semibold text-gray-700 mb-1">
            Produk <span class="text-red-500">*</span>
          </label>
          {#if loadingProducts}
            <div class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-400 text-sm">
              Memuat daftar produk...
            </div>
          {:else if products.length === 0}
            <div class="w-full px-4 py-2 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-700 text-sm">
              Belum ada produk. <button type="button" on:click={() => router.goto('/stocks/new')} class="underline font-semibold">Tambah produk</button> terlebih dahulu.
            </div>
          {:else}
            <select
              id="log-product"
              bind:value={product_id}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              required
            >
              <option value="">-- Pilih Produk --</option>
              {#each products as p}
                <option value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ''} — Stok: {p.stock}</option>
              {/each}
            </select>
          {/if}

          {#if selectedProduct}
            <p class="text-xs text-gray-400 mt-1">
              Stok saat ini: <strong>{selectedProduct.stock}</strong>
              {selectedProduct.sku ? `· SKU: ${selectedProduct.sku}` : ''}
            </p>
          {/if}
        </div>

        <!-- Tipe Log -->
        <div>
          <p class="block text-sm font-semibold text-gray-700 mb-2">
            Tipe Mutasi Stok <span class="text-red-500">*</span>
          </p>
          <div class="grid grid-cols-3 gap-3">
            <button
              type="button"
              on:click={() => (type = 'in')}
              class="py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer text-sm
                {type === 'in'
                  ? 'bg-green-50 border-green-400 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
            >
              📥 Masuk (In)
            </button>
            <button
              type="button"
              on:click={() => (type = 'out')}
              class="py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer text-sm
                {type === 'out'
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
            >
              📤 Keluar (Out)
            </button>
            <button
              type="button"
              on:click={() => (type = 'adjust')}
              class="py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer text-sm
                {type === 'adjust'
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
            >
              🔧 Penyesuaian
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            {#if type === 'in'}
              Stok akan <strong>ditambah</strong> sejumlah yang dimasukkan.
            {:else if type === 'out'}
              Stok akan <strong>dikurangi</strong> sejumlah yang dimasukkan.
            {:else}
              Stok akan <strong>diset langsung</strong> ke nilai yang dimasukkan (opname/koreksi).
            {/if}
          </p>
        </div>

        <!-- Jumlah & Operator -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="log-qty" class="block text-sm font-semibold text-gray-700 mb-1">
              Jumlah <span class="text-red-500">*</span>
            </label>
            <input
              id="log-qty"
              type="number"
              min="1"
              bind:value={quantity}
              placeholder="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label for="log-operator" class="block text-sm font-semibold text-gray-700 mb-1">
              Nama Operator
            </label>
            <input
              id="log-operator"
              type="text"
              bind:value={operator}
              placeholder="Contoh: Ahmad (Opsional)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <!-- Status & Catatan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="log-status" class="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              id="log-status"
              bind:value={status}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="completed">Selesai (Completed)</option>
              <option value="pending_audit">Menunggu Audit</option>
            </select>
          </div>

          <div>
            <label for="log-note" class="block text-sm font-semibold text-gray-700 mb-1">
              Catatan
            </label>
            <input
              id="log-note"
              type="text"
              bind:value={note}
              placeholder="Contoh: Restock mingguan (Opsional)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            on:click={() => router.goto('/logs')}
            class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading || products.length === 0}
            class="px-6 py-2.5 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Menyimpan...' : 'Simpan Log'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
