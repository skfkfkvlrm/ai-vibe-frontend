export interface Note {
  id: number
  title: string
  content: string | null
  createdAt: string
  updatedAt: string
}

export interface NoteInput {
  title: string
  content: string
}

const BASE = '/api/notes'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

export const listNotes = () => request<Note[]>(BASE)

export const createNote = (input: NoteInput) =>
  request<Note>(BASE, { method: 'POST', body: JSON.stringify(input) })

export const updateNote = (id: number, input: NoteInput) =>
  request<Note>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteNote = (id: number) =>
  request<void>(`${BASE}/${id}`, { method: 'DELETE' })
