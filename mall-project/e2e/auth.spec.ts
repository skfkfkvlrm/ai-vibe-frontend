import { expect, test } from '@playwright/test'
import { ACCOUNTS, PASSWORD, TOKEN_KEY, emailOf } from './helpers/env'
import { storedToken } from './helpers/session'

const NEW_NAME = 'E2E 신규회원'

test.describe('로그인·가입', () => {
  test('A1 UI 가입 → 로그인 → 헤더 표시 → 새로고침 유지 → 로그아웃', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('아이디').fill(ACCOUNTS.signup)
    await page.getByLabel('비밀번호', { exact: true }).fill(PASSWORD)
    await page.getByLabel('비밀번호 확인').fill(PASSWORD)
    await page.getByLabel('이름').fill(NEW_NAME)
    await page.getByLabel('이메일').fill(emailOf(ACCOUNTS.signup))
    await page.getByRole('button', { name: '가입하기' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByText('가입이 완료되었습니다. 로그인해 주세요.')).toBeVisible()

    await page.getByLabel('아이디').fill(ACCOUNTS.signup)
    await page.getByLabel('비밀번호').fill(PASSWORD)
    await page.getByRole('button', { name: '로그인', exact: true }).click()

    const nameLink = page.getByRole('link', { name: `${NEW_NAME}님` })
    await expect(nameLink).toBeVisible()
    await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('link', { name: '회원가입' })).toHaveCount(0)
    expect(await storedToken(page)).not.toBeNull()

    await page.reload()
    await expect(nameLink).toBeVisible()

    await page.getByRole('button', { name: '로그아웃' }).click()
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: '로그인', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: '회원가입' })).toBeVisible()
    await expect(nameLink).toHaveCount(0)
    expect(await storedToken(page)).toBeNull()
  })

  test('A2 틀린 비밀번호는 오류 안내를 보이고 로그인 화면에 머문다', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('아이디').fill(ACCOUNTS.user)
    await page.getByLabel('비밀번호').fill('wrong-password-1')
    await page.getByRole('button', { name: '로그인', exact: true }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
    expect(await storedToken(page)).toBeNull()
  })

  test('A3 무효 토큰으로 마이페이지에 가면 로그인 화면으로 간다', async ({ page }) => {
    await page.goto('/login')
    await page.evaluate((key) => localStorage.setItem(key, 'garbage.token.value'), TOKEN_KEY)
    await page.goto('/mypage')

    await expect(page).toHaveURL(/\/login$/)
    // 로그인 화면 본문에도 같은 문구의 링크가 있으므로 헤더 안내만 본다.
    await expect(page.getByRole('navigation').getByRole('link', { name: '회원가입' })).toBeVisible()
  })
})
