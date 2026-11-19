import { useId, useState, type FormEvent } from 'react'
import { errorMessage, type BoardInput } from './api/boards'

interface Props {
  title: string
  submitLabel: string
  initial?: { name: string; subject: string; content: string }
  /**
   * 로그인 회원 기준으로 작성·수정하는 경우. 작성자는 이 이름으로 자동 입력되고
   * 비밀번호는 필요 없으므로 두 입력란을 숨긴다. 비회원이면 undefined.
   * note는 안내 문구(기본 "로그인 계정"). 관리자가 남의 글을 고칠 때는 "관리자 권한으로 수정"을 쓴다.
   */
  authed?: { name: string; note?: string }
  onSubmit: (input: BoardInput) => Promise<void>
  onCancel: () => void
}

/** 글쓰기·답글·수정이 함께 쓰는 인라인 폼. */
function BoardForm({ title, submitLabel, initial, authed, onSubmit, onCancel }: Props) {
  const uid = useId()
  const [name, setName] = useState(initial?.name ?? '')
  const [pass, setPass] = useState('')
  const [subject, setSubject] = useState(initial?.subject ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!subject.trim()) {
      setError('제목은 필수입니다.')
      return
    }
    if (!authed && (!name.trim() || !pass)) {
      setError('작성자, 비밀번호, 제목은 필수입니다.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(
        authed
          ? { board_subject: subject.trim(), board_content: content }
          : {
              board_name: name.trim(),
              board_pass: pass,
              board_subject: subject.trim(),
              board_content: content,
            },
      )
    } catch (err) {
      setError(errorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <form className="board-form" onSubmit={handleSubmit}>
      <h3>{title}</h3>
      {authed ? (
        <p className="board-form-note">
          작성자: {authed.name} ({authed.note ?? '로그인 계정'})
        </p>
      ) : (
        <>
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
        </>
      )}
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
