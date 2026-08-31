import { defineConfig } from 'vite';

// Served from the domain root by default. Set VITE_BASE_PATH to deploy under a subpath —
// a GitHub Pages project site, or wherever the engine is eventually mounted.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/'
});
