<script lang="ts">
  import { router } from 'tinro';
  import { authStore } from '../../lib/stores/auth';
  import { authService } from '../../lib/services';
  import logo from '../../../images/logo.png';
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

<div class="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-poppins">
  <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
    <div class="flex flex-col items-center mb-6">
      <img src={logo} alt="FinSense Logo" class="h-12 w-auto mb-2" />
      <h1 class="text-2xl font-bold text-[#071426]">
        Fin<span class="text-cyan-500">Sense</span>
      </h1>
      <h2 class="text-xl font-bold text-gray-800 mt-4">Selamat Datang</h2>
      <p class="text-sm text-gray-500 text-center mt-1">
        Masuk ke dashboard manajemen bisnis Anda.
      </p>
    </div>

    {#if errorMessage}
      <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
        {errorMessage}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="email" class="block text-xs font-bold text-gray-700 mb-1">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          placeholder="email@domain.com"
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-sm bg-blue-50/30"
        />
      </div>

      <div>
        <label for="password" class="block text-xs font-bold text-gray-700 mb-1">Password</label>
        <div class="relative">
          {#if showPassword}
            <input
              id="password"
              type="text"
              bind:value={password}
              required
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-sm pr-10"
            />
          {:else}
            <input
              id="password"
              type="password"
              bind:value={password}
              required
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-sm pr-10"
            />
          {/if}

          <button
            type="button"
            on:click={() => (showPassword = !showPassword)}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
        class="w-full bg-[#071426] text-white font-bold py-3 rounded-lg hover:bg-[#0b2743] transition duration-200 mt-2 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Memproses...' : 'Masuk'}
      </button>
    </form>

    <div class="mt-6 text-center text-xs text-gray-600 space-y-2">
      <p>
        Belum punya akun? 
        <a href="/register" class="text-orange-500 font-bold hover:underline">
          Daftar di sini
        </a>
      </p>
      <div>
        <a href="/lupa-password" class="text-orange-500 font-bold hover:underline">
          Lupa Password?
        </a>
      </div>
    </div>
  </div>
</div>