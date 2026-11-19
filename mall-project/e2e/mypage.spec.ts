import { expect, test } from '@playwright/test'
import { login } from './helpers/api'
import { ACCOUNTS, PASSWORD } from './helpers/env'
import { loginAs, storedToken } from './helpers/session'

const NEW_PASSWORD = 'E2e-changed-456'
const NEW_NAME = 'E2E 수정완료'
const NEW_EMAIL = 'e2e_my_changed@example.com'

// 같은 계정(e2e_my)의 상태를 이어서 바꾸므로 순서대로 실행한다.
test.describe.configure({ mode: 'serial' })

test.describe('마이페이지', () => {
  test('M1 비로그인은 로그인 화면으로 이동한다', async ({ page }) => {
    await page.goto('/mypage')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('M2 이름·이메일을 수정하면 저장 안내와 헤더 이름이 바뀌고 새로고침해도 유지된다', async ({ page }) => {
    await loginAs(page, ACCOUNTS.my, '/mypage')
    const profile = page.locator('form', { has: page.getByRole('heading', { name: '내 정보' }) })

    await expect(profile.getByLabel('아이디')).toHaveValue(ACCOUNTS.my)
    await profile.getByLabel('이름').fill(NEW_NAME)
    await profile.getByLabel('이메일').fill(NEW_EMAIL)
    await profile.getByRole('button', { name: '저장' }).click()

    await expect(page.getByText('저장되었습니다.')).toBeVisible()
    await expect(page.getByRole('link', { name: `${NEW_NAME}님` })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('link', { name: `${NEW_NAME}님` })).toBeVisible()
    await expect(profile.getByLabel('이름')).toHaveValue(NEW_NAME)
    await expect(profile.getByLabel('이메일')).toHaveValue(NEW_EMAIL)
  })

  test('M3 비밀번호 변경: 현재 비밀번호가 틀리면 오류, 맞으면 성공하고 로그인이 유지된다', async ({ page }) => {
    await loginAs(page, ACCOUNTS.my, '/mypage')
    const form = page.locator('form', { has: page.getByRole('heading', { name: '비밀번호 변경' }) })
    const tokenBefore = await storedToken(page)

    // 틀린 현재 비밀번호
    await form.getByLabel('현재 비밀번호').fill('wrong-current-1')
    await form.getByLabel('새 비밀번호', { exact: true }).fill(NEW_PASSWORD)
    await form.getByLabel('새 비밀번호 확인', { exact: true }).fill(NEW_PASSWORD)
    await form.getByRole('button', { name: '변경' }).click()
    await expect(page.getByRole('alert')).toContainText('현재 비밀번호가 일치하지 않습니다.')

    // 올바른 현재 비밀번호
    await form.getByLabel('현재 비밀번호').fill(PASSWORD)
    await form.getByRole('button', { name: '변경' }).click()
    await expect(page.getByText('비밀번호가 변경되었습니다.')).toBeVisible()

    // 새 토큰으로 바뀌었고, 새로고침해도 마이페이지에 머문다(로그아웃되지 않는다).
    await expect.poll(() => storedToken(page)).not.toBe(tokenBefore)
    await page.reload()
    await expect(page).toHaveURL(/\/mypage$/)
    await expect(page.getByRole('link', { name: `${NEW_NAME}님` })).toBeVisible()

    // 서버 쪽 결과: 옛 비밀번호는 거부, 새 비밀번호는 통과
    expect((await login(ACCOUNTS.my, PASSWORD)).status).toBe(401)
    expect((await login(ACCOUNTS.my, NEW_PASSWORD)).status).toBe(200)
  })
})
