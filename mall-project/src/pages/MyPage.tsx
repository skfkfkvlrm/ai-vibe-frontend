import { useId, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { accountErrorMessage, changePassword, updateProfile } from '../auth/accountApi'
import type { Member } from '../auth/api'
import { useAuth } from '../auth/useAuth'

// 백엔드(MemberRules)와 같은 규칙. 최종 검증은 서버가 한다.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const MIN_PASSWORD = 8
const MAX_PASSWORD_BYTES = 72

function ProfileSection({ member }: { member: Member }) {
  const uid = useId()
  const { applyMember } = useAuth()
  const [name, setName] = useState(member.name)
  const [email, setEmail] = useState(member.email)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length > 100) {
      setMessage({ text: '이름을 입력해 주세요.', error: true })
      return
    }
    if (!EMAIL.test(email.trim()) || email.trim().length > 200) {
      setMessage({ text: '이메일 형식이 올바르지 않습니다.', error: true })
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const updated = await updateProfile({ name: name.trim(), email: email.trim() })
      applyMember(updated)
      setName(updated.name)
      setEmail(updated.email)
      setMessage({ text: '저장되었습니다.', error: false })
    } catch (err) {
      setMessage({ text: accountErrorMessage(err), error: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>내 정보</h2>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-id`}>아이디</label>
        <input id={`${uid}-id`} value={member.login_id} readOnly />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-name`}>이름</label>
        <input id={`${uid}-name`} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-email`}>이메일</label>
        <input
          id={`${uid}-email`}
          type="email"
          value={email}
          maxLength={200}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {message && <p role={message.error ? 'alert' : 'status'}>{message.text}</p>}
      <div className="auth-form-actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  )
}

function PasswordSection() {
  const uid = useId()
  const { applyToken } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const validate = (): string | null => {
    if (!current) return '현재 비밀번호를 입력해 주세요.'
    if (next.length < MIN_PASSWORD) return '새 비밀번호는 8자 이상이어야 합니다.'
    if (new TextEncoder().encode(next).length > MAX_PASSWORD_BYTES) return '새 비밀번호가 너무 깁니다.'
    if (next === current) return '새 비밀번호는 현재 비밀번호와 달라야 합니다.'
    if (next !== confirm) return '새 비밀번호 확인이 일치하지 않습니다.'
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const invalid = validate()
    if (invalid) {
      setMessage({ text: invalid, error: true })
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const token = await changePassword(current, next)
      // 이전 토큰은 서버에서 무효가 되므로 새 토큰으로 현재 로그인을 이어간다.
      await applyToken(token.access_token)
      setCurrent('')
      setNext('')
      setConfirm('')
      setMessage({ text: '비밀번호가 변경되었습니다.', error: false })
    } catch (err) {
      setMessage({ text: accountErrorMessage(err), error: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>비밀번호 변경</h2>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-cur`}>현재 비밀번호</label>
        <input
          id={`${uid}-cur`}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-new`}>새 비밀번호</label>
        <input
          id={`${uid}-new`}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-conf`}>새 비밀번호 확인</label>
        <input
          id={`${uid}-conf`}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {message && <p role={message.error ? 'alert' : 'status'}>{message.text}</p>}
      <div className="auth-form-actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? '변경 중...' : '변경'}
        </button>
      </div>
    </form>
  )
}

export default function MyPage() {
  const { member, ready } = useAuth()
  if (!ready) return null
  if (!member) return <Navigate to="/login" replace />
  return (
    <>
      <ProfileSection member={member} />
      <PasswordSection />
    </>
  )
}
