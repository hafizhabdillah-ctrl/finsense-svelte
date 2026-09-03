<script lang="ts">
  import { authService } from '../../lib/services';
  import Swal from 'sweetalert2';

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
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 mx-2">
          <path d="M19.6 5.3c-2-2.9-5.9-3.8-8.8-2l-4.9 3.1a5.6 5.6 0 0 0-2.5 3.7 5.7 5.7 0 0 0 .6 3.8 5.5 5.5 0 0 0-.8 2.1 5.8 5.8 0 0 0 1 4.4c2 2.9 5.9 3.8 8.8 2l4.9-3.1a5.6 5.6 0 0 0 2.5-3.7 5.7 5.7 0 0 0-.6-3.8 5.5 5.5 0 0 0 .8-2.1 5.8 5.8 0 0 0-1-4.4Z" fill="#FF3E00"/>
          <path d="M16.3 8.2c-1.6-.9-3-.8-4.3 0l-3.8 2.4c-.8.5-1.1 1.5-.6 2.3.4.6 1.1.9 1.8.7M7.7 15.8c1.6.9 3 .8 4.3 0l3.8-2.4c.8-.5 1.1-1.5.6-2.3-.4-.6-1.1-.9-1.8-.7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
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
