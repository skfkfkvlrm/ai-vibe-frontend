import { execFileSync } from 'node:child_process'
import { E2E_PREFIX } from './env'

// 접속 정보는 환경변수에서만 읽는다. 비밀번호는 코드·로그에 남기지 않고 MYSQL_PWD로만 전달한다.
const MYSQL_BIN = process.env.MYSQL_BIN ?? 'C:\\Program Files\\MySQL\\MySQL Server 8.2\\bin\\mysql.exe'
const HOST = process.env.DB_HOST ?? 'localhost'
const PORT = process.env.DB_PORT ?? '3306'
const NAME = process.env.DB_NAME ?? 'dbdemoboard'
const USER = process.env.DB_USERNAME ?? 'demoboard'

/** 한 번에 지울 수 있는 e2e 행의 상한. 넘으면 조건이 잘못된 것으로 보고 중단한다. */
const MAX_E2E_ROWS = 10

/** LIKE 패턴: e2e_로 시작(밑줄은 이스케이프). */
const LIKE = `${E2E_PREFIX.replace('_', '\\_')}%`

function sql(statement: string): string {
  const password = process.env.DB_PASSWORD
  if (!password) {
    throw new Error('DB_PASSWORD 환경변수가 필요합니다. (e2e 계정 정리·ADMIN 지정에 DB 접속을 씁니다.)')
  }
  try {
    return execFileSync(
      MYSQL_BIN,
      ['-h', HOST, '-P', PORT, '-u', USER, NAME, '--batch', '--skip-column-names', '--default-character-set=utf8mb4', '-e', statement],
      { env: { ...process.env, MYSQL_PWD: password }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
  } catch (e) {
    const err = e as { stderr?: string; message: string }
    throw new Error(`mysql 실행 실패(${MYSQL_BIN}): ${(err.stderr ?? err.message).toString().trim()}`)
  }
}

function count(statement: string): number {
  return Number(sql(statement).trim())
}

/** e2e_ 접두사 계정과 그 로그인 시도 기록만 지운다. 상한을 넘으면 아무것도 지우지 않고 실패한다. */
export function cleanupE2eAccounts(): void {
  const rows = count(`SELECT COUNT(*) FROM mall_member WHERE login_id LIKE '${LIKE}'`)
  if (rows > MAX_E2E_ROWS) {
    throw new Error(`e2e_ 계정이 ${rows}건으로 상한(${MAX_E2E_ROWS})을 넘어 정리를 중단합니다. 조건을 확인하세요.`)
  }
  sql(`DELETE FROM mall_login_attempt WHERE login_id LIKE '${LIKE}'`)
  sql(`DELETE FROM mall_member WHERE login_id LIKE '${LIKE}'`)
}

/** e2e 계정 한 건을 ADMIN으로 올린다. e2e_ 접두사가 아니면 거부한다. */
export function promoteToAdmin(loginId: string): void {
  if (!loginId.startsWith(E2E_PREFIX) || !/^[a-z0-9_]+$/.test(loginId)) {
    throw new Error(`e2e 전용 계정만 ADMIN으로 올릴 수 있습니다: ${loginId}`)
  }
  sql(`UPDATE mall_member SET role='ADMIN' WHERE login_id='${loginId}' AND login_id LIKE '${LIKE}'`)
  const role = sql(`SELECT role FROM mall_member WHERE login_id='${loginId}'`).trim()
  if (role !== 'ADMIN') throw new Error(`${loginId}의 ADMIN 지정을 확인하지 못했습니다(role=${role || '없음'}).`)
}

/** 남아 있는 e2e 행 수(회원, 로그인 시도). 정리 결과 확인용. */
export function remainingE2eRows(): { members: number; attempts: number } {
  return {
    members: count(`SELECT COUNT(*) FROM mall_member WHERE login_id LIKE '${LIKE}'`),
    attempts: count(`SELECT COUNT(*) FROM mall_login_attempt WHERE login_id LIKE '${LIKE}'`),
  }
}
