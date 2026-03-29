import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['react-data-table-component']
  },
  server: {
    port: 3006,
    strictPort: true
  }
});
