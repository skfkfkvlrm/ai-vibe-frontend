import { useId, useState, type FormEvent } from 'react'
import { errorMessage } from './api/boards'

interface Props {
  /** 비회원 글이면 true(비밀번호 입력), 내 글(로그인 회원)이면 false(확인만) */
  needPassword: boolean
  onConfirm: (pass?: string) => Promise<void>
  onCancel: () => void
}

/** 삭제 버튼을 누르면 나타나는 확인란. 비회원 글은 비밀번호를 함께 받는다. */
function DeleteConfirm({ needPassword, onConfirm, onCancel }: Props) {
  const uid = useId()
  const [pass, setPass] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (needPassword && !pass) {
      setError('비밀번호를 입력해 주세요.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(needPassword ? pass : undefined)
    } catch (err) {
      setError(errorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <form className="board-delete-confirm" onSubmit={handleSubmit}>
      {needPassword ? (
        <>
          <label htmlFor={`${uid}-pass`}>삭제하려면 비밀번호를 입력하세요</label>
          <input
            id={`${uid}-pass`}
            type="password"
            autoComplete="off"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </>
      ) : (
        <span>이 글을 삭제하시겠습니까?</span>
      )}
      <button type="submit" disabled={submitting}>
        {submitting ? '삭제 중...' : '삭제 확인'}
      </button>
      <button type="button" onClick={onCancel} disabled={submitting}>
        취소
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}

export default DeleteConfirm
