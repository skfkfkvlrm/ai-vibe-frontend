import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 백엔드(hanabank, 8080)로 API 요청을 넘긴다. (개발 서버 전용)
// 배포용 빌드는 백엔드 static 폴더로 내보내 http://localhost:8080/hanabank 에서 바로 열린다.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8080' } },
  build: {
    outDir: '../../ai-vibe-backend/hanabank/src/main/resources/static',
    emptyOutDir: true,
  },
})
