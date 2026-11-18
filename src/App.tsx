import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { createNote, deleteNote, listNotes, updateNote } from './api/notes'
import type { Note } from './api/notes'
import './App.css'

const formatTime = (iso: string) => new Date(iso).toLocaleString('ko-KR')

type Theme = 'light' | 'dark'
const THEME_KEY = 'theme'

// 저장된 선택이 있으면 그것을, 없으면 OS 설정을 따른다.
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // 저장소에 접근할 수 없으면 OS 설정을 사용한다.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // 저장하지 못해도 현재 화면의 테마는 바뀐다.
    }
  }

  const load = useCallback(async () => {
    try {
      setNotes(await listNotes())
      setError(null)
    } catch (e) {
      setError(`목록 조회 실패: ${(e as Error).message}`)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const reset = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const action = editingId === null ? '추가' : '수정'
    if (!window.confirm(`"${title}" 노트를 ${action}할까요?`)) return
    try {
      if (editingId === null) {
        await createNote({ title, content })
      } else {
        await updateNote(editingId, { title, content })
      }
      reset()
      await load()
    } catch (err) {
      setError(`저장 실패: ${(err as Error).message}`)
    }
  }

  const edit = (note: Note) => {
    setEditingId(note.id)
    setTitle(note.title)
    setContent(note.content ?? '')
  }

  const remove = async (note: Note) => {
    if (!window.confirm(`"${note.title}" 노트를 삭제할까요?`)) return
    const id = note.id
    try {
      await deleteNote(id)
      if (editingId === id) reset()
      await load()
    } catch (err) {
      setError(`삭제 실패: ${(err as Error).message}`)
    }
  }

  return (
    <main className="notes">
      <header className="notes-header">
        <h1>Notes</h1>
        <button
          type="button"
          className="btn"
          onClick={toggleTheme}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? '☀️ 라이트' : '🌙 다크'}
        </button>
      </header>

      <form onSubmit={submit} className="note-form panel">
        <div className="field">
          <label htmlFor="note-title">제목</label>
          <input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="note-content">내용</label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용"
            rows={3}
          />
        </div>
        <div className="actions">
          <button type="submit" className="btn btn-primary">
            {editingId === null ? '추가' : '수정 저장'}
          </button>
          {editingId !== null && (
            <button type="button" className="btn" onClick={reset}>
              취소
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="note-list">
        {notes.map((note) => (
          <li key={note.id} className="panel">
            <strong className="note-title">{note.title}</strong>
            <p className="note-content">{note.content}</p>
            <small className="note-time">{formatTime(note.updatedAt)}</small>
            <div className="actions">
              <button type="button" className="btn" onClick={() => edit(note)}>
                수정
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => remove(note)}
              >
                삭제
              </button>
            </div>
          </li>
        ))}
        {notes.length === 0 && !error && <li className="empty panel">노트가 없습니다.</li>}
      </ul>
    </main>
  )
}

export default App
