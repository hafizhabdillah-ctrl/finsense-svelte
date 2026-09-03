<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { authService } from '../../lib/services';
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
      push('/login');
    } catch (error) {
      const msg = error.response?.data?.error || 'Registrasi gagal';
      await Swal.fire('Error', msg, 'error');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-200 p-4">
  <div
    class="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
  >
    <div class="flex flex-col items-center">
      <div class="flex flex-row items-center mb-4">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 sm:h-12 sm:w-12 mx-2">
          <path d="M19.6 5.3c-2-2.9-5.9-3.8-8.8-2l-4.9 3.1a5.6 5.6 0 0 0-2.5 3.7 5.7 5.7 0 0 0 .6 3.8 5.5 5.5 0 0 0-.8 2.1 5.8 5.8 0 0 0 1 4.4c2 2.9 5.9 3.8 8.8 2l4.9-3.1a5.6 5.6 0 0 0 2.5-3.7 5.7 5.7 0 0 0-.6-3.8 5.5 5.5 0 0 0 .8-2.1 5.8 5.8 0 0 0-1-4.4Z" fill="#FF3E00"/>
          <path d="M10.4 19.4a3.5 3.5 0 0 1-3.7-1.4 3.2 3.2 0 0 1-.6-2.5l.2-.6.5.4a6.4 6.4 0 0 0 1.9 1l.4.1-.1.4a1 1 0 0 0 .2.9 1.1 1.1 0 0 0 1.2.4l.3-.1 4.9-3.1a.9.9 0 0 0 .4-.6 1 1 0 0 0-.1-.7 1.1 1.1 0 0 0-1.2-.4l-.3.1-1.9 1.2a3.6 3.6 0 0 1-1.1.4 3.5 3.5 0 0 1-3.7-1.4 3.2 3.2 0 0 1-.6-2.5 2.9 2.9 0 0 1 1.3-2l4.9-3.1a3.6 3.6 0 0 1 1.1-.4 3.5 3.5 0 0 1 3.7 1.4 3.2 3.2 0 0 1 .6 2.5l-.2.6-.5-.4a6.4 6.4 0 0 0-1.9-1l-.4-.1.1-.4a1 1 0 0 0-.2-.9 1.1 1.1 0 0 0-1.2-.4l-.3.1-4.9 3.1a.9.9 0 0 0-.4.6 1 1 0 0 0 .1.7 1.1 1.1 0 0 0 1.2.4l.3-.1 1.9-1.2a3.6 3.6 0 0 1 1.1-.4 3.5 3.5 0 0 1 3.7 1.4 3.2 3.2 0 0 1 .6 2.5 2.9 2.9 0 0 1-1.3 2l-4.9 3.1a3.6 3.6 0 0 1-1.1.4Z" fill="#FFF"/>
        </svg>
        <h1 class="text-2xl sm:text-3xl font-bold text-sky-950">
          Fin<span class="text-orange-400">Sense</span>
        </h1>
      </div>

      <h2 class="text-xl sm:text-2xl font-bold text-sky-950 mb-2 text-center">
        Selamat Datang
      </h2>
      <p class="text-gray-500 text-sm sm:text-base mb-6 text-center">
        Buat akun baru untuk manajemen bisnis Anda.
      </p>

      <form on:submit={handleRegister} class="w-full">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            placeholder="Masukkan email Anda"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <div class="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder="Minimal 6 karakter"
              class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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

        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Konfirmasi Password
          </label>
          <div class="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              placeholder="Ulangi password Anda"
              class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-sky-950 text-white font-bold rounded-lg py-2 hover:bg-sky-900 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600 text-sm">
          Sudah punya akun?
          <a href="/#/login" class="text-orange-500 font-bold hover:underline">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
