<script lang="ts">
  import { router } from 'tinro';
  import { authService } from '../../lib/services';
  import { Eye, EyeOff } from 'lucide-svelte';
  import Swal from 'sweetalert2';

  let email = '';
  let password = '';
  let confirm = '';
  let loading = false;
  let showPassword = false;
  let showConfirm = false;

  async function handleRegister(e: Event) {
    e.preventDefault();

    if (password !== confirm) {
      await Swal.fire('Error', 'Password tidak cocok', 'error');
      return;
    }

    if (password.length < 6) {
      await Swal.fire('Error', 'Password minimal 6 karakter', 'error');
      return;
    }

    loading = true;
    try {
      await authService.register(email, password, email.split('@')[0]);
      await Swal.fire(
        'Berhasil',
        'Akun berhasil dibuat. Silakan login.',
        'success'
      );
      router.goto('/login');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Registrasi gagal';
      await Swal.fire('Error', msg, 'error');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-[#071426] p-4 font-poppins">
  <div class="bg-[#0d1b2e] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
    <div class="flex flex-col items-center">
      <div class="flex items-center gap-2">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-9 w-auto">
          <path d="M19.6 5.3c-2-2.9-5.9-3.8-8.8-2l-4.9 3.1a5.6 5.6 0 0 0-2.5 3.7 5.7 5.7 0 0 0 .6 3.8 5.5 5.5 0 0 0-.8 2.1 5.8 5.8 0 0 0 1 4.4c2 2.9 5.9 3.8 8.8 2l4.9-3.1a5.6 5.6 0 0 0 2.5-3.7 5.7 5.7 0 0 0-.6-3.8 5.5 5.5 0 0 0 .8-2.1 5.8 5.8 0 0 0-1-4.4Z" fill="#FF3E00"/>
          <path d="M16.3 8.2c-1.6-.9-3-.8-4.3 0l-3.8 2.4c-.8.5-1.1 1.5-.6 2.3.4.6 1.1.9 1.8.7M7.7 15.8c1.6.9 3 .8 4.3 0l3.8-2.4c.8-.5 1.1-1.5.6-2.3-.4-.6-1.1-.9-1.8-.7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1 class="text-2xl font-bold text-white">
          Fin<span class="text-orange-400">Sense</span>
        </h1>
      </div>
      <p class="text-orange-400 text-xs font-bold tracking-widest mt-1">
        MANAJEMEN UMKM
      </p>

      <h2 class="text-xl font-bold text-white mt-4 text-center">
        Selamat datang
      </h2>
      <p class="text-slate-400 text-sm mb-6 text-center mt-1">
        Buat akun baru untuk manajemen bisnis Anda.
      </p>

      <form on:submit={handleRegister} class="w-full space-y-4">
        <div>
          <label for="reg-email" class="block text-xs font-bold text-slate-300 mb-1">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            bind:value={email}
            placeholder="Masukkan email Anda"
            class="w-full px-4 py-2.5 rounded-lg border-0 focus:ring-2 focus:ring-orange-400 outline-none transition text-sm bg-blue-50/90 text-gray-900"
            required
          />
        </div>

        <div>
          <label for="reg-password" class="block text-xs font-bold text-slate-300 mb-1">
            Password
          </label>
          <div class="relative">
            {#if showPassword}
              <input
                id="reg-password"
                type="text"
                bind:value={password}
                placeholder="Minimal 6 karakter"
                class="w-full px-4 py-2.5 pr-10 rounded-lg border-0 focus:ring-2 focus:ring-orange-400 outline-none transition text-sm bg-blue-50/90 text-gray-900"
                required
              />
            {:else}
              <input
                id="reg-password"
                type="password"
                bind:value={password}
                placeholder="Minimal 6 karakter"
                class="w-full px-4 py-2.5 pr-10 rounded-lg border-0 focus:ring-2 focus:ring-orange-400 outline-none transition text-sm bg-blue-50/90 text-gray-900"
                required
              />
            {/if}
            <button
              type="button"
              on:click={() => (showPassword = !showPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {#if showPassword}
                <EyeOff size={18} />
              {:else}
                <Eye size={18} />
              {/if}
            </button>
          </div>
        </div>

        <div>
          <label for="reg-confirm" class="block text-xs font-bold text-slate-300 mb-1">
            Konfirmasi Password
          </label>
          <div class="relative">
            {#if showConfirm}
              <input
                id="reg-confirm"
                type="text"
                bind:value={confirm}
                placeholder="Ulangi password Anda"
                class="w-full px-4 py-2.5 pr-10 rounded-lg border-0 focus:ring-2 focus:ring-orange-400 outline-none transition text-sm bg-blue-50/90 text-gray-900"
                required
              />
            {:else}
              <input
                id="reg-confirm"
                type="password"
                bind:value={confirm}
                placeholder="Ulangi password Anda"
                class="w-full px-4 py-2.5 pr-10 rounded-lg border-0 focus:ring-2 focus:ring-orange-400 outline-none transition text-sm bg-blue-50/90 text-gray-900"
                required
              />
            {/if}
            <button
              type="button"
              on:click={() => (showConfirm = !showConfirm)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {#if showConfirm}
                <EyeOff size={18} />
              {:else}
                <Eye size={18} />
              {/if}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-orange-400 text-[#071426] font-bold rounded-lg py-3 hover:bg-orange-300 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-slate-400 text-xs">
          Sudah punya akun?
          <a href="/login" class="text-orange-400 font-bold hover:underline">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
