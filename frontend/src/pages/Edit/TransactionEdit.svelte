<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { transactionService } from '../../lib/services';
  import api from '../../lib/services/api';

  export let id: string;

  let date = '';
  let category_id = '';
  let description = '';
  let amount: number | '' = '';
  let type = '';
  let loading = true;
  let submitting = false;
  let categories: { id: number; name: string }[] = [];

  onMount(async () => {
    try {
      // Kategori diambil dari backend agar id-nya selalu sesuai database
      const catRes = await api.get('/categories');
      categories = catRes.data || [];
      const tx = await transactionService.getById(id);
      date = tx.transaction_date ? tx.transaction_date.split('T')[0] : '';
      category_id = String(tx.category_id);
      description = tx.description || '';
      amount = tx.amount;
      type = tx.type;
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat data transaksi', 'error');
      router.goto('/transactions');
    } finally {
      loading = false;
    }
  });

  async function onSubmitHandler(e: Event) {
    e.preventDefault();
    if (!category_id || !amount || !type) {
      Swal.fire('Perhatian', 'Lengkapi semua data', 'info');
      return;
    }
    submitting = true;
    try {
      await transactionService.update(id, {
        category_id: parseInt(category_id),
        amount: parseFloat(String(amount)),
        description,
        transaction_date: date,
        type,
        source: 'manual',
      });
      Swal.fire('Sukses', 'Transaksi berhasil diperbarui', 'success');
      router.goto(`/transactions/${id}`);
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal memperbarui transaksi', 'error');
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
      <h1 class="text-2xl font-bold text-gray-800">Edit Transaksi</h1>
      <p class="mb-2 mt-2 text-sm text-gray-500">ID Transaksi: {id}</p>

      <div class="grid grid-cols-2 gap-2 border-t pt-2">
        <p class="flex items-center font-semibold text-gray-600">Tanggal:</p>
        <input type="date" bind:value={date} class="p-2 border border-gray-400 rounded" required />

        <p class="flex items-center font-semibold text-gray-600">Kategori:</p>
        <select bind:value={category_id} class="p-2 border border-gray-400 rounded" required>
          <option value="">Pilih Kategori</option>
          {#each categories as cat (cat.id)}
            <option value={String(cat.id)}>{cat.name}</option>
          {/each}
        </select>

        <p class="flex items-center font-semibold text-gray-600">Keterangan:</p>
        <input type="text" bind:value={description} class="p-2 border border-gray-400 rounded" />

        <p class="flex items-center font-semibold text-gray-600">Nominal:</p>
        <input type="number" bind:value={amount} class="p-2 border border-gray-400 rounded" required />

        <p class="flex items-center font-semibold text-gray-600">Tipe:</p>
        <select bind:value={type} class="p-2 border border-gray-400 rounded" required>
          <option value="income">Masuk</option>
          <option value="expense">Keluar</option>
        </select>
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
