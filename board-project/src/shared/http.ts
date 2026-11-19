import { getToken } from './token'

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

/** 토큰이 있으면 Authorization 헤더를 붙여 요청하고, 실패하면 ApiError를 던진다. */
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
