import { useId, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authErrorMessage } from './api'
import { useAuth } from './useAuth'

function LoginPage() {
  const uid = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const { member, ready, login } = useAuth()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const state = location.state as { registered?: boolean; expired?: boolean } | null
  const registered = state?.registered === true
  const expired = state?.expired === true

  if (!ready) return null
  if (member) return <Navigate to="/boards" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!loginId.trim() || !password) {
      setError('아이디와 비밀번호를 입력해 주세요.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await login(loginId.trim(), password)
      navigate('/boards')
    } catch (err) {
      setError(authErrorMessage(err, 'login'))
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>로그인</h2>
      {registered && <p role="status">가입이 완료되었습니다. 로그인해 주세요.</p>}
      {expired && <p role="alert">로그인 정보가 변경되었거나 만료되었습니다. 다시 로그인해 주세요.</p>}
      <div className="auth-form-row">
        <label htmlFor={`${uid}-id`}>아이디</label>
        <input
          id={`${uid}-id`}
          autoComplete="username"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-pw`}>비밀번호</label>
        <input
          id={`${uid}-pw`}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="auth-form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
        <Link to="/signup">회원가입</Link>
      </div>
    </form>
  )
}

export default LoginPage
