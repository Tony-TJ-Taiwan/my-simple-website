import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/my-simple-website/', // 這裡必須跟你的 GitHub 儲存庫名稱完全一致
})