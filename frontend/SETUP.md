# Svelte Frontend README

Aplikasi frontend **FinSense** menggunakan **Svelte** sebagai framework utama dengan **Tailwind CSS** untuk styling.

## 🚀 Features

✅ Autentikasi (Login, Register, Reset Password)  
✅ Dashboard dengan statistik real-time  
✅ Manajemen Stok Barang  
✅ Catatan Keuangan & Transaksi  
✅ POS Terminal (Point of Sales)  
✅ Manajemen Hutang Pelanggan  
✅ Log Inventaris  
✅ Profil User & Settings UMKM  
✅ Responsive Design (Mobile & Desktop)  
✅ Dark/Light Theme Ready  

## 🛠️ Tech Stack

- **Framework**: Svelte 4.x
- **Routing**: svelte-spa-router
- **Styling**: Tailwind CSS 4.x
- **Build**: Vite
- **HTTP Client**: Axios
- **UI Alerts**: SweetAlert2
- **Charts**: Chart.js

## 📦 Installation

### Prerequisites
- Node.js 16+
- npm atau yarn

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi Anda
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```
   Buka browser ke `http://localhost:5173`

## 🏗️ Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
# Output di folder 'dist/'
```

### Preview Build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## 📁 Project Structure

```
svelte/frontend/
├── src/
│   ├── pages/                 # Route pages
│   │   ├── MainPage.svelte       # Landing page
│   │   ├── Auth/
│   │   │   ├── LoginPage.svelte
│   │   │   ├── RegisterPage.svelte
│   │   │   ├── LupaPasswordPage.svelte
│   │   │   └── ResetPasswordPage.svelte
│   │   └── Features/
│   │       ├── DashboardPage.svelte
│   │       ├── StockPage.svelte
│   │       ├── TransactionPage.svelte
│   │       ├── PosPage.svelte
│   │       ├── DebtPage.svelte
│   │       ├── LogPage.svelte
│   │       └── ErrorPage.svelte
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── MainLayout.svelte    # Main app layout
│   │   │   │   ├── Sidebar.svelte       # Navigation
│   │   │   │   ├── Topbar.svelte        # Header
│   │   │   │   └── SettingsModal.svelte # Profile settings
│   │   │   ├── Auth/
│   │   │   └── Features/
│   │   ├── services/
│   │   │   ├── api.ts         # Axios instance
│   │   │   └── index.ts       # Service functions
│   │   ├── stores/
│   │   │   └── auth.ts        # Auth state
│   │   └── utils/
│   ├── App.svelte             # Root router
│   ├── main.ts                # Entry point
│   ├── app.css                # Global CSS
│   └── images/                # Static images
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## 🔐 Authentication

Sistem autentikasi berbasis JWT token:

- **Login**: POST `/auth/login`
- **Register**: POST `/auth/register`  
- **Forgot Password**: POST `/auth/forgot-password`
- **Reset Password**: POST `/auth/reset-password`
- **Get Profile**: GET `/auth/profile`
- **Update Profile**: PUT `/auth/profile`

Token disimpan di localStorage dan otomatis di-attach ke setiap request.

## 🛣️ Routes

| Route | Deskripsi |
|-------|-----------|
| `/` | Landing page (publik) |
| `/login` | Halaman login |
| `/register` | Halaman registrasi |
| `/lupa-password` | Request reset password |
| `/reset-password?token=...` | Reset password |
| `/dashboard` | Dashboard (protected) |
| `/stocks` | Manajemen stok (protected) |
| `/transactions` | Catatan keuangan (protected) |
| `/pos` | POS Terminal (protected) |
| `/debts` | Manajemen hutang (protected) |
| `/logs` | Log inventaris (protected) |
| `*` | Error page (404) |

## 🎨 Styling

Menggunakan Tailwind CSS v4 dengan customization:

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#0f172a', // sky-950
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
};
```

## 📡 API Integration

Semua API calls menggunakan service layer di `src/lib/services/`:

```svelte
<script>
  import { stockService, authService } from '$lib/services';

  let stocks = [];
  stocks = await stockService.getAll();
</script>
```

## 🔄 State Management

Menggunakan Svelte Stores:

```svelte
<script>
  import { authStore } from '$lib/stores/auth';
  
  $: user = $authStore.user;
  $: isAuthenticated = $authStore.isAuthenticated;
</script>

<p>{user?.full_name}</p>
```

## 📱 Responsive Design

Aplikasi fully responsive dengan Tailwind breakpoints:

- `xs`: 475px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🔧 Development Guide

### Membuat Page Baru

1. Buat file di `src/pages/Features/NewPage.svelte`:
   ```svelte
   <script>
     import MainLayout from '../../lib/components/Layout/MainLayout.svelte';
   </script>

   <MainLayout>
     <h1>New Page</h1>
   </MainLayout>
   ```

2. Tambahkan route di `src/App.svelte`:
   ```javascript
   import NewPage from './pages/Features/NewPage.svelte';
   
   const routes = {
     '/new-page': NewPage,
   };
   ```

### Membuat Component Reusable

1. Buat file di `src/lib/components/Features/`
2. Export props yang diperlukan
3. Gunakan di pages

### API Calls

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { stockService } from '$lib/services';
  
  let data = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      data = await stockService.getAll();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="text-red-500">{error}</p>
{:else}
  <!-- Content -->
{/if}
```

## 🔗 Backend Configuration

Default backend URL: `http://localhost:3000/api`

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## 📦 Dependencies

### Main
- `axios`: HTTP client
- `chart.js`: Charts library
- `jspdf`: PDF generation
- `jspdf-autotable`: Table to PDF
- `svelte-spa-router`: Routing
- `sweetalert2`: Alerts & modals

### Dev
- `@sveltejs/vite-plugin-svelte`: Svelte plugin for Vite
- `@tailwindcss/vite`: Tailwind CSS for Vite
- `vite`: Build tool
- `tailwindcss`: CSS framework
- `autoprefixer`: PostCSS plugin
- `eslint`: Code linting

## 🚨 Troubleshooting

### CORS Error
Pastikan backend mengizinkan cross-origin requests dari frontend URL.

### 401 Unauthorized
Token expired. Aplikasi akan otomatis refresh atau redirect ke login.

### Import Error
Check path dengan benar, terutama untuk path alias di `tsconfig.json`.

### Styling tidak muncul
Pastikan Tailwind config sudah include path yang benar:
```javascript
content: ['./index.html', './src/**/*.{js,ts,svelte}'],
```

## 🔒 Security Notes

- Jangan commit `.env` file dengan secrets
- Token disimpan di localStorage (tidak ideal untuk highly sensitive apps)
- Implement CSRF protection jika diperlukan
- Validate semua input di frontend dan backend
- Sanitize output untuk prevent XSS

## 📚 Additional Resources

- [Svelte Docs](https://svelte.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [svelte-spa-router](https://github.com/ItalyPaleAle/svelte-spa-router)
- [Vite Guide](https://vitejs.dev)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push: `git push origin feature/your-feature`
4. Open Pull Request

## 📄 License

ISC

## ✉️ Support

Hubungi team development untuk support atau issues.

---

**Built with ❤️ using Svelte & Tailwind CSS**

FinSense © 2026 - Coding Camp
