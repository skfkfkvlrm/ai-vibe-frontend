/** 백엔드 주소. 화면(vite)의 /api 프록시는 vite.config.ts의 8086으로 고정이므로 기본값과 같게 둔다. */
export const BACKEND = process.env.E2E_BACKEND_URL ?? 'http://localhost:8086'

/** e2e 전용 계정은 모두 이 접두사로 시작한다. DB 정리는 이 접두사에만 적용된다. */
export const E2E_PREFIX = 'e2e_'

export const PASSWORD = 'E2e-pass-123'

export const ACCOUNTS = {
  admin: 'e2e_adm',
  user: 'e2e_usr',
  my: 'e2e_my',
  target1: 'e2e_t1',
  target2: 'e2e_t2',
  /** UI 가입 시나리오에서 만든다(setup에서는 만들지 않음). */
  signup: 'e2e_new',
} as const

/** localStorage에 로그인 토큰을 두는 키(src/auth/token.ts와 같다). */
export const TOKEN_KEY = 'jwt_token'

export function displayName(loginId: string): string {
  return `E2E ${loginId}`
}

export function emailOf(loginId: string): string {
  return `${loginId}@example.com`
}
