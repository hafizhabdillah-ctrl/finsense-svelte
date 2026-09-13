<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { debtService } from '../../lib/services';

  export let id: string;

  let debt: any = null;
  let loading = true;

  // State untuk modal pembayaran
  let showPaymentModal = false;
  let paymentAmount = '';
  let paymentNote = '';
  let submitting = false;

  onMount(async () => {
    await loadDebt();
  });

  async function loadDebt() {
    try {
      debt = await debtService.getById(id);
    } catch (err) {
      router.goto('/debts');
    } finally {
      loading = false;
    }
  }

  $: remainingDebt = debt ? debt.total_debt - debt.paid_amount : 0;
  $: isPaid = debt?.status === 'paid';

  async function onDeleteHandler() {
    const result = await Swal.fire({
      title: 'Hapus Hutang?',
      text: `Yakin ingin menghapus hutang "${debt?.customer_name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7f1d1d',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await debtService.delete(id);
        Swal.fire('Sukses', 'Hutang berhasil dihapus', 'success');
        router.goto('/debts');
      } catch (err: any) {
        Swal.fire('Gagal', err.response?.data?.error || 'Gagal menghapus hutang', 'error');
      }
    }
  }

  async function handlePaymentSubmit(e: Event) {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Swal.fire('Error', 'Jumlah harus lebih dari 0', 'error');
      return;
    }
    if (amount > remainingDebt) {
      Swal.fire('Error', `Pembayaran melebihi sisa hutang (Rp ${remainingDebt.toLocaleString()})`, 'error');
      return;
    }

    submitting = true;
    try {
      await debtService.addPayment(id, { amount, note: paymentNote });
      Swal.fire('Sukses', 'Pembayaran berhasil dicatat', 'success');
      showPaymentModal = false;
      paymentAmount = '';
      paymentNote = '';
      await loadDebt();
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal mencatat pembayaran', 'error');
    } finally {
      submitting = false;
    }
  }

  const statusLabel = (status: string) =>
    ({ pending: 'Belum Lunas', partial: 'Sebagian Lunas', paid: 'Lunas', overdue: 'Jatuh Tempo' })[status] || status;
</script>

<MainLayout>
  {#if loading}
    <div class="p-6">Memuat detail...</div>
  {:else if !debt}
    <div class="p-6">Hutang tidak ditemukan</div>
  {:else}
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Detail Hutang</h1>
      <p class="mb-2 mt-2 text-sm text-gray-500">ID Hutang: {debt.id}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 border-t pt-4 mt-2">
        <p class="font-semibold text-gray-600">Nama Orang:</p>
        <p>{debt.customer_name}</p>
        <p class="font-semibold text-gray-600">Total Hutang:</p>
        <p>Rp {debt.total_debt?.toLocaleString()}</p>
        <p class="font-semibold text-gray-600">Telah Dibayar:</p>
        <p>Rp {debt.paid_amount?.toLocaleString()}</p>
        <p class="font-semibold text-gray-600">Sisa Hutang:</p>
        <p class={remainingDebt > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
          Rp {remainingDebt.toLocaleString()}
        </p>
        <p class="font-semibold text-gray-600">Jatuh Tempo:</p>
        <p>{new Date(debt.due_date).toLocaleDateString('id-ID')}</p>
        <p class="font-semibold text-gray-600">Status:</p>
        <p>{statusLabel(debt.status)}</p>
      </div>

      <!-- Tombol aksi -->
      <div class="flex gap-4 mt-4 flex-wrap">
        <button
          on:click={() => router.goto(`/debts/edit/${id}`)}
          class="flex items-center gap-2 cursor-pointer bg-sky-950 p-2 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all"
        >
          Edit
        </button>
        <button
          on:click={onDeleteHandler}
          class="flex items-center gap-2 cursor-pointer bg-red-900 p-2 text-white font-semibold border rounded-lg hover:bg-white hover:text-red-900 transition-all"
        >
          Hapus
        </button>
        {#if !isPaid}
          <button
            on:click={() => (showPaymentModal = true)}
            class="flex items-center gap-2 cursor-pointer bg-green-700 p-2 text-white font-semibold border rounded-lg hover:bg-white hover:text-green-700 transition-all"
          >
            Bayar Hutang
          </button>
        {/if}
      </div>

      <!-- Riwayat Pembayaran -->
      {#if debt.payments && debt.payments.length > 0}
        <div class="mt-6 border-t pt-4">
          <h2 class="text-xl font-semibold text-gray-700 mb-3">Riwayat Pembayaran</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-semibold">Tanggal</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold">Jumlah</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {#each debt.payments as payment (payment.id)}
                  <tr class="border-t">
                    <td class="px-4 py-2 text-sm">{new Date(payment.paid_at).toLocaleDateString('id-ID')}</td>
                    <td class="px-4 py-2 text-sm">Rp {payment.amount?.toLocaleString()}</td>
                    <td class="px-4 py-2 text-sm">{payment.note || '-'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

      <!-- Modal Pembayaran -->
      {#if showPaymentModal}
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 class="text-xl font-bold mb-4">Catat Pembayaran</h2>
            <p class="mb-2 text-sm text-gray-600">
              Sisa hutang: <strong>Rp {remainingDebt.toLocaleString()}</strong>
            </p>
            <form on:submit={handlePaymentSubmit}>
              <div class="mb-4">
                <label for="payment-amount" class="block text-sm font-semibold mb-1">Jumlah Bayar (Rp)</label>
                <input
                  id="payment-amount"
                  type="number"
                  bind:value={paymentAmount}
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="Masukkan jumlah"
                  required
                  min="1"
                  max={remainingDebt}
                />
              </div>
              <div class="mb-4">
                <label for="payment-note" class="block text-sm font-semibold mb-1">Catatan (Opsional)</label>
                <textarea
                  id="payment-note"
                  bind:value={paymentNote}
                  class="w-full p-2 border border-gray-300 rounded"
                  rows="2"
                  placeholder="Contoh: Pembayaran tunai"
                ></textarea>
              </div>
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  on:click={() => (showPaymentModal = false)}
                  class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  class="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Bayar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</MainLayout>
