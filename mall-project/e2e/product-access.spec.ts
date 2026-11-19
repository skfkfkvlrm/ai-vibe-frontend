import { expect, test, type Page } from '@playwright/test'
import { firstProductId } from './helpers/api'
import { ACCOUNTS, displayName } from './helpers/env'
import { loginAs } from './helpers/session'

// 상품 쓰기 화면은 ADMIN만 쓴다. 이 스펙은 버튼 표시와 접근 이동만 확인하고 상품을 저장하지 않는다.

/** 헤더가 로그인 복원을 마칠 때까지 기다린다(복원 전에는 항상 비로그인처럼 보이므로 부재 검사가 헛통과할 수 있다). */
async function waitUntilReady(page: Page, loginId: string | null) {
  const nav = page.getByRole('navigation')
  if (loginId) {
    await expect(nav.getByRole('link', { name: `${displayName(loginId)}님` })).toBeVisible()
  } else {
    await expect(nav.getByRole('link', { name: '로그인', exact: true })).toBeVisible()
  }
}

test.describe('상품 쓰기 화면 접근', () => {
  let productId: number | null = null

  test.beforeAll(async () => {
    productId = await firstProductId()
  })

  test('P1 비로그인: 등록 버튼이 없고 등록·수정 주소는 로그인 화면으로 간다', async ({ page }) => {
    await page.goto('/')
    await waitUntilReady(page, null)
    await expect(page.getByRole('heading', { name: '제품 목록' })).toBeVisible()
    await expect(page.getByRole('link', { name: '새 제품 등록' })).toHaveCount(0)

    await page.goto('/products/new')
    await expect(page).toHaveURL(/\/login$/)
    await page.goto('/products/1/edit')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('P2 일반 회원: 등록 버튼이 없고 등록·수정 주소는 목록으로 간다', async ({ page }) => {
    await loginAs(page, ACCOUNTS.user, '/')
    await waitUntilReady(page, ACCOUNTS.user)
    await expect(page.getByRole('heading', { name: '제품 목록' })).toBeVisible()
    await expect(page.getByRole('link', { name: '새 제품 등록' })).toHaveCount(0)

    await page.goto('/products/new')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: '제품 목록' })).toBeVisible()
    await page.goto('/products/1/edit')
    await expect(page).toHaveURL(/\/$/)
  })

  test('P3 ADMIN: 등록 버튼으로 등록 폼이 열린다(저장하지 않음)', async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin, '/')
    await waitUntilReady(page, ACCOUNTS.admin)
    await page.getByRole('link', { name: '새 제품 등록' }).click()
    await expect(page).toHaveURL(/\/products\/new$/)
    await expect(page.getByRole('heading', { name: '새 제품 등록' })).toBeVisible()
  })

  test('P4 상품 상세: 비로그인·일반 회원에게 수정 버튼이 없고 ADMIN에게는 있다(저장하지 않음)', async ({ page }) => {
    test.skip(productId === null, '표시할 기존 상품이 없어 상세 화면 시나리오를 건너뜁니다.')
    const detail = `/products/${productId}`

    await page.goto(detail)
    await waitUntilReady(page, null)
    await expect(page.getByRole('link', { name: '← 목록으로' })).toBeVisible()
    await expect(page.getByRole('link', { name: '수정', exact: true })).toHaveCount(0)

    await loginAs(page, ACCOUNTS.user, detail)
    await waitUntilReady(page, ACCOUNTS.user)
    await expect(page.getByRole('link', { name: '← 목록으로' })).toBeVisible()
    await expect(page.getByRole('link', { name: '수정', exact: true })).toHaveCount(0)

    await loginAs(page, ACCOUNTS.admin, detail)
    await waitUntilReady(page, ACCOUNTS.admin)
    await page.getByRole('link', { name: '수정', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/products/${productId}/edit$`))
    await expect(page.getByRole('heading', { name: '제품 수정' })).toBeVisible()
  })
})
