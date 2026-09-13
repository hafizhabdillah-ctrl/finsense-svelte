<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { debtService } from '../../lib/services';

  export let id: string;

  let customer_name = '';
  let total_debt: number | '' = '';
  let due_date = '';
  let status = '';
  let loading = true;
  let submitting = false;

  onMount(async () => {
    try {
      const data = await debtService.getById(id);
      customer_name = data.customer_name;
      total_debt = data.total_debt;
      due_date = data.due_date.split('T')[0]; // format yyyy-mm-dd
      status = data.status;
    } catch (err) {
      router.goto('/debts');
    } finally {
      loading = false;
    }
  });

  async function onSubmitHandler(e: Event) {
    e.preventDefault();
    submitting = true;
    try {
      await debtService.update(id, {
        customer_name,
        total_debt: Number(total_debt),
        due_date,
        status,
      });
      Swal.fire('Sukses', 'Hutang berhasil diperbarui', 'success');
      router.goto(`/debts/${id}`);
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal memperbarui hutang', 'error');
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
      <h1 class="text-2xl font-bold text-gray-800">Edit Hutang</h1>
      <p class="mb-2 mt-2 text-sm text-gray-500">ID Hutang: {id}</p>
      <div class="grid grid-cols-2 gap-2 border-t pt-2">
        <p class="flex items-center font-semibold text-gray-600">Nama Orang:</p>
        <input class="p-2 border border-gray-400 rounded" bind:value={customer_name} required />
        <p class="flex items-center font-semibold text-gray-600">Total Hutang:</p>
        <input type="number" class="p-2 border border-gray-400 rounded" bind:value={total_debt} required />
        <p class="flex items-center font-semibold text-gray-600">Jatuh Tempo:</p>
        <input type="date" class="p-2 border border-gray-400 rounded" bind:value={due_date} required />
        <p class="flex items-center font-semibold text-gray-600">Status:</p>
        <select class="p-2 border border-gray-400 rounded bg-white" bind:value={status}>
          <option value="pending">Belum Lunas</option>
          <option value="paid">Lunas</option>
          <option value="overdue">Overdue</option>
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
