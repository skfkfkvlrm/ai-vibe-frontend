import { ApiError, asBanInfo, banMessage, readErrorBody, retryAfterSeconds, waitText } from './boards'

export interface Member {
  member_id: number
  login_id: string
  name: string
  email: string
  role: string
  created_at: string
  /** 관리자가 임시 비밀번호로 초기화한 뒤 아직 바꾸지 않았으면 true */
  password_reset_pending: boolean
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

const BASE = '/api/auth'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText}`, await readErrorBody(res))
  }
  return (await res.json()) as T
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const signup = (input: SignupInput) =>
  request<Member>(`${BASE}/signup`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  })

export const login = (login_id: string, password: string) =>
  request<TokenResponse>(`${BASE}/login`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ login_id, password }),
  })

export const me = (token: string) =>
  request<Member>(`${BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })

export function authErrorMessage(e: unknown, kind: 'login' | 'signup'): string {
  if (e instanceof ApiError) {
    if (kind === 'login' && e.status === 403) {
      const ban = asBanInfo(e.body)
      if (ban) return banMessage(ban)
    }
    if (kind === 'login' && e.status === 429) {
      const wait = retryAfterSeconds(e.body)
      return `로그인 실패가 반복되어 일시적으로 잠겼습니다.${wait ? ` ${waitText(wait)} 후` : ' 잠시 후'} 다시 시도해 주세요.`
    }
    if (kind === 'login' && e.status === 401) return '아이디 또는 비밀번호가 올바르지 않습니다.'
    if (kind === 'signup' && e.status === 409) return '이미 사용 중인 아이디 또는 이메일입니다.'
    if (e.status === 400) return '입력값을 확인해 주세요.'
  }
  return '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}
