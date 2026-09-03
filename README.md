# 🚀 FinSense Svelte - Dokumentasi Utama & Panduan Cepat

Aplikasi **FinSense** frontend berbasis **Svelte 4** dan **Tailwind CSS** dengan 100% *feature parity* terhadap versi React, Vue, dan Angular. Dokumen ini menyatukan seluruh informasi penggunaan dasar, fitur, alur cepat, dan panduan penggunaan.

---

## 📋 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Panduan Cepat (5-Minute Quick Start)](#-panduan-cepat-5-minute-quick-start)
3. [Kredensial Default](#-kredensial-default)
4. [Struktur Folder](#-struktur-folder)
5. [Daftar Route Aplikasi](#-daftar-route-aplikasi)
6. [Tech Stack & Desain System](#-tech-stack--desain-system)
7. [Perintah Umum (Commands)](#-perintah-umum-commands)
8. [Troubleshooting Dasar](#-troubleshooting-dasar)
9. [Panduan Deployment](#-panduan-deployment)

---

## ✨ Fitur Utama

- **Otentikasi Lengkap**: Login, Register, Lupa Password, Reset Password dengan verifikasi token, serta auto-logout jika token kadaluarsa.
- **Dashboard Interaktif**: Ringkasan statistik penjualan, pendapatan, stok barang, transaksi terbaru, dan grafik visual.
- **Manajemen Stok**: Tambah/edit/hapus produk, pelacakan jumlah stok, peringatan stok rendah, dan pencarian cepat.
- **Catatan Keuangan**: Pencatatan transaksi masuk & keluar, kategori pemasukan/pengeluaran, dan laporan keuangan.
- **POS Terminal (Point of Sale)**: Kasir penjualan cepat, manajemen keranjang belanja, ringkasan pembayaran.
- **Manajemen Hutang**: Pelacakan hutang pelanggan, pencatatan pembayaran, dan status pelunasan.
- **Log Inventaris**: Riwayat stok masuk/keluar, pelacakan aktivitas inventaris (*audit trail*).
- **Pengaturan Pengguna & UMKM**: Manajemen profil pengguna dan konfigurasi informasi profil usaha UMKM.
- **Responsif & Performa Tinggi**: Tampilan optimal di perangkat Mobile, Tablet, dan Desktop dengan ukuran bundle sangat kecil (~250KB gzipped).

---

## ⚡ Panduan Cepat (5-Minute Quick Start)

### 1️⃣ Install Dependencies (1 menit)
```bash
cd svelte/frontend
npm install
```

### 2️⃣ Konfigurasi Environment (1 menit)
```bash
cp .env.example .env
# File .env default sudah mengarah ke backend http://localhost:3000/api
```

### 3️⃣ Jalankan Backend (1 menit)
Di terminal baru:
```bash
cd svelte/backend
npm install
npm run dev
# Backend berjalan di http://localhost:3000
```

### 4️⃣ Jalankan Frontend (1 menit)
```bash
cd svelte/frontend
npm run dev
# Frontend berjalan di http://localhost:5173
```

### 5️⃣ Login ke Aplikasi (1 menit)
Buka browser ke `http://localhost:5173` dan masuk menggunakan kredensial default.

---

## 📝 Kredensial Default

- **Email**: `user@example.com`
- **Password**: `password123`

*(Catatan: Kredensial tergantung pada seeding database backend).*

---

## 📂 Struktur Folder

```
svelte/
├── backend/                  # Shared Backend (Express.js + Prisma)
└── frontend/                 # Svelte Frontend
    ├── src/
    │   ├── pages/            # Page components (Routing)
    │   │   ├── MainPage.svelte
    │   │   ├── Auth/         # Page Login, Register, Reset Password
    │   │   └── Features/     # Page Dashboard, Stock, POS, Debt, Logs, Transaction
    │   ├── lib/
    │   │   ├── components/   # Layout (Sidebar, Topbar, Settings) & UI Components
    │   │   ├── services/     # Layer HTTP Client (Axios API calls)
    │   │   ├── stores/       # State Management (Svelte Stores - authStore)
    │   │   └── utils/        # Utility helpers
    │   ├── App.svelte        # Root Component & Route Configuration
    │   ├── main.ts           # Entry point TypeScript
    │   └── app.css           # Global Tailwind CSS Styles
    ├── public/               # Public assets & logo
    ├── index.html            # Entry HTML
    ├── package.json          # Dependencies & Scripts
    ├── vite.config.js        # Vite Build Config
    └── tailwind.config.js    # Tailwind Config
```

---

## 🎯 Daftar Route Aplikasi

| URL Route | Deskripsi | Akses Protected |
|---|---|:---:|
| `/` | Landing page utama | ❌ Publik |
| `/login` | Halaman Login | ❌ Publik |
| `/register` | Halaman Registrasi Akun | ❌ Publik |
| `/lupa-password` | Form Pengajuan Reset Password | ❌ Publik |
| `/reset-password` | Form Reset Password via Token | ❌ Publik |
| `/dashboard` | Dashboard utama & Statistik | ✅ Protected |
| `/stocks` | Manajemen Stok Produk | ✅ Protected |
| `/transactions` | Catatan Transaksi Keuangan | ✅ Protected |
| `/pos` | Terminal Kasir (Point of Sale) | ✅ Protected |
| `/debts` | Manajemen Hutang Pelanggan | ✅ Protected |
| `/logs` | Log Aktivitas Inventaris | ✅ Protected |
| `*` | Halaman 404 Not Found | ❌ Publik |

---

## 🛠️ Tech Stack & Desain System

### Technologies
- **Framework**: Svelte 4.x
- **Build Tool**: Vite 8.x
- **Styling**: Tailwind CSS 4.x + PostCSS
- **Routing**: `svelte-spa-router` 4.x
- **HTTP Client**: Axios 1.16.x
- **UI Alerts**: SweetAlert2 11.x
- **Charts**: Chart.js 4.x

### Color Palette
- **Primary (Dark Blue)**: `#0f172a` (`sky-950`)
- **Secondary (Cyan)**: `#06b6d4` (`cyan-500`)
- **Accent / CTA (Orange)**: `#f97316` (`orange-500`)
- **Typography**: Poppins (Google Fonts)

---

## 🛠️ Perintah Umum (Commands)

```bash
# Jalankan server pengembangan (Dev Server - port 5173)
npm run dev

# Jalankan dev server pada port khusus
npm run dev -- --port 5174

# Build aplikasi untuk produksi (output folder: dist/)
npm run build

# Preview hasil build produksi
npm run preview

# Lakukan pengecekan kualitas kode (Linting)
npm run lint
```

---

## ❓ Troubleshooting Dasar

1. **Port 5173 sudah digunakan?**
   Jalankan dengan opsi port alternatif: `npm run dev -- --port 5174`
2. **Gagal koneksi API?**
   Pastikan backend Express berjalan di `http://localhost:3000` dan file `.env` berisi `VITE_API_URL=http://localhost:3000/api`.
3. **Error Module / Dependency?**
   Hapus modul lama lalu install ulang:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 🚀 Panduan Deployment

Aplikasi siap dideploy ke berbagai platform hosting statis setelah melakukan build (`npm run build`):

- **Vercel**: Jalankan `vercel deploy` di root frontend.
- **Netlify**: Deploy folder `dist/` dengan `netlify deploy --prod --dir=dist`.
- **AWS S3 / CloudFront**: Sync isi folder `dist/` ke bucket S3.

---

*Untuk informasi arsitektur mendalam, alur API, dan panduan kode developer, silakan merujuk ke **[DEVELOPMENT.md](./DEVELOPMENT.md)**.*
