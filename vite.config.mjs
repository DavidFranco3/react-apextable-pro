import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/react-apextable-pro/',
  optimizeDeps: {
    exclude: ['react-data-table-component']
  },
  server: {
    port: 3006,
    strictPort: true
  }
});
