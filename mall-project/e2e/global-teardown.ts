import { cleanupE2eAccounts, remainingE2eRows } from './helpers/db'

/** 실행 후 정리: e2e_ 계정과 로그인 시도 기록을 지우고 남은 행이 없는지 확인한다. */
export default async function globalTeardown(): Promise<void> {
  cleanupE2eAccounts()
  const left = remainingE2eRows()
  if (left.members !== 0 || left.attempts !== 0) {
    throw new Error(`e2e 데이터 정리 후에도 행이 남았습니다: members=${left.members}, attempts=${left.attempts}`)
  }
}
