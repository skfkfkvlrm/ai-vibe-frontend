import type { Member, TokenResponse } from './auth'
import { ApiError, asBanInfo, banMessage, request, type Board } from './boards'

const BASE = '/api/members/me'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

/** 이름·이메일 수정. 이름을 바꾸면 서버가 이미 쓴 글의 작성자명도 함께 바꾼다. */
export const updateProfile = (input: { name?: string; email?: string }) =>
  request<Member>(BASE, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(input) })

/** 비밀번호 변경. 이전 토큰은 모두 무효가 되고 응답의 새 토큰으로 현재 로그인을 이어간다. */
export const changePassword = (current_password: string, new_password: string) =>
  request<TokenResponse>(`${BASE}/password`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ current_password, new_password }),
  })

/** 탈퇴(익명화). 되돌릴 수 없다. */
export const withdraw = (password: string) =>
  request<void>(BASE, { method: 'DELETE', headers: JSON_HEADERS, body: JSON.stringify({ password }) })

export const myPosts = (signal?: AbortSignal) => request<Board[]>(`${BASE}/posts`, { signal })

export function accountErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 403) {
      const ban = asBanInfo(e.body)
      return ban ? banMessage(ban) : '현재 비밀번호가 일치하지 않거나 권한이 없습니다.'
    }
    if (e.status === 409) return '이미 사용 중인 이메일입니다.'
    if (e.status === 400) return '입력값을 확인해 주세요. (새 비밀번호는 8자 이상이며 현재 비밀번호와 달라야 합니다.)'
    if (e.status === 401) return '로그인이 필요하거나 로그인 정보가 변경되었습니다.'
  }
  return '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}
