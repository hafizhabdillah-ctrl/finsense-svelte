<script lang="ts">
  import { onMount } from 'svelte';
  import { Route } from 'tinro';
  import { authStore } from './lib/stores/auth';
  import { authService } from './lib/services';

  // Pages
  import MainPage from './pages/MainPage.svelte';
  import LoginPage from './pages/Auth/LoginPage.svelte';
  import RegisterPage from './pages/Auth/RegisterPage.svelte';
  import LupaPasswordPage from './pages/Auth/LupaPasswordPage.svelte';
  import ResetPasswordPage from './pages/Auth/ResetPasswordPage.svelte';
  import ErrorPage from './pages/Features/ErrorPage.svelte';

  // Feature Pages
  import DashboardPage from './pages/Features/DashboardPage.svelte';
  import StockPage from './pages/Features/StockPage.svelte';
  import StockDetail from './pages/Read/StockDetail.svelte';
  import PosPage from './pages/Features/PosPage.svelte';
  import TransactionPage from './pages/Features/TransactionPage.svelte';
  import TransactionDetail from './pages/Read/TransactionDetail.svelte';
  import DebtPage from './pages/Features/DebtPage.svelte';
  import DebtDetail from './pages/Read/DebtDetail.svelte';
  import LogPage from './pages/Features/LogPage.svelte';
  import LogDetail from './pages/Read/LogDetail.svelte';

  // New Item pages
  import NewStock from './pages/New/NewStock.svelte';
  import NewTransaction from './pages/New/NewTransaction.svelte';
  import NewDebt from './pages/New/NewDebt.svelte';
  import NewLog from './pages/New/NewLog.svelte';
  import NewPos from './pages/New/NewPos.svelte';

  onMount(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const user = await authService.getProfile();
        authStore.set({ user, loading: false, isAuthenticated: true });
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        authStore.set({ user: null, loading: false, isAuthenticated: false });
      }
    } else {
      authStore.set({ user: null, loading: false, isAuthenticated: false });
    }
  });
</script>

<main class="font-poppins">
  {#if $authStore.loading}
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-950"></div>
    </div>
  {:else}
    <Route path="/"><MainPage /></Route>
    <Route path="/login"><LoginPage /></Route>
    <Route path="/register"><RegisterPage /></Route>
    <Route path="/lupa-password"><LupaPasswordPage /></Route>
    <Route path="/reset-password"><ResetPasswordPage /></Route>

    <Route path="/dashboard"><DashboardPage /></Route>
    <Route path="/stocks"><StockPage /></Route>
    <Route path="/stocks/new"><NewStock /></Route>
    <Route path="/stocks/:id" let:meta>
      <StockDetail id={meta.params.id} />
    </Route>
    <Route path="/pos"><PosPage /></Route>
    <Route path="/pos/new"><NewPos /></Route>
    <Route path="/transactions"><TransactionPage /></Route>
    <Route path="/transactions/new"><NewTransaction /></Route>
    <Route path="/transactions/:id" let:meta>
      <TransactionDetail id={meta.params.id} />
    </Route>
    <Route path="/debts"><DebtPage /></Route>
    <Route path="/debts/new"><NewDebt /></Route>
    <Route path="/debts/:id" let:meta>
      <DebtDetail id={meta.params.id} />
    </Route>
    <Route path="/logs"><LogPage /></Route>
    <Route path="/logs/new"><NewLog /></Route>
    <Route path="/logs/:id" let:meta>
      <LogDetail id={meta.params.id} />
    </Route>

    <Route fallback><ErrorPage /></Route>
  {/if}
</main>