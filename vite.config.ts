import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// demo-dog 백엔드(8080)로 API와 이미지 요청을 넘긴다. (개발 서버 전용)
const backend = 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': backend,
      '^/[^/]+\\.(jpg|jpeg|png)$': backend,
    },
  },
})
