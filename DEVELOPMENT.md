# 🏗️ FinSense Svelte - Panduan Teknikal & Arsitektur Pengembangan

Dokumen teknikal ini ditujukan bagi developer untuk memahami arsitektur, pola pembuatan komponen, alur otentikasi JWT, integrasi API, serta pemeliharaan kode pada aplikasi **FinSense Svelte Frontend**.

---

## 📋 Daftar Isi
1. [Arsitektur & State Management](#1-arsitektur--state-management)
2. [Alur Otentikasi & Keamanan](#2-alur-otentikasi--keamanan)
3. [Daftar Endpoint API](#3-daftar-endpoint-api)
4. [Pola Pengembangan Komponen Svelte](#4-pola-pengembangan-komponen-svelte)
5. [Matriks Perbandingan Framework](#5-matriks-perbandingan-framework)
6. [Best Practices & Tips Pengembangan](#6-best-practices--tips-pengembangan)

---

## 1. Arsitektur & State Management

Aplikasi dibangun dengan arsitektur modular yang memisahkan komponen visual, layer layanan API, dan pengelolaan state.

```
UI Layer (Svelte Pages & Components)
       │
       ▼
Svelte Stores (State Management - authStore)
       │
       ▼
Service Layer (API Interceptor & Axios Services)
       │
       ▼
Backend REST API (Express.js / Prisma)
```

### Store Management (`src/lib/stores/auth.ts`)
Pengelolaan state otentikasi menggunakan Svelte Writable Store bawaan yang terintegrasi dengan `localStorage`:

```typescript
import { writable } from 'svelte/store';

export const authStore = writable({
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken') || null,
});
```

---

## 2. Alur Otentikasi & Keamanan

1. **Login User**:
   - User memasukkan kredensial → `POST /auth/login`.
   - Backend mengembalikan `accessToken` dan `refreshToken`.
2. **Penyimpanan Token**:
   - `accessToken` & `refreshToken` disimpan di `localStorage`.
   - Axios Interceptor secara otomatis menyisipkan header `Authorization: Bearer <accessToken>` pada setiap request HTTP.
3. **Auto Refresh Token**:
   - Jika request mengembalikan error `401 Unauthorized`, interceptor Axios mencoba melakukan refresh token ke `POST /auth/refresh-token`.
4. **Protected Routes Guard**:
   - Pengecekan status login dilakukan pada lifecycle `onMount` di setiap komponen halaman protected:
   ```svelte
   <script>
     import { onMount } from 'svelte';
     import { push } from 'svelte-spa-router';
     import { authStore } from '$lib/stores/auth';

     onMount(() => {
       if (!$authStore.isAuthenticated) {
         push('/login');
       }
     });
   </script>
   ```

---

## 3. Daftar Endpoint API

Seluruh service API terdefinisi di `src/lib/services/`:

### 🔐 Authentication (`/auth`)
- `POST /auth/login` — Login & dapatkan JWT
- `POST /auth/register` — Pendaftaran akun baru
- `POST /auth/forgot-password` — Request reset password via email
- `POST /auth/reset-password` — Eksekusi reset password
- `GET /auth/profile` — Ambil profil user saat ini
- `PUT /auth/profile` — Update profil user

### 📦 Product & Stock (`/products`)
- `GET /products` — Ambil daftar seluruh produk
- `POST /products` — Tambah produk baru
- `GET /products/:id` — Detail produk berdasarkan ID
- `PUT /products/:id` — Update data produk
- `DELETE /products/:id` — Hapus produk

### 💰 Transactions (`/transactions`)
- `GET /transactions` — Riwayat transaksi
- `POST /transactions` — Catat transaksi baru
- `PUT /transactions/:id` — Update data transaksi
- `DELETE /transactions/:id` — Hapus catatan transaksi

### 👥 Debts & Logs
- `GET /debts` & `POST /debts` — Manajemen hutang pelanggan
- `GET /inventory-logs` — Pelacakan log masuk/keluar barang
- `GET /dashboard/stats` — Ringkasan data untuk grafik & card dashboard

---

## 4. Pola Pengembangan Komponen Svelte

Setiap komponen halaman mengadopsi struktur Svelte idiomatis:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import MainLayout from '$lib/components/Layout/MainLayout.svelte';
  import { stockService } from '$lib/services';

  let items = [];
  let isLoading = true;
  let errorMessage = '';

  onMount(async () => {
    try {
      items = await stockService.getAll();
    } catch (err: any) {
      errorMessage = err.message || 'Gagal memuat data stok';
    } finally {
      isLoading = false;
    }
  });
</script>

<MainLayout>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-slate-900 mb-4">Manajemen Stok</h1>

    {#if isLoading}
      <div class="text-center py-8">Memuat data...</div>
    {:else if errorMessage}
      <div class="p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each items as item (item.id)}
          <div class="p-4 border border-slate-200 rounded-lg shadow-sm">
            <h3 class="font-semibold">{item.name}</h3>
            <p class="text-sm text-slate-500">Stok: {item.quantity}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</MainLayout>

<style>
  /* Styling spesifik komponen (scoped secara otomatis oleh Svelte) */
</style>
```

---

## 5. Matriks Perbandingan Framework

| Parameter | Svelte (Versi Ini) | React | Vue | Angular |
|---|:---:|:---:|:---:|:---:|
| **Ukuran Bundle (gzipped)** | **~250 KB** ⚡ | ~400 KB | ~350 KB | ~600 KB |
| **Waktu Load Awal** | **< 1.5 detik** | ~2.2 detik | ~1.8 detik | ~2.8 detik |
| **Kompleksitas State** | **Sangat Simpel** (Store) | Hook / Redux | Pinia / Vuex | RxJS / Service |
| **Reaktivitas** | **Kompilasi bawaan** (`$:`) | Virtual DOM | Reactive Proxy | Zone.js / Signals |
| **Kurva Pembelajaran** | **Rendah** | Sedang | Sedang | Tinggi |

---

## 6. Best Practices & Tips Pengembangan

1. **Gunakan Type Safety**: Selalu manfaatkan interface TypeScript saat memanggil data dari Service Layer.
2. **Gunakan Toast / Alert Standard**: Manfaatkan library `SweetAlert2` yang sudah di-wrap di utilitas untuk respon error/sukses pengguna.
3. **Pembersihan LocalStorage**: Jika terjadi error token corrupted, jalankan skrip berikut di console browser:
   ```javascript
   localStorage.clear();
   window.location.href = '#/login';
   ```
4. **Optimasi Gambar & Assets**: Letakkan seluruh asset statis di folder `public/` atau `src/images/` untuk bundling otomatis oleh Vite.

---

*FinSense Svelte Frontend © 2026 - Coding Camp Dicoding*
