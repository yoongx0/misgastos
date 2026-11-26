import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // En desarrollo, /api va al backend local. En producción se usa VITE_API_URL (Render).
  server: { proxy: { '/api': 'http://localhost:3000' } },
  test: { include: ['src/**/*.test.ts'] },
});
