<script lang="ts">
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import { ArrowLeft, Save, HandCoins } from 'lucide-svelte';
  import { debtService } from '../../lib/services';

  // Field sesuai schema DB: customer_name, total_debt, due_date, note
  let customer_name = '';
  let total_debt: number | '' = '';
  let due_date = '';
  let note = '';
  let loading = false;

  // Set default due_date = hari ini
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  due_date = `${yyyy}-${mm}-${dd}`;

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!customer_name || !total_debt || !due_date) {
      Swal.fire('Perhatian', 'Nama pelanggan, jumlah hutang, dan tanggal jatuh tempo wajib diisi.', 'warning');
      return;
    }
    loading = true;
    try {
      await debtService.create({
        customer_name,
        total_debt: Number(total_debt),
        due_date: new Date(due_date).toISOString(),
        note: note || undefined,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Catatan hutang berhasil ditambahkan.',
        confirmButtonColor: '#0c4a6e',
      });

      router.goto('/debts');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Gagal menambahkan catatan hutang.';
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
        on:click={() => router.goto('/debts')}
        class="flex items-center gap-2 text-gray-600 hover:text-sky-950 font-medium transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Kembali ke Hutang</span>
      </button>

      <div class="flex items-center gap-2 text-sky-950 font-bold text-xl">
        <HandCoins size={24} />
        <span>Tambah Hutang Baru</span>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-200">
      <form on:submit={handleSubmit} class="space-y-6">

        <!-- Nama Pelanggan -->
        <div>
          <label for="debt-customer" class="block text-sm font-semibold text-gray-700 mb-1">
            Nama Pelanggan / Peminjam <span class="text-red-500">*</span>
          </label>
          <input
            id="debt-customer"
            type="text"
            bind:value={customer_name}
            placeholder="Contoh: Budi Santoso"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>

        <!-- Jumlah Hutang & Jatuh Tempo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="debt-amount" class="block text-sm font-semibold text-gray-700 mb-1">
              Jumlah Hutang (Rp) <span class="text-red-500">*</span>
            </label>
            <input
              id="debt-amount"
              type="number"
              min="1"
              bind:value={total_debt}
              placeholder="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label for="debt-due-date" class="block text-sm font-semibold text-gray-700 mb-1">
              Tanggal Jatuh Tempo <span class="text-red-500">*</span>
            </label>
            <input
              id="debt-due-date"
              type="date"
              bind:value={due_date}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
        </div>

        <!-- Keterangan -->
        <div>
          <label for="debt-note" class="block text-sm font-semibold text-gray-700 mb-1">
            Keterangan
          </label>
          <textarea
            id="debt-note"
            bind:value={note}
            placeholder="Contoh: Hutang pembelian barang tanggal 1 September... (Opsional)"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          ></textarea>
        </div>

        <!-- Info Box -->
        <div class="bg-sky-50 border border-sky-200 rounded-lg p-4 text-sm text-sky-800">
          <p class="font-semibold mb-1">ℹ️ Status Awal: <span class="font-bold">Pending</span></p>
          <p>Hutang akan otomatis menjadi <strong>Overdue</strong> jika melewati tanggal jatuh tempo. Gunakan fitur "Catat Pembayaran" untuk memperbarui status.</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            on:click={() => router.goto('/debts')}
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
            <span>{loading ? 'Menyimpan...' : 'Simpan Hutang'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
