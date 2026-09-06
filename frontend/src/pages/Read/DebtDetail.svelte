<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { ArrowLeft } from 'lucide-svelte';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { debtService } from '../../lib/services';

  export let id: string;

  let debt: any = null;
  let loading = true;
  let error = '';
  let editing = false;
  let saving = false;
  let form = { customer_name: '', total_debt: '' as number | '', due_date: '', status: 'pending' };

  let showPaymentModal = false;
  let paymentAmount: number | '' = '';
  let paymentNote = '';
  let paying = false;

  onMount(async () => {
    await loadDebt();
  });

  async function loadDebt() {
    loading = true;
    error = '';
    try {
      debt = await debtService.getById(id);
    } catch (err: any) {
      error = err.response?.data?.error || 'Gagal memuat detail hutang.';
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    const result = await Swal.fire({
      title: `Hapus hutang "${debt.customer_name}"?`,
      text: 'Data hutang beserta riwayat pembayarannya akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus',
    });
    if (!result.isConfirmed) return;
    try {
      await debtService.delete(id);
      await Swal.fire({ icon: 'success', title: 'Berhasil dihapus!', timer: 1500, showConfirmButton: false });
      router.goto('/debts');
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menghapus hutang.', 'error');
    }
  }

  function handleEdit() {
    form = {
      customer_name: debt.customer_name,
      total_debt: debt.total_debt,
      due_date: debt.due_date.split('T')[0],
      status: debt.status,
    };
    editing = true;
  }

  async function handleSave() {
    saving = true;
    try {
      await debtService.update(id, {
        customer_name: form.customer_name,
        total_debt: Number(form.total_debt),
        due_date: form.due_date,
        status: form.status,
      });
      await Swal.fire({ icon: 'success', title: 'Berhasil disimpan!', timer: 1500, showConfirmButton: false });
      editing = false;
      await loadDebt();
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menyimpan perubahan.', 'error');
    } finally {
      saving = false;
    }
  }

  function openPayment() {
    paymentAmount = '';
    paymentNote = '';
    showPaymentModal = true;
  }

  async function handlePaymentSubmit() {
    const remaining = debt.total_debt - debt.paid_amount;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      Swal.fire('Error', 'Jumlah harus lebih dari 0', 'error');
      return;
    }
    if (amount > remaining) {
      Swal.fire('Error', `Pembayaran melebihi sisa hutang (${formatRp(remaining)})`, 'error');
      return;
    }
    paying = true;
    try {
      await debtService.addPayment(id, { amount, note: paymentNote || undefined });
      await Swal.fire('Sukses', 'Pembayaran berhasil dicatat', 'success');
      showPaymentModal = false;
      await loadDebt();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.error || 'Gagal mencatat pembayaran', 'error');
    } finally {
      paying = false;
    }
  }

  function formatRp(val: number) {
    return 'Rp ' + val.toLocaleString('id-ID');
  }
  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function statusLabel(s: string) {
    return { pending: 'Pending', partial: 'Sebagian', paid: 'Lunas', overdue: 'Jatuh Tempo' }[s] ?? s;
  }
</script>

