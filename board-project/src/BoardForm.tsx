import { useId, useState, type FormEvent } from 'react'
import { errorMessage, type BoardInput } from './api/boards'

interface Props {
  title: string
  submitLabel: string
  initial?: { name: string; subject: string; content: string }
  onSubmit: (input: BoardInput) => Promise<void>
  onCancel: () => void
}

/** 글쓰기·답글·수정이 함께 쓰는 인라인 폼. */
function BoardForm({ title, submitLabel, initial, onSubmit, onCancel }: Props) {
  const uid = useId()
  const [name, setName] = useState(initial?.name ?? '')
  const [pass, setPass] = useState('')
  const [subject, setSubject] = useState(initial?.subject ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !pass || !subject.trim()) {
      setError('작성자, 비밀번호, 제목은 필수입니다.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        board_name: name.trim(),
        board_pass: pass,
        board_subject: subject.trim(),
        board_content: content,
      })
    } catch (err) {
      setError(errorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <form className="board-form" onSubmit={handleSubmit}>
      <h3>{title}</h3>
      <div className="board-form-row">
        <label htmlFor={`${uid}-name`}>작성자</label>
        <input
          id={`${uid}-name`}
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="board-form-row">
        <label htmlFor={`${uid}-pass`}>비밀번호</label>
        <input
          id={`${uid}-pass`}
          type="password"
          autoComplete="off"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
      </div>
      <div className="board-form-row">
        <label htmlFor={`${uid}-subject`}>제목</label>
        <input
          id={`${uid}-subject`}
          value={subject}
          maxLength={300}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div className="board-form-row">
        <label htmlFor={`${uid}-content`}>내용</label>
        <textarea
          id={`${uid}-content`}
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="board-form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '처리 중...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          취소
        </button>
      </div>
    </form>
  )
}

export default BoardForm
