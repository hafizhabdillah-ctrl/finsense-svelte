import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  server: {
    host: 'localhost',
    port: 5173,
    open: true,
    cors: true,
  },
  build: {
    minify: 'esbuild',
  },
});