<MainLayout>
  <div class="max-w-2xl">
    <button
      on:click={() => router.goto('/debts')}
      class="flex items-center gap-2 text-gray-600 hover:text-sky-950 font-medium transition cursor-pointer mb-4"
    >
      <ArrowLeft size={20} />
      <span>Kembali ke Hutang</span>
    </button>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-950"></div>
        <span class="ml-3 text-gray-500">Memuat data...</span>
      </div>
    {:else if error}
      <div class="py-8 text-center text-red-500">{error}</div>
    {:else if debt}
      <p class="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">
        Read / Detail
      </p>
      <h1 class="text-2xl md:text-3xl font-bold mb-4">Detail Hutang</h1>

      <div class="bg-white rounded-xl shadow p-6 space-y-4">
        {#if !editing}
          <div class="grid grid-cols-3 gap-2">
            <span class="text-sm font-semibold text-gray-700">Nama Pelanggan</span>
            <span class="col-span-2 text-sm text-gray-800">{debt.customer_name}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <span class="text-sm font-semibold text-gray-700">Total Hutang</span>
            <span class="col-span-2 text-sm font-semibold text-gray-800">{formatRp(debt.total_debt)}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <span class="text-sm font-semibold text-gray-700">Sudah Terbayar</span>
            <span class="col-span-2 text-sm text-gray-800">{formatRp(debt.paid_amount)}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <span class="text-sm font-semibold text-gray-700">Sisa Hutang</span>
            <span class="col-span-2 text-sm font-semibold {debt.total_debt - debt.paid_amount > 0 ? 'text-red-600' : 'text-green-600'}">
              {formatRp(debt.total_debt - debt.paid_amount)}
            </span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <span class="text-sm font-semibold text-gray-700">Jatuh Tempo</span>
            <span class="col-span-2 text-sm text-gray-800">{formatDate(debt.due_date)}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <span class="text-sm font-semibold text-gray-700">Status</span>
            <span class="col-span-2 text-sm text-gray-800">{statusLabel(debt.status)}</span>
          </div>

          <div class="flex gap-3 pt-4 flex-wrap">
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
            {#if debt.status !== 'paid'}
              <button
                on:click={openPayment}
                class="px-5 py-2.5 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition cursor-pointer"
              >
                Bayar Hutang
              </button>
            {/if}
          </div>

          {#if debt.payments && debt.payments.length > 0}
            <div class="mt-6 border-t pt-4">
              <h2 class="text-lg font-semibold text-gray-700 mb-3">Riwayat Pembayaran</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="px-4 py-2 text-left font-semibold">Tanggal</th>
                      <th class="px-4 py-2 text-left font-semibold">Jumlah</th>
                      <th class="px-4 py-2 text-left font-semibold">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each debt.payments as payment (payment.id)}
                      <tr class="border-t">
                        <td class="px-4 py-2">{formatDate(payment.paid_at)}</td>
                        <td class="px-4 py-2">{formatRp(payment.amount)}</td>
                        <td class="px-4 py-2">{payment.note || '-'}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="text-sm font-semibold text-gray-700">Nama Pelanggan
              <input bind:value={form.customer_name} class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </label>
            <label class="text-sm font-semibold text-gray-700">Total Hutang (Rp)
              <input type="number" min="1" bind:value={form.total_debt} class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </label>
            <label class="text-sm font-semibold text-gray-700">Jatuh Tempo
              <input type="date" bind:value={form.due_date} class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </label>
            <label class="text-sm font-semibold text-gray-700">Status
              <select bind:value={form.status} class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="pending">Belum Lunas</option>
                <option value="partial">Sebagian Lunas</option>
                <option value="paid">Lunas</option>
                <option value="overdue">Jatuh Tempo</option>
              </select>
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

  {#if showPaymentModal}
    <div class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Catat Pembayaran</h2>
        <p class="mb-4 text-sm text-gray-600">
          Sisa hutang: <strong>{formatRp(debt.total_debt - debt.paid_amount)}</strong>
        </p>
        <div class="mb-4">
          <label for="payment-amount" class="block text-sm font-semibold mb-1">Jumlah Bayar (Rp)</label>
          <input
            id="payment-amount"
            type="number"
            bind:value={paymentAmount}
            min="1"
            max={debt.total_debt - debt.paid_amount}
            placeholder="Masukkan jumlah"
            class="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div class="mb-4">
          <label for="payment-note" class="block text-sm font-semibold mb-1">Catatan (Opsional)</label>
          <textarea
            id="payment-note"
            bind:value={paymentNote}
            rows="2"
            placeholder="Contoh: Pembayaran tunai"
            class="w-full p-2 border border-gray-300 rounded"
          ></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button
            on:click={() => (showPaymentModal = false)}
            class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
          >
            Batal
          </button>
          <button
            on:click={handlePaymentSubmit}
            disabled={paying}
            class="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50 cursor-pointer"
          >
            {paying ? 'Menyimpan...' : 'Bayar'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</MainLayout>
