import { BACKEND, PASSWORD, displayName, emailOf } from './env'

/** 백엔드를 직접 호출한다(화면을 거치지 않는 준비·확인용). */
async function call(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BACKEND}${path}`, init)
}

export async function backendHealthy(): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await call('/health', { signal: AbortSignal.timeout(5_000) })
    return { ok: res.status === 200, detail: `HTTP ${res.status}` }
  } catch (e) {
    return { ok: false, detail: (e as Error).message }
  }
}

export async function signup(loginId: string): Promise<void> {
  const res = await call('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login_id: loginId, password: PASSWORD, name: displayName(loginId), email: emailOf(loginId) }),
  })
  if (res.status !== 201) throw new Error(`가입 실패(${loginId}): HTTP ${res.status}`)
}

export interface LoginResult {
  status: number
  token: string | null
  body: unknown
}

export async function login(loginId: string, password: string = PASSWORD): Promise<LoginResult> {
  const res = await call('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login_id: loginId, password }),
  })
  const body: unknown = await res.json().catch(() => null)
  const token = res.status === 200 ? (body as { access_token: string }).access_token : null
  return { status: res.status, token, body }
}

export async function requireToken(loginId: string, password: string = PASSWORD): Promise<string> {
  const result = await login(loginId, password)
  if (!result.token) throw new Error(`로그인 실패(${loginId}): HTTP ${result.status}`)
  return result.token
}

export interface AdminMemberRow {
  login_id: string
  role: string
  status: string
}

export async function adminMembers(token: string): Promise<AdminMemberRow[]> {
  const res = await call('/api/admin/members', { headers: { Authorization: `Bearer ${token}` } })
  if (res.status !== 200) throw new Error(`회원 목록 조회 실패: HTTP ${res.status}`)
  return (await res.json()) as AdminMemberRow[]
}

/** 삭제되지 않은 첫 상품의 id. 상품이 없으면 null. */
export async function firstProductId(): Promise<number | null> {
  const res = await call('/api/products')
  if (res.status !== 200) throw new Error(`상품 목록 조회 실패: HTTP ${res.status}`)
  const list = (await res.json()) as { id: number }[]
  return list.length > 0 ? list[0].id : null
}
