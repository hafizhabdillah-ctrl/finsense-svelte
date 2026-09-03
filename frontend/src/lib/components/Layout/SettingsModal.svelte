<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../../stores/auth';
  import { authService, umkmService } from '../../services';
  import Swal from 'sweetalert2';

  export let isOpen = false;

  let activeTab = 'profile';
  let loading = false;
  let profileLoading = false;

  let userForm = {
    full_name: '',
    email: '',
  };

  let umkmForm = {
    business_name: '',
    business_type: '',
    province: '',
    city: '',
    monthly_revenue_est: '',
    employee_count: '',
  };

  // Fetch setiap kali modal dibuka
  $: if (isOpen) {
    fetchProfiles();
  }

  async function fetchProfiles() {
    profileLoading = true;
    try {
      const userData = await authService.getProfile();
      userForm = {
        full_name: userData.full_name || '',
        email: userData.email || '',
      };

      try {
        const umkmData = await umkmService.getProfile();
        if (umkmData && umkmData.business_name) {
          umkmForm = {
            business_name: umkmData.business_name || '',
            business_type: umkmData.business_type || '',
            province: umkmData.province || '',
            city: umkmData.city || '',
            monthly_revenue_est: umkmData.monthly_revenue_est != null ? String(umkmData.monthly_revenue_est) : '',
            employee_count: umkmData.employee_count != null ? String(umkmData.employee_count) : '',
          };
        }
      } catch {
        // UMKM profile belum dibuat, form kosong
      }
    } catch (err: any) {
      console.error('Gagal memuat profil:', err);
      Swal.fire('Gagal', err?.response?.data?.error || 'Gagal memuat data profil.', 'error');
    } finally {
      profileLoading = false;
    }
  }

  async function handleUserSubmit(e: Event) {
    e.preventDefault();
    if (!userForm.full_name.trim()) {
      Swal.fire('Perhatian', 'Nama lengkap tidak boleh kosong.', 'warning');
      return;
    }
    loading = true;
    try {
      const response = await authService.updateProfile(userForm.full_name, userForm.email);
      authStore.update((auth) => ({
        ...auth,
        user: { ...auth.user, full_name: response.full_name },
      }));
      await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Profil berhasil diperbarui.', confirmButtonColor: '#0c4a6e' });
      isOpen = false;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Gagal memperbarui profil.';
      await Swal.fire('Gagal', msg, 'error');
    } finally {
      loading = false;
    }
  }

  async function handleUmkmSubmit(e: Event) {
    e.preventDefault();
    if (!umkmForm.business_name.trim()) {
      Swal.fire('Perhatian', 'Nama bisnis wajib diisi.', 'warning');
      return;
    }
    loading = true;
    try {
      const payload = {
        business_name: umkmForm.business_name,
        business_type: umkmForm.business_type || null,
        province: umkmForm.province || null,
        city: umkmForm.city || null,
        monthly_revenue_est: umkmForm.monthly_revenue_est
          ? parseFloat(umkmForm.monthly_revenue_est)
          : null,
        employee_count: umkmForm.employee_count
          ? parseInt(umkmForm.employee_count)
          : null,
      };
      const response = await umkmService.updateProfile(payload);
      authStore.update((auth) => ({
        ...auth,
        user: { ...auth.user, umkm_profile: response },
      }));
      await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Profil UMKM berhasil diperbarui.', confirmButtonColor: '#0c4a6e' });
      isOpen = false;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Gagal memperbarui profil UMKM.';
      await Swal.fire('Gagal', msg, 'error');
    } finally {
      loading = false;
    }
  }

  function closeModal() {
    isOpen = false;
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    on:click|self={closeModal}
    role="dialog"
    aria-modal="true"
    aria-label="Pengaturan"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
        <h2 class="text-xl font-bold text-gray-900">Pengaturan Akun</h2>
        <button
          on:click={closeModal}
          class="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-2xl leading-none"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="flex border-b border-gray-200 px-6 bg-gray-50">
        <button
          on:click={() => (activeTab = 'profile')}
          class="px-5 py-3 font-semibold text-sm transition-colors border-b-2 cursor-pointer
            {activeTab === 'profile'
              ? 'border-sky-900 text-sky-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'}"
        >
          User
        </button>
        <button
          on:click={() => (activeTab = 'umkm')}
          class="px-5 py-3 font-semibold text-sm transition-colors border-b-2 cursor-pointer
            {activeTab === 'umkm'
              ? 'border-sky-900 text-sky-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'}"
        >
          UMKM
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        {#if profileLoading}
          <div class="flex items-center justify-center py-12 gap-3 text-gray-500">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-950"></div>
            <span>Memuat data profil...</span>
          </div>
        {:else}

          <!-- ===== TAB: Profil User ===== -->
          {#if activeTab === 'profile'}
            <form on:submit={handleUserSubmit} class="space-y-5">

              <div>
                <label for="settings-fullname" class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap <span class="text-red-500">*</span>
                </label>
                <input
                  id="settings-fullname"
                  type="text"
                  bind:value={userForm.full_name}
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <label for="settings-email" class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="settings-email"
                  type="email"
                  value={userForm.email}
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                  disabled
                />
                <p class="text-xs text-gray-400 mt-1">Email tidak dapat diubah.</p>
              </div>

              <div class="pt-2 flex gap-3 justify-end border-t border-gray-100">
                <button
                  type="button"
                  on:click={closeModal}
                  class="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  class="px-5 py-2 bg-sky-950 text-white rounded-lg hover:bg-sky-900 transition disabled:opacity-50 cursor-pointer text-sm font-medium"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>

          <!-- ===== TAB: Profil UMKM ===== -->
          {:else if activeTab === 'umkm'}
            <form on:submit={handleUmkmSubmit} class="space-y-5">

              <div>
                <label for="settings-bizname" class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Bisnis <span class="text-red-500">*</span>
                </label>
                <input
                  id="settings-bizname"
                  type="text"
                  bind:value={umkmForm.business_name}
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition"
                  placeholder="Contoh: Toko Sembako Jaya"
                  required
                />
              </div>

              <div>
                <label for="settings-biztype" class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Jenis Bisnis
                </label>
                <input
                  id="settings-biztype"
                  type="text"
                  bind:value={umkmForm.business_type}
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition"
                  placeholder="Contoh: Retail, Kuliner, Jasa..."
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="settings-province" class="block text-sm font-semibold text-gray-700 mb-1.5">
                    Provinsi
                  </label>
                  <input
                    id="settings-province"
                    type="text"
                    bind:value={umkmForm.province}
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition"
                    placeholder="Contoh: Jawa Barat"
                  />
                </div>
                <div>
                  <label for="settings-city" class="block text-sm font-semibold text-gray-700 mb-1.5">
                    Kota
                  </label>
                  <input
                    id="settings-city"
                    type="text"
                    bind:value={umkmForm.city}
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition"
                    placeholder="Contoh: Bandung"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="settings-revenue" class="block text-sm font-semibold text-gray-700 mb-1.5">
                    Estimasi Pendapatan Bulanan (Rp)
                  </label>
                  <input
                    id="settings-revenue"
                    type="number"
                    min="0"
                    bind:value={umkmForm.monthly_revenue_est}
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label for="settings-employee" class="block text-sm font-semibold text-gray-700 mb-1.5">
                    Jumlah Karyawan
                  </label>
                  <input
                    id="settings-employee"
                    type="number"
                    min="0"
                    bind:value={umkmForm.employee_count}
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="pt-2 flex gap-3 justify-end border-t border-gray-100">
                <button
                  type="button"
                  on:click={closeModal}
                  class="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  class="px-5 py-2 bg-sky-950 text-white rounded-lg hover:bg-sky-900 transition disabled:opacity-50 cursor-pointer text-sm font-medium"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          {/if}

        {/if}
      </div>
    </div>
  </div>
{/if}
