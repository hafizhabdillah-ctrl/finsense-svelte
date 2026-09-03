# FinSense Frontend - Svelte

Frontend aplikasi FinSense menggunakan Svelte sebagai framework utama dengan Tailwind CSS untuk styling.

## Features

- ✅ Authentication (Login, Register, Password Reset)
- ✅ Dashboard dengan statistik penjualan
- ✅ Manajemen Stok
- ✅ Catatan Keuangan (Transaksi)
- ✅ POS Terminal
- ✅ Manajemen Hutang Pelanggan
- ✅ Log Inventaris
- ✅ Profil Pengguna & UMKM Settings
- ✅ Responsive Design (Mobile & Desktop)
- ✅ Tailwind CSS Styling

## Tech Stack

- **Framework**: Svelte 4.x
- **Routing**: svelte-spa-router
- **Styling**: Tailwind CSS 4.x
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Alert/Modal**: SweetAlert2
- **Charts**: Chart.js

## Installation

### Prerequisites
- Node.js 16+ dan npm/yarn

### Setup

1. Clone repository:
```bash
cd svelte/frontend
```

2. Install dependencies:
```bash
npm install
# atau
yarn install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi Anda
```

4. Start development server:
```bash
npm run dev
# atau
yarn dev
```

Server akan berjalan di `http://localhost:5173`

## Build

Untuk production build:
```bash
npm run build
# atau
yarn build
```

Output akan tersimpan di folder `dist/`

## File Structure

```
src/
├── App.svelte              # Main router component
├── main.ts                 # Entry point
├── app.css                 # Global styles
├── pages/                  # Page components
│   ├── MainPage.svelte     # Landing page
│   ├── Auth/               # Authentication pages
│   │   ├── LoginPage.svelte
│   │   ├── RegisterPage.svelte
│   │   ├── LupaPasswordPage.svelte
│   │   └── ResetPasswordPage.svelte
│   └── Features/           # Feature pages
│       ├── DashboardPage.svelte
│       ├── StockPage.svelte
│       ├── TransactionPage.svelte
│       ├── PosPage.svelte
│       ├── DebtPage.svelte
│       ├── LogPage.svelte
│       └── ErrorPage.svelte
├── lib/
│   ├── components/         # Reusable components
│   │   ├── Layout/
│   │   │   ├── MainLayout.svelte
│   │   │   ├── Sidebar.svelte
│   │   │   ├── Topbar.svelte
│   │   │   └── SettingsModal.svelte
│   │   ├── Auth/           # Auth components
│   │   └── Features/       # Feature components
│   ├── services/           # API services
│   │   ├── api.ts          # Axios instance
│   │   └── index.ts        # Service functions
│   ├── stores/             # Svelte stores
│   │   └── auth.ts         # Auth store
│   └── utils/              # Utility functions
```

## Routing

Aplikasi menggunakan SPA routing dengan struktur berikut:

- `/` - Landing page (MainPage)
- `/login` - Login page
- `/register` - Register page
- `/lupa-password` - Forgot password
- `/reset-password` - Reset password
- `/dashboard` - Dashboard (protected)
- `/stocks` - Manajemen Stok (protected)
- `/transactions` - Catatan Keuangan (protected)
- `/pos` - POS Terminal (protected)
- `/debts` - Manajemen Hutang (protected)
- `/logs` - Log Inventaris (protected)
- `*` - Error page (404)

## API Configuration

Pastikan backend API berjalan di port 3000. Environment variable `VITE_API_URL` akan menggunakan endpoint yang sudah dikonfigurasi.

Default: `http://localhost:3000/api`

## Authentication

Aplikasi menggunakan JWT token-based authentication:

1. **Login**: `/auth/login` - Mendapatkan accessToken dan refreshToken
2. **Register**: `/auth/register` - Membuat akun baru
3. **Profile**: `/auth/profile` - Get user profile
4. **Forgot Password**: `/auth/forgot-password` - Request password reset
5. **Reset Password**: `/auth/reset-password` - Reset password dengan token

Token disimpan di localStorage dan otomatis di-attach ke setiap request.

## Components

### MainLayout
Layout utama untuk halaman yang require authentication. Menampilkan Sidebar dan Topbar.

### Sidebar
Menu navigasi dengan links ke semua fitur aplikasi. Responsive untuk mobile & desktop.

### Topbar
Header dengan tombol menu (mobile), settings, dan profile user.

### SettingsModal
Modal untuk edit profil user dan profil UMKM.

## Styling

Aplikasi menggunakan Tailwind CSS dengan custom configuration:

- Primary color: `sky-950` (deep blue)
- Secondary color: `orange-400` (orange accent)
- Responsive breakpoints: xs, sm, md, lg, xl
- Custom animations: fade-in-up, fade-in-up-delay

## Development Guide

### Menambah Page Baru

1. Buat file component di `src/pages/Features/`
```svelte
<script lang="ts">
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
</script>

<MainLayout>
  <!-- Isi page -->
</MainLayout>
```

2. Tambahkan route di `src/App.svelte`:
```ts
import NewPage from './pages/Features/NewPage.svelte';

const routes = {
  '/new-page': privateRoute(NewPage),
};
```

### Menambah Component Reusable

1. Buat file di `src/lib/components/Features/`
2. Export component dengan props yang diperlukan
3. Import dan gunakan di pages

### API Calls

Gunakan service functions dari `src/lib/services/index.ts`:

```svelte
<script lang="ts">
  import { stockService } from '../../lib/services';

  async function loadStocks() {
    try {
      const data = await stockService.getAll();
      stocks = data;
    } catch (error) {
      console.error(error);
    }
  }
</script>
```

## Environment Variables

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# App info (optional)
VITE_APP_NAME=FinSense
VITE_APP_VERSION=1.0.0
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Tips

1. Lazy load images dengan intersectionObserver
2. Gunakan page-specific stores untuk data management
3. Implement virtual scrolling untuk large lists
4. Cache API responses dengan appropriate TTL

## Troubleshooting

### CORS Error
Pastikan backend sudah mengkonfigurasi CORS untuk menerima request dari frontend.

### 401 Unauthorized
Token mungkin expired. Aplikasi akan otomatis refresh token atau redirect ke login.

### Module not found
Pastikan path import sudah benar dan file ada.

## Contributing

Untuk kontribusi:

1. Create feature branch: `git checkout -b feature/nama-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push ke branch: `git push origin feature/nama-feature`
4. Open Pull Request

## License

ISC

## Support

Untuk support atau questions, hubungi team development atau buat issue di repository.

---

Built with ❤️ using Svelte & Tailwind CSS
