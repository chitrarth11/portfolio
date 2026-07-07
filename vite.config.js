import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // site is served from https://chitrarth11.github.io/portfolio/
  base: '/portfolio/',
});
