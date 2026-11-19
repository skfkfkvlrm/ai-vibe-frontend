import { backendHealthy, signup } from './helpers/api'
import { cleanupE2eAccounts, promoteToAdmin } from './helpers/db'
import { ACCOUNTS, BACKEND } from './helpers/env'

/** 실행 전 준비: 백엔드 확인 → 이전 잔여 e2e 데이터 정리 → 계정 가입 → e2e_adm만 ADMIN 지정. */
export default async function globalSetup(): Promise<void> {
  const health = await backendHealthy()
  if (!health.ok) {
    throw new Error(
      `백엔드(${BACKEND}/health)에 연결할 수 없습니다(${health.detail}). pc-mall을 먼저 기동하세요.`,
    )
  }

  cleanupE2eAccounts()
  try {
    for (const loginId of [ACCOUNTS.admin, ACCOUNTS.user, ACCOUNTS.my, ACCOUNTS.target1, ACCOUNTS.target2]) {
      await signup(loginId)
    }
    promoteToAdmin(ACCOUNTS.admin)
  } catch (e) {
    // setup이 실패하면 teardown이 돌지 않을 수 있으므로 여기서 직접 정리한다.
    cleanupE2eAccounts()
    throw e
  }
}
