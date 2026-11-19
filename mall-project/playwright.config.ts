import { defineConfig, devices } from '@playwright/test'

// E2E는 개발용 공유 DB를 쓰므로 직렬로 실행한다. 백엔드(pc-mall :8086)는 미리 떠 있어야 한다.
// 테스트용 vite는 5175에서 띄운다(strictPort, 남은 서버가 있으면 조용히 재사용하지 않고 실패한다).
const PORT = 5175

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [['list']],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // trace에는 Authorization 헤더가 담기므로 끈다.
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
