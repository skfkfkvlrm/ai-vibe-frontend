import { useCallback, useEffect, useState } from 'react'
import { createNote, deleteNote, listNotes, updateNote } from './api/notes'
import type { Note } from './api/notes'
import './App.css'

const formatTime = (iso: string) => new Date(iso).toLocaleString('ko-KR')

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      <h1>Notes</h1>

      <form onSubmit={submit} className="note-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          rows={3}
        />
        <div className="actions">
          <button type="submit">{editingId === null ? '추가' : '수정 저장'}</button>
          {editingId !== null && (
            <button type="button" onClick={reset}>
              취소
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="note-list">
        {notes.map((note) => (
          <li key={note.id}>
            <strong>{note.title}</strong>
            <p>{note.content}</p>
            <small className="note-time">
              {formatTime(note.updatedAt)}
            </small>
            <div className="actions">
              <button type="button" onClick={() => edit(note)}>
                수정
              </button>
              <button type="button" onClick={() => remove(note)}>
                삭제
              </button>
            </div>
          </li>
        ))}
        {notes.length === 0 && !error && <li>노트가 없습니다.</li>}
      </ul>
    </main>
  )
}

export default App
