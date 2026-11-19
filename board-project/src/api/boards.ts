import { getToken } from '../auth/token'

export interface Board {
  board_num: number
  board_name: string
  board_subject: string
  board_content: string | null
  board_file: string | null
  re_ref: number
  re_lev: number
  re_step: number
  board_readcount: number
  board_date: string
  /** 로그인 회원이 쓴 글이면 작성 회원 ID, 비회원 글(기존 글 포함)이면 null */
  member_id: number | null
}

/**
 * 글·답글 작성/수정 요청 본문.
 * 로그인 상태에서는 board_name·board_pass를 보내지 않는다(서버가 회원 이름을 쓰고 비밀번호는 필요 없다).
 * 비회원 글을 수정할 때는 board_pass가 본인 확인용이다.
 */
export interface BoardInput {
  board_name?: string
  board_pass?: string
  board_subject: string
  board_content: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** 토큰을 보냈는데 401이 오면(만료·무효) 발생하는 이벤트. AuthProvider가 받아 로그아웃 처리한다. */
export const AUTH_EXPIRED_EVENT = 'auth:expired'

const BASE = '/api/boards'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    if (res.status === 401 && token) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    throw new ApiError(res.status, `${res.status} ${res.statusText}`)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const listBoards = (signal?: AbortSignal) =>
  request<Board[]>(BASE, { signal })

/** 단건 조회. 호출될 때마다 서버의 board_readcount가 1 증가한다. */
export const getBoard = (id: number) => request<Board>(`${BASE}/${id}`)

export const createBoard = (input: BoardInput) =>
  request<Board>(BASE, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  })

/** parentId 글(원글 또는 답글)에 답글을 단다. */
export const replyBoard = (parentId: number, input: BoardInput) =>
  request<Board>(`${BASE}/${parentId}/replies`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  })

// PUT은 보내지 않은 board_file을 지우므로, 보낸 필드만 바꾸는 PATCH를 쓴다.
export const updateBoard = (id: number, input: BoardInput) =>
  request<Board>(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  })

/** 서버에서 soft delete 된다(DB 행은 유지). 비회원 글만 pass가 필요하다. */
export const deleteBoard = (id: number, pass?: string) =>
  request<void>(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: pass ? { 'X-Board-Pass': pass } : undefined,
  })

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return '로그인이 필요하거나 로그인이 만료되었습니다.'
    if (e.status === 403) return '권한이 없거나 비밀번호가 일치하지 않습니다.'
    if (e.status === 404) return '이미 삭제되었거나 존재하지 않는 글입니다.'
    if (e.status === 400) return '입력값을 확인해 주세요.'
  }
  return e instanceof Error ? e.message : '요청에 실패했습니다.'
}
