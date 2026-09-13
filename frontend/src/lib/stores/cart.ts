import { writable, derived } from 'svelte/store';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const STORAGE_KEY = 'pos_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

function createCartStore() {
  const { subscribe, set, update } = writable<CartItem[]>(loadCart());

  function addItem(item: CartItem) {
    update((items) => {
      const existing = items.find((i) => i.id === item.id);
      const next = existing
        ? items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i))
        : [...items, item];
      persist(next);
      return next;
    });
  }

  function updateQty(id: string, qty: number) {
    update((items) => {
      const next = items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
      persist(next);
      return next;
    });
  }

  function removeItem(id: string) {
    update((items) => {
      const next = items.filter((i) => i.id !== id);
      persist(next);
      return next;
    });
  }

  function emptyCart() {
    persist([]);
    set([]);
  }

  return { subscribe, addItem, updateQty, removeItem, emptyCart };
}

export const cartStore = createCartStore();

export const cartTotal = derived(cartStore, ($cart) =>
  $cart.reduce((acc, item) => acc + item.price * item.qty, 0),
);
