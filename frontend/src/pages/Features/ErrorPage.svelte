<script lang="ts">
  import { router } from 'tinro';
</script>

<div
  class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8"
>
  <div class="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
    <div class="relative bg-sky-950 px-4 py-12 flex justify-center">
      <div class="text-center">
        <div class="text-8xl md:text-9xl font-black text-white/20 select-none">
          404
        </div>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <svg
            class="w-24 h-24 md:w-32 md:h-32 text-white/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-white font-semibold text-lg md:text-xl mt-4">
            Halaman Tidak Ditemukan
          </p>
        </div>
      </div>
    </div>

    <div class="p-6 md:p-8 text-center">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
        Oops! Halaman yang Anda cari tidak ada.
      </h1>
      <p class="text-gray-500 mb-6">
        Mungkin URL yang Anda masukkan salah, atau halaman tersebut telah
        dipindahkan.
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          on:click={() => window.history.back()}
          class="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
        >
          ← Kembali
        </button>
        <button
          on:click={() => router.goto('/dashboard')}
          class="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-950 text-white rounded-lg font-medium hover:bg-sky-900 transition-all shadow-sm"
        >
          Ke Dashboard
        </button>
      </div>
    </div>

    <div class="border-t border-gray-100 px-6 py-3 text-center text-xs text-gray-400">
      FinSense &copy; {new Date().getFullYear()}. All rights reserved.
    </div>
  </div>
</div>
