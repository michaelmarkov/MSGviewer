import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // Include specific polyfills for the modules we need
      include: ['buffer', 'stream', 'util', 'process'],
      // Whether to polyfill `global` 
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['@kenjiuno/msgreader', 'buffer', 'stream-browserify', 'util']
  }
}) 