<script lang="ts">
  import { authService } from '../../lib/services';
  import Swal from 'sweetalert2';
  import logo from '../../../images/logo.png';

  let email = '';
  let message = '';
  let error = '';
  let loading = false;

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    message = '';
    error = '';

    try {
      const result = await authService.forgotPassword(email);
      message = result.message;
    } catch (err) {
      error = err.response?.data?.error || 'Gagal mengirim permintaan.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-200">
  <div class="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
    <div class="flex flex-col items-center">
      <div class="flex flex-row">
        <img src={logo} alt="logo" class="h-12 w-12 mb-2 mx-2" />
        <h1 class="text-3xl font-bold text-sky-950">
          Fin<span class="text-orange-400">Sense</span>
        </h1>
      </div>
      <p class="text-gray-500 text-sm mb-4">
        Masukkan email Anda, kami akan kirimkan link reset password.
      </p>
      <form on:submit={handleSubmit} class="w-full">
        <input
          type="email"
          bind:value={email}
          placeholder="Email"
          class="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 transition-colors"
          required
        />
        {#if message}
          <p class="text-green-500 text-sm mb-2">{message}</p>
        {/if}
        {#if error}
          <p class="text-red-500 text-sm mb-2">{error}</p>
        {/if}
        <button
          type="submit"
          disabled={loading}
          class="w-full bg-sky-950 text-white font-bold rounded-lg py-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Mengirim...' : 'Kirim Link Reset'}
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
