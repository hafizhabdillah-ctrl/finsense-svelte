import { writable } from 'svelte/store';

export const authStore = writable({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export const userStore = writable({
  user: null,
  profile: null,
});

export const sidebarStore = writable({
  isOpen: false,
});
