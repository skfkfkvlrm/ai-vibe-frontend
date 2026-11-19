import { ApiError, request } from '../../shared/http'
import type { Board } from '../board/api'

/** 관리자용 삭제된 글·답글 한 건. root_deleted는 답글의 원글도 삭제 상태인지 여부. */
export interface DeletedBoard {
  board_num: number
  board_name: string
  board_subject: string
  board_content: string | null
  re_ref: number
  re_lev: number
  member_id: number | null
  board_date: string
  deleted_at: string
  root_deleted: boolean
}

/** 관리자용 회원 한 건. banned_permanent가 true이면 영구 밴(banned_until 없음). */
export interface AdminMember {
  member_id: number
  login_id: string
  name: string
  email: string
  role: string
  created_at: string
  status: 'ACTIVE' | 'BANNED' | 'WITHDRAWN'
  ban_reason: string | null
  banned_until: string | null
  banned_permanent: boolean
  withdrawn_at: string | null
  password_reset_pending: boolean
}

/** 감사 로그 한 건. admin_id가 null이면 시스템 기록(예: 로그인 잠금)이다. */
export interface AuditLog {
  audit_id: number
  admin_id: number | null
  admin_login_id: string | null
  action: string
  target_type: string
  target_id: number | null
  detail: string | null
  created_at: string
}

/** 1D·7D·30D: 지금부터 N일, PERMANENT: 영구, UNTIL: until에 지정한 미래 시각까지 */
export type BanType = '1D' | '7D' | '30D' | 'PERMANENT' | 'UNTIL'

const BASE = '/api/admin'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const listDeletedBoards = (signal?: AbortSignal) =>
  request<DeletedBoard[]>(`${BASE}/boards/deleted`, { signal })

/** 선택한 글 1건만 복구한다. */
export const restoreBoard = (id: number) =>
  request<Board>(`${BASE}/boards/${id}/restore`, { method: 'POST' })

/** 최신 200건, 최신순. 조회 전용. */
export const listAuditLogs = (signal?: AbortSignal) =>
  request<AuditLog[]>(`${BASE}/audit-logs`, { signal })

export const listMembers =(signal?: AbortSignal) =>
  request<AdminMember[]>(`${BASE}/members`, { signal })

export const banMember = (id: number, input: { reason: string; type: BanType; until?: string }) =>
  request<AdminMember>(`${BASE}/members/${id}/ban`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  })

export const unbanMember = (id: number) =>
  request<AdminMember>(`${BASE}/members/${id}/ban`, { method: 'DELETE' })

/** 임시 비밀번호는 이 응답으로 한 번만 전달된다. */
export const resetMemberPassword = (id: number) =>
  request<{ temporary_password: string }>(`${BASE}/members/${id}/reset-password`, { method: 'POST' })

export function adminErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 403) return '관리자 권한이 필요하거나, 관리자·본인 계정은 대상이 될 수 없습니다.'
    if (e.status === 404) return '이미 복구되었거나 존재하지 않는 대상입니다.'
    if (e.status === 409) return '이미 탈퇴한 회원입니다.'
    if (e.status === 400) return '입력값을 확인해 주세요. (사유는 필수이고 해제 시각은 미래여야 합니다.)'
    if (e.status === 401) return '로그인이 필요하거나 로그인이 만료되었습니다.'
  }
  return e instanceof Error ? e.message : '요청에 실패했습니다.'
}
