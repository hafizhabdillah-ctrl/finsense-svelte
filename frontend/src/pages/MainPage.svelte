<script lang="ts">
  import { router } from 'tinro';
  import { onMount } from 'svelte';
  import {
    NotebookPen,
    Coins,
    PackageX,
    Wallet,
    Boxes,
    CreditCard,
    Lightbulb,
    Mic,
    ChevronDown,
  } from 'lucide-svelte';

  import hero from '../../images/herosection.png';
  import dashboard from '../../images/dashboard.png';
  import debt from '../../images/debt.png';
  import aicashier from '../../images/aicashier.png';

  interface Problem {
    icon: typeof NotebookPen;
    title: string;
    text: string;
  }

  interface Feature {
    icon: typeof Wallet;
    title: string;
    text: string;
  }

  interface Step {
    number: string;
    title: string;
    text: string;
  }

  interface FaqItem {
    question: string;
    answer: string;
  }

  const problems: Problem[] = [
    {
      icon: NotebookPen,
      title: 'Lupa catat penjualan',
      text: 'Transaksi kadang dicatat di buku dan sering hilang atau lupa dicatat sehingga rekap jadi tidak akurat.',
    },
    {
      icon: Coins,
      title: 'Hutang pelanggan tercecer',
      text: 'Catatan hutang rusak atau hilang, tanpa bon pelanggan sering lupa berapa hutang yang harus dibayar.',
    },
    {
      icon: PackageX,
      title: 'Stok habis tanpa sadar',
      text: 'Baru sadar barang kosong saat pembeli sudah menunggu, penjualan hilang begitu saja karena tidak tahu stok tersisa.',
    },
  ];

  const features: Feature[] = [
    {
      icon: Wallet,
      title: 'Catatan Keuangan',
      text: 'Pemasukan dan pengeluaran tercatat otomatis dan menunjukkan untung rugi tiap hari tanpa ribet hitung manual.',
    },
    {
      icon: Boxes,
      title: 'Manajemen Stok',
      text: 'Stok berkurang otomatis setelah penjualan, kamu selalu tahu barang apa yang perlu direstok.',
    },
    {
      icon: CreditCard,
      title: 'Hutang Pelanggan',
      text: 'Pantau siapa saja pelanggan yang berutang, catat pelunasan, dan kirim pengingat lewat WhatsApp otomatis.',
    },
    {
      icon: Lightbulb,
      title: 'Rekomendasi Restok',
      text: 'Dapat rekomendasi otomatis kapan harus restok dan berapa banyak berdasarkan tren penjualan.',
    },
  ];

  const steps: Step[] = [
    {
      number: '1',
      title: 'Daftar akun',
      text: 'Isi nama toko dan email, langsung bisa mulai kelola bisnis tanpa ribet.',
    },
    {
      number: '2',
      title: 'Masukkan stok awal',
      text: 'Cukup masukkan barang yang kamu jual sekarang, tak perlu input rumit satu per satu.',
    },
    {
      number: '3',
      title: 'Jualan seperti biasa',
      text: 'FinSense mencatat semuanya otomatis sesuai transaksi harian tokomu.',
    },
  ];

  const faqItems: FaqItem[] = [
    {
      question: 'Apakah data penjualan saya aman?',
      answer:
        'Ya. Semua data tersimpan di server terenkripsi dan otomatis dicadangkan setiap hari, jadi catatan penjualanmu tidak akan hilang.',
    },
    {
      question: 'Bisa dipakai tanpa internet?',
      answer:
        'FinSense butuh koneksi internet untuk mencatat transaksi secara real-time, tapi tetap ringan digunakan lewat HP dengan kuota minim.',
    },
    {
      question: 'Perlu alat khusus?',
      answer:
        'Tidak. Cukup gunakan HP atau laptop yang sudah kamu punya, tanpa perlu membeli mesin kasir atau alat tambahan.',
    },
    {
      question: 'Apakah gratis selamanya?',
      answer:
        'FinSense bisa dipakai gratis untuk kebutuhan dasar. Untuk fitur lanjutan tersedia paket berbayar yang bisa kamu pilih sesuai kebutuhan toko.',
    },
    {
      question: 'Bagaimana kalau saya punya lebih dari satu toko?',
      answer:
        'Tenang, kamu bisa menambahkan toko lain dan memantau semuanya dari satu akun FinSense yang sama.',
    },
  ];

  let openFaq: number | null = null;

  const toggleFaq = (index: number) => {
    openFaq = openFaq === index ? null : index;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  let loading = true;

  onMount(() => {
    setTimeout(() => {
      loading = false;
    }, 900);
  });
</script>

{#if loading}
  <div class="min-h-screen bg-white font-poppins">
    <div class="h-20 border-b border-slate-200 px-5 sm:px-8">
      <div class="mx-auto flex h-full max-w-7xl items-center justify-between">
        <div class="h-8 w-32 animate-pulse rounded bg-slate-200" />
        <div class="hidden gap-8 md:flex">
          <div class="h-4 w-14 animate-pulse rounded bg-slate-200" />
          <div class="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div class="h-4 w-12 animate-pulse rounded bg-slate-200" />
        </div>
        <div class="h-10 w-36 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
    <div class="px-5 py-16 sm:px-8 md:py-24">
      <div class="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div class="space-y-4">
          <div class="h-10 w-full max-w-md animate-pulse rounded bg-slate-200" />
          <div class="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
          <div class="h-4 w-full max-w-lg animate-pulse rounded bg-slate-200" />
          <div class="h-4 w-2/3 max-w-lg animate-pulse rounded bg-slate-200" />
          <div class="h-12 w-44 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div class="aspect-video w-full animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
    <div class="bg-sky-950 px-5 py-20 sm:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto h-8 w-full max-w-md animate-pulse rounded bg-white/10" />
        <div class="mx-auto mt-4 h-4 w-full max-w-sm animate-pulse rounded bg-white/10" />
        <div class="mt-14 grid gap-6 sm:grid-cols-3">
          <div class="h-48 animate-pulse rounded-2xl bg-white/10" />
          <div class="h-48 animate-pulse rounded-2xl bg-white/10" />
          <div class="h-48 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    </div>
    <div class="bg-slate-50 px-5 py-20 sm:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto h-8 w-full max-w-md animate-pulse rounded bg-slate-200" />
        <div class="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div class="h-80 animate-pulse rounded-2xl bg-slate-200" />
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="h-36 animate-pulse rounded-2xl bg-slate-200" />
            <div class="h-36 animate-pulse rounded-2xl bg-slate-200" />
            <div class="h-36 animate-pulse rounded-2xl bg-slate-200" />
            <div class="h-36 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
    <div class="bg-sky-950 px-5 py-20 sm:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto h-8 w-full max-w-sm animate-pulse rounded bg-white/10" />
        <div class="mt-14 grid gap-8 sm:grid-cols-3">
          <div class="h-28 animate-pulse rounded-2xl bg-white/10" />
          <div class="h-28 animate-pulse rounded-2xl bg-white/10" />
          <div class="h-28 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    </div>
    <div class="bg-slate-50 px-5 py-20 sm:px-8">
      <div class="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        <div class="space-y-3">
          <div class="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div class="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div class="h-4 w-full animate-pulse rounded bg-slate-200" />
        </div>
        <div class="aspect-video w-full animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
    <div class="bg-white px-5 py-20 sm:px-8">
      <div class="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        <div class="aspect-video w-full animate-pulse rounded-2xl bg-slate-200" />
        <div class="space-y-3">
          <div class="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div class="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div class="h-4 w-full animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
    <div class="bg-slate-50 px-5 py-20 sm:px-8">
      <div class="mx-auto max-w-3xl">
        <div class="mx-auto h-8 w-full max-w-sm animate-pulse rounded bg-slate-200" />
        <div class="mt-10 space-y-3">
          {#each Array(5) as _, i (i)}
            <div class="h-14 animate-pulse rounded-2xl bg-slate-200" />
          {/each}
        </div>
      </div>
    </div>
    <div class="bg-slate-900 px-5 py-20 sm:px-8">
      <div class="mx-auto max-w-3xl space-y-4 text-center">
        <div class="mx-auto h-8 w-full max-w-sm animate-pulse rounded bg-white/10" />
        <div class="mx-auto h-4 w-full max-w-md animate-pulse rounded bg-white/10" />
        <div class="mx-auto h-12 w-52 animate-pulse rounded-lg bg-white/10" />
      </div>
    </div>
    <div class="bg-slate-950 px-5 py-14 sm:px-8">
      <div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div class="h-24 animate-pulse rounded bg-white/10" />
        <div class="h-24 animate-pulse rounded bg-white/10" />
        <div class="h-24 animate-pulse rounded bg-white/10" />
        <div class="h-24 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  </div>
{:else}
<div class="min-h-screen bg-white font-poppins text-slate-900">
  <nav class="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="flex h-20 items-center justify-between">
        <button
          on:click={() => scrollToSection('hero')}
          class="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 md:text-2xl cursor-pointer"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="none"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="M18.5 8.5 13 14l-3-3-4.5 4.5" stroke="#F97316" />
            </svg>
          </div>
          <span>Fin<span class="text-orange-500">Sense</span></span>
        </button>
        <div class="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <button
            on:click={() => scrollToSection('fitur')}
            class="transition-colors hover:text-orange-500 cursor-pointer"
          >
            Fitur
          </button>
          <button
            on:click={() => scrollToSection('cara-kerja')}
            class="transition-colors hover:text-orange-500 cursor-pointer"
          >
            Cara Kerja
          </button>
          <button
            on:click={() => scrollToSection('faq')}
            class="transition-colors hover:text-orange-500 cursor-pointer"
          >
            FAQ
          </button>
        </div>
        <div class="flex items-center gap-2 text-sm font-semibold sm:gap-4">
          <button
            on:click={() => router.goto('/login')}
            class="px-2 py-2 text-slate-600 transition-colors hover:text-slate-900 sm:px-3 cursor-pointer"
          >
            Masuk
          </button>
          <button
            on:click={() => router.goto('/register')}
            class="rounded-lg bg-orange-500 px-4 py-2.5 text-white shadow-[0_8px_24px_rgba(249,115,22,0.25)] transition hover:bg-orange-600 sm:px-5 cursor-pointer"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>
      <div
        class="flex justify-center gap-5 border-t border-slate-200 py-3 text-xs font-medium text-slate-600 md:hidden"
      >
        <button on:click={() => scrollToSection('fitur')} class="cursor-pointer">Fitur</button>
        <button on:click={() => scrollToSection('cara-kerja')} class="cursor-pointer"
          >Cara Kerja</button
        >
        <button on:click={() => scrollToSection('faq')} class="cursor-pointer">FAQ</button>
      </div>
    </div>
  </nav>

  <main>
    <section
      id="hero"
      class="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-white to-white px-5 py-16 sm:px-8 md:py-24 lg:py-28"
    >
      <div class="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div class="text-center lg:text-left">
          <h1
            class="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Catat penjualan cukup dengan <span class="text-orange-500">ngomong.</span>
          </h1>
          <p class="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
            FinSense mengurus kasir, stok, hutang pelanggan, dan laporan keuangan warung kamu
            dalam satu aplikasi tanpa ribet manual.
          </p>
          <div class="mt-8 flex justify-center lg:justify-start">
            <button
              on:click={() => router.goto('/register')}
              class="rounded-lg bg-orange-500 px-7 py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600 cursor-pointer"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
        <div class="relative">
          <div class="absolute -inset-6 rounded-3xl bg-orange-500/10 blur-3xl" />
          <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div class="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span class="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span class="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span class="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <img src={hero} alt="Tampilan kasir FinSense" class="w-full object-cover" />
            <div
              class="absolute -bottom-4 left-4 flex items-center gap-2 rounded-xl rounded-bl-sm border border-slate-100 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-lg"
            >
              <Mic class="h-3.5 w-3.5 text-orange-500" /> "Jual Mie Goreng 3 bungkus"
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      id="masalah"
      class="relative overflow-hidden bg-sky-950 bg-[radial-gradient(circle_at_15%_15%,rgba(249,115,22,0.12),transparent_40%)] px-5 py-20 sm:px-8 md:py-24"
    >
      <div class="relative mx-auto max-w-7xl">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Masalah yang tiap hari dialami pemilik warung
          </h2>
          <p class="mt-4 text-base leading-7 text-slate-300">
            Banyak hal kecil di warung yang bikin pusing dari hari ke hari.
          </p>
        </div>
        <div class="mt-14 grid gap-6 sm:grid-cols-3">
          {#each problems as problem (problem.title)}
            <div
              class="rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:-translate-y-1 hover:border-orange-500/40 hover:bg-white/10"
            >
              <div
                class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400"
              >
                <svelte:component this={problem.icon} class="h-6 w-6" />
              </div>
              <h3 class="text-lg font-bold text-white">{problem.title}</h3>
              <p class="mt-3 text-sm leading-6 text-slate-300">{problem.text}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section id="fitur" class="bg-slate-50 px-5 py-20 sm:px-8 md:py-24">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Satu aplikasi untuk semua urusan warung
          </h2>
          <p class="mt-4 text-base leading-7 text-slate-600">
            Pilih yang paling dibutuhkan, mudah digunakan siapa saja, bahkan tanpa keahlian
            komputer.
          </p>
        </div>
        <div class="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div class="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white">
            <span
              class="inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-400"
            >
              Penjualan Otomatis
            </span>
            <h3 class="mt-4 text-2xl font-bold">POS Suara</h3>
            <p class="mt-3 max-w-sm text-sm leading-6 text-slate-300">
              Cukup sebutkan nama barang dan jumlahnya. Transaksi langsung tercatat otomatis tanpa
              ketik satu pun.
            </p>
            <div class="mt-6 overflow-hidden rounded-xl border border-white/10">
              <img src={aicashier} alt="Kasir suara FinSense" class="w-full object-cover" />
            </div>
            <div
              class="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
            >
              <Mic class="h-4 w-4" /> Mendengarkan...
            </div>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            {#each features as feature (feature.title)}
              <div
                class="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"
                >
                  <svelte:component this={feature.icon} class="h-5 w-5" />
                </div>
                <h3 class="text-base font-bold text-slate-900">{feature.title}</h3>
                <p class="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <section
      id="cara-kerja"
      class="relative overflow-hidden bg-sky-950 bg-[radial-gradient(circle_at_15%_15%,rgba(249,115,22,0.12),transparent_40%)] px-5 py-20 sm:px-8 md:py-24"
    >
      <div class="relative mx-auto max-w-7xl">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Mulai dalam 5 menit
          </h2>
          <p class="mt-4 text-base leading-7 text-slate-300">
            Tanpa ribet, tanpa instalasi hardware, atau kursus rumit.
          </p>
        </div>
        <div class="mt-14 grid gap-8 text-left sm:grid-cols-3">
          {#each steps as step (step.number)}
            <div>
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white"
              >
                {step.number}
              </div>
              <h3 class="mt-5 text-lg font-bold text-white">{step.title}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-300">{step.text}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="bg-slate-50 px-5 py-20 sm:px-8 md:py-24">
      <div class="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        <div>
          <span
            class="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600"
          >
            Kontrol Keuangan
          </span>
          <h3 class="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
            Lihat untung rugi hari ini
          </h3>
          <p class="mt-4 leading-7 text-slate-600">
            Pantau jumlah keuntungan, kerugian, dan grafik produk terlaris secara real-time dari
            HP atau laptop kamu kapan pun.
          </p>
          <blockquote class="mt-6 border-l-4 border-orange-500 pl-4 text-sm italic text-slate-500">
            "Sekarang saya bisa lihat untung rugi setiap hari lewat HP."
          </blockquote>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <img src={dashboard} alt="Dasbor keuangan FinSense" class="w-full rounded-xl object-cover" />
        </div>
      </div>
    </section>

    <section class="bg-white px-5 py-20 sm:px-8 md:py-24">
      <div class="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl md:order-first">
          <img src={debt} alt="Rekap hutang pelanggan FinSense" class="w-full rounded-xl object-cover" />
        </div>
        <div>
          <span
            class="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600"
          >
            Tutup Hutang
          </span>
          <h3 class="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
            Tidak ada lagi hutang yang terlupa
          </h3>
          <p class="mt-4 leading-7 text-slate-600">
            Rekap hutang pelanggan tercatat rapi lengkap dengan tanggal jatuh tempo, supaya arus
            kas warungmu tetap terjaga.
          </p>
          <blockquote class="mt-6 border-l-4 border-orange-500 pl-4 text-sm italic text-slate-500">
            "Sekarang saya bisa ingatkan pelanggan otomatis sebelum jatuh tempo."
          </blockquote>
        </div>
      </div>
    </section>

    <section id="faq" class="bg-slate-50 px-5 py-20 sm:px-8 md:py-24">
      <div class="mx-auto max-w-3xl">
        <div class="text-center">
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Pertanyaan yang sering ditanyakan
          </h2>
          <p class="mt-4 text-base leading-7 text-slate-600">
            Segala hal yang perlu kamu ketahui seputar FinSense.
          </p>
        </div>
        <div class="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {#each faqItems as item, i (item.question)}
            <div>
              <button
                on:click={() => toggleFaq(i)}
                class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-slate-900 cursor-pointer"
              >
                <span>{item.question}</span>
                <ChevronDown
                  class="h-4 w-4 shrink-0 text-slate-400 transition-transform {openFaq === i
                    ? 'rotate-180'
                    : ''}"
                />
              </button>
              <div
                class="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out {openFaq ===
                i
                  ? 'grid-rows-[1fr]'
                  : 'grid-rows-[0fr]'}"
              >
                <div class="overflow-hidden">
                  <p class="px-6 pb-5 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="bg-slate-900 px-5 py-20 text-center sm:px-8 md:py-24">
      <div class="mx-auto max-w-3xl">
        <h2 class="text-3xl font-bold text-white sm:text-4xl">
          Rapikan pembukuan warung kamu mulai hari ini.
        </h2>
        <p class="mt-4 text-base leading-7 text-slate-300">
          Bergabunglah dengan ribuan pemilik warung pintar di seluruh Indonesia yang hemat waktu
          dan untung lebih banyak.
        </p>
        <button
          on:click={() => router.goto('/register')}
          class="mt-8 inline-block rounded-lg bg-orange-500 px-8 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-600 cursor-pointer"
        >
          Mulai Gratis Sekarang
        </button>
      </div>
    </section>
  </main>

  <footer class="bg-slate-950 px-5 py-14 text-slate-400 sm:px-8">
    <div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
      <div>
        <div class="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="none"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="M18.5 8.5 13 14l-3-3-4.5 4.5" stroke="#F97316" />
            </svg>
          </div>
          <span>Fin<span class="text-orange-500">Sense</span></span>
        </div>
        <p class="mt-3 max-w-xs text-sm leading-6">
          POS Kasir Suara untuk pemilik warung dan UMKM di Indonesia.
        </p>
      </div>
      <div>
        <h4 class="text-xs font-bold uppercase tracking-wide text-white">Produk</h4>
        <ul class="mt-4 space-y-2 text-sm">
          <li>Kasir POS</li>
          <li>Catatan Keuangan</li>
          <li>Manajemen Stok</li>
          <li>Catatan Hutang</li>
        </ul>
      </div>
      <div>
        <h4 class="text-xs font-bold uppercase tracking-wide text-white">Dukungan</h4>
        <ul class="mt-4 space-y-2 text-sm">
          <li>Pusat Bantuan</li>
          <li>Panduan Pengguna</li>
          <li>Kontak WhatsApp</li>
        </ul>
      </div>
      <div>
        <h4 class="text-xs font-bold uppercase tracking-wide text-white">Perusahaan</h4>
        <ul class="mt-4 space-y-2 text-sm">
          <li>Tentang Kami</li>
          <li>Blog</li>
          <li>Karir</li>
        </ul>
      </div>
    </div>
    <div class="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs">
      &copy; 2026 FinSense. Dibuat untuk pengusaha UMKM Indonesia.
    </div>
  </footer>
</div>
{/if}

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
  }
</style>
