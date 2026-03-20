import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
// @ts-ignore
import manifest from './manifest.json';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // @ts-ignore
  plugins: [svelte(), crx({ manifest })],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//]
    }
  }
});
