<script lang="ts">
  import { onMount } from 'svelte';
  import { router, meta } from 'tinro';
  import Swal from 'sweetalert2';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { stockService, transactionService, debtService, logService } from '../../lib/services';
  import api from '../../lib/services/api';

  type ItemType = 'product' | 'transaction' | 'pos' | 'debt' | 'log';

  const TABS: { key: ItemType; label: string }[] = [
    { key: 'product', label: 'Produk' },
    { key: 'transaction', label: 'Transaksi' },
    { key: 'pos', label: 'POS' },
    { key: 'debt', label: 'Hutang' },
    { key: 'log', label: 'Log Stok' },
  ];

  const inputClass = 'w-full p-2 border-2 border-gray-300 rounded-lg';
  const fieldWrapClass = 'px-2 mt-4 relative flex flex-col gap-2';
  const submitClass =
    'flex items-center py-2 px-4 mx-2 mt-4 gap-2 cursor-pointer bg-sky-950 text-white font-semibold border rounded-lg hover:bg-white hover:text-sky-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const initialType = meta().query?.type as string | undefined;
  let type: ItemType =
    initialType && TABS.some((t) => t.key === initialType) ? (initialType as ItemType) : 'product';

  // Daftar produk (dipakai tab POS & Log) dan kategori (tab Transaksi)
  let products: { id: string; name: string; sku: string | null; stock: number; price: number | null }[] = [];
  let categories: { id: number; name: string }[] = [];

  onMount(async () => {
    try {
      products = await stockService.getAll();
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat daftar produk', 'error');
    }
    try {
      const res = await api.get('/categories');
      categories = res.data || [];
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat daftar kategori', 'error');
    }
  });

  const errorMessage = (err: any, fallback: string) => err?.response?.data?.error || fallback;

  // -------------------- Produk --------------------
  let p_name = '';
  let p_sku = '';
  let p_stock = '';
  let p_unit = '';
  let p_price = '';
  let p_min_stock = '';
  let p_submitting = false;

  async function submitProduct(e: Event) {
    e.preventDefault();
    if (!p_name || !p_sku) {
      Swal.fire({ title: 'Mohon isi seluruh data', icon: 'info' });
      return;
    }
    p_submitting = true;
    try {
      await stockService.create({
        name: p_name,
        sku: p_sku,
        stock: p_stock ? parseInt(p_stock) : 0,
        unit: p_unit || null,
        price: p_price ? parseFloat(p_price) : null,
        min_stock: p_min_stock ? parseInt(p_min_stock) : 10,
      });
      Swal.fire('Sukses', 'Produk berhasil ditambahkan', 'success');
      router.goto('/stocks');
    } catch (err) {
      Swal.fire('Gagal', errorMessage(err, 'Gagal menambah produk'), 'error');
    } finally {
      p_submitting = false;
    }
  }

  // -------------------- Transaksi --------------------
  let t_date = '';
  let t_category_id = '';
  let t_description = '';
  let t_amount = '';
  let t_type: 'income' | 'expense' = 'income';
  let t_submitting = false;

  async function submitTransaction(e: Event) {
    e.preventDefault();
    if (!t_category_id || !t_amount) {
      Swal.fire('Perhatian', 'Lengkapi data kategori dan nominal', 'info');
      return;
    }
    t_submitting = true;
    try {
      await transactionService.create({
        category_id: parseInt(t_category_id),
        amount: parseFloat(t_amount),
        description: t_description,
        transaction_date: t_date,
        type: t_type,
        source: 'manual',
      });
      Swal.fire('Sukses', 'Transaksi berhasil ditambahkan', 'success');
      router.goto('/transactions');
    } catch (err) {
      Swal.fire('Gagal', errorMessage(err, 'Gagal menambah transaksi'), 'error');
    } finally {
      t_submitting = false;
    }
  }

  // -------------------- POS --------------------
  let pos_product_id = '';
  let pos_quantity = '';
  let pos_submitting = false;

  async function submitPos(e: Event) {
    e.preventDefault();
    if (!pos_product_id || !pos_quantity) {
      Swal.fire('Perhatian', 'Pilih produk dan isi jumlah', 'info');
      return;
    }
    const product = products.find((p) => String(p.id) === String(pos_product_id));
    if (!product) {
      Swal.fire('Error', 'Produk tidak ditemukan', 'error');
      return;
    }
    const qty = parseInt(pos_quantity);
    pos_submitting = true;
    try {
      await logService.create({
        product_id: pos_product_id,
        type: 'out',
        quantity: qty,
        note: 'Penjualan POS',
        operator: 'Kasir',
        status: 'completed',
      });
    } catch (err) {
      Swal.fire('Gagal', errorMessage(err, 'Gagal menambah log stok'), 'error');
      pos_submitting = false;
      return;
    }
    try {
      await transactionService.create({
        category_id: 1, // Penjualan
        amount: (product.price || 0) * qty,
        description: `Penjualan POS: ${product.name} x${qty}`,
        transaction_date: new Date().toISOString().slice(0, 10),
        type: 'income',
        source: 'pos',
      });
      Swal.fire('Sukses', 'Transaksi berhasil ditambahkan', 'success');
      router.goto('/pos');
    } catch (err) {
      Swal.fire('Gagal', errorMessage(err, 'Gagal menambah transaksi'), 'error');
    } finally {
      pos_submitting = false;
    }
  }

  // -------------------- Hutang --------------------
  let d_customer_name = '';
  let d_total_debt = '';
  let d_due_date = '';
  let d_submitting = false;

  async function submitDebt(e: Event) {
    e.preventDefault();
    if (!d_customer_name || !d_total_debt || !d_due_date) {
      Swal.fire({ title: 'Mohon isi seluruh data', icon: 'info' });
      return;
    }
    d_submitting = true;
    try {
      await debtService.create({
        customer_name: d_customer_name,
        total_debt: Number(d_total_debt),
        due_date: d_due_date,
      });
      Swal.fire('Sukses', 'Hutang berhasil ditambahkan', 'success');
      router.goto('/debts');
    } catch (err) {
      Swal.fire('Gagal', errorMessage(err, 'Gagal menambah hutang'), 'error');
    } finally {
      d_submitting = false;
    }
  }

  // -------------------- Log Stok --------------------
  let l_product_id = '';
  let l_type: 'in' | 'out' | 'adjust' = 'in';
  let l_quantity = '';
  let l_note = '';
  let l_operator = 'Admin';
  let l_status: 'completed' | 'pending_audit' = 'completed';
  let l_submitting = false;

  async function submitLog(e: Event) {
    e.preventDefault();
    if (!l_product_id || !l_quantity) {
      Swal.fire('Perhatian', 'Pilih produk dan isi jumlah', 'info');
      return;
    }
    l_submitting = true;
    try {
      await logService.create({
        product_id: l_product_id,
        type: l_type,
        quantity: parseInt(l_quantity),
        note: l_note || null,
        operator: l_operator,
        status: l_status,
      });
      Swal.fire('Sukses', 'Log stok berhasil ditambahkan', 'success');
      router.goto('/logs');
    } catch (err) {
      Swal.fire('Gagal', errorMessage(err, 'Gagal menambah log stok'), 'error');
    } finally {
      l_submitting = false;
    }
  }
