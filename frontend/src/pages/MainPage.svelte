<script lang="ts">
  import { router } from 'tinro';
  
  import logo from '../../images/logo.png';
  import hero from '../../images/herosection.png';
  import dashboard from '../../images/dashboard.png';
  import stock from '../../images/stock.png';
  import cashier from '../../images/cashier.png';
  import debt from '../../images/debt.png';
  import log from '../../images/log.png';
  import aicashier from '../../images/aicashier.png';
  import chat from '../../images/chat.png';

  const features = [
    {
      title: 'Dasbor Utama',
      alt: 'Dashboard',
      image: dashboard,
      text: 'Pantau kesehatan bisnis, tren pendapatan, dan metrik operasional harian dalam satu tampilan.',
    },
    {
      title: 'Stok Barang',
      alt: 'Stock',
      image: stock,
      text: 'Dapatkan peringatan stok rendah dan kelola inventaris secara real-time tanpa tebakan.',
    },
    {
      title: 'Kasir Otomatis',
      alt: 'Cashier',
      image: cashier,
      text: 'Proses transaksi lebih cepat, akurat, dan nyaman untuk setiap pelanggan.',
    },
    {
      title: 'Pantau Hutang',
      alt: 'Debt',
      image: debt,
      text: 'Jaga arus kas tetap sehat dengan pelacakan faktur yang belum dibayar.',
    },
    {
      title: 'Log Inventaris',
      alt: 'Log',
      image: log,
      text: 'Lacak barang masuk dan keluar dengan riwayat yang siap membantu audit.',
    },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
</script>

<div class="min-h-screen bg-[#071426] font-poppins text-slate-100">
  <nav
    class="sticky top-0 z-50 border-b border-white/10 bg-[#071426]/90 backdrop-blur-xl"
  >
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="flex h-20 items-center justify-between">
        <button
          on:click={() => scrollToSection('produk')}
          class="flex items-center text-xl font-bold tracking-tight md:text-2xl cursor-pointer"
        >
          <img src={logo} alt="FinSense Logo" class="h-9 w-auto mr-2" />
          Fin<span class="text-cyan-300">Sense</span>
        </button>
        <div class="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <button
            on:click={() => scrollToSection('produk')}
            class="transition-colors hover:text-cyan-300 cursor-pointer"
          >
            Produk
          </button>
          <button
            on:click={() => scrollToSection('fitur')}
            class="transition-colors hover:text-cyan-300 cursor-pointer"
          >
            Fitur
          </button>
          <button
            on:click={() => scrollToSection('wawasan')}
            class="transition-colors hover:text-cyan-300 cursor-pointer"
          >
            Wawasan AI
          </button>
        </div>
        <div class="flex items-center gap-2 text-sm font-semibold sm:gap-4">
          <button
            on:click={() => router.goto('/login')}
            class="px-2 py-2 text-slate-300 transition-colors hover:text-white sm:px-3 cursor-pointer"
          >
            Masuk
          </button>
          <button
            on:click={() => router.goto('/register')}
            class="rounded-lg bg-cyan-300 px-4 py-2.5 text-[#071426] shadow-[0_8px_24px_rgba(103,232,249,0.18)] transition hover:bg-cyan-200 sm:px-5 cursor-pointer"
          >
            Daftar
          </button>
        </div>
      </div>
      <div
        class="flex justify-center gap-5 border-t border-white/10 py-3 text-xs font-medium text-slate-300 md:hidden"
      >
        <button
          on:click={() => scrollToSection('produk')}
          class="cursor-pointer"
        >
          Produk
        </button>
        <button
          on:click={() => scrollToSection('fitur')}
          class="cursor-pointer"
        >
          Fitur
        </button>
        <button
          on:click={() => scrollToSection('wawasan')}
          class="cursor-pointer"
        >
          Wawasan AI
        </button>
      </div>
    </div>
  </nav>

  <main>
    <section
      id="produk"
      class="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.18),transparent_32%),linear-gradient(135deg,#071426_0%,#0b2743_55%,#0b3954_100%)] px-5 py-16 sm:px-8 md:py-24 lg:py-28"
    >
      <div
        class="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div class="animate-fade-in-up text-center lg:text-left">
          <p
            class="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300"
          >
            Platform bisnis UMKM
          </p>
          <h1
            class="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl"
          >
            Cerdas mengelola bisnis, <span class="text-cyan-300"
              >siap bertumbuh.</span
            >
          </h1>
          <p
            class="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg"
          >
            Kendalikan penjualan, stok, dan keuangan dengan wawasan AI yang
            bekerja untuk membantu Anda mengambil keputusan lebih cepat.
          </p>
          <div
            class="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <button
              on:click={() => router.goto('/register')}
              class="rounded-lg bg-cyan-300 px-6 py-3 font-bold text-[#071426] shadow-lg transition hover:-translate-y-0.5 hover:bg-cyan-200 cursor-pointer"
            >
              Mulai Sekarang
            </button>
          </div>
          <div
            class="mt-10 flex justify-center gap-8 text-left text-xs text-slate-400 lg:justify-start"
          >
            <span
              ><strong class="block text-lg text-white">5</strong>modul bisnis</span
            >
            <span
              ><strong class="block text-lg text-white">24/7</strong>dukungan
              AI</span
            >
            <span><strong class="block text-lg text-white">1</strong>platform terpadu</span>
          </div>
        </div>
        <div class="relative animate-fade-in-up-delay">
          <div
            class="absolute -inset-5 rounded-3xl bg-cyan-300/10 blur-3xl"
          />
          <div
            class="relative rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-sm sm:p-3"
          >
            <img 
              src={hero} 
              alt="FinSense Preview" 
              class="w-full h-auto rounded-xl object-cover shadow-lg" 
            />
          </div>
        </div>
      </div>
    </section>

    <section id="fitur" class="bg-[#0a1d33] px-5 py-20 sm:px-8 md:py-24">
      <div class="mx-auto max-w-7xl">
        <div
          class="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p
              class="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300"
            >
              Satu ekosistem
            </p>
            <h2
              class="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Semua yang bisnis Anda butuhkan.
            </h2>
          </div>
          <p
            class="max-w-sm text-sm leading-7 text-slate-400"
          >
            Dari transaksi pertama hingga keputusan strategis, FinSense membantu
            Anda tetap memegang kendali.
          </p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {#each features as feature, index (feature.title)}
            <article
              class={`group flex flex-col border border-white/10 bg-[#102b47] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-[#143858] ${
                index === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div class="mb-5 flex items-center justify-between">
                <span class="text-xs font-bold text-cyan-300"
                  >0{index + 1}</span
                >
                <span class="h-px w-10 bg-cyan-300/30" />
              </div>
              <h3 class="text-lg font-bold text-white">{feature.title}</h3>
              <div class="my-6 h-32 w-full overflow-hidden rounded-lg bg-slate-800/50">
                <img
                  src={feature.image}
                  alt={feature.alt}
                  class="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                />
              </div>
              <p class="mt-auto text-sm leading-6 text-slate-400">
                {feature.text}
              </p>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <section id="wawasan" class="bg-[#071426] px-5 py-20 sm:px-8 md:py-28">
      <div class="mx-auto max-w-7xl">
        <div class="mb-16 max-w-2xl">
          <p
            class="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300"
          >
            Bekerja lebih cerdas
          </p>
          <h2
            class="text-3xl font-bold tracking-tight text-white sm:text-5xl"
          >
            AI yang memahami ritme bisnis Anda.
          </h2>
        </div>
        <div
          class="grid items-center gap-10 border-t border-white/10 py-12 md:grid-cols-2 md:gap-20"
        >
          <div>
            <h3 class="text-2xl font-bold text-white sm:text-3xl">
              Operasional lebih cerdas dengan suara
            </h3>
            <p class="mt-5 leading-8 text-slate-400">
              Percepat alur kerja dengan kasir pengenal suara. Tambah barang,
              cek harga, atau cetak struk seketika tanpa mengganggu ritme
              pelayanan.
            </p>
          </div>
          <div class="overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
            <img 
              src={aicashier} 
              alt="Kasir Pengenal Suara AI" 
              class="w-full h-auto object-cover" 
            />
          </div>
        </div>
        <div
          class="grid items-center gap-10 border-t border-white/10 py-12 md:grid-cols-2 md:gap-20"
        >
          <div class="overflow-hidden rounded-2xl border border-white/15 shadow-2xl md:order-first">
            <img 
              src={chat} 
              alt="Wawasan AI Live" 
              class="w-full h-auto object-cover" 
            />
          </div>
          <div>
            <h3 class="text-2xl font-bold text-white sm:text-3xl">
              Wawasan AI, kapan pun dibutuhkan
            </h3>
            <p class="mt-5 leading-8 text-slate-400">
              Tanyakan apa saja tentang data bisnis Anda. AI Live membantu
              membaca pola, memberi solusi real-time, dan menyusun langkah
              strategis.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer
    class="border-t border-white/10 bg-[#050f1e] px-5 py-7 text-center text-sm text-slate-400 sm:px-8"
  >
    <p>
      <span class="font-bold text-white"
        >Fin<span class="text-cyan-300">Sense</span></span
      >
      &copy; {new Date().getFullYear()} - Coding Camp 2026
    </p>
  </footer>
</div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
  }
</style>