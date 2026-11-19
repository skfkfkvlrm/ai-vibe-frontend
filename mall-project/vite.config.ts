import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// pc-mall 백엔드(8086)로 API 요청을 넘긴다. (개발 서버 전용)
const backend = 'http://localhost:8086'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': backend,
    },
  },
})
