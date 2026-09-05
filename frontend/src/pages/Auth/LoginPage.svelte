<script lang="ts">
  import { router } from 'tinro';
  import { authStore } from '../../lib/stores/auth';
  import { authService } from '../../lib/services';
  import { Eye, EyeOff } from 'lucide-svelte';

  let email = '';
  let password = '';
  let showPassword = false;
  let loading = false;
  let errorMessage = '';

  const handleSubmit = async () => {
    loading = true;
    errorMessage = '';

    try {
      const response = await authService.login(email, password);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      authStore.set({
        user: response.user,
        loading: false,
        isAuthenticated: true,
      });

      router.goto('/dashboard');
    } catch (err: any) {
      console.error('Login Error Response:', err.response?.data);
      errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal masuk. Periksa kembali email dan password.';
    } finally {
      loading = false;
    }
  };
</script>

<div class="min-h-screen flex items-center justify-center bg-[#000000] p-4 font-poppins">
  <div class="bg-[#171717] border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md">
    <div class="flex flex-col items-center mb-6">
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
      <h2 class="text-xl font-bold text-white mt-4">Selamat datang</h2>
      <p class="text-sm text-slate-400 text-center mt-1">
        Masuk ke dashboard manajemen bisnis Anda.
      </p>
    </div>

    {#if errorMessage}
      <div class="mb-4 p-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg text-sm">
        {errorMessage}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="email" class="block text-xs font-bold text-slate-300 mb-1">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          placeholder="email@domain.com"
          class="w-full px-4 py-2.5 rounded-lg border-0 focus:ring-2 focus:ring-orange-400 outline-none transition text-sm bg-blue-50/90 text-gray-900"
        />
      </div>

      <div>
        <label for="password" class="block text-xs font-bold text-slate-300 mb-1">Password</label>
        <div class="relative">
          {#if showPassword}
            <input
              id="password"
              type="text"
              bind:value={password}
              required
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded-lg border-0 focus:ring-2 focus:ring-orange-400 outline-none transition text-sm bg-blue-50/90 text-gray-900 pr-10"
            />
          {:else}
            <input
              id="password"
              type="password"
              bind:value={password}
              required
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded-lg border-0 focus:ring-2 focus:ring-orange-400 outline-none transition text-sm bg-blue-50/90 text-gray-900 pr-10"
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

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-orange-400 text-[#071426] font-bold py-3 rounded-lg hover:bg-orange-300 transition duration-200 mt-2 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Memproses...' : 'Masuk'}
      </button>
    </form>

    <div class="mt-6 text-center text-xs text-slate-400 space-y-2">
      <p>
        Belum punya akun?
        <a href="/register" class="text-orange-400 font-bold hover:underline">
          Daftar di sini
        </a>
      </p>
      <div>
        <a href="/lupa-password" class="text-orange-400 font-bold hover:underline">
          Lupa Password?
        </a>
      </div>
    </div>
  </div>
</div>
