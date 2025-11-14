import { defineConfig } from 'vite';

export default defineConfig({
  base: '/2025-hex-js-m8/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
      },
    },
  },
});
