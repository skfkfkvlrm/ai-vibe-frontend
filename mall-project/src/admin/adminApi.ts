import { ApiError } from '../auth/api'
import { AUTH_EXPIRED_EVENT } from '../auth/events'
import { getToken } from '../auth/token'

const BASE = '/api/admin/members'

export interface AdminMember {
  member_id: number
  login_id: string
  name: string
  email: string
  role: string
  created_at: string
  status: 'ACTIVE' | 'BANNED'
  ban_reason: string | null
  banned_until: string | null
  banned_permanent: boolean
}

export type BanType = '1D' | '7D' | '30D' | 'PERMANENT' | 'UNTIL'

/** 토큰을 붙여 요청한다. 토큰을 보냈는데 401이 오면 로그아웃 처리를 요청한다. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  if (init?.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    throw new ApiError(res.status, `${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export const getMembers = (signal?: AbortSignal) => request<AdminMember[]>(BASE, { signal })

/** 역할 변경(승격·해제). */
export const setRole = (id: number, role: 'USER' | 'ADMIN') =>
  request<AdminMember>(`${BASE}/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) })

/** 밴. type이 UNTIL이면 until(미래 시각)이 필요하다. */
export const banMember = (id: number, input: { type: BanType; reason: string; until?: string }) =>
  request<AdminMember>(`${BASE}/${id}/ban`, { method: 'POST', body: JSON.stringify(input) })

export const unbanMember = (id: number) => request<AdminMember>(`${BASE}/${id}/ban`, { method: 'DELETE' })

export function adminErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 400) return '입력값을 확인해 주세요. (사유는 필수이며 500자 이하, 직접 지정은 미래 시각이어야 합니다.)'
    if (e.status === 401) return '로그인이 필요하거나 로그인 정보가 변경되었습니다.'
    if (e.status === 403) return '이 작업은 할 수 없습니다. (자기 자신 해제·밴, 관리자 밴은 금지입니다.)'
    if (e.status === 404) return '회원을 찾을 수 없습니다.'
    if (e.status === 409) return '처리할 수 없습니다. (마지막 관리자는 해제할 수 없고, 밴 중인 회원은 먼저 밴을 해제해야 승격할 수 있습니다.)'
  }
  return '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}
