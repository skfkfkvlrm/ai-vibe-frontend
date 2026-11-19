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
  /** 오류 응답 본문(JSON이면 파싱한 값). 밴 안내(code: 'BANNED') 등을 읽는 데 쓴다. */
  body?: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

/** 밴 중인 회원에게 서버가 내려주는 안내. until이 null이면 영구 밴이다. */
export interface BanInfo {
  code: 'BANNED'
  reason: string | null
  until: string | null
  permanent: boolean
}

export function asBanInfo(body: unknown): BanInfo | null {
  if (typeof body === 'object' && body !== null && (body as { code?: unknown }).code === 'BANNED') {
    return body as BanInfo
  }
  return null
}

export function banMessage(info: BanInfo): string {
  const until = info.permanent || !info.until ? '영구' : info.until.slice(0, 16).replace('T', ' ') + '까지'
  const reason = info.reason ? ` 사유: ${info.reason}.` : ''
  return `이용이 제한된 계정입니다.${reason} 제한 기간: ${until}`
}

/** 429 응답 본문에서 다시 시도할 수 있을 때까지 남은 초를 읽는다. 없으면 null. */
export function retryAfterSeconds(body: unknown): number | null {
  const v = typeof body === 'object' && body !== null ? (body as { retry_after_seconds?: unknown }).retry_after_seconds : null
  return typeof v === 'number' && v > 0 ? v : null
}

/** 60초 이상은 올림한 분, 그보다 짧으면 초로 표시한다. */
export function waitText(seconds: number): string {
  return seconds >= 60 ? `${Math.ceil(seconds / 60)}분` : `${seconds}초`
}

/** 오류 응답 본문을 JSON으로 읽는다. 본문이 없거나 JSON이 아니면 undefined. */
export async function readErrorBody(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    return undefined
  }
}

/** 토큰을 보냈는데 401이 오면(만료·무효) 발생하는 이벤트. AuthProvider가 받아 로그아웃 처리한다. */
export const AUTH_EXPIRED_EVENT = 'auth:expired'

const BASE = '/api/boards'

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    if (res.status === 401 && token) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    throw new ApiError(res.status, `${res.status} ${res.statusText}`, await readErrorBody(res))
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
