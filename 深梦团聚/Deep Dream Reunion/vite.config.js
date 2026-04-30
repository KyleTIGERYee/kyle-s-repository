import vue from '@vitejs/plugin-vue2'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // HMR 可通过 DISABLE_HMR 环境变量禁用
    hmr: process.env.DISABLE_HMR !== 'true',
  },
})
