<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { logService } from '../../lib/services';

  export let id: string;

  let status = '';
  let note = '';
  let loading = true;
  let submitting = false;

  onMount(async () => {
    try {
      const log = await logService.getById(id);
      status = log.status;
      note = log.note || '';
    } catch (err) {
      router.goto('/logs');
    } finally {
      loading = false;
    }
  });

  async function onSubmitHandler(e: Event) {
    e.preventDefault();
    submitting = true;
    try {
      await logService.update(id, { status, note });
      Swal.fire('Sukses', 'Log stok berhasil diperbarui', 'success');
      router.goto(`/logs/${id}`);
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal memperbarui log stok', 'error');
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
      <h1 class="text-2xl font-bold text-gray-800">Edit Log</h1>
      <p class="mb-2 mt-2 text-sm text-gray-500">ID Log: {id}</p>
      <div class="grid grid-cols-2 gap-4 border-t pt-2">
        <p class="flex items-center font-semibold text-gray-600">Status:</p>
        <select class="p-2 border border-gray-400 rounded" bind:value={status}>
          <option value="completed">Selesai</option>
          <option value="pending_audit">Menunggu audit</option>
        </select>
        <p class="flex items-center font-semibold text-gray-600">Catatan:</p>
        <input class="p-2 border border-gray-400 rounded" bind:value={note} />
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
