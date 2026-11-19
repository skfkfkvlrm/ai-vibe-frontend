import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// demo-board 백엔드(8084)로 API 요청을 넘긴다. (개발 서버 전용)
const backend = 'http://localhost:8084'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': backend,
    },
  },
})
