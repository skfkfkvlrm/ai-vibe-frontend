import { expect, test, type Page } from '@playwright/test'
import { adminMembers, login, requireToken } from './helpers/api'
import { ACCOUNTS, displayName } from './helpers/env'
import { loginAs } from './helpers/session'

// 같은 대상 계정(e2e_t1, e2e_t2)의 상태를 이어서 바꾸므로 순서대로 실행한다.
test.describe.configure({ mode: 'serial' })

function rowOf(page: Page, loginId: string) {
  return page.getByRole('row', { name: new RegExp(loginId) })
}

/** 서버에 반영된 역할·상태를 관리자 API로 직접 읽는다(화면 표시와 별개의 확인). */
async function serverState(loginId: string): Promise<{ role: string; status: string }> {
  const token = await requireToken(ACCOUNTS.admin)
  const row = (await adminMembers(token)).find((m) => m.login_id === loginId)
  if (!row) throw new Error(`${loginId}가 관리자 목록에 없습니다.`)
  return { role: row.role, status: row.status }
}

async function openAsAdmin(page: Page) {
  await loginAs(page, ACCOUNTS.admin, '/admin/members')
  await expect(page.getByRole('heading', { name: '회원 관리' })).toBeVisible()
  await expect(rowOf(page, ACCOUNTS.target1)).toBeVisible()
}

test.describe('관리자 회원 관리', () => {
  test('D1 헤더 메뉴와 접근: ADMIN에게만 보이고 일반 회원은 목록으로 간다', async ({ page }) => {
    await loginAs(page, ACCOUNTS.user, '/')
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: `${displayName(ACCOUNTS.user)}님` })).toBeVisible()
    await expect(nav.getByRole('link', { name: '회원 관리' })).toHaveCount(0)
    await page.goto('/admin/members')
    await expect(page).toHaveURL(/\/$/)

    await loginAs(page, ACCOUNTS.admin, '/')
    await expect(nav.getByRole('link', { name: '회원 관리' })).toBeVisible()
    await nav.getByRole('link', { name: '회원 관리' }).click()
    await expect(page).toHaveURL(/\/admin\/members$/)
    await expect(page.getByRole('heading', { name: '회원 관리' })).toBeVisible()
  })

  test('D2 표에 e2e 회원이 보이고 본인 행의 ADMIN 해제는 비활성이다', async ({ page }) => {
    await openAsAdmin(page)
    for (const loginId of [ACCOUNTS.admin, ACCOUNTS.user, ACCOUNTS.target1, ACCOUNTS.target2]) {
      await expect(rowOf(page, loginId)).toBeVisible()
    }
    const self = rowOf(page, ACCOUNTS.admin)
    await expect(self.getByRole('button', { name: 'ADMIN 해제' })).toBeDisabled()
    await expect(self.getByRole('button', { name: '밴', exact: true })).toBeDisabled()
  })

  test('D3 승격·해제: 취소하면 서버에 보내지 않고, 확인하면 역할이 바뀐다', async ({ page }) => {
    await openAsAdmin(page)
    const row = rowOf(page, ACCOUNTS.target1)

    // 취소: 확인 단계가 열렸다가 닫히고 서버 상태는 그대로
    await row.getByRole('button', { name: 'ADMIN 승격' }).click()
    await expect(row.getByText('ADMIN 승격할까요?')).toBeVisible()
    await row.getByRole('button', { name: '취소' }).click()
    await expect(row.getByRole('button', { name: 'ADMIN 승격' })).toBeVisible()
    expect((await serverState(ACCOUNTS.target1)).role).toBe('USER')

    // 확인: 승격
    await row.getByRole('button', { name: 'ADMIN 승격' }).click()
    await row.getByRole('button', { name: '확인' }).click()
    await expect(page.getByText(`${ACCOUNTS.target1}님의 역할을 ADMIN로 바꿨습니다.`)).toBeVisible()
    await expect(row.getByRole('button', { name: 'ADMIN 해제' })).toBeVisible()
    expect((await serverState(ACCOUNTS.target1)).role).toBe('ADMIN')
    // 관리자는 밴할 수 없다
    await expect(row.getByRole('button', { name: '밴', exact: true })).toBeDisabled()

    // 해제
    await row.getByRole('button', { name: 'ADMIN 해제' }).click()
    await row.getByRole('button', { name: '확인' }).click()
    await expect(page.getByText(`${ACCOUNTS.target1}님의 역할을 USER로 바꿨습니다.`)).toBeVisible()
    await expect(row.getByRole('button', { name: 'ADMIN 승격' })).toBeVisible()
    expect((await serverState(ACCOUNTS.target1)).role).toBe('USER')
  })

  test('D4 밴: 사유 입력 후 확인하면 밴되어 로그인이 막히고, 해제하면 다시 로그인된다', async ({ page }) => {
    await openAsAdmin(page)
    const row = rowOf(page, ACCOUNTS.target2)

    await row.getByRole('button', { name: '밴', exact: true }).click()
    const form = page.locator('form.ban-form')
    await expect(form.getByRole('heading', { name: `${ACCOUNTS.target2}님 밴` })).toBeVisible()
    await form.getByLabel('기간').selectOption('7D')
    await form.getByLabel('사유').fill('자동 테스트 밴')
    await form.getByRole('button', { name: '밴', exact: true }).click()
    // 확인 단계
    await expect(form.getByText('정말 밴할까요?')).toBeVisible()
    await form.getByRole('button', { name: '확인' }).click()

    await expect(page.getByText(`${ACCOUNTS.target2}님을 밴했습니다.`)).toBeVisible()
    await expect(row).toContainText('밴 (')
    await expect(row).toContainText('자동 테스트 밴')
    expect((await serverState(ACCOUNTS.target2)).status).toBe('BANNED')
    const banned = await login(ACCOUNTS.target2)
    expect(banned.status).toBe(403)
    expect((banned.body as { code: string }).code).toBe('BANNED')

    // 해제
    await row.getByRole('button', { name: '밴 해제' }).click()
    await expect(row.getByText('밴 해제할까요?')).toBeVisible()
    await row.getByRole('button', { name: '확인' }).click()
    await expect(page.getByText(`${ACCOUNTS.target2}님의 밴을 해제했습니다.`)).toBeVisible()
    await expect(row).toContainText('정상')
    expect((await serverState(ACCOUNTS.target2)).status).toBe('ACTIVE')
    expect((await login(ACCOUNTS.target2)).status).toBe(200)
  })
})
