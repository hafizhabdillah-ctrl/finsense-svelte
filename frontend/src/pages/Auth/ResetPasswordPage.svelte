<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import { authService } from '../../lib/services';
  import Swal from 'sweetalert2';

  let token = '';
  let password = '';
  let confirm = '';
  let showPassword = false;
  let showConfirm = false;
  let message = '';
  let error = '';
  let loading = false;

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    token = params.get('token') || '';
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (password !== confirm) {
      error = 'Password tidak cocok';
      return;
    }

    if (password.length < 6) {
      error = 'Password minimal 6 karakter';
      return;
    }

    loading = true;
    message = '';
    error = '';

    try {
      const res = await authService.resetPassword(token, password);
      message = res.message;
      setTimeout(() => push('/login'), 3000);
    } catch (err) {
      error = err.response?.data?.error || 'Gagal reset password';
    } finally {
      loading = false;
    }
  }
</script>

{#if !token}
  <div class="min-h-screen flex items-center justify-center bg-gray-200">
    <div class="bg-white p-8 rounded-2xl shadow-xl text-center">
      <p class="text-red-500 mb-4">
        Token tidak valid atau sudah kadaluarsa.
      </p>
      <a href="/#/login" class="text-orange-500 font-bold hover:underline">
        Kembali ke Login
      </a>
    </div>
  </div>
{:else}
  <div class="min-h-screen flex items-center justify-center bg-gray-200 p-4">
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 p-6 sm:p-8"
    >
      <div class="flex flex-col items-center">
        <div class="flex flex-row items-center mb-4">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 sm:h-12 sm:w-12 mx-2">
            <path d="M19.6 5.3c-2-2.9-5.9-3.8-8.8-2l-4.9 3.1a5.6 5.6 0 0 0-2.5 3.7 5.7 5.7 0 0 0 .6 3.8 5.5 5.5 0 0 0-.8 2.1 5.8 5.8 0 0 0 1 4.4c2 2.9 5.9 3.8 8.8 2l4.9-3.1a5.6 5.6 0 0 0 2.5-3.7 5.7 5.7 0 0 0-.6-3.8 5.5 5.5 0 0 0 .8-2.1 5.8 5.8 0 0 0-1-4.4Z" fill="#FF3E00"/>
            <path d="M16.3 8.2c-1.6-.9-3-.8-4.3 0l-3.8 2.4c-.8.5-1.1 1.5-.6 2.3.4.6 1.1.9 1.8.7M7.7 15.8c1.6.9 3 .8 4.3 0l3.8-2.4c.8-.5 1.1-1.5.6-2.3-.4-.6-1.1-.9-1.8-.7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h1 class="text-2xl sm:text-3xl font-bold text-sky-950">
            Fin<span class="text-orange-400">Sense</span>
          </h1>
        </div>

        <h2 class="text-xl sm:text-2xl font-bold text-sky-950 mb-2 text-center">
          Reset Password
        </h2>
        <p class="text-gray-500 text-sm sm:text-base mb-6 text-center">
          Masukkan password baru Anda.
        </p>

        <form on:submit={handleSubmit} class="w-full">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Password Baru
            </label>
            <div class="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder="Minimal 6 karakter"
                class="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800"
                required
              />
              <button
                type="button"
                on:click={() => (showPassword = !showPassword)}
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-sky-700 cursor-pointer"
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Konfirmasi Password
            </label>
            <div class="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                placeholder="Ulangi password baru"
                class="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800"
                required
              />
              <button
                type="button"
                on:click={() => (showConfirm = !showConfirm)}
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-sky-700 cursor-pointer"
              >
                {showConfirm ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          {#if message}
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
              {message}
            </div>
          {/if}

          {#if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          {/if}

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-sky-950 text-white font-bold rounded-lg py-2 disabled:opacity-50 cursor-pointer hover:bg-sky-900 transition"
          >
            {loading ? 'Memproses...' : 'Reset Password'}
          </button>
        </form>

        <div class="mt-4 text-center">
          <a href="/#/login" class="text-orange-500 font-bold hover:underline">
            Kembali ke Login
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}
