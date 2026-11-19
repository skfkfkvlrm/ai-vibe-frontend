import type { Member } from './auth'
import { ApiError, request, type Board } from './boards'

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

const BASE = '/api/admin'

export const listDeletedBoards = (signal?: AbortSignal) =>
  request<DeletedBoard[]>(`${BASE}/boards/deleted`, { signal })

/** 선택한 글 1건만 복구한다. */
export const restoreBoard = (id: number) =>
  request<Board>(`${BASE}/boards/${id}/restore`, { method: 'POST' })

export const listMembers = (signal?: AbortSignal) =>
  request<Member[]>(`${BASE}/members`, { signal })

export function adminErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 403) return '관리자 권한이 필요합니다.'
    if (e.status === 404) return '이미 복구되었거나 존재하지 않는 글입니다.'
    if (e.status === 401) return '로그인이 필요하거나 로그인이 만료되었습니다.'
  }
  return e instanceof Error ? e.message : '요청에 실패했습니다.'
}
