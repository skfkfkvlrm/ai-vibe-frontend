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
}

const BASE = '/api/boards'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export const listBoards = (signal?: AbortSignal) =>
  request<Board[]>(BASE, { signal })

/** 단건 조회. 호출될 때마다 서버의 board_readcount가 1 증가한다. */
export const getBoard = (id: number) => request<Board>(`${BASE}/${id}`)
