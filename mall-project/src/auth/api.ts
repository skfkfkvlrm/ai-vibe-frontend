export interface Member {
  member_id: number
  login_id: string
  name: string
  email: string
  role: string
  created_at: string
}

export interface SignupInput {
  login_id: string
  password: string
  name: string
  email: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export class ApiError extends Error {
  status: number
  /** 오류 응답 본문(JSON이면 파싱한 값). 밴 안내(code: 'BANNED')·잠금(retry_after_seconds)을 읽는 데 쓴다. */
  body?: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

const BASE = '/api/auth'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      // 본문이 JSON이 아니면 상태 코드만 사용
    }
    throw new ApiError(res.status, `${res.status} ${res.statusText}`, body)
  }
  return (await res.json()) as T
}

export const signup = (input: SignupInput) =>
  request<Member>(`${BASE}/signup`, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(input) })

export const login = (login_id: string, password: string) =>
  request<TokenResponse>(`${BASE}/login`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ login_id, password }),
  })

export const me = (token: string) =>
  request<Member>(`${BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })

function waitText(seconds: number): string {
  return seconds >= 60 ? `${Math.ceil(seconds / 60)}분` : `${seconds}초`
}

export function authErrorMessage(e: unknown, kind: 'login' | 'signup'): string {
  if (e instanceof ApiError) {
    const body = (typeof e.body === 'object' && e.body !== null ? e.body : {}) as Record<string, unknown>
    if (kind === 'login' && e.status === 403 && body.code === 'BANNED') {
      const until =
        body.permanent === true || typeof body.until !== 'string'
          ? '영구'
          : body.until.slice(0, 16).replace('T', ' ') + '까지'
      const reason = typeof body.reason === 'string' && body.reason ? ` 사유: ${body.reason}.` : ''
      return `이용이 제한된 계정입니다.${reason} 제한 기간: ${until}`
    }
    if (kind === 'login' && e.status === 429) {
      const wait = typeof body.retry_after_seconds === 'number' ? body.retry_after_seconds : 0
      return `로그인 실패가 반복되어 일시적으로 잠겼습니다.${wait > 0 ? ` ${waitText(wait)} 후` : ' 잠시 후'} 다시 시도해 주세요.`
    }
    if (kind === 'login' && e.status === 401) return '아이디 또는 비밀번호가 올바르지 않습니다.'
    if (kind === 'signup' && e.status === 409) return '이미 사용 중인 아이디 또는 이메일입니다.'
    if (e.status === 400) return '입력값을 확인해 주세요.'
  }
  return '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}
