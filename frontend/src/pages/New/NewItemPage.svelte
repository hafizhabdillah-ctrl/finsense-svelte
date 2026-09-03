<script lang="ts">
  import { onMount } from 'svelte';
  import { router, meta } from 'tinro';
  import Swal from 'sweetalert2';
  import {
    ArrowLeft,
    Save,
    PackagePlus,
    Receipt,
    ShoppingCart,
    HandCoins,
    ClipboardList,
  } from 'lucide-svelte';
  import { stockService, transactionService, debtService, logService } from '../../lib/services';
  import api from '../../lib/services/api';

  type ItemType = 'product' | 'transaction' | 'pos' | 'debt' | 'log';

  const tabs: { value: ItemType; label: string; icon: any; backPath: string }[] = [
    { value: 'product', label: 'Produk', icon: PackagePlus, backPath: '/stocks' },
    { value: 'transaction', label: 'Transaksi', icon: Receipt, backPath: '/transactions' },
    { value: 'pos', label: 'POS', icon: ShoppingCart, backPath: '/pos' },
    { value: 'debt', label: 'Hutang', icon: HandCoins, backPath: '/debts' },
    { value: 'log', label: 'Log Stok', icon: ClipboardList, backPath: '/logs' },
  ];

  const initialQuery = meta().query?.type as string | undefined;
  let type: ItemType =
    initialQuery && tabs.some((t) => t.value === initialQuery) ? (initialQuery as ItemType) : 'product';

  onMount(() => {
    loadProducts();
    loadCategories();
  });

  $: currentTab = tabs.find((t) => t.value === type)!;

  function switchTab(value: ItemType) {
    type = value;
    router.location.query.set('type', value);
  }

  // -------------------- Produk (Stock) --------------------
  let p_name = '';
  let p_sku = '';
  let p_stock = 0;
  let p_unit = '';
  let p_price: number | '' = '';
  let p_min_stock = 10;
  let p_loading = false;

  async function submitProduct(e: Event) {
    e.preventDefault();
    p_loading = true;
    try {
      await stockService.create({
        name: p_name,
        sku: p_sku || undefined,
        stock: Number(p_stock),
        unit: p_unit || undefined,
        price: p_price !== '' ? Number(p_price) : undefined,
        min_stock: Number(p_min_stock),
      });

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Produk baru berhasil ditambahkan.',
        confirmButtonColor: '#0c4a6e',
      });

      router.goto('/stocks');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Gagal menambahkan produk.';
      Swal.fire('Gagal', msg, 'error');
    } finally {
      p_loading = false;
    }
  }

  // -------------------- Transaksi --------------------
  let t_category_id: number | '' = '';
  let t_type: 'income' | 'expense' = 'expense';
  let t_amount: number | '' = '';
  let t_description = '';
  let t_transaction_date = new Date().toISOString().slice(0, 16);
  let t_source: 'manual' | 'voice' | 'ai' = 'manual';
  let t_loading = false;

  let categories: { id: number; name: string; type: string }[] = [];
  let loadingCategories = true;

  async function loadCategories() {
    try {
      const res = await api.get('/categories');
      categories = res.data;
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    } finally {
      loadingCategories = false;
    }
  }

  $: filteredCategories = categories.filter((c) => c.type === t_type);

  function onTransactionTypeChange() {
    t_category_id = '';
  }

  async function submitTransaction(e: Event) {
    e.preventDefault();
    if (!t_category_id || !t_amount) {
      Swal.fire('Perhatian', 'Kategori dan jumlah wajib diisi.', 'warning');
      return;
    }
    t_loading = true;
    try {
      await transactionService.create({
        category_id: Number(t_category_id),
        type: t_type,
        amount: Number(t_amount),
        description: t_description || undefined,
        transaction_date: t_transaction_date
          ? new Date(t_transaction_date).toISOString()
          : undefined,
        source: t_source,
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
      t_loading = false;
    }
  }

  // -------------------- POS --------------------
  let products: {
    id: string;
    name: string;
    sku: string | null;
    stock: number;
    unit: string | null;
    price: number | null;
  }[] = [];
  let loadingProducts = true;

  let pos_productId = '';
  let pos_quantity: number | '' = '';
  let pos_loading = false;

  async function loadProducts() {
    try {
      products = await stockService.getAll();
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    } finally {
      loadingProducts = false;
    }
  }

  $: pos_selectedProduct = products.find((p) => p.id === pos_productId);

  async function submitPos() {
    if (!pos_productId || !pos_quantity) {
      Swal.fire('Perhatian', 'Pilih barang dan isi jumlah terlebih dahulu.', 'warning');
      return;
    }
    if (pos_selectedProduct && Number(pos_quantity) > pos_selectedProduct.stock) {
      Swal.fire('Stok Tidak Cukup', `Stok tersedia: ${pos_selectedProduct.stock}`, 'warning');
      return;
    }

    pos_loading = true;
    try {
      const product = pos_selectedProduct!;
      const qty = Number(pos_quantity);
      const totalAmount = (product.price ?? 0) * qty;

      // 1. Kurangi stok via stock-log (type: out)
      await api.post('/stock-logs', {
        product_id: pos_productId,
        type: 'out',
        quantity: qty,
        note: `POS penjualan ${product.name}`,
        status: 'completed',
      });

      // 2. Cari kategori income
      const catRes = await api.get('/categories');
      const allCats: { id: number; name: string; type: string }[] = catRes.data;
      const incomeCategory =
        allCats.find(
          (c) =>
            c.type === 'income' &&
            (c.name.toLowerCase().includes('jual') || c.name.toLowerCase().includes('usaha'))
        ) || allCats.find((c) => c.type === 'income') || allCats[0];

      if (!incomeCategory) {
        throw new Error('Tidak ada kategori pemasukan. Pastikan seed kategori sudah dijalankan.');
      }

      // 3. Buat transaksi income (penjualan)
      await transactionService.create({
        category_id: incomeCategory.id,
        type: 'income',
        amount: totalAmount,
        description: `Penjualan POS: ${product.name} x${qty}`,
        source: 'pos',
      });

      await Swal.fire({
        icon: 'success',
        title: 'Transaksi Berhasil!',
        html: `<p>Penjualan <strong>${product.name}</strong> x${qty} senilai <strong>Rp ${totalAmount.toLocaleString('id-ID')}</strong> berhasil dicatat.</p>`,
        confirmButtonColor: '#0c4a6e',
      });

      router.goto('/pos');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Gagal memproses transaksi POS.';
      Swal.fire('Gagal', msg, 'error');
    } finally {
      pos_loading = false;
    }
  }

  // -------------------- Hutang --------------------
  let d_customer_name = '';
  let d_total_debt: number | '' = '';
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  let d_due_date = `${yyyy}-${mm}-${dd}`;
  let d_note = '';
  let d_loading = false;

  async function submitDebt(e: Event) {
    e.preventDefault();
    if (!d_customer_name || !d_total_debt || !d_due_date) {
      Swal.fire(
        'Perhatian',
        'Nama pelanggan, jumlah hutang, dan tanggal jatuh tempo wajib diisi.',
        'warning'
      );
      return;
    }
    d_loading = true;
    try {
      await debtService.create({
        customer_name: d_customer_name,
        total_debt: Number(d_total_debt),
        due_date: new Date(d_due_date).toISOString(),
        note: d_note || undefined,
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
      d_loading = false;
    }
  }

  // -------------------- Log Stok --------------------
  let l_product_id = '';
  let l_type: 'in' | 'out' | 'adjust' = 'in';
  let l_quantity: number | '' = '';
  let l_note = '';
  let l_operator = '';
  let l_status: 'completed' | 'pending_audit' = 'completed';
  let l_loading = false;

  $: l_selectedProduct = products.find((p) => p.id === l_product_id);

  async function submitLog(e: Event) {
    e.preventDefault();
    if (!l_product_id || !l_quantity) {
      Swal.fire('Perhatian', 'Produk dan jumlah wajib diisi.', 'warning');
      return;
    }
    l_loading = true;
    try {
      await logService.create({
        product_id: l_product_id,
        type: l_type,
        quantity: Number(l_quantity),
        note: l_note || undefined,
        operator: l_operator || undefined,
        status: l_status,
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
      l_loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
  <div class="max-w-3xl mx-auto">
    <!-- Header Page -->
    <div class="flex items-center justify-between mb-6">
      <button
        on:click={() => router.goto(currentTab.backPath)}
        class="flex items-center gap-2 text-gray-600 hover:text-sky-950 font-medium transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Kembali</span>
      </button>

      <div class="flex items-center gap-2 text-sky-950 font-bold text-xl">
        <svelte:component this={currentTab.icon} size={24} />
        <span>Tambah Item Baru</span>
      </div>
    </div>

    <!-- Tab Strip -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-200 p-2 mb-6 flex flex-wrap gap-2">
      {#each tabs as tab (tab.value)}
        <button
          type="button"
          on:click={() => switchTab(tab.value)}
          class="flex-1 min-w-[110px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer
            {type === tab.value
              ? 'bg-sky-950 text-white shadow'
              : 'text-gray-500 hover:bg-gray-100'}"
        >
          <svelte:component this={tab.icon} size={18} />
          <span>{tab.label}</span>
        </button>
      {/each}
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-200">
      {#if type === 'product'}
        <form on:submit={submitProduct} class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="item-name" class="block text-sm font-semibold text-gray-700 mb-1">
                Nama Produk <span class="text-red-500">*</span>
              </label>
              <input
                id="item-name"
                type="text"
                bind:value={p_name}
                placeholder="Contoh: Kopi Susu Aren"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label for="item-sku" class="block text-sm font-semibold text-gray-700 mb-1">
                Kode SKU / Barcode
              </label>
              <input
                id="item-sku"
                type="text"
                bind:value={p_sku}
                placeholder="Contoh: PRD-001 (Opsional)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="item-stock" class="block text-sm font-semibold text-gray-700 mb-1">
                Jumlah Stok Awal <span class="text-red-500">*</span>
              </label>
              <input
                id="item-stock"
                type="number"
                min="0"
                bind:value={p_stock}
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label for="item-unit" class="block text-sm font-semibold text-gray-700 mb-1">
                Satuan
              </label>
              <input
                id="item-unit"
                type="text"
                bind:value={p_unit}
                placeholder="Contoh: pcs, kg, lusin (Opsional)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="item-price" class="block text-sm font-semibold text-gray-700 mb-1">
                Harga Jual (Rp)
              </label>
              <input
                id="item-price"
                type="number"
                min="0"
                bind:value={p_price}
                placeholder="0 (Opsional)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label for="item-min-stock" class="block text-sm font-semibold text-gray-700 mb-1">
                Stok Minimum (Peringatan)
              </label>
              <input
                id="item-min-stock"
                type="number"
                min="0"
                bind:value={p_min_stock}
                placeholder="10"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p class="text-xs text-gray-400 mt-1">Sistem akan memberi peringatan saat stok ≤ nilai ini.</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              on:click={() => router.goto('/stocks')}
              class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={p_loading}
              class="px-6 py-2.5 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={18} />
              <span>{p_loading ? 'Menyimpan...' : 'Simpan Produk'}</span>
            </button>
          </div>
        </form>
      {:else if type === 'transaction'}
        <form on:submit={submitTransaction} class="space-y-6">
          <div>
            <p class="block text-sm font-semibold text-gray-700 mb-2">
              Tipe Transaksi <span class="text-red-500">*</span>
            </p>
            <div class="flex gap-3">
              <button
                type="button"
                on:click={() => {
                  t_type = 'expense';
                  onTransactionTypeChange();
                }}
                class="flex-1 py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer
                  {t_type === 'expense'
                    ? 'bg-red-50 border-red-400 text-red-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
              >
                Pengeluaran
              </button>
              <button
                type="button"
                on:click={() => {
                  t_type = 'income';
                  onTransactionTypeChange();
                }}
                class="flex-1 py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer
                  {t_type === 'income'
                    ? 'bg-green-50 border-green-400 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
              >
                Pemasukan
              </button>
            </div>
          </div>

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
                  bind:value={t_category_id}
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
                bind:value={t_amount}
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="trx-date" class="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal & Waktu
              </label>
              <input
                id="trx-date"
                type="datetime-local"
                bind:value={t_transaction_date}
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label for="trx-source" class="block text-sm font-semibold text-gray-700 mb-1">
                Sumber Input
              </label>
              <select
                id="trx-source"
                bind:value={t_source}
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="manual">Manual</option>
                <option value="voice">Suara</option>
                <option value="ai">AI</option>
              </select>
            </div>
          </div>

          <div>
            <label for="trx-desc" class="block text-sm font-semibold text-gray-700 mb-1">
              Keterangan / Deskripsi
            </label>
            <textarea
              id="trx-desc"
              bind:value={t_description}
              placeholder="Contoh: Pembelian bahan baku mingguan... (Opsional)"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            ></textarea>
          </div>

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
              disabled={t_loading}
              class="px-6 py-2.5 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={18} />
              <span>{t_loading ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      {:else if type === 'pos'}
        <div>
          <div class="mb-5">
            <label for="pos-product" class="block text-sm font-bold text-gray-800 mb-2">
              Nama Barang:
            </label>
            {#if loadingProducts}
              <div class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-400 text-sm bg-gray-50">
                Memuat daftar produk...
              </div>
            {:else if products.length === 0}
              <div class="w-full px-4 py-2.5 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-700 text-sm">
                Belum ada produk.
                <button type="button" on:click={() => switchTab('product')} class="underline font-semibold">
                  Tambah produk
                </button>
                terlebih dahulu.
              </div>
            {:else}
              <select
                id="pos-product"
                bind:value={pos_productId}
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-gray-700"
              >
                <option value="">Pilih Barang dari Stok</option>
                {#each products as p}
                  <option value={p.id} disabled={p.stock === 0}>
                    {p.name}{p.sku ? ` (${p.sku})` : ''} — Stok: {p.stock}
                    {p.stock === 0 ? ' [Habis]' : ''}
                  </option>
                {/each}
              </select>
            {/if}

            {#if pos_selectedProduct}
              <p class="text-xs text-gray-400 mt-1">
                Stok tersedia: <strong>{pos_selectedProduct.stock}</strong>
                {pos_selectedProduct.unit ? `· Satuan: ${pos_selectedProduct.unit}` : ''}
                {pos_selectedProduct.price != null ? `· Harga: Rp ${pos_selectedProduct.price.toLocaleString('id-ID')}` : ''}
              </p>
            {/if}
          </div>

          <div class="mb-7">
            <label for="pos-qty" class="block text-sm font-bold text-gray-800 mb-2">
              Jumlah Barang:
            </label>
            <input
              id="pos-qty"
              type="number"
              min="1"
              max={pos_selectedProduct?.stock ?? undefined}
              bind:value={pos_quantity}
              placeholder="Masukan jumlah Barang..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-700"
            />
            {#if pos_selectedProduct && pos_quantity}
              <p class="text-xs text-gray-500 mt-1">
                Total: <strong>Rp {((pos_selectedProduct.price ?? 0) * Number(pos_quantity)).toLocaleString('id-ID')}</strong>
              </p>
            {/if}
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              on:click={() => router.goto('/pos')}
              class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              on:click={submitPos}
              disabled={pos_loading || !pos_productId || products.length === 0}
              class="px-6 py-2.5 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{pos_loading ? 'Memproses...' : 'Konfirmasi'}</span>
            </button>
          </div>
        </div>
      {:else if type === 'debt'}
        <form on:submit={submitDebt} class="space-y-6">
          <div>
            <label for="debt-customer" class="block text-sm font-semibold text-gray-700 mb-1">
              Nama Pelanggan / Peminjam <span class="text-red-500">*</span>
            </label>
            <input
              id="debt-customer"
              type="text"
              bind:value={d_customer_name}
              placeholder="Contoh: Budi Santoso"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="debt-amount" class="block text-sm font-semibold text-gray-700 mb-1">
                Jumlah Hutang (Rp) <span class="text-red-500">*</span>
              </label>
              <input
                id="debt-amount"
                type="number"
                min="1"
                bind:value={d_total_debt}
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
                bind:value={d_due_date}
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label for="debt-note" class="block text-sm font-semibold text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              id="debt-note"
              bind:value={d_note}
              placeholder="Contoh: Hutang pembelian barang tanggal 1 September... (Opsional)"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            ></textarea>
          </div>

          <div class="bg-sky-50 border border-sky-200 rounded-lg p-4 text-sm text-sky-800">
            <p class="font-semibold mb-1">ℹ️ Status Awal: <span class="font-bold">Pending</span></p>
            <p>Hutang akan otomatis menjadi <strong>Overdue</strong> jika melewati tanggal jatuh tempo. Gunakan fitur "Catat Pembayaran" untuk memperbarui status.</p>
          </div>

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
              disabled={d_loading}
              class="px-6 py-2.5 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={18} />
              <span>{d_loading ? 'Menyimpan...' : 'Simpan Hutang'}</span>
            </button>
          </div>
        </form>
      {:else if type === 'log'}
        <form on:submit={submitLog} class="space-y-6">
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
                Belum ada produk.
                <button type="button" on:click={() => switchTab('product')} class="underline font-semibold">
                  Tambah produk
                </button>
                terlebih dahulu.
              </div>
            {:else}
              <select
                id="log-product"
                bind:value={l_product_id}
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                required
              >
                <option value="">-- Pilih Produk --</option>
                {#each products as p}
                  <option value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ''} — Stok: {p.stock}</option>
                {/each}
              </select>
            {/if}

            {#if l_selectedProduct}
              <p class="text-xs text-gray-400 mt-1">
                Stok saat ini: <strong>{l_selectedProduct.stock}</strong>
                {l_selectedProduct.sku ? `· SKU: ${l_selectedProduct.sku}` : ''}
              </p>
            {/if}
          </div>

          <div>
            <p class="block text-sm font-semibold text-gray-700 mb-2">
              Tipe Mutasi Stok <span class="text-red-500">*</span>
            </p>
            <div class="grid grid-cols-3 gap-3">
              <button
                type="button"
                on:click={() => (l_type = 'in')}
                class="py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer text-sm
                  {l_type === 'in'
                    ? 'bg-green-50 border-green-400 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
              >
                📥 Masuk (In)
              </button>
              <button
                type="button"
                on:click={() => (l_type = 'out')}
                class="py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer text-sm
                  {l_type === 'out'
                    ? 'bg-red-50 border-red-400 text-red-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
              >
                📤 Keluar (Out)
              </button>
              <button
                type="button"
                on:click={() => (l_type = 'adjust')}
                class="py-2.5 rounded-lg border-2 font-semibold transition cursor-pointer text-sm
                  {l_type === 'adjust'
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}"
              >
                🔧 Penyesuaian
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              {#if l_type === 'in'}
                Stok akan <strong>ditambah</strong> sejumlah yang dimasukkan.
              {:else if l_type === 'out'}
                Stok akan <strong>dikurangi</strong> sejumlah yang dimasukkan.
              {:else}
                Stok akan <strong>diset langsung</strong> ke nilai yang dimasukkan (opname/koreksi).
              {/if}
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="log-qty" class="block text-sm font-semibold text-gray-700 mb-1">
                Jumlah <span class="text-red-500">*</span>
              </label>
              <input
                id="log-qty"
                type="number"
                min="1"
                bind:value={l_quantity}
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
                bind:value={l_operator}
                placeholder="Contoh: Ahmad (Opsional)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="log-status" class="block text-sm font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                id="log-status"
                bind:value={l_status}
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
                bind:value={l_note}
                placeholder="Contoh: Restock mingguan (Opsional)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

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
              disabled={l_loading || products.length === 0}
              class="px-6 py-2.5 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={18} />
              <span>{l_loading ? 'Menyimpan...' : 'Simpan Log'}</span>
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>
