import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/kotakAmal/' // GANTI dengan nama repository GitHub kamu
})