<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { ArrowLeft, Save, Receipt } from 'lucide-svelte';
  import { transactionService } from '../../lib/services';
  import api from '../../lib/services/api';

  // Form state — sesuai schema DB: category_id, type, amount, description, transaction_date, source
  let category_id: number | '' = '';
  let type: 'income' | 'expense' = 'expense';
  let amount: number | '' = '';
  let description = '';
  let transaction_date = new Date().toISOString().slice(0, 16); // datetime-local format
  let source: 'manual' | 'voice' | 'ai' = 'manual';
  let loading = false;

  // Kategori dari API
  let categories: { id: number; name: string; type: string }[] = [];
  let loadingCategories = true;

  onMount(async () => {
    try {
      const res = await api.get('/categories');
      categories = res.data;
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    } finally {
      loadingCategories = false;
    }
  });

  $: filteredCategories = categories.filter((c) => c.type === type);

  // Reset category when type changes
  function onTypeChange() {
    category_id = '';
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!category_id || !amount) {
      Swal.fire('Perhatian', 'Kategori dan jumlah wajib diisi.', 'warning');
      return;
    }
    loading = true;
    try {
      await transactionService.create({
        category_id: Number(category_id),
        type,
        amount: Number(amount),
        description: description || undefined,
        transaction_date: transaction_date
          ? new Date(transaction_date).toISOString()
          : undefined,
        source,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Transaksi berhasil dicatat.',
        confirmButtonColor: '#0c4a6e',
      });

      router.goto('/transactions');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Gagal mencatat transaksi.';
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
        on:click={() => router.goto('/transactions')}
        class="flex items-center gap-2 text-gray-600 hover:text-sky-950 font-medium transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Kembali ke Transaksi</span>
      </button>

      <div class="flex items-center gap-2 text-sky-950 font-bold text-xl">
        <Receipt size={24} />
        <span>Tambah Transaksi Baru</span>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-200">
      <form on:submit={handleSubmit} class="space-y-6">

        <!-- Tipe Transaksi -->
        <div>
          <p class="block text-sm font-semibold text-gray-700 mb-2">
            Tipe Transaksi <span class="text-red-500">*</span>
          </p>
          <div class="flex gap-3">
            <button
              type="button"
              on:click={() => { type = 'expense'; onTypeChange(); }}
              class="flex-1 py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer
                {type === 'expense'
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
            >
              Pengeluaran
            </button>
            <button
              type="button"
              on:click={() => { type = 'income'; onTypeChange(); }}
              class="flex-1 py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer
                {type === 'income'
                  ? 'bg-green-50 border-green-400 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
            >
              Pemasukan
            </button>
          </div>
        </div>

        <!-- Kategori & Jumlah -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="trx-category" class="block text-sm font-semibold text-gray-700 mb-1">
              Kategori <span class="text-red-500">*</span>
            </label>
            {#if loadingCategories}
              <div class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-400 text-sm">
                Memuat kategori...
              </div>
            {:else}
              <select
                id="trx-category"
                bind:value={category_id}
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {#each filteredCategories as cat}
                  <option value={cat.id}>{cat.name}</option>
                {/each}
              </select>
            {/if}
          </div>

          <div>
            <label for="trx-amount" class="block text-sm font-semibold text-gray-700 mb-1">
              Jumlah (Rp) <span class="text-red-500">*</span>
            </label>
            <input
              id="trx-amount"
              type="number"
              min="1"
              bind:value={amount}
              placeholder="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
        </div>

        <!-- Tanggal & Sumber -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="trx-date" class="block text-sm font-semibold text-gray-700 mb-1">
              Tanggal & Waktu
            </label>
            <input
              id="trx-date"
              type="datetime-local"
              bind:value={transaction_date}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label for="trx-source" class="block text-sm font-semibold text-gray-700 mb-1">
              Sumber Input
            </label>
            <select
              id="trx-source"
              bind:value={source}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="manual">Manual</option>
              <option value="voice">Suara</option>
              <option value="ai">AI</option>
            </select>
          </div>
        </div>

        <!-- Deskripsi -->
        <div>
          <label for="trx-desc" class="block text-sm font-semibold text-gray-700 mb-1">
            Keterangan / Deskripsi
          </label>
          <textarea
            id="trx-desc"
            bind:value={description}
            placeholder="Contoh: Pembelian bahan baku mingguan... (Opsional)"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            on:click={() => router.goto('/transactions')}
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
            <span>{loading ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
