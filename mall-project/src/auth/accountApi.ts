import { ApiError, type Member, type TokenResponse } from './api'
import { AUTH_EXPIRED_EVENT } from './events'
import { getToken } from './token'

const BASE = '/api/members/me'

/** 토큰을 붙여 요청한다. 토큰을 보냈는데 401이 오면 로그아웃 처리를 요청한다. */
async function request<T>(url: string, init: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    throw new ApiError(res.status, `${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

/** 이름·이메일 수정. */
export const updateProfile = (input: { name?: string; email?: string }) =>
  request<Member>(BASE, { method: 'PATCH', body: JSON.stringify(input) })

/** 비밀번호 변경. 이전 토큰은 모두 무효가 되고 응답의 새 토큰으로 현재 로그인을 이어간다. */
export const changePassword = (current_password: string, new_password: string) =>
  request<TokenResponse>(`${BASE}/password`, {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  })

export function accountErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 403) return '현재 비밀번호가 일치하지 않습니다.'
    if (e.status === 409) return '이미 사용 중인 이메일입니다.'
    if (e.status === 400) return '입력값을 확인해 주세요. (새 비밀번호는 8자 이상이며 현재 비밀번호와 달라야 합니다.)'
    if (e.status === 401) return '로그인이 필요하거나 로그인 정보가 변경되었습니다.'
  }
  return '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}