</script>

<MainLayout>
  <div class="py-2 px-4">
    <!-- Header -->
    <h1 class="p-2 text-gray-700 text-2xl font-bold">Tambah Item Baru</h1>
    <p class="px-2 text-gray-500 text-sm">Pilih kategori item yang ingin ditambahkan lalu isi formulir di bawah.</p>

    <div class="p-2">
      <!-- Tab strip -->
      <div class="flex flex-wrap gap-2 border-b border-gray-300 mb-4">
        {#each TABS as tab (tab.key)}
          <button
            type="button"
            on:click={() => (type = tab.key)}
            class="py-2 px-4 font-semibold rounded-t-md border border-b-0 transition-all cursor-pointer {type === tab.key
              ? 'bg-sky-950 text-white border-sky-950'
              : 'bg-white text-sky-950 border-gray-300 hover:bg-sky-950 hover:text-white'}"
          >
            {tab.label}
          </button>
        {/each}
      </div>

      <!-- Form container -->
      <div class="py-2 px-2">
        {#if type === 'product'}
          <form class="max-w-2xl" on:submit={submitProduct}>
            <div class={fieldWrapClass}>
              <span class="font-bold">Nama Barang:</span>
              <input type="text" placeholder="Masukan nama barang..." class={inputClass} bind:value={p_name} required />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">SKU Barang:</span>
              <input type="text" placeholder="Masukan SKU..." class={inputClass} bind:value={p_sku} required />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Jumlah Stok:</span>
              <input type="number" placeholder="Masukan jumlah barang..." class={inputClass} bind:value={p_stock} />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Satuan (opsional):</span>
              <input type="text" placeholder="Masukan satuan barang..." class={inputClass} bind:value={p_unit} />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Harga (opsional):</span>
              <input type="number" placeholder="Masukan harga barang..." class={inputClass} bind:value={p_price} />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Minimal Stok (default 10):</span>
              <input type="number" placeholder="Masukan jumlah minimal barang..." class={inputClass} bind:value={p_min_stock} />
            </div>
            <button type="submit" disabled={p_submitting} class={submitClass}>
              {p_submitting ? 'Menyimpan...' : 'Tambah Barang'}
            </button>
          </form>
        {:else if type === 'transaction'}
          <form class="max-w-2xl" on:submit={submitTransaction}>
            <div class={fieldWrapClass}>
              <span class="font-bold">Waktu:</span>
              <input type="date" bind:value={t_date} class={inputClass} required />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Kategori:</span>
              <select bind:value={t_category_id} class={inputClass} required>
                <option value="">Pilih kategori</option>
                {#each categories as cat (cat.id)}
                  <option value={String(cat.id)}>{cat.name}</option>
                {/each}
              </select>
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Keterangan:</span>
              <input type="text" placeholder="Masukan keterangan..." bind:value={t_description} class={inputClass} />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Nominal:</span>
              <input type="number" placeholder="Masukan nominal..." bind:value={t_amount} class={inputClass} required />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Tipe:</span>
              <select bind:value={t_type} class={inputClass}>
                <option value="income">Masuk</option>
                <option value="expense">Keluar</option>
              </select>
            </div>
            <button type="submit" disabled={t_submitting} class={submitClass}>
              {t_submitting ? 'Menyimpan...' : 'Konfirmasi'}
            </button>
          </form>
        {:else if type === 'pos'}
          <form class="max-w-2xl" on:submit={submitPos}>
            <div class={fieldWrapClass}>
              <span class="font-bold">Produk:</span>
              <select bind:value={pos_product_id} class={inputClass} required>
                <option value="">Pilih Barang dari Stok</option>
                {#each products as p (p.id)}
                  <option value={p.id}>{p.name} - Rp {p.price?.toLocaleString()}</option>
                {/each}
              </select>
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Jumlah:</span>
              <input type="number" class={inputClass} placeholder="Masukan jumlah barang..." bind:value={pos_quantity} min="1" required />
            </div>
            <button type="submit" disabled={pos_submitting} class={submitClass}>
              {pos_submitting ? 'Memproses...' : 'Konfirmasi'}
            </button>
          </form>
        {:else if type === 'debt'}
          <form class="max-w-2xl" on:submit={submitDebt}>
            <div class={fieldWrapClass}>
              <span class="font-bold">Nama Orang:</span>
              <input type="text" placeholder="Masukan nama orang..." class={inputClass} bind:value={d_customer_name} required />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Total Hutang:</span>
              <input type="number" placeholder="Masukan total hutang..." class={inputClass} bind:value={d_total_debt} required />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Jatuh Tempo:</span>
              <input type="date" class={inputClass} bind:value={d_due_date} required />
            </div>
            <button type="submit" disabled={d_submitting} class={submitClass}>
              {d_submitting ? 'Menyimpan...' : 'Konfirmasi'}
            </button>
          </form>
        {:else if type === 'log'}
          <form class="max-w-2xl" on:submit={submitLog}>
            <div class={fieldWrapClass}>
              <span class="font-bold">Produk:</span>
              <select class={inputClass} bind:value={l_product_id} required>
                <option value="">Pilih produk</option>
                {#each products as p (p.id)}
                  <option value={p.id}>{p.name} (SKU: {p.sku})</option>
                {/each}
              </select>
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Tipe:</span>
              <select class={inputClass} bind:value={l_type}>
                <option value="in">Stok Masuk</option>
                <option value="out">Stok Keluar</option>
                <option value="adjust">Penyesuaian Manual</option>
              </select>
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Jumlah:</span>
              <input type="number" placeholder="Masukan jumlah barang..." class={inputClass} bind:value={l_quantity} required />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Catatan (opsional):</span>
              <input type="text" placeholder="Masukan catatan barang..." class={inputClass} bind:value={l_note} />
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Oleh:</span>
              <select class={inputClass} bind:value={l_operator}>
                <option>Admin</option>
                <option>Kasir</option>
                <option>Gudang</option>
              </select>
            </div>
            <div class={fieldWrapClass}>
              <span class="font-bold">Status:</span>
              <select class={inputClass} bind:value={l_status}>
                <option value="completed">Selesai</option>
                <option value="pending_audit">Menunggu audit</option>
              </select>
            </div>
            <button type="submit" disabled={l_submitting} class={submitClass}>
              {l_submitting ? 'Menyimpan...' : 'Konfirmasi'}
            </button>
          </form>
        {/if}
      </div>
    </div>
  </div>
</MainLayout>
