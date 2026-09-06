<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { ArrowLeft } from 'lucide-svelte';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { transactionService } from '../../lib/services';
  import api from '../../lib/services/api';

  export let id: string;

  let transaction: any = null;
  let loading = true;
  let error = '';
  let editing = false;
  let saving = false;
  let categories: { id: number; name: string; type: string }[] = [];
  let form = {
    transaction_date: '',
    category_id: '' as number | '',
    description: '',
    amount: '' as number | '',
    type: 'income' as 'income' | 'expense',
  };

  $: filteredCategories = categories.filter((c) => c.type === form.type);

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

  async function handleEdit() {
    form = {
      transaction_date: transaction.transaction_date ? transaction.transaction_date.slice(0, 16) : '',
      category_id: transaction.category_id ?? '',
      description: transaction.description || '',
      amount: transaction.amount ?? '',
      type: transaction.type,
    };
    if (categories.length === 0) {
      try {
        const res = await api.get('/categories');
        categories = res.data;
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
      }
    }
    editing = true;
  }

  async function handleSave() {
    if (!form.category_id || !form.amount) {
      Swal.fire('Perhatian', 'Kategori dan jumlah wajib diisi.', 'warning');
      return;
    }
    saving = true;
    try {
      await transactionService.update(id, {
        category_id: Number(form.category_id),
        type: form.type,
        amount: Number(form.amount),
        description: form.description || undefined,
        transaction_date: form.transaction_date ? new Date(form.transaction_date).toISOString() : undefined,
        source: transaction.source,
      });
      await Swal.fire({ icon: 'success', title: 'Berhasil disimpan!', timer: 1500, showConfirmButton: false });
      editing = false;
      await loadTransaction();
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menyimpan perubahan.', 'error');
    } finally {
      saving = false;
    }
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
        {#if !editing}
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
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="text-sm font-semibold text-gray-700">Tanggal & Waktu
              <input type="datetime-local" bind:value={form.transaction_date} class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </label>
            <label class="text-sm font-semibold text-gray-700">Tipe
              <select bind:value={form.type} on:change={() => (form.category_id = '')} class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </label>
            <label class="text-sm font-semibold text-gray-700">Kategori
              <select bind:value={form.category_id} class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="">-- Pilih Kategori --</option>
                {#each filteredCategories as cat}
                  <option value={cat.id}>{cat.name}</option>
                {/each}
              </select>
            </label>
            <label class="text-sm font-semibold text-gray-700">Nominal (Rp)
              <input type="number" min="1" bind:value={form.amount} class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </label>
            <label class="text-sm font-semibold text-gray-700 sm:col-span-2">Keterangan
              <input bind:value={form.description} class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </label>
          </div>
          <div class="flex gap-3 pt-4">
            <button
              on:click={handleSave}
              disabled={saving}
              class="px-5 py-2.5 bg-sky-950 text-white font-bold rounded-lg hover:bg-sky-900 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              on:click={() => (editing = false)}
              class="px-5 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Batal
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</MainLayout>
