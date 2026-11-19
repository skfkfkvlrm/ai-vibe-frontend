import { ApiError, asBanInfo, banMessage, request, retryAfterSeconds, waitText } from '../../shared/http'

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

const BASE = '/api/boards'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/** 검색 조건: 제목+내용 또는 작성자 */
export type SearchField = 'TITLE_CONTENT' | 'AUTHOR'

export const PAGE_SIZES = [10, 20, 50] as const
export type PageSize = (typeof PAGE_SIZES)[number]

/** 서버가 허용하는 검색어 최대 길이 */
export const MAX_QUERY_LENGTH = 100

export interface ListParams {
  /** 0부터 시작 */
  page: number
  size: PageSize
  field: SearchField
  /** 빈 문자열이면 검색하지 않는다 */
  q: string
}

/** 목록 한 페이지. items는 해당 페이지의 원글과 그 답글이며, 건수·페이지 수는 원글 기준이다. */
export interface BoardPage {
  items: Board[]
  page: number
  size: number
  total_elements: number
  total_pages: number
}

export const listBoards = (params: ListParams, signal?: AbortSignal) => {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.q) {
    query.set('field', params.field)
    query.set('q', params.q)
  }
  return request<BoardPage>(`${BASE}?${query}`, { signal })
}

/** 단건 조회. count가 true(기본)이면 서버의 board_readcount가 1 증가하고, false이면 올리지 않는다. */
export const getBoard = (id: number, options?: { count?: boolean }) =>
  request<Board>(`${BASE}/${id}${options?.count === false ? '?count=false' : ''}`)

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
    if (e.status === 403) {
      const ban = asBanInfo(e.body)
      return ban ? banMessage(ban) : '권한이 없거나 비밀번호가 일치하지 않습니다.'
    }
    if (e.status === 404) return '이미 삭제되었거나 존재하지 않는 글입니다.'
    if (e.status === 400) return '입력값을 확인해 주세요.'
    if (e.status === 429) {
      const wait = retryAfterSeconds(e.body)
      return `글쓰기가 너무 잦습니다.${wait ? ` ${waitText(wait)} 후` : ' 잠시 후'} 다시 시도해 주세요.`
    }
  }
  return e instanceof Error ? e.message : '요청에 실패했습니다.'
}
