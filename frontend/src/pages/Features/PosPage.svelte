<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Swal from 'sweetalert2';
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';
  import { CirclePlus, Search, Mic, RefreshCw } from 'lucide-svelte';
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
  let query = '';
  let filtered: Product[] = [];

  onMount(async () => {
    await loadProducts();
  });

  async function loadProducts() {
    try {
      products = await stockService.getAll();
    } catch (err) {
      console.error(err);
    }
  }

  // ==================== InputPos: pencarian + suara ====================
  $: filtered =
    query.length > 1 ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())) : [];

  function handleAddProduct(product: Product) {
    cartStore.addItem({ id: product.id, name: product.name, price: product.price || 0, qty: 1 });
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: `${product.name} ditambahkan ke keranjang`,
      timer: 1500,
      showConfirmButton: false,
    });
    query = '';
    filtered = [];
  }

  // Kamus jumlah & satuan untuk parsing perintah suara (sama dengan InputPos.jsx di React)
  const QTY: Record<string, number> = {
    satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
    enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10,
  };
  const STRONG_UNITS = new Set(['bungkus', 'botol', 'dus', 'pcs', 'pack', 'renteng', 'slop', 'sak', 'biji', 'buah', 'lusin', 'pak', 'karton', 'box', 'kaleng', 'sachet', 'tray', 'ikat', 'lembar', 'batang', 'butir']);
  const WEAK_UNITS = new Set(['kilo', 'kilogram', 'kg', 'liter', 'gram', 'gr']);

  function parseJumlah(transcript: string): number | null {
    if (!transcript) return null;
    const words = transcript.toLowerCase().split(/\s+/);
    // 1. qty word + strong unit
    for (let i = 0; i < words.length; i++) {
      if (QTY[words[i]] && i + 1 < words.length && STRONG_UNITS.has(words[i + 1])) return QTY[words[i]];
    }
    // 2. digit + strong unit
    for (let i = 0; i < words.length; i++) {
      if (/^\d+$/.test(words[i]) && i + 1 < words.length && STRONG_UNITS.has(words[i + 1])) {
        const v = parseInt(words[i]);
        if (v >= 1 && v <= 10) return v;
      }
    }
    // 3. qty word at end
    if (words.length && QTY[words[words.length - 1]]) return QTY[words[words.length - 1]];
    // 4. last qty + weak unit
    let weak: number | null = null;
    for (let i = 0; i < words.length; i++) {
      if (QTY[words[i]] && i + 1 < words.length && WEAK_UNITS.has(words[i + 1])) weak = QTY[words[i]];
    }
    if (weak !== null) return weak;
    // 5. last qty not part of number phrase
    const skip = new Set(['ratus', 'ribu', 'puluh', 'belas', 'mililiter', 'ml', ...WEAK_UNITS]);
    let cand: number | null = null;
    for (let i = 0; i < words.length; i++) {
      if (QTY[words[i]] && !skip.has(words[i + 1] || '')) cand = QTY[words[i]];
    }
    return cand;
  }

  let isListening = false;
  let isProcessing = false;
  let recognition: any = null;
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let audioMimeType = '';

  async function startListening() {
    filtered = [];
    audioChunks = [];
    let transcriptResult = '';

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      Swal.fire('Error', 'Browser tidak mendukung Web Speech API', 'error');
      return;
    }
    const rec = new SpeechRecognitionCtor();
    rec.lang = 'id-ID';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognition = rec;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/mpeg')) mimeType = 'audio/mpeg';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorder = recorder;
      audioMimeType = mimeType || recorder.mimeType;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      recorder.start();
    } catch (err) {
      Swal.fire('Error', 'Tidak dapat mengakses mikrofon', 'error');
      return;
    }

    rec.onresult = (event: any) => {
      transcriptResult = event.results[0][0].transcript;
    };
    rec.onerror = (e: any) => {
      console.error(e);
      Swal.fire('Error', 'Gagal menangkap suara', 'error');
      stopListening();
    };
    rec.onend = () => {
      isListening = false;
      if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
      if (transcriptResult) processTransaction(transcriptResult);
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

  async function processTransaction(spokenText: string) {
    isProcessing = true;
    const jumlah = parseJumlah(spokenText) || 1;

    await new Promise((resolve) => setTimeout(resolve, 300));

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
          html: `
          <strong>Produk:</strong> ${produk}<br/>
          <strong>Jumlah:</strong> ${qty}<br/>
          <small>Akurasi: ${((produk_conf || 0) * 100).toFixed(1)}%</small>
        `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Ya, Tambahkan',
          cancelButtonText: 'Batal',
        });
        if (result.isConfirmed) {
          cartStore.addItem({ id: matchedProduct.id, name: matchedProduct.name, price: matchedProduct.price || 0, qty });
          await Swal.fire('Berhasil!', 'Produk ditambahkan ke keranjang', 'success');
        }
      } else {
        let top3Text = '';
        if (res.data.produk_top3 && res.data.produk_top3.length) {
          top3Text = '<br/><br/><strong>Alternatif teratas:</strong><ul>';
          for (const [name, conf] of res.data.produk_top3) {
            top3Text += `<li>${name} (${(conf * 100).toFixed(1)}%)</li>`;
          }
          top3Text += '</ul>';
        }
        await Swal.fire({
          title: 'Hasil Deteksi Suara',
          html: `
          Produk terdeteksi: <strong>${produk}</strong><br/>
          Jumlah: ${qty}<br/>
          Perkiraan harga: Rp ${Number(harga || 0).toLocaleString()}${top3Text}
        `,
          icon: 'info',
          confirmButtonText: 'OK',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal memproses suara. Coba lagi.', 'error');
    } finally {
      isProcessing = false;
    }
  }

  // ==================== CartPos ====================
  function onQtyChange(item: CartItem, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    cartStore.updateQty(item.id, parseInt(value) || 1);
  }

  function onDeleteHandler(item: CartItem) {
    Swal.fire({
      title: 'Hapus Item?',
      text: `Yakin ingin menghapus ${item.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) cartStore.removeItem(item.id);
    });
  }

  function generateStrukPDF(transactionData: {
    transactionId: string;
    date: string;
    items: CartItem[];
    subtotal: number;
    payment: number;
    change: number;
    cashier: string;
  }) {
    const { transactionId, date, items, subtotal, payment, change, cashier } = transactionData;
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
        item.qty,
        `Rp${item.price.toLocaleString()}`,
        `Rp${(item.price * item.qty).toLocaleString()}`,
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
    doc.text(`Subtotal   : Rp${subtotal.toLocaleString()}`, leftMargin + maxWidth - 2, finalY, { align: 'right' });
    finalY += 5;
    doc.text(`Dibayar    : Rp${payment.toLocaleString()}`, leftMargin + maxWidth - 2, finalY, { align: 'right' });
    finalY += 5;
    doc.text(`Kembalian  : Rp${change.toLocaleString()}`, leftMargin + maxWidth - 2, finalY, { align: 'right' });
    finalY += 5;
    doc.line(leftMargin, finalY, leftMargin + maxWidth, finalY);
    finalY += 3;
    doc.setFont('helvetica', 'italic');
    doc.text('Terima kasih!', leftMargin + maxWidth / 2, finalY, { align: 'center' });
    finalY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('FinSense POS', leftMargin + maxWidth / 2, finalY, { align: 'center' });
    doc.save(`struk_${transactionId}.pdf`);
  }

  async function onCheckout() {
    const cart = $cartStore;
    const subtotal = $cartTotal;
    if (cart.length === 0) {
      Swal.fire('Keranjang kosong', 'Tambahkan produk terlebih dahulu', 'info');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Konfirmasi Transaksi',
      text: `Total Rp ${subtotal.toLocaleString()}. Lanjutkan ke pembayaran?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, lanjut',
    });
    if (!confirm.isConfirmed) return;

    const { value: paymentAmount } = await Swal.fire({
      title: 'Jumlah Bayar',
      input: 'number',
      inputLabel: `Total belanja: Rp ${subtotal.toLocaleString()}`,
      inputPlaceholder: 'Masukkan jumlah uang customer',
      inputAttributes: { min: String(subtotal), step: '1' },
      showCancelButton: true,
      confirmButtonText: 'Hitung Kembalian',
      preConfirm: (amount: string) => {
        const num = Number(amount);
        if (isNaN(num) || num < subtotal) {
          Swal.showValidationMessage(`Jumlah bayar minimal Rp ${subtotal.toLocaleString()}`);
          return false;
        }
        return num;
      },
    });
    if (!paymentAmount) return;
    const change = paymentAmount - subtotal;

    const finalConfirm = await Swal.fire({
      title: 'Detail Pembayaran',
      html: `
        <div style="text-align: left">
          <p><strong>Subtotal:</strong> Rp ${subtotal.toLocaleString()}</p>
          <p><strong>Dibayar:</strong> Rp ${paymentAmount.toLocaleString()}</p>
          <p><strong>Kembalian:</strong> Rp ${change.toLocaleString()}</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Cetak Struk & Proses',
      cancelButtonText: 'Batal',
    });
    if (!finalConfirm.isConfirmed) return;

    try {
      // Cek stok
      for (const item of cart) {
        const product = await stockService.getById(item.id);
        const currentStock = product?.stock ?? 0;
        if (currentStock < item.qty) {
          await Swal.fire({
            title: 'Stok tidak mencukupi',
            html: `${item.name}<br/>Stok tersedia: ${currentStock}<br/>Diminta: ${item.qty}`,
            icon: 'error',
          });
          return;
        }
      }

      const items = cart.map((item) => ({
        item_name: item.name,
        quantity: item.qty,
        unit: 'pcs',
        unit_price: item.price,
        product_id: item.id,
      }));

      const response = await transactionService.create({
        category_id: 1,
        type: 'income',
        amount: subtotal,
        description: `Penjualan POS - ${cart.length} item`,
        transaction_date: new Date().toISOString(),
        source: 'ai',
        items,
      });
      const transactionId = response?.id || 'Unknown';

      for (const item of cart) {
        await api.patch(`/products/${item.id}/stock`, { quantity: item.qty, type: 'out', note: 'Penjualan POS' });
      }

      // Ambil nama kasir dari store auth
      const cashierName = $authStore.user?.full_name || 'Kasir';

      generateStrukPDF({
        transactionId,
        date: new Date().toLocaleString('id-ID'),
        items: cart,
        subtotal,
        payment: paymentAmount,
        change,
        cashier: cashierName,
      });

      Swal.fire('Sukses', 'Transaksi berhasil diproses & struk diunduh', 'success');
      cartStore.emptyCart();
      await loadProducts();
    } catch (err: any) {
      console.error(err);
      Swal.fire('Gagal', err.response?.data?.error || 'Terjadi kesalahan', 'error');
    }
  }
</script>

<MainLayout>
  <div class="h-full flex flex-col">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div>
        <h1 class="text-2xl font-bold">POS Terminal</h1>
        <p class="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <button
        on:click={() => router.goto('/new?type=pos')}
        class="flex items-center gap-2 bg-sky-950 p-2 px-4 text-white font-semibold border cursor-pointer rounded-lg hover:bg-white hover:text-sky-950 transition"
      >
        <CirclePlus size={16} />
        Tambah POS baru
      </button>
    </div>
    <div class="flex flex-col lg:flex-row gap-4 mt-4 flex-1">
      <div class="flex flex-col gap-4 lg:w-3/4">
        <!-- InputPos -->
        <div class="flex flex-col items-center py-4 gap-4">
          <!-- Input pencarian -->
          <div class="relative w-full max-w-md">
            <input type="text" placeholder="Cari produk..." bind:value={query} class="w-full p-3 border border-gray-300 rounded-lg" />
            <Search size={16} class="absolute right-3 top-4 text-gray-400" />
            {#if filtered.length > 0}
              <ul class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto">
                {#each filtered as p (p.id)}
                  <li
                    role="button"
                    tabindex="0"
                    on:click={() => handleAddProduct(p)}
                    on:keydown={(e) => e.key === 'Enter' && handleAddProduct(p)}
                    class="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                  >
                    <span>{p.name}</span>
                    <span>Rp {(p.price || 0).toLocaleString()}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>

          <!-- Tombol suara dan status proses -->
          <button
            on:click={isListening ? stopListening : startListening}
            disabled={isProcessing}
            class="flex p-5 border rounded-xl transition-all {isProcessing
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : isListening
                ? 'bg-white text-red-500 border-red-500'
                : 'bg-sky-950 text-white hover:bg-white hover:text-sky-950'}"
          >
            {#if isProcessing}
              <RefreshCw size={28} class="animate-spin" />
            {:else}
              <Mic size={28} />
            {/if}
          </button>

          <p class="text-sm text-gray-400">
            {isProcessing
              ? 'Memproses suara...'
              : isListening
                ? 'Mendengarkan... (klik lagi untuk berhenti)'
                : 'Tekan mikrofon untuk perintah suara'}
          </p>

          <p class="text-sm text-gray-400">Contoh: "Jual Mie Goreng 3 bungkus"</p>
        </div>

        <!-- FrequentlyPos -->
        <div class="mt-4">
          <p class="text-lg font-semibold px-2 py-2">Produk Sering Dibeli</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-2">
            {#each products.slice(0, 6) as product (product.id)}
              <div
                role="button"
                tabindex="0"
                on:click={() => handleAddProduct(product)}
                on:keydown={(e) => e.key === 'Enter' && handleAddProduct(product)}
                class="p-4 border rounded-xl cursor-pointer hover:bg-gray-100"
              >
                <div class="font-semibold">{product.name}</div>
                <div>Stok: {product.stock} {product.unit || ''}</div>
                <div>Rp {(product.price || 0).toLocaleString()}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- CartPos -->
      <div class="border border-gray-400 rounded-md w-full lg:w-1/4">
        <div class="flex flex-col p-2 h-full">
          <h1 class="font-semibold text-xl text-sky-950 mb-2">Keranjang</h1>
          <div class="flex flex-col gap-2 max-h-96 overflow-y-auto flex-1 mt-2">
            {#if $cartStore.length === 0}
              <p class="text-gray-500 text-center py-8">Keranjang kosong</p>
            {:else}
              {#each $cartStore as item (item.id)}
                <div class="border-b pb-2">
                  <div class="flex justify-between font-semibold">{item.name}</div>
                  <div class="flex flex-wrap justify-between items-center gap-2 text-gray-500">
                    <div class="flex items-center gap-4 mt-2">
                      <span>Rp {item.price.toLocaleString()}</span>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        on:change={(e) => onQtyChange(item, e)}
                        class="w-16 p-1 border rounded"
                      />
                    </div>
                    <div class="flex gap-2">
                      <span class="font-bold text-sky-950">Rp {(item.price * item.qty).toLocaleString()}</span>
                      <button on:click={() => onDeleteHandler(item)} class="text-red-800 cursor-pointer">X</button>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
          <div class="mt-auto pt-2 border-t">
            <div class="flex justify-between">
              <span class="text-gray-500">Subtotal</span>
              <span class="font-bold text-lg">Rp {$cartTotal.toLocaleString()}</span>
            </div>
            <button
              on:click={onCheckout}
              class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-2 cursor-pointer"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</MainLayout>
