import type { Page } from '@playwright/test'
import { requireToken } from './api'
import { TOKEN_KEY } from './env'

/**
 * API로 로그인해 토큰을 localStorage에 한 번 넣고 target으로 이동한다(로그인 화면 조작을 생략하는 단축).
 * 매 이동마다 덮어쓰는 init script는 쓰지 않는다. 비밀번호 변경 뒤 앱이 받은 새 토큰을 유지해야 하기 때문이다.
 */
export async function loginAs(page: Page, loginId: string, target: string): Promise<void> {
  const token = await requireToken(loginId)
  await page.goto('/login')
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [TOKEN_KEY, token])
  await page.goto(target)
}

export async function storedToken(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), TOKEN_KEY)
}
