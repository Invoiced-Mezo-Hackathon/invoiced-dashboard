import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      external: (id) => {
        // Don't bundle problematic modules
        if (id.includes('@base-org/account')) return true
        if (id.includes('@safe-globalThis/')) return true
        return false
      }
    }
  },
  optimizeDeps: {
    include: [
      'sats-connect', 
      '@mezo-org/passport',
      '@rainbow-me/rainbowkit',
      'wagmi',
      'viem'
    ],
    exclude: ['@base-org/account', '@safe-globalThis/safe-apps-sdk', '@safe-globalThis/safe-apps-provider']
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    target: 'esnext',
  },
})
