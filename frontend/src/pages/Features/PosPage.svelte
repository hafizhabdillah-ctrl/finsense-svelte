<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';
  import { Search, Mic, RefreshCw, X } from 'lucide-svelte';
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
  import { stockService, transactionService } from '../../lib/services';
  import api from '../../lib/services/api';
  import { cartStore, cartTotal, type CartItem } from '../../lib/stores/cart';
  import { authStore } from '../../lib/stores/auth';

  type Product = {
    id: string;
    name: string;
    sku: string | null;
    stock: number;
    unit: string | null;
    price: number | null;
  };

  let products: Product[] = [];
  let frequently: Product[] = [];
  let query = '';
  let filtered: Product[] = [];
  let checkingOut = false;

  const QTY: Record<string, number> = {
    satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
    enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10,
  };

  function parseJumlah(transcript: string): number | null {
    if (!transcript) return null;
    const words = transcript.toLowerCase().split(/\s+/);
    for (const w of words) if (QTY[w]) return QTY[w];
    for (const w of words) {
      if (/^\d+$/.test(w)) {
        const v = parseInt(w, 10);
        if (v >= 1 && v <= 10) return v;
      }
    }
    return null;
  }

  onMount(async () => {
    await loadProducts();
  });

  async function loadProducts() {
    try {
      products = await stockService.getAll();
      frequently = products.slice(0, 6);
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    }
  }

  $: filtered = query.length > 1
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  function addToCart(product: Product, qty = 1) {
    cartStore.addItem({ id: product.id, name: product.name, price: product.price ?? 0, qty });
    query = '';
    filtered = [];
  }

  function onQtyChange(item: CartItem, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const qty = parseInt(value, 10);
    if (!isNaN(qty) && qty > 0) cartStore.updateQty(item.id, qty);
  }

  function onRemove(item: CartItem) {
    cartStore.removeItem(item.id);
  }

  // -------------------- Voice input --------------------
  let isListening = false;
  let isProcessing = false;
  let recognition: any = null;
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let audioMimeType = '';

  async function startListening() {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      Swal.fire('Error', 'Browser tidak mendukung Web Speech API', 'error');
      return;
    }

    audioChunks = [];
    let transcriptResult = '';

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      Swal.fire('Error', 'Tidak dapat mengakses mikrofon', 'error');
      return;
    }

    let mimeType = '';
    if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
    else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorder = recorder;
    audioMimeType = mimeType || recorder.mimeType;
    recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    recorder.start();

    const rec = new SpeechRecognitionCtor();
    rec.lang = 'id-ID';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognition = rec;

    rec.onresult = (event: any) => { transcriptResult = event.results[0][0].transcript; };
    rec.onerror = () => {
      Swal.fire('Error', 'Gagal menangkap suara', 'error');
      stopListening();
    };
    rec.onend = () => {
      isListening = false;
      if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
      if (transcriptResult) processVoiceTransaction(transcriptResult);
      else Swal.fire('Info', 'Tidak ada ucapan yang terekam', 'info');
    };

    rec.start();
    isListening = true;
  }

  function stopListening() {
    if (recognition) recognition.stop();
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
    isListening = false;
  }

  async function processVoiceTransaction(spokenText: string) {
    isProcessing = true;
    const jumlah = parseJumlah(spokenText) || 1;
    const mimeType = audioMimeType || 'audio/webm';
    const audioBlob = new Blob(audioChunks, { type: mimeType });
    let extension = 'webm';
    if (mimeType.includes('mp4')) extension = 'mp4';
    else if (mimeType.includes('mpeg')) extension = 'mp3';

    const formData = new FormData();
    formData.append('audio', audioBlob, `recording.${extension}`);
    formData.append('transcript', spokenText);
    formData.append('jumlah', String(jumlah));

    try {
      const res = await api.post('/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      const { produk, jumlah: qty, harga, produk_conf, matchedProduct } = res.data;

      if (matchedProduct) {
        const result = await Swal.fire({
          title: 'Tambahkan ke Keranjang?',
          html: `<strong>Produk:</strong> ${produk}<br/><strong>Jumlah:</strong> ${qty}<br/><small>Akurasi: ${((produk_conf || 0) * 100).toFixed(1)}%</small>`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Ya, Tambahkan',
          cancelButtonText: 'Batal',
        });
        if (result.isConfirmed) {
          addToCart({ id: matchedProduct.id, name: matchedProduct.name, sku: null, stock: matchedProduct.stock ?? 0, unit: null, price: matchedProduct.price }, qty);
          await Swal.fire('Berhasil!', 'Produk ditambahkan ke keranjang', 'success');
        }
      } else {
        await Swal.fire({
          title: 'Hasil Deteksi Suara',
          html: `Produk terdeteksi: <strong>${produk}</strong><br/>Jumlah: ${qty}<br/>Perkiraan harga: Rp ${(harga || 0).toLocaleString('id-ID')}`,
          icon: 'info',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal memproses suara. Coba lagi.', 'error');
    } finally {
      isProcessing = false;
    }
  }

  // -------------------- Checkout --------------------
  function generateStrukPDF(payload: {
    transactionId: string;
    date: string;
    items: CartItem[];
    subtotal: number;
    cashier: string;
  }) {
    const { transactionId, date, items, subtotal, cashier } = payload;
    const doc = new jsPDF({ unit: 'mm', format: [58, 200] });
    const leftMargin = 2;
    const maxWidth = 54;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FINSENSE', leftMargin + maxWidth / 2, 5, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Kasir : ${cashier}`, leftMargin, 10);
    doc.text(`Tanggal: ${date}`, leftMargin, 15);
    doc.text(`ID Trx : ${transactionId}`, leftMargin, 20);
    doc.line(leftMargin, 23, leftMargin + maxWidth, 23);

    autoTable(doc, {
      startY: 25,
      head: [['Item', 'Qty', 'Harga', 'Total']],
      body: items.map((item) => [
        item.name,
        String(item.qty),
        `Rp${item.price.toLocaleString('id-ID')}`,
        `Rp${(item.price * item.qty).toLocaleString('id-ID')}`,
      ]),
      theme: 'plain',
      styles: { fontSize: 6, cellPadding: 1, halign: 'left' },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 6, halign: 'center' },
        2: { cellWidth: 12, halign: 'right' },
        3: { cellWidth: 14, halign: 'right' },
      },
      margin: { left: leftMargin, right: 2 },
      tableWidth: maxWidth,
    });

    let finalY = (doc as any).lastAutoTable.finalY + 2;
    doc.line(leftMargin, finalY, leftMargin + maxWidth, finalY);
    finalY += 3;
    doc.setFontSize(7);
    doc.text(`Subtotal : Rp${subtotal.toLocaleString('id-ID')}`, leftMargin + maxWidth - 2, finalY, { align: 'right' });
    finalY += 5;
    doc.setFont('helvetica', 'italic');
    doc.text('Terima kasih!', leftMargin + maxWidth / 2, finalY, { align: 'center' });
    finalY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('FinSense POS', leftMargin + maxWidth / 2, finalY, { align: 'center' });
    doc.save(`struk_${transactionId}.pdf`);
  }

  async function onCheckout() {
    if ($cartStore.length === 0) {
      Swal.fire('Keranjang kosong', 'Tambahkan produk terlebih dahulu', 'info');
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Konfirmasi Transaksi',
      text: `Total Rp ${$cartTotal.toLocaleString('id-ID')}. Lanjutkan?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, lanjut',
    });
    if (!confirmResult.isConfirmed) return;

    checkingOut = true;
    try {
      // 1. Cek stok terkini untuk tiap item
      for (const item of $cartStore) {
        const product = await stockService.getById(item.id);
        if (product.stock < item.qty) {
          await Swal.fire('Stok tidak mencukupi', `${item.name}<br/>Stok tersedia: ${product.stock}<br/>Diminta: ${item.qty}`, 'error');
          checkingOut = false;
          return;
        }
      }

      // 2. Kurangi stok tiap item lewat stock-log
      for (const item of $cartStore) {
        await api.post('/stock-logs', {
          product_id: item.id,
          type: 'out',
          quantity: item.qty,
          note: 'Penjualan POS',
          status: 'completed',
        });
      }

      // 3. Cari kategori income
      const catRes = await api.get('/categories');
      const allCats: { id: number; name: string; type: string }[] = catRes.data;
      const incomeCategory =
        allCats.find((c) => c.type === 'income' && (c.name.toLowerCase().includes('jual') || c.name.toLowerCase().includes('usaha'))) ||
        allCats.find((c) => c.type === 'income') ||
        allCats[0];
      if (!incomeCategory) throw new Error('Tidak ada kategori pemasukan.');

      // 4. Buat transaksi income
      const subtotal = $cartTotal;
      const transaction = await transactionService.create({
        category_id: incomeCategory.id,
        type: 'income',
        amount: subtotal,
        description: `Penjualan POS - ${$cartStore.length} item`,
        source: 'pos',
      });

      // 5. Cetak struk
      const cashier = $authStore.user?.full_name || $authStore.user?.email || 'Kasir';
      generateStrukPDF({
        transactionId: transaction.id || 'Unknown',
        date: new Date().toLocaleString('id-ID'),
        items: $cartStore,
        subtotal,
        cashier,
      });

      cartStore.emptyCart();
      await loadProducts();
      await Swal.fire('Sukses', 'Transaksi berhasil diproses & struk diunduh', 'success');
    } catch (err: any) {
      console.error(err);
      Swal.fire('Gagal', err.response?.data?.error || 'Terjadi kesalahan', 'error');
    } finally {
      checkingOut = false;
    }
  }
</script>

<MainLayout>
  <div class="px-4 h-full flex flex-col">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
      <h1 class="text-2xl font-bold">POS Terminal</h1>
      <button
        on:click={() => router.goto('/new?type=pos')}
        class="flex items-center gap-2 bg-sky-950 p-2 px-4 text-white font-semibold border cursor-pointer rounded-lg hover:bg-white hover:text-sky-950 transition"
      >
        Tambah POS baru
      </button>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 mt-4 flex-1">
      <div class="flex flex-col gap-4 lg:w-3/4">
        <!-- Pencarian & voice -->
        <div class="bg-white rounded-lg shadow-md p-4">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div class="relative flex-1">
              <input
                type="text"
                placeholder="Cari produk..."
                bind:value={query}
                class="w-full p-3 pr-10 border border-gray-300 rounded-lg"
              />
              <Search size={18} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              {#if filtered.length > 0}
                <ul class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                  {#each filtered as p (p.id)}
                    <li
                      on:click={() => addToCart(p)}
                      class="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                    >
                      <span>{p.name}</span>
                      <span>Rp {(p.price ?? 0).toLocaleString('id-ID')}</span>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            <button
              on:click={isListening ? stopListening : startListening}
              disabled={isProcessing}
              class="flex items-center justify-center p-4 border rounded-xl transition-all cursor-pointer
                {isProcessing ? 'bg-gray-400 text-white cursor-not-allowed' : isListening ? 'bg-white text-red-500 border-red-500' : 'bg-sky-950 text-white hover:bg-white hover:text-sky-950'}"
            >
              {#if isProcessing}
                <RefreshCw size={22} class="animate-spin" />
              {:else}
                <Mic size={22} />
              {/if}
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            {isProcessing ? 'Memproses suara...' : isListening ? 'Mendengarkan... (klik lagi untuk berhenti)' : 'Tekan mikrofon untuk perintah suara, contoh: "Jual Mie Goreng 3 bungkus"'}
          </p>
        </div>

        <!-- Produk sering dibeli -->
        <div class="bg-white rounded-lg shadow-md p-4">
          <h2 class="text-lg font-bold mb-4">Produk Sering Dibeli</h2>
          {#if frequently.length === 0}
            <div class="h-32 bg-gray-100 rounded flex items-center justify-center">
              <p class="text-gray-500">Belum ada produk.</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {#each frequently as p (p.id)}
                <button
                  type="button"
                  on:click={() => addToCart(p)}
                  class="p-4 border rounded-xl cursor-pointer hover:bg-gray-100 text-left"
                >
                  <div class="font-semibold">{p.name}</div>
                  <div class="text-sm text-gray-500">Stok: {p.stock} {p.unit ?? ''}</div>
                  <div class="font-bold text-sky-950">Rp {(p.price ?? 0).toLocaleString('id-ID')}</div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Keranjang -->
      <div class="border border-gray-400 rounded-md w-full lg:w-1/4 bg-white p-4 flex flex-col">
        <h2 class="text-lg font-bold mb-4">Keranjang</h2>
        <div class="flex flex-col gap-2 max-h-96 overflow-y-auto flex-1">
          {#if $cartStore.length === 0}
            <p class="text-gray-500 text-center py-8">Keranjang kosong</p>
          {:else}
            {#each $cartStore as item (item.id)}
              <div class="border-b pb-2">
                <div class="flex justify-between font-semibold">{item.name}</div>
                <div class="flex flex-wrap justify-between items-center gap-2 text-gray-500 mt-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">Rp {item.price.toLocaleString('id-ID')}</span>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      on:change={(e) => onQtyChange(item, e)}
                      class="w-14 p-1 border rounded text-sm"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sky-950 text-sm">Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                    <button on:click={() => onRemove(item)} class="text-red-800 cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
        <div class="mt-auto pt-2 border-t">
          <div class="flex justify-between">
            <span class="text-gray-500">Subtotal</span>
            <span class="font-bold text-lg">Rp {$cartTotal.toLocaleString('id-ID')}</span>
          </div>
          <button
            on:click={onCheckout}
            disabled={checkingOut}
            class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-2 disabled:opacity-50 cursor-pointer"
          >
            {checkingOut ? 'Memproses...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  </div>
</MainLayout>
