// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server', // Enables serverless functions by default
  adapter: vercel({
    imageService: true, // Uses Vercel's Edge Image Optimization for your philosopher busts
  }),
  vite: {
    plugins: [tailwindcss()]
  }
});